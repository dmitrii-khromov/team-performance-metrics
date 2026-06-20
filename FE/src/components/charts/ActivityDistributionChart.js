import React, { useState, useEffect } from "react";
import { Doughnut, Bar } from "react-chartjs-2";
import DateRangeControls from "../DateRangeControls";
import { getMetricsActivityDistribution } from "../../api/workItemsApi";
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";

const ACTIVITY_COLORS = {
  "Investigation": "#1976D2",
  "Development": "#388E3C",
  "Testing": "#FBC02D",
  "Communication": "#7B1FA2",
  "Code review": "#C62828",
  "Documentation": "#FF9800",
};

function getColor(activity, idx) {
  return ACTIVITY_COLORS[activity] || ["#00BCD4", "#E91E63", "#9C27B0", "#607D8B"][idx % 4];
}

function ActivityDistributionChart() {
  const [startDate, setStartDate] = useState("2025-08-03");
  const [endDate, setEndDate] = useState("2025-08-16");
  const [data, setData] = useState(null);

  useEffect(() => {
    getMetricsActivityDistribution(startDate, endDate)
      .then(setData)
      .catch(() => setData(null));
  }, [startDate, endDate]);

  if (!data) return <p>Loading...</p>;

  const { aggregate, perTask } = data;

  // Doughnut chart for aggregate activity distribution
  const activityLabels = Object.keys(aggregate);
  const activityValues = Object.values(aggregate);
  const doughnutData = {
    labels: activityLabels,
    datasets: [
      {
        data: activityValues,
        backgroundColor: activityLabels.map((a, i) => getColor(a, i)),
      },
    ],
  };

  // Stacked bar for per-task breakdown
  const allActivities = [...new Set(perTask.flatMap((t) => Object.keys(t.activities)))];
  const barData = {
    labels: perTask.map((t) => `#${t.taskId}`),
    datasets: allActivities.map((activity, idx) => ({
      label: activity,
      data: perTask.map((t) => t.activities[activity] || 0),
      backgroundColor: getColor(activity, idx),
    })),
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Activity Breakdown per Work Item" },
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true, beginAtZero: true, title: { display: true, text: "Hours" } },
    },
  };

  return (
    <div style={{ width: 900, margin: "2rem auto" }}>
      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        Activity Distribution
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Shows how time is distributed across activity types (Investigation, Development, Testing, etc.) for matched work items.
      </Typography>
      <DateRangeControls startDate={startDate} endDate={endDate} setStartDate={setStartDate} setEndDate={setEndDate} />

      {activityLabels.length > 0 ? (
        <>
          <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ width: 350 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Aggregate Distribution</Typography>
              <Doughnut
                data={doughnutData}
                options={{
                  plugins: { legend: { position: "bottom" } },
                  cutout: "40%",
                }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 400 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Per Work Item</Typography>
              <Bar data={barData} options={barOptions} />
            </div>
          </div>

          <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Task ID</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Total (h)</TableCell>
                  {allActivities.map((a) => (
                    <TableCell key={a} align="right">{a} (h)</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {perTask.map((row) => (
                  <TableRow key={row.taskId}>
                    <TableCell>{row.taskId}</TableCell>
                    <TableCell>{row.title}</TableCell>
                    <TableCell>{row.workItemType}</TableCell>
                    <TableCell align="right">{row.totalHours}</TableCell>
                    {allActivities.map((a) => (
                      <TableCell key={a} align="right">{row.activities[a] || "—"}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : (
        <Typography>No matched work items found for this period.</Typography>
      )}
    </div>
  );
}

export default ActivityDistributionChart;
