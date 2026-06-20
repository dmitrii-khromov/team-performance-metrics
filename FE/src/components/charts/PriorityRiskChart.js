import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import DateRangeControls from "../DateRangeControls";
import { getWorkItemsPriorityRiskSummary } from "../../api/workItemsApi";

function PriorityRiskChart() {
  const [startDate, setStartDate] = useState("2025-08-01");
  const [endDate, setEndDate] = useState("2025-08-01");
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    getWorkItemsPriorityRiskSummary(startDate, endDate)
      .then((data) => {
        setChartData({
          labels: data.labels,
          datasets: [
            ...data.priorityCounts.map((emp, idx) => ({
              label: `${emp.employee} (Priority)`,
              data: emp.values,
              backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56"][idx % 3],
              stack: "Priority",
            })),
            ...data.riskCounts.map((emp, idx) => ({
              label: `${emp.employee} (Risk)`,
              data: emp.values,
              backgroundColor: ["#9AD0F5", "#FFB1C1", "#FFE29A"][idx % 3],
              stack: "Risk",
            })),
          ],
        });
      })
      .catch((err) => {
        // handle error if needed
      });
  }, [startDate, endDate]);

  return (
    <div style={{ width: 700, margin: "2rem auto" }}>
      <DateRangeControls
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
      />
      <h2>Priority & Risk Analysis</h2>
      {chartData ? (
        <Bar
          data={chartData}
          options={{
            plugins: { legend: { position: "bottom" } },
            scales: { x: { stacked: true }, y: { stacked: true } }
          }}
        />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default PriorityRiskChart;