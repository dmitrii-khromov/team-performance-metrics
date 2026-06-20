import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import DateRangeControls from "../DateRangeControls";
import { getMetricsEstimationAccuracy } from "../../api/workItemsApi";
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from "@mui/material";

function EstimationAccuracyChart() {
  const [startDate, setStartDate] = useState("2025-08-03");
  const [endDate, setEndDate] = useState("2025-08-16");
  const [data, setData] = useState(null);

  useEffect(() => {
    getMetricsEstimationAccuracy(startDate, endDate)
      .then(setData)
      .catch(() => setData([]));
  }, [startDate, endDate]);

  if (!data) return <p>Loading...</p>;

  const items = data.filter((d) => d.originalEstimate && d.etsActualHours);

  const chartData = {
    labels: items.map((d) => `#${d.taskId}`),
    datasets: [
      {
        label: "Original Estimate (h)",
        data: items.map((d) => d.originalEstimate),
        backgroundColor: "#36A2EB",
      },
      {
        label: "ETS Actual (h)",
        data: items.map((d) => d.etsActualHours),
        backgroundColor: "#FF6384",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "ADO Estimate vs ETS Actual Hours" },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: "Hours" } },
    },
  };

  return (
    <div style={{ width: 900, margin: "2rem auto" }}>
      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        Estimation Accuracy
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Compares Azure DevOps original time estimates with actual hours tracked in ETS for each matched work item.
      </Typography>
      <DateRangeControls startDate={startDate} endDate={endDate} setStartDate={setStartDate} setEndDate={setEndDate} />
      {items.length > 0 ? (
        <>
          <Bar data={chartData} options={chartOptions} />
          <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Task ID</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Estimate (h)</TableCell>
                  <TableCell align="right">ETS Actual (h)</TableCell>
                  <TableCell align="right">Deviation (h)</TableCell>
                  <TableCell align="right">Accuracy</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((row) => (
                  <TableRow key={row.taskId}>
                    <TableCell>{row.taskId}</TableCell>
                    <TableCell>{row.title}</TableCell>
                    <TableCell>{row.workItemType}</TableCell>
                    <TableCell align="right">{row.originalEstimate}</TableCell>
                    <TableCell align="right">{row.etsActualHours}</TableCell>
                    <TableCell align="right">
                      <Chip
                        size="small"
                        label={`${row.deviationHours > 0 ? "+" : ""}${row.deviationHours}h`}
                        color={Math.abs(row.deviationHours) <= 1 ? "success" : row.deviationHours > 0 ? "warning" : "info"}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        size="small"
                        label={`${row.accuracyPct}%`}
                        color={row.accuracyPct >= 80 && row.accuracyPct <= 120 ? "success" : "warning"}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : (
        <Typography>No matched work items with estimates found for this period.</Typography>
      )}
    </div>
  );
}

export default EstimationAccuracyChart;
