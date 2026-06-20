import requests
from typing import List, Optional, Dict, Any

class ETSTimeUnitsClient:
    """
    Client for querying ETS time units API.
    """

    def __init__(self, base_url:str, username: str, password: str):
        self.base_url = base_url
        self.session = requests.Session()

        params = {}
        if username:
            params["username"] = username
        if password:
            params["password"] = password

        headers = {"Content-Type": "application/json", "Accept": "application/json"}
        response = self.session.post(self.base_url + "/api/auth/sign-in", headers=headers, json=params)
        response.raise_for_status()

        response_payload = response.json()
        self.bearer_token = response_payload["access_token"]
        self.employee_id = response_payload["employee_details"]["id"]
        self.session.headers.update({
            "Authorization": f"Bearer {self.bearer_token}",
            "Accept": "application/json"
        })

    def get_time_units(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        **extra_filters
    ) -> List[Dict[str, Any]]:
        """
        Fetch time units with optional filters.

        Args:
            start_date (str): Filter by start date (YYYY-MM-DD).
            end_date (str): Filter by end date (YYYY-MM-DD).
            employee_id (str): Filter by employee ID (GUID).
            extra_filters: Any additional query parameters.

        Returns:
            List[Dict[str, Any]]: List of time unit records.
        """
        params = {}
        if start_date:
            params["start_date"] = start_date
        if end_date:
            params["end_date"] = end_date

        params["employee_id"] = self.employee_id
        params.update(extra_filters)

        response = self.session.get(self.base_url + "/api/time-units/", params=params)
        response.raise_for_status()
        return response.json()