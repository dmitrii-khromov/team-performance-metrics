import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import DateRangeControls from "../DateRangeControls";
import { getWorkItemsEffortSummary } from "../../api/workItemsApi";
import { Typography } from '@mui/material';

function EffortChart() {
  const [startDate, setStartDate] = useState("2025-08-01");
  const [endDate, setEndDate] = useState("2025-08-01");
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    getWorkItemsEffortSummary(startDate, endDate)
      .then((data) => {
        setChartData({
          labels: data.labels,
          datasets: [
            {
              label: "Planned Effort",
              data: data.plannedEffort,
              backgroundColor: "#36A2EB",
            },
            {
              label: "Actual Effort",
              data: data.actualEffort,
              backgroundColor: "#FF6384",
            },
            {
              label: "Overtime",
              data: data.overtime,
              backgroundColor: "#FFCE56",
            },
          ],
        });
      })
      .catch((err) => {
        // handle error if needed
      });
  }, [startDate, endDate]);

  return (
    <div style={{ width: 700, margin: "2rem auto" }}>
      <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
        Planned vs Actual Effort (hours)
      </Typography>
      <DateRangeControls
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
      />
      {chartData ? <Bar data={chartData} /> : <p>Loading...</p>}
    </div>
  );
}

export default EffortChart;