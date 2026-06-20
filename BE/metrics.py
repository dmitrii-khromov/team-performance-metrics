import re
from collections import defaultdict


def extract_task_number(description):
    """Extract task/bug number from ETS description.
    
    ETS descriptions follow patterns like:
    - "Bug 34102179: DXB32 Edge TER BOMs..."
    - "Task 34428037: Refactor optical components..."
    """
    match = re.match(r"(?:Bug|Task|Product Backlog Item|PBI)\s+(\d+)", description, re.IGNORECASE)
    return int(match.group(1)) if match else None


def build_matched_work_items(ets_items, ado_items):
    """Match ETS time entries with Azure DevOps work items by task number.
    
    Returns a list of matched work items with combined data from both systems.
    """
    # Index ADO items by ID
    ado_by_id = {}
    for item in ado_items:
        ado_by_id[item["id"]] = item

    # Group ETS entries by task number
    ets_by_task = defaultdict(list)
    for entry in ets_items:
        task_num = extract_task_number(entry.get("description", ""))
        if task_num:
            ets_by_task[task_num].append(entry)

    # Match and combine
    matched = []
    for task_id, ets_entries in ets_by_task.items():
        ado_item = ado_by_id.get(task_id)
        if not ado_item:
            continue

        fields = ado_item.get("fields", {})
        total_ets_minutes = sum(e.get("minutes", 0) for e in ets_entries)
        total_ets_hours = round(total_ets_minutes / 60, 2)

        # Activity breakdown from ETS
        activity_minutes = defaultdict(int)
        for entry in ets_entries:
            activity = entry.get("task_type_title", "Unknown").strip()
            activity_minutes[activity] += entry.get("minutes", 0)

        activity_hours = {k: round(v / 60, 2) for k, v in activity_minutes.items()}

        # Dates from ETS entries
        dates_worked = sorted(set(e.get("date") for e in ets_entries if e.get("date")))

        matched.append({
            "taskId": task_id,
            "title": fields.get("System.Title", ""),
            "workItemType": fields.get("System.WorkItemType", ""),
            "state": fields.get("System.State", ""),
            "priority": fields.get("Microsoft.VSTS.Common.Priority"),
            "riskRating": fields.get("Scrum_custom.AdjustedRiskRating", ""),
            "adoCompletedWork": fields.get("Microsoft.VSTS.Scheduling.CompletedWork"),
            "adoOriginalEstimate": fields.get("Microsoft.VSTS.Scheduling.OriginalEstimate"),
            "adoRemainingWork": fields.get("Microsoft.VSTS.Scheduling.RemainingWork"),
            "etsTotalHours": total_ets_hours,
            "etsActivityBreakdown": activity_hours,
            "etsDatesWorked": dates_worked,
            "etsOvertimeMinutes": sum(e.get("minutes", 0) for e in ets_entries if e.get("overtime")),
            "activatedDate": fields.get("Microsoft.VSTS.Common.ActivatedDate"),
            "closedDate": fields.get("Microsoft.VSTS.Common.ClosedDate"),
        })

    return matched


def compute_estimation_accuracy(matched_items):
    """Compare ADO OriginalEstimate vs ETS actual time.
    
    Returns per-task estimation accuracy data.
    """
    results = []
    for item in matched_items:
        estimate = item.get("adoOriginalEstimate")
        actual = item.get("etsTotalHours")
        if estimate and actual and estimate > 0:
            accuracy_pct = round((actual / estimate) * 100, 1)
            deviation_hours = round(actual - estimate, 2)
        else:
            accuracy_pct = None
            deviation_hours = None

        results.append({
            "taskId": item["taskId"],
            "title": item["title"],
            "workItemType": item["workItemType"],
            "originalEstimate": estimate,
            "etsActualHours": actual,
            "accuracyPct": accuracy_pct,
            "deviationHours": deviation_hours,
        })

    return results


def compute_time_discrepancy(matched_items):
    """Compare ETS logged hours vs ADO CompletedWork.
    
    Highlights differences between what was reported in ADO vs what was tracked in ETS.
    """
    results = []
    for item in matched_items:
        ado_completed = item.get("adoCompletedWork")
        ets_hours = item.get("etsTotalHours")
        if ado_completed is not None and ets_hours is not None:
            discrepancy = round(ets_hours - ado_completed, 2)
            discrepancy_pct = round((discrepancy / ado_completed) * 100, 1) if ado_completed > 0 else None
        else:
            discrepancy = None
            discrepancy_pct = None

        results.append({
            "taskId": item["taskId"],
            "title": item["title"],
            "workItemType": item["workItemType"],
            "adoCompletedWork": ado_completed,
            "etsActualHours": ets_hours,
            "discrepancyHours": discrepancy,
            "discrepancyPct": discrepancy_pct,
        })

    return results


def compute_activity_distribution(matched_items):
    """Activity type distribution across all matched work items.
    
    Shows how time is distributed across Investigation, Development, Testing, etc.
    """
    # Per-task breakdown
    per_task = []
    for item in matched_items:
        per_task.append({
            "taskId": item["taskId"],
            "title": item["title"],
            "workItemType": item["workItemType"],
            "priority": item["priority"],
            "activities": item["etsActivityBreakdown"],
            "totalHours": item["etsTotalHours"],
        })

    # Aggregate across all tasks
    aggregate = defaultdict(float)
    for item in matched_items:
        for activity, hours in item["etsActivityBreakdown"].items():
            aggregate[activity] += hours

    aggregate_rounded = {k: round(v, 2) for k, v in aggregate.items()}

    return {
        "perTask": per_task,
        "aggregate": aggregate_rounded,
    }


def compute_all_metrics(ets_items, ado_items):
    """Compute all metrics from matched ETS and ADO data."""
    matched = build_matched_work_items(ets_items, ado_items)
    return {
        "matchedItems": matched,
        "estimationAccuracy": compute_estimation_accuracy(matched),
        "timeDiscrepancy": compute_time_discrepancy(matched),
        "activityDistribution": compute_activity_distribution(matched),
        "summary": {
            "totalMatchedTasks": len(matched),
            "totalEtsHours": round(sum(i["etsTotalHours"] for i in matched), 2),
            "totalAdoCompletedWork": round(
                sum(i["adoCompletedWork"] for i in matched if i["adoCompletedWork"]), 2
            ),
            "totalAdoEstimate": round(
                sum(i["adoOriginalEstimate"] for i in matched if i["adoOriginalEstimate"]), 2
            ),
        }
    }
