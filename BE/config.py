"""Central configuration: employee roster and DEBUG/REAL mode resolution.

DEBUG mode  -> endpoints return hardcoded sample data (no external calls).
REAL  mode  -> endpoints query Azure DevOps and ETS for live data.

Mode precedence (highest first):
  1. per-request query param  ?debug=true / ?debug=false
  2. APP_MODE env var ("debug" | "real")
  3. default: debug
"""
import os

from dotenv import load_dotenv

load_dotenv()


def _parse_employees(raw):
    """Parse roster from env: 'Name:ado-email;Name:ado-email'."""
    employees = []
    for entry in (raw or "").split(";"):
        entry = entry.strip()
        if not entry or ":" not in entry:
            continue
        name, ado = entry.split(":", 1)
        employees.append({"name": name.strip(), "ado": ado.strip()})
    return employees


# Team roster, sourced from the EMPLOYEES env var. ADO is queried per-person by
# their email/display name. ETS authenticates with a single set of credentials
# (the configured user), so ETS-backed metrics only resolve for the employee
# whose creds are in .env.
EMPLOYEES = _parse_employees(os.environ.get("EMPLOYEES"))

EMPLOYEE_NAMES = [e["name"] for e in EMPLOYEES]


def is_debug_mode(request):
    """Resolve mode for the current request. Returns True for debug (stub) mode."""
    raw = request.args.get("debug")
    if raw is not None:
        return raw.strip().lower() in ("1", "true", "yes", "on")
    return os.environ.get("APP_MODE", "debug").strip().lower() != "real"
