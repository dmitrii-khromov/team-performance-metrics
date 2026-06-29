// Base URL for your API
const BASE_URL = "http://localhost:5000/api";

// Mode: "debug" uses backend stubs, "real" queries Azure DevOps + ETS.
// Persisted in localStorage so it survives reloads.
let appMode = (typeof localStorage !== "undefined" && localStorage.getItem("appMode")) || "debug";

export function setAppMode(mode) {
  appMode = mode === "real" ? "real" : "debug";
  if (typeof localStorage !== "undefined") localStorage.setItem("appMode", appMode);
}

export function getAppMode() {
  return appMode;
}

function modeParam() {
  return `debug=${appMode === "real" ? "false" : "true"}`;
}

// Helper for GET requests
async function fetchJson(url) {
  const sep = url.includes("?") ? "&" : "?";
  const response = await fetch(`${url}${sep}${modeParam()}`);
  if (!response.ok) throw new Error("Network response was not ok");
  return response.json();
}

// Status summary
export function getWorkItemsStatusSummary(startDate, endDate) {
  return fetchJson(`${BASE_URL}/work-items-status-summary?start_date=${startDate}&end_date=${endDate}`);
}

// Effort summary
export function getWorkItemsEffortSummary(startDate, endDate) {
  return fetchJson(`${BASE_URL}/work-items-effort-summary?start_date=${startDate}&end_date=${endDate}`);
}

// Type breakdown
export function getWorkItemsTypeBreakdown(startDate, endDate) {
  return fetchJson(`${BASE_URL}/work-items-type-breakdown?start_date=${startDate}&end_date=${endDate}`);
}

// Assignment summary
export function getWorkItemsAssignmentSummary(startDate, endDate) {
  return fetchJson(`${BASE_URL}/work-items-assignment-summary?start_date=${startDate}&end_date=${endDate}`);
}

// Priority & risk summary
export function getWorkItemsPriorityRiskSummary(startDate, endDate) {
  return fetchJson(`${BASE_URL}/work-items-priority-risk-summary?start_date=${startDate}&end_date=${endDate}`);
}

// Activity summary (per employee)
export function getWorkItemsActivitySummary(employee, startDate, endDate) {
  return fetchJson(`${BASE_URL}/work-items-activity-summary?employee=${encodeURIComponent(employee)}&start_date=${startDate}&end_date=${endDate}`);
}

// Estimation accuracy metrics (ETS actual vs ADO estimate)
export function getMetricsEstimationAccuracy(startDate, endDate) {
  return fetchJson(`${BASE_URL}/metrics/estimation-accuracy?start_date=${startDate}&end_date=${endDate}`);
}

// Time discrepancy metrics (ETS hours vs ADO CompletedWork)
export function getMetricsTimeDiscrepancy(startDate, endDate) {
  return fetchJson(`${BASE_URL}/metrics/time-discrepancy?start_date=${startDate}&end_date=${endDate}`);
}

// Activity distribution metrics
export function getMetricsActivityDistribution(startDate, endDate) {
  return fetchJson(`${BASE_URL}/metrics/activity-distribution?start_date=${startDate}&end_date=${endDate}`);
}

// All combined metrics
export function getMetricsAll(startDate, endDate) {
  return fetchJson(`${BASE_URL}/metrics/all?start_date=${startDate}&end_date=${endDate}`);
}