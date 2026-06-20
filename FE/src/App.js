import React, { useState } from "react";
import "chart.js/auto";
import StatusPage from "./pages/StatusPage";
import EffortPage from "./pages/EffortPage";
import TypeBreakdownPage from "./pages/TypeBreakdownPage";
import AssignmentPage from "./pages/AssignmentPage";
import PriorityRiskPage from "./pages/PriorityRiskPage";
import ActivityPage from "./pages/ActivityPage";
import EstimationAccuracyPage from "./pages/EstimationAccuracyPage";
import TimeDiscrepancyPage from "./pages/TimeDiscrepancyPage";
import ActivityDistributionPage from "./pages/ActivityDistributionPage";
import { Tabs, Tab } from '@mui/material';

function App() {
  const [page, setPage] = useState("status");

  return (
    <div>
      <Tabs value={page} onChange={(e, val) => setPage(val)} variant="scrollable" scrollButtons="auto">
        <Tab label="Status" value="status" />
        <Tab label="Effort" value="effort" />
        <Tab label="Type Breakdown" value="type" />
        <Tab label="Assignment" value="assignment" />
        <Tab label="Priority/Risk" value="priorityrisk" />
        <Tab label="Activities" value="activity" />
        <Tab label="Estimation Accuracy" value="estimation" />
        <Tab label="Time Discrepancy" value="discrepancy" />
        <Tab label="Activity Distribution" value="activitydist" />
      </Tabs>
      {page === "status" && <StatusPage />}
      {page === "effort" && <EffortPage />}
      {page === "type" && <TypeBreakdownPage />}
      {page === "assignment" && <AssignmentPage />}
      {page === "priorityrisk" && <PriorityRiskPage />}
      {page === "activity" && <ActivityPage />}
      {page === "estimation" && <EstimationAccuracyPage />}
      {page === "discrepancy" && <TimeDiscrepancyPage />}
      {page === "activitydist" && <ActivityDistributionPage />}
    </div>
  );
}

export default App;