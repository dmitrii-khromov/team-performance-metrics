import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import DateRangeControls from "../DateRangeControls";
import { getWorkItemsTypeBreakdown } from "../../api/workItemsApi";

function TypeBreakdownChart() {
  const [startDate, setStartDate] = useState("2025-08-01");
  const [endDate, setEndDate] = useState("2025-08-01");
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    getWorkItemsTypeBreakdown(startDate, endDate)
      .then((data) => {
        setChartData({
          labels: data.labels,
          datasets: data.counts.map((emp, idx) => ({
            label: emp.employee,
            data: emp.values,
            backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56"][idx % 3],
          })),
        });
      })
      .catch((err) => {
        // handle error if needed
      });
  }, [startDate, endDate]);

  return (
    <div style={{ width: 700, margin: "2rem auto" }}>
      <h2>Work Item Type Breakdown (per Employee)</h2>
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

export default TypeBreakdownChart;