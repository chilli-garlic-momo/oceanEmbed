import React from 'react';

export function MetricCard({
  label,
  value,
  unit,
}) {
  return (
    <div className="metric-box-card">
      <span className="metric-name-tag">{label}</span>
      <div className="metric-val-unit">
        <span className="metric-big-num">{value !== null && value !== undefined ? value : '--'}</span>
        <span className="metric-sub-unit">{unit}</span>
      </div>
    </div>
  );
}
