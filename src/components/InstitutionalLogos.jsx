import React from 'react';

/**
 * Vivid, authentic vector SVG logos for leading oceanographic institutions
 */

export function IncoisLogo({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      title="INCOIS - Indian National Centre for Ocean Information Services"
    >
      <circle cx="24" cy="24" r="23" fill="#061C38" stroke="#00D9FF" strokeWidth="1.8" />
      {/* Radiant Sun */}
      <circle cx="24" cy="14" r="4.5" fill="#FACC15" />
      <path d="M24 6V8M24 20V22M16 14H18M30 14H32M18.5 8.5L20 10M28 18L29.5 19.5M29.5 8.5L28 10M20 18L18.5 19.5" stroke="#FACC15" strokeWidth="1.4" strokeLinecap="round" />
      {/* Vibrant Ocean Waves */}
      <path
        d="M6 25C11 20 17 31 24 26C31 21 37 31 42 26"
        stroke="#00D9FF"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M6 32C11 27 17 38 24 33C31 28 37 38 42 33"
        stroke="#10B981"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <path
        d="M9 39C14 36 19 43 24 40C29 37 34 43 39 40"
        stroke="#0284C7"
        strokeWidth="2.0"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function NoaaLogo({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      title="NOAA - National Oceanic and Atmospheric Administration"
    >
      <circle cx="24" cy="24" r="23" fill="#003087" stroke="#00A3E0" strokeWidth="1.8" />
      {/* Top Sky Dome */}
      <path
        d="M5 24C5 13.5 13.5 5 24 5C34.5 5 43 13.5 43 24C34 21.5 25 25.5 17 23.5C11.5 22 7.5 23.2 5 24Z"
        fill="#FFFFFF"
      />
      {/* Flying Seagull in NOAA Blue */}
      <path
        d="M12 18.5C16.5 13.5 23 15 28.5 11.5C24.5 17 21 21.5 12 18.5Z"
        fill="#003087"
      />
      {/* Deep Ocean Water Base */}
      <path
        d="M5 24C10 22.5 15.5 28 24 25.5C32.5 23 37.5 27.5 43 24C43 34.5 34.5 43 24 43C13.5 43 5 34.5 5 24Z"
        fill="#004696"
      />
      {/* Wave Crest in Bright Cyan */}
      <path
        d="M7 32C13 29 19 35 27 32C33 30 38 33 41 34"
        stroke="#00E5FF"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function NasaLogo({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      title="NASA Ocean Physics / JPL"
    >
      <circle cx="24" cy="24" r="23" fill="#0B3D91" stroke="#FC3D21" strokeWidth="1.8" />
      {/* Red Vector Chevron */}
      <path
        d="M10 30L24 10L38 30L28 25.5L24 18.5L20 25.5L10 30Z"
        fill="#FC3D21"
      />
      {/* White Orbit Ellipse */}
      <ellipse
        cx="24"
        cy="24"
        rx="19"
        ry="7.5"
        stroke="#FFFFFF"
        strokeWidth="1.6"
        transform="rotate(-28 24 24)"
      />
      {/* White Stars */}
      <circle cx="15" cy="18" r="1.3" fill="#FFF" />
      <circle cx="33" cy="15" r="1.3" fill="#FFF" />
      <circle cx="29" cy="34" r="1.3" fill="#FFF" />
      <circle cx="18" cy="33" r="1.0" fill="#FFF" />
    </svg>
  );
}

export function ArgoLogo({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      title="ARGO - Global In-Situ Ocean Profiling Network"
    >
      <circle cx="24" cy="24" r="23" fill="#082032" stroke="#10B981" strokeWidth="1.8" />
      {/* Antenna & Beacon */}
      <path d="M24 7V19" stroke="#F5F7FA" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="24" cy="7" r="2.8" fill="#10B981" />
      {/* Telemetry Radar Arcs */}
      <path
        d="M19 11C20.5 9.5 22.2 8.5 24 8.5C25.8 8.5 27.5 9.5 29 11"
        stroke="#00D9FF"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M16 14C18.2 12 21 11 24 11C27 11 29.8 12 32 14"
        stroke="#00D9FF"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.75"
      />
      {/* Float Cylindrical Body */}
      <rect x="17" y="19" width="14" height="21" rx="5" fill="#0284C7" stroke="#00D9FF" strokeWidth="1.8" />
      {/* Sensor Stripes */}
      <path d="M18 27H30" stroke="#10B981" strokeWidth="2" />
      <path d="M18 33H30" stroke="#FACC15" strokeWidth="2" />
    </svg>
  );
}

export function CopernicusLogo({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      title="Copernicus Marine Service (CMEMS)"
    >
      <circle cx="24" cy="24" r="23" fill="#08182B" stroke="#E63946" strokeWidth="1.8" />
      <circle cx="24" cy="24" r="14" stroke="#00D9FF" strokeWidth="1.8" strokeDasharray="4 2.5" />
      <circle cx="24" cy="24" r="5.5" fill="#E63946" />
      <circle cx="34" cy="18" r="3" fill="#00D9FF" />
    </svg>
  );
}
