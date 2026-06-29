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
import { Tabs, Tab, FormControlLabel, Switch, Box } from '@mui/material';
import { getAppMode, setAppMode } from "./api/workItemsApi";

function App() {
  const [page, setPage] = useState("status");
  const [realMode, setRealMode] = useState(getAppMode() === "real");

  const handleModeToggle = (e) => {
    const real = e.target.checked;
    setRealMode(real);
    setAppMode(real ? "real" : "debug");
  };

  return (
    <div>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2 }}>
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
        <FormControlLabel
          control={<Switch checked={realMode} onChange={handleModeToggle} />}
          label={realMode ? "Real" : "Debug"}
        />
      </Box>
      <div key={realMode ? "real" : "debug"}>
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
    </div>
  );
}

export default App;