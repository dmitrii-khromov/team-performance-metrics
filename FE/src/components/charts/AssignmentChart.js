import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import DateRangeControls from "../DateRangeControls";
import { getWorkItemsAssignmentSummary } from "../../api/workItemsApi";

function AssignmentChart() {
  const [startDate, setStartDate] = useState("2025-08-01");
  const [endDate, setEndDate] = useState("2025-08-01");
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    getWorkItemsAssignmentSummary(startDate, endDate)
      .then((data) => {
        setChartData({
          labels: data.labels,
          datasets: [
            {
              label: "Assigned Work Items",
              data: data.assignedCount,
              backgroundColor: "#36A2EB",
            },
          ],
        });
      })
      .catch((err) => {
        console.error(err);
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
      <h2>Workload Distribution</h2>
      {chartData ? <Bar data={chartData} /> : <p>Loading...</p>}
    </div>
  );
}

export default AssignmentChart;