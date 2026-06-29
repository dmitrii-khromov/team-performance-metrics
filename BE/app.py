from AzureDevOps.azure_devops_work_items_client import AzureDevOpsWorkItemsClient
from ETS.ets_time_units_client import ETSTimeUnitsClient
from metrics import (
    build_matched_work_items,
    compute_estimation_accuracy,
    compute_time_discrepancy,
    compute_activity_distribution,
    compute_all_metrics,
)
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os
import random
import string

from config import is_debug_mode
import summaries

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route("/api/work-items-summary")
def work_items_summary():
    # Example data; in real use, fetch from AzureDevOpsWorkItemsClient
    data = {
        "labels": ["Active", "Closed", "Resolved"],
        "counts": [12, 7, 3]
    }
    return jsonify(data)

@app.route("/api/azure-devops-work-items")
def azure_devops_work_items():
    BASE_URL = os.environ["AZURE_DEVOPS_BASE_URL"]
    PAT = os.environ["AZURE_DEVOPS_PAT"]
    ASSIGNED_TO = os.environ["AZURE_DEVOPS_ASSIGNED_TO"]

    # Get parameters from URL, with defaults
    status = request.args.get("status", "Done")
    start_date = request.args.get("start_date", "2025-03-01")
    end_date = request.args.get("end_date", "2025-08-16")

    client = AzureDevOpsWorkItemsClient(BASE_URL, PAT)
    items = client.get_work_items(ASSIGNED_TO, status, start_date, end_date)
    return jsonify(items)

@app.route("/api/ets-work-items")
def ets_work_items():
    BASE_URL = os.environ["ETS_BASE_URL"]
    USERNAME = os.environ["ETS_USERNAME"]
    PASSWORD = os.environ["ETS_PASSWORD"]
    start_date = request.args.get("start_date", "2025-08-03")
    end_date = request.args.get("end_date", "2025-08-16")
    client = ETSTimeUnitsClient(BASE_URL, USERNAME, PASSWORD)
    results = client.get_time_units(
        start_date=start_date,
        end_date=end_date
    )
    return jsonify(results)

@app.route("/api/work-items-status-summary")
def work_items_status_summary():
    # Pie/bar chart: Work item status distribution per employee
    start_date = request.args.get("start_date", "2025-03-01")
    end_date = request.args.get("end_date", "2025-08-16")
    if not is_debug_mode(request):
        return jsonify(summaries.status_summary(start_date, end_date))
    data = {
        "labels": ["Active", "Closed", "Resolved"],
        "counts": [
            {"employee": "Anna Naumova", "values": [8, 12, 5]},
            {"employee": "Pavlo Sokolov", "values": [5, 9, 2]},
            {"employee": "Ilfat Galiev", "values": [7, 10, 3]},
            {"employee": "Dmitrii Khromov", "values": [12, 7, 3]}
        ]
    }
    return jsonify(data)

@app.route("/api/work-items-effort-summary")
def work_items_effort_summary():
    # Bar/line chart: Planned vs. actual effort per employee
    start_date = request.args.get("start_date", "2025-03-01")
    end_date = request.args.get("end_date", "2025-08-16")
    if not is_debug_mode(request):
        return jsonify(summaries.effort_summary(start_date, end_date))
    data = {
        "labels": ["Anna Naumova", "Pavlo Sokolov", "Ilfat Galiev", "Dmitrii Khromov"],
        "plannedEffort": [40, 32, 36, 50],   # hours
        "actualEffort": [38, 35, 34, 52],    # hours
        "overtime": [2, 3, 0, 5]             # hours
    }
    return jsonify(data)

@app.route("/api/work-items-type-breakdown")
def work_items_type_breakdown():
    # Pie/bar chart: Work item type breakdown per employee
    start_date = request.args.get("start_date", "2025-03-01")
    end_date = request.args.get("end_date", "2025-08-16")
    if not is_debug_mode(request):
        return jsonify(summaries.type_breakdown(start_date, end_date))
    data = {
        "labels": ["Bug", "Task", "Product Backlog Item"],
        "counts": [
            {"employee": "Anna Naumova", "values": [3, 10, 12]},
            {"employee": "Pavlo Sokolov", "values": [2, 8, 6]},
            {"employee": "Ilfat Galiev", "values": [1, 9, 10]},
            {"employee": "Dmitrii Khromov", "values": [4, 7, 11]}
        ]
    }
    return jsonify(data)

@app.route("/api/work-items-assignment-summary")
def work_items_assignment_summary():
    # Bar chart: Workload distribution (number of work items assigned)
    start_date = request.args.get("start_date", "2025-03-01")
    end_date = request.args.get("end_date", "2025-08-16")
    if not is_debug_mode(request):
        return jsonify(summaries.assignment_summary(start_date, end_date))
    data = {
        "labels": ["Anna Naumova", "Pavlo Sokolov", "Ilfat Galiev", "Dmitrii Khromov"],
        "assignedCount": [25, 15, 20, 22]
    }
    return jsonify(data)

@app.route("/api/work-items-priority-risk-summary")
def work_items_priority_risk_summary():
    # Bar/bubble chart: Priority and risk analysis per employee
    start_date = request.args.get("start_date", "2025-03-01")
    end_date = request.args.get("end_date", "2025-08-16")
    if not is_debug_mode(request):
        return jsonify(summaries.priority_risk_summary(start_date, end_date))
    data = {
        "labels": ["High", "Medium", "Low"],
        "priorityCounts": [
            {"employee": "Anna Naumova", "values": [5, 10, 10]},
            {"employee": "Pavlo Sokolov", "values": [3, 7, 5]},
            {"employee": "Ilfat Galiev", "values": [4, 8, 6]},
            {"employee": "Dmitrii Khromov", "values": [6, 9, 7]}
        ],
        "riskCounts": [
            {"employee": "Anna Naumova", "values": [2, 8, 15]},
            {"employee": "Pavlo Sokolov", "values": [1, 5, 9]},
            {"employee": "Ilfat Galiev", "values": [3, 6, 9]},
            {"employee": "Dmitrii Khromov", "values": [4, 7, 11]}
        ]
    }
    return jsonify(data)

@app.route("/api/work-items-activity-summary")
def work_items_activity_summary():
    employee = request.args.get("employee", "Dmitrii Khromov")
    start_date = request.args.get("start_date", "2025-08-01")
    end_date = request.args.get("end_date", "2025-08-16")

    if not is_debug_mode(request):
        return jsonify(summaries.activity_summary(employee, start_date, end_date))

    activity_types = ["Investigation", "Development", "Documentation", "Code review", "Testing"]

    # Helper to generate a random numeric work item id
    def generate_id():
        return random.randint(10000000, 99999999)

    # Helper to generate random activities for a work item
    def generate_activities():
        # Each work item gets 2-5 activities, each with 1-8 hours
        selected = random.sample(activity_types, random.randint(2, 5))
        return {act: random.randint(1, 8) for act in selected}

    # Mock data for each employee
    mock_items = {
        "Anna Naumova": [{
            "id": generate_id(),
            "activities": generate_activities()
        } for _ in range(5)],
        "Pavlo Sokolov": [{
            "id": generate_id(),
            "activities": generate_activities()
        } for _ in range(3)],
        "Ilfat Galiev": [{
            "id": generate_id(),
            "activities": generate_activities()
        } for _ in range(7)],
        "Dmitrii Khromov": [{
            "id": generate_id(),
            "activities": generate_activities()
        } for _ in range(4)]
    }

    items = mock_items.get(employee, mock_items["Dmitrii Khromov"])

    response = {
        "workItems": items
    }
    return jsonify(response)

def _fetch_both_sources(start_date, end_date):
    """Helper to fetch data from both ETS and Azure DevOps."""
    ETS_BASE_URL = os.environ["ETS_BASE_URL"]
    USERNAME = os.environ["ETS_USERNAME"]
    PASSWORD = os.environ["ETS_PASSWORD"]

    BASE_URL = os.environ["AZURE_DEVOPS_BASE_URL"]
    PAT = os.environ["AZURE_DEVOPS_PAT"]
    ASSIGNED_TO = os.environ["AZURE_DEVOPS_ASSIGNED_TO"]

    ets_client = ETSTimeUnitsClient(ETS_BASE_URL, USERNAME, PASSWORD)
    ets_items = ets_client.get_time_units(start_date=start_date, end_date=end_date)

    ado_client = AzureDevOpsWorkItemsClient(BASE_URL, PAT)
    ado_items = ado_client.get_work_items(ASSIGNED_TO, "Done", start_date, end_date)

    return ets_items, ado_items


@app.route("/api/metrics/estimation-accuracy")
def metrics_estimation_accuracy():
    """Compare ADO original estimates vs actual ETS tracked time per task."""
    start_date = request.args.get("start_date", "2025-08-03")
    end_date = request.args.get("end_date", "2025-08-16")
    ets_items, ado_items = _fetch_both_sources(start_date, end_date)
    matched = build_matched_work_items(ets_items, ado_items)
    results = compute_estimation_accuracy(matched)
    return jsonify(results)


@app.route("/api/metrics/time-discrepancy")
def metrics_time_discrepancy():
    """Compare ETS tracked hours vs ADO reported CompletedWork per task."""
    start_date = request.args.get("start_date", "2025-08-03")
    end_date = request.args.get("end_date", "2025-08-16")
    ets_items, ado_items = _fetch_both_sources(start_date, end_date)
    matched = build_matched_work_items(ets_items, ado_items)
    results = compute_time_discrepancy(matched)
    return jsonify(results)


@app.route("/api/metrics/activity-distribution")
def metrics_activity_distribution():
    """Activity type distribution across matched work items."""
    start_date = request.args.get("start_date", "2025-08-03")
    end_date = request.args.get("end_date", "2025-08-16")
    ets_items, ado_items = _fetch_both_sources(start_date, end_date)
    matched = build_matched_work_items(ets_items, ado_items)
    results = compute_activity_distribution(matched)
    return jsonify(results)


@app.route("/api/metrics/all")
def metrics_all():
    """All combined metrics from matched ETS and ADO data."""
    start_date = request.args.get("start_date", "2025-08-03")
    end_date = request.args.get("end_date", "2025-08-16")
    ets_items, ado_items = _fetch_both_sources(start_date, end_date)
    results = compute_all_metrics(ets_items, ado_items)
    return jsonify(results)


if __name__ == "__main__":
    app.run(debug=True)