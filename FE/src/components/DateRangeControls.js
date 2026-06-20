import React from "react";
import { TextField } from "@mui/material";

function DateRangeControls({ startDate, endDate, setStartDate, setEndDate }) {
  return (
    <form
      className="date-controls-row"
      style={{ display: "flex", gap: "1rem", justifyContent: "center", marginBottom: "1rem" }}
      onSubmit={e => e.preventDefault()}
    >
      <TextField
        label="Start date"
        type="date"
        id="start-date"
        value={startDate}
        onChange={e => setStartDate(e.target.value)}
        InputLabelProps={{ shrink: true }}
        inputProps={{ max: endDate }}
        sx={{ minWidth: 160 }}
      />
      <TextField
        label="End date"
        type="date"
        id="end-date"
        value={endDate}
        onChange={e => setEndDate(e.target.value)}
        InputLabelProps={{ shrink: true }}
        inputProps={{ min: startDate }}
        sx={{ minWidth: 160 }}
      />
    </form>
  );
}

export default DateRangeControls;