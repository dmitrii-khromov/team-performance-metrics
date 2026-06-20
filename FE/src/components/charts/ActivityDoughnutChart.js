import React, { useState, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import DateRangeControls from "../DateRangeControls";
import { getWorkItemsActivitySummary } from "../../api/workItemsApi";
import { Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const EMPLOYEES = ["Anna Naumova", "Pavlo Sokolov", "Ilfat Galiev", "Dmitrii Khromov"];

function ActivityDoughnutChart() {
  const [startDate, setStartDate] = useState("2025-08-01");
  const [endDate, setEndDate] = useState("2025-08-01");
  const [employee, setEmployee] = useState(EMPLOYEES[0]);
  const [chartData, setChartData] = useState(null);
  const [workItems, setWorkItems] = useState([]);
  const [activityLabels, setActivityLabels] = useState([]);

  useEffect(() => {
    getWorkItemsActivitySummary(employee, startDate, endDate)
      .then((data) => {
        setWorkItems(data.workItems);

        const outerLabels = data.workItems.map((wi) => wi.id);
        const outerData = data.workItems.map(
          (wi) => Object.values(wi.activities).reduce((a, b) => a + b, 0)
        );

        const innerLabels = [];
        const innerData = [];
        const innerColors = [];
        const activityPalette = [
          "#1976D2", "#C62828", "#FBC02D", "#388E3C", "#7B1FA2"
        ];
        data.workItems.forEach((wi, wiIdx) => {
          Object.entries(wi.activities).forEach(([act, hrs], actIdx) => {
            innerLabels.push(`${wi.id}-${act}`);
            innerData.push(hrs);
            innerColors.push(activityPalette[actIdx % activityPalette.length]);
          });
        });

        setActivityLabels(innerLabels);

        setChartData({
          labels: [...outerLabels, ...innerLabels],
          datasets: [
            {
              label: "Work Items",
              data: outerData,
              backgroundColor: [
                "#36A2EB",
                "#FF6384",
                "#FFCE56",
                "#9AD0F5",
                "#FFB1C1",
                "#FFE29A",
                "#8BC34A",
                "#E91E63",
                "#00BCD4",
                "#FF9800"
              ].slice(0, outerData.length),
            },
            {
              label: "Activities",
              data: innerData,
              backgroundColor: innerColors,
            },
          ],
        });
      })
      .catch((err) => {
        // handle error if needed
      });
  }, [employee, startDate, endDate]);

  return (
    <div className="activity-doughnut-container" style={{ width: 700, margin: "2rem auto" }}>
      <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
        Work Item Activities
      </Typography>
      <form
        className="activity-controls-row"
        onSubmit={e => e.preventDefault()}
        style={{ display: "flex", alignItems: "center", gap: "2rem", justifyContent: "center" }}
      >
        <FormControl sx={{ minWidth: 220, flex: "0 0 auto" }}>
          <InputLabel id="employee-select-label" sx={{ top: "-6px" }}>Employee</InputLabel>
          <Select
            labelId="employee-select-label"
            id="employee-select"
            value={employee}
            label="Employee"
            onChange={e => setEmployee(e.target.value)}
            sx={{ mt: 1 }}
          >
            {EMPLOYEES.map(emp => (
              <MenuItem key={emp} value={emp}>
                {emp}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <div style={{ display: "flex", alignItems: "center" }}>
          <DateRangeControls
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
          />
        </div>
      </form>
      {chartData ? (
        <Doughnut
          data={{
            labels: chartData.labels,
            datasets: chartData.datasets,
          }}
          options={{
            plugins: {
              legend: {
                position: "bottom",
                labels: {
                  generateLabels: (chart) => {
                    return chart.data.labels.map((label, i) => ({
                      text: label,
                      fillStyle: chart.data.datasets[0].backgroundColor[i],
                      hidden: false,
                      index: i
                    }));
                  }
                }
              },
              tooltip: {
                callbacks: {
                  labelColor: function (context) {
                    return undefined;
                  },
                  title: function (context) {
                    const datasetIndex = context.datasetIndex;
                    const dataIndex = context.dataIndex;
                    if (datasetIndex === 0) {
                      return `Work Item: ${context.chart.data.labels[dataIndex]} (${context.formattedValue}h)`;
                    }
                    return "";
                  }
                }
              }
            },
            cutout: "40%",
          }}
        />
      ) : (
        <p>Loading...</p>
      )}
      <div style={{ marginTop: "2rem" }}>
        <h4>Work Items</h4>
        <ul>
          {workItems.map((wi) => (
            <li key={wi.id}>
              <strong>{wi.id}</strong>:&nbsp;
              {Object.entries(wi.activities)
                .map(([act, hrs]) => `${act} (${hrs}h)`)
                .join(", ")}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ActivityDoughnutChart;