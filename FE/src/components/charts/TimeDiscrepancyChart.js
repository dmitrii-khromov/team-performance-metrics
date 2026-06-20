import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import DateRangeControls from "../DateRangeControls";
import { getMetricsTimeDiscrepancy } from "../../api/workItemsApi";
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from "@mui/material";

function TimeDiscrepancyChart() {
  const [startDate, setStartDate] = useState("2025-08-03");
  const [endDate, setEndDate] = useState("2025-08-16");
  const [data, setData] = useState(null);

  useEffect(() => {
    getMetricsTimeDiscrepancy(startDate, endDate)
      .then(setData)
      .catch(() => setData([]));
  }, [startDate, endDate]);

  if (!data) return <p>Loading...</p>;

  const items = data.filter((d) => d.adoCompletedWork != null && d.etsActualHours != null);

  const chartData = {
    labels: items.map((d) => `#${d.taskId}`),
    datasets: [
      {
        label: "ADO Completed Work (h)",
        data: items.map((d) => d.adoCompletedWork),
        backgroundColor: "#36A2EB",
      },
      {
        label: "ETS Tracked Time (h)",
        data: items.map((d) => d.etsActualHours),
        backgroundColor: "#FFCE56",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "ADO Completed Work vs ETS Tracked Time" },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: "Hours" } },
    },
  };

  return (
    <div style={{ width: 900, margin: "2rem auto" }}>
      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        Time Discrepancy (ETS vs ADO)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Highlights differences between time reported in Azure DevOps (CompletedWork) and time tracked in ETS for the same work items.
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
                  <TableCell align="right">ADO (h)</TableCell>
                  <TableCell align="right">ETS (h)</TableCell>
                  <TableCell align="right">Discrepancy (h)</TableCell>
                  <TableCell align="right">Discrepancy %</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((row) => (
                  <TableRow key={row.taskId}>
                    <TableCell>{row.taskId}</TableCell>
                    <TableCell>{row.title}</TableCell>
                    <TableCell>{row.workItemType}</TableCell>
                    <TableCell align="right">{row.adoCompletedWork}</TableCell>
                    <TableCell align="right">{row.etsActualHours}</TableCell>
                    <TableCell align="right">
                      <Chip
                        size="small"
                        label={`${row.discrepancyHours > 0 ? "+" : ""}${row.discrepancyHours}h`}
                        color={Math.abs(row.discrepancyHours) <= 1 ? "success" : "warning"}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {row.discrepancyPct != null ? (
                        <Chip
                          size="small"
                          label={`${row.discrepancyPct > 0 ? "+" : ""}${row.discrepancyPct}%`}
                          color={Math.abs(row.discrepancyPct) <= 10 ? "success" : "warning"}
                        />
                      ) : "—"}
                    </TableCell>
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

export default TimeDiscrepancyChart;
