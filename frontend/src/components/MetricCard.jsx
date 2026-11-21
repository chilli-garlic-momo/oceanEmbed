import React from 'react';

export function MetricCard({
  label,
  value,
  unit,
}) {
  let displayVal = '--';
  if (value !== null && value !== undefined) {
    const num = Number(value);
    displayVal = Number.isFinite(num) ? (Number.isInteger(num) ? num : num.toFixed(1)) : value;
  }

  return (
    <div className="metric-box-card">
      <span className="metric-name-tag">{label}</span>
      <div className="metric-val-unit">
        <span className="metric-big-num" title={String(value)}>{displayVal}</span>
        <span className="metric-sub-unit">{unit}</span>
      </div>
    </div>
  );
}
