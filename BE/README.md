# Team Performance Metrics — Back-End

A Flask API service that aggregates team performance data from Azure DevOps and ETS.

## Prerequisites

- Python 3.10+

## Local Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd back-end
```

### 2. Create and activate a virtual environment

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate
```

### 3. Install dependencies

```bash
pip install flask flask-cors python-dotenv requests
```

### 4. Configure environment variables

Copy the example file and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` and provide values for:

| Variable | Description |
|----------|-------------|
| `AZURE_DEVOPS_ORGANIZATION` | Your Azure DevOps organization name |
| `AZURE_DEVOPS_PROJECT` | Target project name |
| `AZURE_DEVOPS_PAT` | Personal Access Token with work-item read permissions |
| `AZURE_DEVOPS_ASSIGNED_TO` | Email of the developer to query |
| `ETS_TOKEN` | Bearer token for the ETS API |
| `ETS_EMPLOYEE_ID` | Employee ID in ETS |

### 5. Run the service

```bash
flask run
```

The API will be available at `http://127.0.0.1:5000`.

## Debug vs. Real mode

The six summary endpoints support two modes:

- **Debug mode** (default): returns hardcoded sample data, no external calls.
- **Real mode**: queries Azure DevOps (per employee in `config.py`) and ETS for live data.

Mode is resolved per request: `?debug=true` (stubs) / `?debug=false` (live). The
default when no param is sent is controlled by `APP_MODE` (`debug` | `real`).
ETS authenticates as a single user, so ETS-derived effort/activity resolves only
for the employee configured in `.env`; ADO data is fetched for every employee.
The front-end "Debug/Real" switch sets the `debug` query param automatically.

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/azure-devops-work-items` | Fetch work items from Azure DevOps (supports `status`, `start_date`, `end_date` query params) |
| `GET /api/ets-work-items` | Fetch time units from ETS (supports `start_date`, `end_date` query params) |
| `GET /api/work-items-summary` | Work items summary counts |
| `GET /api/work-items-status-summary` | Status distribution per employee |
| `GET /api/work-items-effort-summary` | Planned vs. actual effort per employee |
| `GET /api/work-items-type-breakdown` | Work item type breakdown per employee |
| `GET /api/work-items-assignment-summary` | Workload distribution |
| `GET /api/work-items-priority-risk-summary` | Priority and risk analysis per employee |
| `GET /api/work-items-activity-summary` | Activity breakdown (supports `employee`, `start_date`, `end_date` query params) |
