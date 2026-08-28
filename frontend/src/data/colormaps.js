// Scientific Colormaps for OceanEmbed
// Calibrated oceanographic color scales: TCHP, Subsurface Temperature, D20, and MLD

function hexToRgb(hex) {
  const num = parseInt(hex.replace('#', ''), 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export function getRGBAFromScale(value, scale) {
  const { min, max, stops } = scale;
  const clamped = Math.max(min, Math.min(max, value));
  const normalized = (clamped - min) / (max - min);

  let lowerStop = stops[0];
  let upperStop = stops[stops.length - 1];

  for (let i = 0; i < stops.length - 1; i++) {
    if (normalized >= stops[i].pos && normalized <= stops[i + 1].pos) {
      lowerStop = stops[i];
      upperStop = stops[i + 1];
      break;
    }
  }

  const range = upperStop.pos - lowerStop.pos;
  const factor = range === 0 ? 0 : (normalized - lowerStop.pos) / range;

  const c1 = lowerStop.rgb;
  const c2 = upperStop.rgb;

  const r = Math.round(c1[0] + factor * (c2[0] - c1[0]));
  const g = Math.round(c1[1] + factor * (c2[1] - c1[1]));
  const b = Math.round(c1[2] + factor * (c2[2] - c1[2]));
  const a = Math.round((lowerStop.a + factor * (upperStop.a - lowerStop.a)) * 255);

  return [r, g, b, a];
}

export const COLOR_SCALES = {
  // Scientific TCHP scale:
  // Calibrated so that active warm pools (>65 kJ/cm²) show vivid Yellow,
  // Rapid Intensification (RI) zones (>85 kJ/cm²) show glowing Orange,
  // and extreme cyclone cores (>100 kJ/cm²) show brilliant, fiery Red and Crimson!
  tchp: {
    name: 'TCHP',
    fullName: 'Tropical Cyclone Heat Potential',
    unit: 'kJ/cm²',
    min: 0,
    max: 160,
    ticks: [0, 40, 80, 120, 160],
    stops: [
      { pos: 0.0, hex: '#05142b', rgb: hexToRgb('#05142b'), a: 0.70 },  // Deep sapphire baseline (0 kJ/cm²)
      { pos: 0.15, hex: '#024b86', rgb: hexToRgb('#024b86'), a: 0.78 }, // Indigo blue (~24 kJ/cm²)
      { pos: 0.28, hex: '#0284c7', rgb: hexToRgb('#0284c7'), a: 0.84 }, // Ocean blue (~45 kJ/cm²)
      { pos: 0.40, hex: '#00D9FF', rgb: hexToRgb('#00D9FF'), a: 0.88 }, // Electric cyan (~64 kJ/cm²)
      { pos: 0.50, hex: '#10b981', rgb: hexToRgb('#10b981'), a: 0.91 }, // Emerald green (~80 kJ/cm² - RI threshold)
      { pos: 0.60, hex: '#eab308', rgb: hexToRgb('#eab308'), a: 0.94 }, // Vivid Golden Yellow (~96 kJ/cm²)
      { pos: 0.72, hex: '#f97316', rgb: hexToRgb('#f97316'), a: 0.96 }, // Intense Orange (~115 kJ/cm²)
      { pos: 0.84, hex: '#ef4444', rgb: hexToRgb('#ef4444'), a: 0.98 }, // Fiery Red (~135 kJ/cm²)
      { pos: 1.0, hex: '#991b1b', rgb: hexToRgb('#991b1b'), a: 0.99 },  // Deep Crimson (160+ kJ/cm²)
    ],
    cssGradient: 'linear-gradient(to right, #05142b, #024b86, #0284c7, #00D9FF, #10b981, #eab308, #f97316, #ef4444, #991b1b)',
  },

  // Scientific Subsurface Temperature scale:
  // Calibrated so that surface warm pools (28–31.5°C) glow in rich Yellow, Orange, and Red,
  // while depth levels (100m–1000m) cool smoothly through Cyan and Deep Indigo.
  temperature: {
    name: 'Subsurface Temperature',
    fullName: 'Subsurface Ocean Temperature',
    unit: '°C',
    min: 4,
    max: 32,
    ticks: [4, 10, 16, 22, 28, 32],
    stops: [
      { pos: 0.0, hex: '#040d1f', rgb: hexToRgb('#040d1f'), a: 0.72 },  // 4°C: Abyssal deep blue
      { pos: 0.20, hex: '#1e3a8a', rgb: hexToRgb('#1e3a8a'), a: 0.80 }, // 9.6°C: Deep navy
      { pos: 0.38, hex: '#0284c7', rgb: hexToRgb('#0284c7'), a: 0.85 }, // 14.6°C: Cyan-blue
      { pos: 0.55, hex: '#0d9488', rgb: hexToRgb('#0d9488'), a: 0.89 }, // 19.4°C: Thermocline green
      { pos: 0.70, hex: '#eab308', rgb: hexToRgb('#eab308'), a: 0.93 }, // 23.6°C: Warm yellow
      { pos: 0.82, hex: '#f97316', rgb: hexToRgb('#f97316'), a: 0.96 }, // 27.0°C: Fiery orange
      { pos: 0.92, hex: '#ef4444', rgb: hexToRgb('#ef4444'), a: 0.98 }, // 29.8°C: Vivid warm red
      { pos: 1.0, hex: '#991b1b', rgb: hexToRgb('#991b1b'), a: 0.99 },  // 32.0°C: Deep thermal crimson
    ],
    cssGradient: 'linear-gradient(to right, #040d1f, #1e3a8a, #0284c7, #0d9488, #eab308, #f97316, #ef4444, #991b1b)',
  },

  d20: {
    name: 'D20',
    fullName: '20°C Isotherm Depth',
    unit: 'm',
    min: 20,
    max: 140,
    ticks: [20, 50, 80, 110, 140],
    stops: [
      { pos: 0.0, hex: '#051b36', rgb: hexToRgb('#051b36'), a: 0.75 },
      { pos: 0.25, hex: '#0284c7', rgb: hexToRgb('#0284c7'), a: 0.84 },
      { pos: 0.50, hex: '#00D9FF', rgb: hexToRgb('#00D9FF'), a: 0.90 },
      { pos: 0.75, hex: '#38bdf8', rgb: hexToRgb('#38bdf8'), a: 0.94 },
      { pos: 1.0, hex: '#bae6fd', rgb: hexToRgb('#bae6fd'), a: 0.98 },
    ],
    cssGradient: 'linear-gradient(to right, #051b36, #0284c7, #00D9FF, #38bdf8, #bae6fd)',
  },

  mld: {
    name: 'MLD',
    fullName: 'Mixed Layer Depth',
    unit: 'm',
    min: 10,
    max: 80,
    ticks: [10, 25, 45, 65, 80],
    stops: [
      { pos: 0.0, hex: '#051829', rgb: hexToRgb('#051829'), a: 0.75 },
      { pos: 0.30, hex: '#0369a1', rgb: hexToRgb('#0369a1'), a: 0.84 },
      { pos: 0.60, hex: '#0284c7', rgb: hexToRgb('#0284c7'), a: 0.90 },
      { pos: 0.85, hex: '#38bdf8', rgb: hexToRgb('#38bdf8'), a: 0.94 },
      { pos: 1.0, hex: '#7dd3fc', rgb: hexToRgb('#7dd3fc'), a: 0.98 },
    ],
    cssGradient: 'linear-gradient(to right, #051829, #0369a1, #0284c7, #38bdf8, #7dd3fc)',
  },
};
