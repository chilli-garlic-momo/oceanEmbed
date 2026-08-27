import React from 'react';
import { COLOR_SCALES } from '../data/colormaps';

export function MapLegend({ activeLayer = 'tchp', selectedDepth = 0 }) {
  const scale = COLOR_SCALES[activeLayer] || COLOR_SCALES.tchp;

  return (
    <div className="map-legend-box">
      <div className="legend-title-row">
        <span className="legend-title-text">
          {scale.name}
          {activeLayer === 'temperature' && ` (${selectedDepth === 0 ? 'Surface' : `${selectedDepth}m`})`}
        </span>
        <span className="legend-unit-text">{scale.unit}</span>
      </div>

      <div className="legend-range-label-row">
        <span>LOW</span>
        <span className="legend-range-line"></span>
        <span>HIGH</span>
      </div>

      <div
        className="legend-bar-track"
        style={{ background: scale.cssGradient }}
      />

      <div className="legend-ticks-row">
        {scale.ticks.map((t, idx) => (
          <span key={idx}>{t}</span>
        ))}
      </div>
    </div>
  );
}
