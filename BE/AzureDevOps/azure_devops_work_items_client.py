import requests
from typing import List, Optional, Dict, Any

class AzureDevOpsWorkItemsClient:
    """
    Client for querying Azure DevOps work items by status and time period for a developer.
    """
    def __init__(self, base_url, personal_access_token: str):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.auth = ("", personal_access_token)
        self.session.headers.update({
            "Content-Type": "application/json",
            "Accept": "application/json"
        })

    def get_work_items(
        self,
        assigned_to: str,
        status: str,
        start_date: str,
        end_date: str
    ) -> List[Dict[str, Any]]:
        """
        Fetch work items assigned to a developer, in a given status, during a time period.

        Args:
            assigned_to (str): Developer's display name or email.
            status (str): Work item state (e.g., "Active", "Closed").
            start_date (str): Start date (YYYY-MM-DD).
            end_date (str): End date (YYYY-MM-DD).

        Returns:
            List[Dict[str, Any]]: List of work item details.
        """
        # WIQL query to find work items by assigned user, state, and changed date
        wiql = {
            "query": f"""
                SELECT [System.Id], [System.Title], [System.State], [System.AssignedTo], [System.ChangedDate]
                FROM workitems
                WHERE
                    [System.AssignedTo] = '{assigned_to}'
                    AND [System.State] = '{status}'
                    AND [System.ChangedDate] >= '{start_date}'
                    AND [System.ChangedDate] <= '{end_date}'
                ORDER BY [System.ChangedDate] DESC
            """
        }
        response = self.session.post(f"{self.base_url}/wiql?api-version=7.0", json=wiql)
        response.raise_for_status()
        work_item_refs = response.json().get("workItems", [])
        if not work_item_refs:
            return []

        # Get work item details in batches of 200 (API limit)
        ids = [str(item["id"]) for item in work_item_refs]
        work_items = []
        for i in range(0, len(ids), 200):
            batch_ids = ",".join(ids[i:i+200])
            url = f"{self.base_url}/workitems?ids={batch_ids}&api-version=7.0"
            details_resp = self.session.get(url)
            details_resp.raise_for_status()
            work_items.extend(details_resp.json().get("value", []))
        return work_items
