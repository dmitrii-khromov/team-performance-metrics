"""Real implementations for the dashboard summary endpoints.

Each builder mirrors the exact JSON shape returned by the corresponding debug
stub in app.py, so the front end works unchanged regardless of mode.

Azure DevOps is queried per employee (by assignee). ETS authenticates as a
single user, so ETS-derived effort/activity is only resolved for the configured
employee; others fall back to ADO-reported numbers.
"""
import os
from collections import defaultdict

from AzureDevOps.azure_devops_work_items_client import AzureDevOpsWorkItemsClient
from ETS.ets_time_units_client import ETSTimeUnitsClient
from config import EMPLOYEES, EMPLOYEE_NAMES
from metrics import extract_task_number

STATUS_LABELS = ["Active", "Closed", "Resolved"]
TYPE_LABELS = ["Bug", "Task", "Product Backlog Item"]
PRIORITY_LABELS = ["High", "Medium", "Low"]


def _ado_client():
    return AzureDevOpsWorkItemsClient(
        os.environ["AZURE_DEVOPS_BASE_URL"], os.environ["AZURE_DEVOPS_PAT"]
    )


def _fetch_ado_by_employee(start_date, end_date):
    """Return {employee_name: [work_items]} for every employee in the roster."""
    client = _ado_client()
    result = {}
    for emp in EMPLOYEES:
        try:
            result[emp["name"]] = client.get_all_work_items(emp["ado"], start_date, end_date)
        except Exception:
            result[emp["name"]] = []
    return result


def _f(item, key):
    return item.get("fields", {}).get(key)


def status_summary(start_date, end_date):
    by_emp = _fetch_ado_by_employee(start_date, end_date)
    counts = []
    for name in EMPLOYEE_NAMES:
        tally = {"Active": 0, "Closed": 0, "Resolved": 0}
        for it in by_emp.get(name, []):
            state = (_f(it, "System.State") or "")
            if state in ("Active", "New", "Committed"):
                tally["Active"] += 1
            elif state in ("Closed", "Done", "Removed"):
                tally["Closed"] += 1
            elif state == "Resolved":
                tally["Resolved"] += 1
        counts.append({"employee": name, "values": [tally[s] for s in STATUS_LABELS]})
    return {"labels": STATUS_LABELS, "counts": counts}


def type_breakdown(start_date, end_date):
    by_emp = _fetch_ado_by_employee(start_date, end_date)
    counts = []
    for name in EMPLOYEE_NAMES:
        tally = defaultdict(int)
        for it in by_emp.get(name, []):
            tally[_f(it, "System.WorkItemType")] += 1
        counts.append({"employee": name, "values": [tally.get(t, 0) for t in TYPE_LABELS]})
    return {"labels": TYPE_LABELS, "counts": counts}


def assignment_summary(start_date, end_date):
    by_emp = _fetch_ado_by_employee(start_date, end_date)
    return {
        "labels": EMPLOYEE_NAMES,
        "assignedCount": [len(by_emp.get(n, [])) for n in EMPLOYEE_NAMES],
    }


def priority_risk_summary(start_date, end_date):
    by_emp = _fetch_ado_by_employee(start_date, end_date)
    priority_counts, risk_counts = [], []
    for name in EMPLOYEE_NAMES:
        p = {"High": 0, "Medium": 0, "Low": 0}
        r = {"High": 0, "Medium": 0, "Low": 0}
        for it in by_emp.get(name, []):
            pr = _f(it, "Microsoft.VSTS.Common.Priority")
            if pr == 1:
                p["High"] += 1
            elif pr == 2:
                p["Medium"] += 1
            elif pr is not None:
                p["Low"] += 1
            risk = (_f(it, "Scrum_custom.AdjustedRiskRating") or "").capitalize()
            if risk in r:
                r[risk] += 1
        priority_counts.append({"employee": name, "values": [p[x] for x in PRIORITY_LABELS]})
        risk_counts.append({"employee": name, "values": [r[x] for x in PRIORITY_LABELS]})
    return {"labels": PRIORITY_LABELS, "priorityCounts": priority_counts, "riskCounts": risk_counts}


def _ets_items(start_date, end_date):
    client = ETSTimeUnitsClient(
        os.environ["ETS_BASE_URL"], os.environ["ETS_USERNAME"], os.environ["ETS_PASSWORD"]
    )
    return client.get_time_units(start_date=start_date, end_date=end_date)


def effort_summary(start_date, end_date):
    by_emp = _fetch_ado_by_employee(start_date, end_date)
    configured = os.environ.get("AZURE_DEVOPS_ASSIGNED_TO", "").lower()
    ets_overtime_hours = 0.0
    try:
        ets = _ets_items(start_date, end_date)
        ets_overtime_hours = round(
            sum(e.get("minutes", 0) for e in ets if e.get("overtime")) / 60, 1
        )
    except Exception:
        ets = []
    planned, actual, overtime = [], [], []
    for emp in EMPLOYEES:
        items = by_emp.get(emp["name"], [])
        planned.append(round(sum((_f(i, "Microsoft.VSTS.Scheduling.OriginalEstimate") or 0) for i in items), 1))
        actual.append(round(sum((_f(i, "Microsoft.VSTS.Scheduling.CompletedWork") or 0) for i in items), 1))
        overtime.append(ets_overtime_hours if emp["ado"].lower() == configured else 0)
    return {"labels": EMPLOYEE_NAMES, "plannedEffort": planned, "actualEffort": actual, "overtime": overtime}


def activity_summary(employee, start_date, end_date):
    configured = os.environ.get("AZURE_DEVOPS_ASSIGNED_TO", "").lower()
    emp = next((e for e in EMPLOYEES if e["name"] == employee), None)
    ado_email = emp["ado"] if emp else os.environ["AZURE_DEVOPS_ASSIGNED_TO"]

    activities_by_task = defaultdict(lambda: defaultdict(int))
    if ado_email.lower() == configured:
        try:
            for e in _ets_items(start_date, end_date):
                tid = extract_task_number(e.get("description", ""))
                if tid:
                    act = e.get("task_type_title", "Unknown").strip()
                    activities_by_task[tid][act] += e.get("minutes", 0)
        except Exception:
            pass

    items = _ado_client().get_all_work_items(ado_email, start_date, end_date)
    work_items = []
    for it in items:
        tid = it.get("id")
        acts = {k: round(v / 60, 1) for k, v in activities_by_task.get(tid, {}).items()}
        work_items.append({"id": tid, "activities": acts})
    return {"workItems": work_items}
