import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Plus, Minus, RotateCcw, Crosshair } from 'lucide-react';
import { COLOR_SCALES, getRGBAFromScale } from '../data/colormaps';
import { computeOceanState, isLand, ARGO_FLOATS, getHaversineDistance } from '../data/mock';
import { getTranslation } from '../data/i18n';

// North Indian Ocean Domain (Arabian Sea, Bay of Bengal, Equatorial Indian Ocean)
const DEFAULT_CENTER = [13.5, 77.0];
const DEFAULT_ZOOM = 5.0;

// High-speed in-memory cache for rendered raster frames
const RASTER_DATAURL_CACHE = new Map();

// Minimal scientific reticle marker
const createScientificReticleIcon = (coordLabel) => {
  return L.divIcon({
    className: 'scientific-reticle-container',
    html: `
      <div class="scientific-reticle">
        <div class="reticle-ping-ring"></div>
        <div class="reticle-crosshair-h"></div>
        <div class="reticle-crosshair-v"></div>
        <div class="reticle-center-dot"></div>
        <div class="reticle-coord-chip">${coordLabel}</div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

// Subtle, visually secondary in-situ ARGO float marker
const createArgoFloatIcon = (wmo) => {
  return L.divIcon({
    className: 'argo-map-marker-container',
    html: `
      <div class="argo-map-marker" title="ARGO Profiling Float ${wmo}">
        <div class="argo-marker-pulse"></div>
        <div class="argo-marker-core"></div>
        <div class="argo-marker-label">ARGO ${wmo}</div>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
};

// Geography & basin typography labels
const BASIN_LABELS = [
  { nameKey: 'Arabian Sea', fallback: 'ARABIAN SEA', lat: 16.0, lon: 64.5 },
  { nameKey: 'Bay of Bengal', fallback: 'BAY OF BENGAL', lat: 15.5, lon: 88.2 },
  { nameKey: 'Equatorial Indian Ocean', fallback: 'EQUATORIAL INDIAN OCEAN', lat: -1.0, lon: 77.0 },
  { nameKey: 'Andaman Sea', fallback: 'ANDAMAN SEA', lat: 11.5, lon: 95.5 },
  { nameKey: 'Lakshadweep Sea', fallback: 'LAKSHADWEEP SEA', lat: 10.8, lon: 72.5 },
  { nameKey: 'Maldives', fallback: 'MALDIVES', lat: 3.5, lon: 73.2 },
];

export function MapView({
  activeLayer,
  selectedDepth,
  currentDate,
  fieldData,
  selectedLocation,
  onSelectLocation,
  onLandClick,
  isLoadingField,
  mapFocusTarget,
  currentLang = 'en',
  onMapInteraction,
}) {
  const t = (key) => getTranslation(currentLang, key);

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const imageOverlayRef = useRef(null);
  const selectedMarkerRef = useRef(null);
  const argoMarkersRef = useRef([]);
  const basinMarkersRef = useRef([]);

  // Hover state for real-time cursor ocean probe
  const [hoverData, setHoverData] = useState(null);
  const [mousePixelPos, setMousePixelPos] = useState({ x: 0, y: 0 });
  const hoverRafRef = useRef(null);

  // Store latest state in refs to avoid re-triggering map useEffect
  const currentDateRef = useRef(currentDate);
  currentDateRef.current = currentDate;

  const selectedLocationRef = useRef(selectedLocation);
  selectedLocationRef.current = selectedLocation;

  const onSelectLocationRef = useRef(onSelectLocation);
  onSelectLocationRef.current = onSelectLocation;

  const onLandClickRef = useRef(onLandClick);
  onLandClickRef.current = onLandClick;

  const onMapInteractionRef = useRef(onMapInteraction);
  onMapInteractionRef.current = onMapInteraction;

  // 1. Initialize Map ONCE with smooth physics (Never re-initializes during animation)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      minZoom: 4.2,
      maxZoom: 8.5,
      zoomControl: false,
      attributionControl: false,
      wheelPxPerZoomLevel: 80,
      zoomAnimation: true,
      fadeAnimation: true,
      markerZoomAnimation: true,
      inertia: true,
      inertiaDeceleration: 3000,
      maxBounds: [
        [-10.0, 38.0],
        [30.0, 106.0],
      ],
    });

    mapRef.current = map;

    // ESRI Ocean Basemap
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}',
      {
        className: 'ocean-basemap-tiles',
        maxZoom: 13,
        zIndex: 1,
      }
    ).addTo(map);

    // ESRI Reference Labels - Subdued
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
      {
        className: 'reference-basemap-tiles',
        maxZoom: 16,
        zIndex: 350,
        opacity: 0.35,
      }
    ).addTo(map);

    // Add readable basin typography labels
    basinMarkersRef.current = BASIN_LABELS.map((b) => {
      const localizedName = t(`map.basins.${b.nameKey}`) || b.fallback;
      const basinIcon = L.divIcon({
        className: 'basin-label-container',
        html: `<div class="basin-overlay-label">${localizedName.toUpperCase()}</div>`,
        iconSize: [200, 22],
        iconAnchor: [100, 11],
      });
      return L.marker([b.lat, b.lon], {
        icon: basinIcon,
        zIndexOffset: 250,
        interactive: false,
      }).addTo(map);
    });

    // Render permanent ARGO float markers with rich hover/click tooltips
    argoMarkersRef.current = ARGO_FLOATS.map((f) => {
      const marker = L.marker([f.lat, f.lon], {
        icon: createArgoFloatIcon(f.wmo),
        zIndexOffset: 600,
      }).addTo(map);

      // Tooltip on hover
      const tooltipContent = `
        <div class="argo-map-tooltip-box">
          <div class="argo-tt-title-row">
            <strong>ARGO ${f.wmo}</strong>
            <span class="argo-tt-qc">QC PASSED</span>
          </div>
          <div class="argo-tt-info-row">
            <span>Agency:</span> <strong>${f.institution}</strong>
          </div>
          <div class="argo-tt-info-row">
            <span>Obs Time:</span> <strong>${currentDateRef.current} · 08:00 UTC</strong>
          </div>
          <div class="argo-tt-action-hint">Click to inspect in-situ profile</div>
        </div>
      `;

      marker.bindTooltip(tooltipContent, {
        className: 'argo-glass-tooltip',
        direction: 'top',
        offset: [0, -10],
      });

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        if (onSelectLocationRef.current) {
          onSelectLocationRef.current(f.lat, f.lon);
        }
      });

      return marker;
    });

    // Map click handler
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      const normLng = ((lng % 360) + 540) % 360 - 180;
      const landCheck = isLand(lat, normLng);

      if (landCheck) {
        if (onLandClickRef.current) {
          onLandClickRef.current();
        }
      } else {
        if (onSelectLocationRef.current) {
          onSelectLocationRef.current(lat, normLng);
        }
      }
    });

    // Auto-pause animation on map drag / zoom
    map.on('dragstart zoomstart movestart', () => {
      if (onMapInteractionRef.current) {
        onMapInteractionRef.current();
      }
    });

    // Optimized smooth mousemove probe
    map.on('mousemove', (e) => {
      if (hoverRafRef.current) cancelAnimationFrame(hoverRafRef.current);

      hoverRafRef.current = requestAnimationFrame(() => {
        const { lat, lng } = e.latlng;
        const normLng = ((lng % 360) + 540) % 360 - 180;
        const land = isLand(lat, normLng);

        setMousePixelPos({
          x: e.containerPoint.x,
          y: e.containerPoint.y,
        });

        if (land) {
          setHoverData(null);
        } else {
          const state = computeOceanState(lat, normLng, currentDateRef.current);
          setHoverData({
            lat: Number(lat.toFixed(2)),
            lon: Number(normLng.toFixed(2)),
            basin: state.basin,
            state,
          });
        }
      });
    });

    map.on('mouseout', () => {
      setHoverData(null);
    });

    return () => {
      if (hoverRafRef.current) cancelAnimationFrame(hoverRafRef.current);
      map.remove();
      mapRef.current = null;
    };
  }, []); // Run ONCE on mount

  // Update basin markers when language changes
  useEffect(() => {
    if (!basinMarkersRef.current.length) return;
    basinMarkersRef.current.forEach((marker, idx) => {
      const b = BASIN_LABELS[idx];
      if (!b) return;
      const localizedName = t(`map.basins.${b.nameKey}`) || b.fallback;
      const basinIcon = L.divIcon({
        className: 'basin-label-container',
        html: `<div class="basin-overlay-label">${localizedName.toUpperCase()}</div>`,
        iconSize: [200, 22],
        iconAnchor: [100, 11],
      });
      marker.setIcon(basinIcon);
    });
  }, [currentLang]);

  // 2. Render Continuous Canvas Raster Field with bilinear smoothing and DataURL caching
  useEffect(() => {
    if (!mapRef.current || !fieldData) return;

    const { bounds, rows, cols, grid, edgeMask } = fieldData;
    const cacheKey = `${activeLayer}_${selectedDepth}_${currentDate}`;
    const latLngBounds = [
      [bounds.minLat, bounds.minLon],
      [bounds.maxLat, bounds.maxLon],
    ];

    // 1. Instant Cache Hit: Skip canvas computation
    if (RASTER_DATAURL_CACHE.has(cacheKey)) {
      const cachedDataUrl = RASTER_DATAURL_CACHE.get(cacheKey);
      if (imageOverlayRef.current) {
        imageOverlayRef.current.setUrl(cachedDataUrl);
      } else {
        imageOverlayRef.current = L.imageOverlay(cachedDataUrl, latLngBounds, {
          opacity: 0.90,
          interactive: false,
          zIndex: 200,
          className: 'ocean-data-raster-overlay',
        }).addTo(mapRef.current);
      }
      return;
    }

    // 2. Cache Miss: High quality smooth canvas rendering
    const scale = COLOR_SCALES[activeLayer] || COLOR_SCALES.tchp;
    const canvas = document.createElement('canvas');
    canvas.width = cols;
    canvas.height = rows;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(cols, rows);
    const data = imgData.data;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const val = grid[r][c];
        const fade = edgeMask ? edgeMask[r][c] : 1.0;
        const idx = (r * cols + c) * 4;

        if (val === null || val === undefined || fade <= 0.01) {
          data[idx] = 0;
          data[idx + 1] = 0;
          data[idx + 2] = 0;
          data[idx + 3] = 0;
        } else {
          const [red, green, blue, alpha] = getRGBAFromScale(val, scale);
          data[idx] = red;
          data[idx + 1] = green;
          data[idx + 2] = blue;
          data[idx + 3] = Math.round(alpha * fade * 0.88);
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Upscale by 4x with bicubic smoothing for silky gradients
    const upscaled = document.createElement('canvas');
    const scaleFactor = 4;
    upscaled.width = cols * scaleFactor;
    upscaled.height = rows * scaleFactor;
    const upCtx = upscaled.getContext('2d');
    upCtx.imageSmoothingEnabled = true;
    upCtx.imageSmoothingQuality = 'high';
    upCtx.drawImage(canvas, 0, 0, upscaled.width, upscaled.height);

    const finalImgData = upCtx.getImageData(0, 0, upscaled.width, upscaled.height);
    const finalPixels = finalImgData.data;
    const upRows = upscaled.height;
    const upCols = upscaled.width;
    const latSpan = bounds.maxLat - bounds.minLat;
    const lonSpan = bounds.maxLon - bounds.minLon;

    for (let y = 0; y < upRows; y++) {
      const pixelLat = bounds.maxLat - (y / (upRows - 1)) * latSpan;
      for (let x = 0; x < upCols; x++) {
        const pixelLon = bounds.minLon + (x / (upCols - 1)) * lonSpan;
        if (isLand(pixelLat, pixelLon)) {
          const pIdx = (y * upCols + x) * 4;
          finalPixels[pIdx + 3] = 0;
        }
      }
    }
    upCtx.putImageData(finalImgData, 0, 0);

    const dataUrl = upscaled.toDataURL('image/png');
    RASTER_DATAURL_CACHE.set(cacheKey, dataUrl);

    if (imageOverlayRef.current) {
      imageOverlayRef.current.setUrl(dataUrl);
      imageOverlayRef.current.setBounds(latLngBounds);
    } else {
      imageOverlayRef.current = L.imageOverlay(dataUrl, latLngBounds, {
        opacity: 0.90,
        interactive: false,
        zIndex: 200,
        className: 'ocean-data-raster-overlay',
      }).addTo(mapRef.current);
    }
  }, [fieldData, activeLayer, selectedDepth, currentDate]);

  // 3. Update Scientific Location Marker
  useEffect(() => {
    if (!mapRef.current) return;

    if (selectedMarkerRef.current) {
      mapRef.current.removeLayer(selectedMarkerRef.current);
      selectedMarkerRef.current = null;
    }

    if (selectedLocation && !selectedLocation.isLand) {
      const latStr = `${selectedLocation.lat >= 0 ? `${selectedLocation.lat.toFixed(2)}° N` : `${Math.abs(selectedLocation.lat).toFixed(2)}° S`}`;
      const lonStr = `${selectedLocation.lon >= 0 ? `${selectedLocation.lon.toFixed(2)}° E` : `${Math.abs(selectedLocation.lon).toFixed(2)}° W`}`;
      const coordLabel = `${latStr} · ${lonStr}`;

      const marker = L.marker([selectedLocation.lat, selectedLocation.lon], {
        icon: createScientificReticleIcon(coordLabel),
        zIndexOffset: 1000,
        interactive: false,
      }).addTo(mapRef.current);

      selectedMarkerRef.current = marker;
    }
  }, [selectedLocation]);

  // 4. Focus target changes
  useEffect(() => {
    if (!mapRef.current || !mapFocusTarget) return;
    mapRef.current.flyTo([mapFocusTarget.lat, mapFocusTarget.lon], mapFocusTarget.zoom, {
      duration: 0.8,
    });
  }, [mapFocusTarget]);

  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();
  const handleReset = () => {
    mapRef.current?.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM, { duration: 0.8 });
  };
  const handleFocusSelected = () => {
    if (selectedLocation) {
      mapRef.current?.flyTo([selectedLocation.lat, selectedLocation.lon], 6.5, { duration: 0.8 });
    } else {
      mapRef.current?.flyTo([18.25, 88.5], 6.5, { duration: 0.8 });
    }
  };

  const scale = COLOR_SCALES[activeLayer] || COLOR_SCALES.tchp;

  // Dynamic domain/basin badge resolution
  const getContextLayerBadge = () => {
    const regionName = selectedLocation && !selectedLocation.isLand && selectedLocation.basin
      ? (t(`map.basins.${selectedLocation.basin}`) || selectedLocation.basin)
      : (t('footer.domainDefault') || 'North Indian Ocean Basin').split(' (')[0];

    if (activeLayer === 'tchp') {
      return `${regionName} • TCHP (0–160 kJ/cm²)`;
    }
    if (activeLayer === 'temperature') {
      const depthObj = t(`layers.depths.${selectedDepth}`);
      const dLabel = selectedDepth === 0 ? 'Surface (SST)' : `${selectedDepth} m`;
      return `${regionName} • ${t('layers.items.temperature.name')} (${depthObj?.label || dLabel})`;
    }
    if (activeLayer === 'd20') {
      return `${regionName} • D20 (20°C Isotherm Depth)`;
    }
    if (activeLayer === 'mld') {
      return `${regionName} • MLD (Mixed Layer Depth)`;
    }
    return `${regionName} • ${scale.name}`;
  };

  return (
    <div className="map-container-wrapper">
      <div id="leaflet-map" ref={mapContainerRef} />

      {/* Top-Left Dynamic Context Layer Badge */}
      <div className="map-layer-badge">
        <span className="layer-square-indicator" />
        <span>{getContextLayerBadge()}</span>
      </div>

      {/* Top-Right Glass Map Controls */}
      <div className="map-controls-group">
        <button
          id="btn-zoom-in"
          className="map-btn-icon"
          onClick={handleZoomIn}
          title={t('map.zoomIn')}
        >
          <Plus size={16} />
        </button>
        <button
          id="btn-zoom-out"
          className="map-btn-icon"
          onClick={handleZoomOut}
          title={t('map.zoomOut')}
        >
          <Minus size={16} />
        </button>
        <button
          id="btn-center-focus"
          className="map-btn-icon"
          onClick={handleFocusSelected}
          title={t('map.centerFocus')}
        >
          <Crosshair size={16} />
        </button>
        <button
          id="btn-reset-view"
          className="map-btn-icon"
          onClick={handleReset}
          title={t('map.resetView')}
        >
          <RotateCcw size={15} />
        </button>
      </div>

      {/* Real-Time Ocean Hover Probe Tooltip */}
      {hoverData && (
        <div
          className="map-hover-probe"
          style={{
            left: `${mousePixelPos.x + 12}px`,
            top: `${mousePixelPos.y - 18}px`,
          }}
        >
          <div className="probe-header-row">
            <span className="probe-coords">
              {hoverData.lat >= 0 ? `${hoverData.lat.toFixed(2)}° N` : `${Math.abs(hoverData.lat).toFixed(2)}° S`} ·{' '}
              {hoverData.lon >= 0 ? `${hoverData.lon.toFixed(2)}° E` : `${Math.abs(hoverData.lon).toFixed(2)}° W`}
            </span>
            <span className="probe-basin-tag">
              {t(`map.basins.${hoverData.basin}`) || hoverData.basin}
            </span>
          </div>

          <div className="probe-val-row">
            {activeLayer === 'tchp' && (
              <span className="probe-val">{hoverData.state.tchp} kJ/cm²</span>
            )}
            {activeLayer === 'temperature' && (
              <span className="probe-val">{hoverData.state.sst} °C</span>
            )}
            {activeLayer === 'd20' && (
              <span className="probe-val">{hoverData.state.d20} m</span>
            )}
            {activeLayer === 'mld' && (
              <span className="probe-val">{hoverData.state.mld} m</span>
            )}
          </div>
        </div>
      )}

      {/* Compact Scientific Map Legend */}
      <div className="map-legend-box">
        <div className="legend-title-row">
          <span className="legend-title-text">{scale.name}</span>
          <span className="legend-unit-text">{scale.unit}</span>
        </div>

        <div className="legend-range-label-row">
          <span>{t('map.low')}</span>
          <span className="legend-range-line"></span>
          <span>{t('map.high')}</span>
        </div>

        <div
          className="legend-bar-track"
          style={{ background: scale.cssGradient }}
        />

        <div className="legend-ticks-row">
          {scale.ticks.map((tVal, idx) => (
            <span key={idx}>{tVal}</span>
          ))}
        </div>

        <div className="legend-source-tag">
          {t('map.legendDomain')}
        </div>
      </div>

      {/* Localized Ocean Field Loader */}
      {isLoadingField && (
        <div className="map-field-loader-pill">
          <div className="spinner-ring micro" />
          <span>{t('map.renderingLayer')}</span>
        </div>
      )}
    </div>
  );
}
