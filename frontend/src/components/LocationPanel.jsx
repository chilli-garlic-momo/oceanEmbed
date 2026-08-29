import React from 'react';
import {
  MapPin,
  Calendar,
  X,
  Compass,
  Sparkles,
  Activity,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { ProfileChart } from './ProfileChart';
import { MetricCard } from './MetricCard';
import { ArgoLogo } from './InstitutionalLogos';
import { getTranslation, formatLocalizedDate } from '../data/i18n';

export function LocationPanel({
  selectedLocation,
  profileData,
  isLoadingProfile,
  onSelectSampleLocation,
  onClose,
  currentDate = '2026-08-27',
  currentLang = 'en',
  theme = 'dark',
  isPlaying = false,
}) {
  const t = (key) => getTranslation(currentLang, key);

  // 1. Initial State: No Ocean Location Selected
  if (!selectedLocation || selectedLocation.isLand) {
    return (
      <aside className="right-panel">
        <div className="empty-selection-box">
          <div className="empty-compass-icon">
            <Compass size={26} />
          </div>

          <div className="empty-text-group">
            <h3 className="empty-title">{t('location.emptyInspectorTitle')}</h3>
            <p className="empty-desc">{t('location.emptyInspectorDesc')}</p>
          </div>

          <button
            id="btn-sample-genesis"
            className="btn-demo-sample"
            onClick={() => onSelectSampleLocation(18.25, 88.5)}
          >
            <Sparkles size={14} style={{ display: 'inline', marginRight: '6px' }} />
            <span>{t('location.sampleGenesisBtn')}</span>
          </button>
        </div>
      </aside>
    );
  }

  const { lat, lon, metrics, basin, nearestArgo } = profileData || {
    lat: selectedLocation.lat,
    lon: selectedLocation.lon,
    metrics: { tchp: 126.2, d20: 85, mld: 31, sst: 30.8 },
    basin: 'Bay of Bengal',
    nearestArgo: {
      wmo: '2902346',
      institution: 'INCOIS (Ministry of Earth Sciences)',
      platformType: 'Apex Profiler (CTD + DOXY)',
      observedDate: `${currentDate} 08:00 UTC`,
      distanceKm: 42,
      qcStatus: 'Good (WMO Passed)',
    },
  };

  const formattedLat = `${lat >= 0 ? `${lat.toFixed(2)}° N` : `${Math.abs(lat).toFixed(2)}° S`}`;
  const formattedLon = `${lon >= 0 ? `${lon.toFixed(2)}° E` : `${Math.abs(lon).toFixed(2)}° W`}`;

  const argo = nearestArgo || {
    wmo: '2902346',
    institution: 'INCOIS (Ministry of Earth Sciences)',
    platformType: 'Apex Profiler',
    observedDate: `${currentDate} 08:00 UTC`,
    distanceKm: 42,
    qcStatus: 'Good (WMO Passed)',
  };

  const rawBasin = profileData?.basin || selectedLocation?.basin || (
    lat >= 8.0 && lon >= 79.5 && lon <= 98.0
      ? (lon > 92.0 && lat < 15.0 ? 'Andaman Sea' : 'Bay of Bengal')
      : (lat >= 8.0 && lon >= 50.0 && lon < 77.5
          ? (lat <= 14.0 && lon >= 71.0 ? 'Lakshadweep Sea' : 'Arabian Sea')
          : 'Equatorial Indian Ocean')
  );

  const translatedBasin = (rawBasin && typeof rawBasin === 'string' && !rawBasin.includes('undefined'))
    ? (t(`map.basins.${rawBasin}`) || rawBasin)
    : 'Bay of Bengal';

  const hasElevatedHeat = (metrics?.tchp ?? 0) >= 80;
  const sstVal = typeof metrics?.sst === 'number' ? metrics.sst.toFixed(1) : (metrics?.sst ?? '30.8');

  return (
    <aside className="right-panel">
      {/* 1. Header */}
      <div className="location-details-header">
        <div className="location-header-left">
          <Activity size={14} style={{ color: 'var(--text-secondary)' }} />
          <span className="location-title-main">{t('location.pointInspection')}</span>
        </div>
        <button className="btn-close-panel" onClick={onClose} title={t('location.deselectLocation')}>
          <X size={15} />
        </button>
      </div>

      {/* 2. Clear Visual Hierarchy: Coordinates -> Ocean/Sea Region -> Synchronized Date/Time */}
      <div className="location-meta-card">
        {/* Tier 1: Primary Coordinates */}
        <div className="location-pin-coords">
          <MapPin size={17} className="pin-icon" />
          <span>
            {formattedLat}, {formattedLon}
          </span>
        </div>

        {/* Tier 2: Ocean / Marine Basin Region */}
        <div className="location-basin-label">{translatedBasin}</div>

        {/* Tier 3: Synchronized Date, Time, and 12Z Cycle */}
        <div className="location-datetime-row">
          <Calendar size={12} />
          <span>{formatLocalizedDate(currentDate, currentLang, true)}</span>
        </div>
      </div>

      {/* 3. Integrated Metrics with Refined, Non-Alarmist Heat State Badge */}
      <div className="key-metrics-section">
        <div className="key-metrics-title-row">
          <span className="location-title-main">{t('location.integratedMetrics')}</span>
          {hasElevatedHeat ? (
            <span className="thermal-risk-badge elevated" title="Upper ocean heat flux > 80 kJ/cm² supporting active cyclogenesis">
              <Flame size={11} />
              <span>{t('location.highHeatPotential')}</span>
            </span>
          ) : (
            <span className="thermal-risk-badge nominal" title="Nominal background ocean heat flux">
              <CheckCircle2 size={11} />
              <span>{t('location.nominalThermalState')}</span>
            </span>
          )}
        </div>

        <div className="metrics-row-cards">
          <MetricCard
            label="TCHP"
            value={metrics?.tchp ?? 126.2}
            unit="kJ/cm²"
          />
          <MetricCard
            label="D20"
            value={metrics?.d20 ?? 85}
            unit="m"
          />
          <MetricCard
            label="MLD"
            value={metrics?.mld ?? 31}
            unit="m"
          />
        </div>
      </div>

      {/* 4. Subsurface Temperature Profile Chart */}
      <div className="chart-section-card">
        {isLoadingProfile && !isPlaying && (
          <div className="chart-loading-overlay">
            <div className="spinner-ring" />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              {t('location.reconstructingProfile')}
            </span>
          </div>
        )}

        <div className="profile-chart-header-row">
          <div className="profile-chart-title">{t('location.subsurfaceTempProfile')}</div>
          <span className="profile-surface-tag">{t('location.sstLabel')} {sstVal}°C</span>
        </div>


        <div className="profile-chart-legend">
          <div className="legend-entry">
            <span className="legend-line-cyan" />
            <span>{t('location.neuralOperator')}</span>
          </div>
          <div className="legend-entry">
            <span className="legend-band-blue" />
            <span>{t('location.uncertaintyBand')}</span>
          </div>
          <div className="legend-entry">
            <span className="legend-dot-green" />
            <span>{t('location.argoInSitu')}</span>
          </div>
        </div>

        <ProfileChart
          profileData={profileData}
          theme={theme}
          currentLang={currentLang}
          isPlaying={isPlaying}
        />
      </div>

      {/* 5. ARGO In-Situ Ground Truth Card */}
      <div className="argo-info-card">
        <div className="argo-info-header">
          <div className="argo-header-left">
            <ArgoLogo size={18} />
            <div className="argo-title-box">
              <span className="argo-main-title">{t('location.argoValidation')}</span>
              <span className="argo-sub-agency">{t('location.globalProfiling')}</span>
            </div>
          </div>
          <span className="qc-pill-good">{t('location.qcPassed')}</span>
        </div>

        <div className="argo-info-grid">
          <div className="argo-grid-item">
            <span className="argo-item-label">{t('location.wmoFloat')}</span>
            <strong className="argo-item-val">{argo.wmo}</strong>
          </div>
          <div className="argo-grid-item">
            <span className="argo-item-label">{t('location.deployingAgency')}</span>
            <strong className="argo-item-val">{argo.institution || 'INCOIS / MoES'}</strong>
          </div>
          <div className="argo-grid-item">
            <span className="argo-item-label">{t('location.observationTime')}</span>
            <strong className="argo-item-val">{argo.observedDate || `${currentDate} · 08:00 UTC`}</strong>
          </div>
          <div className="argo-grid-item">
            <span className="argo-item-label">{t('location.sensorDistance')}</span>
            <strong className="argo-item-val">{argo.distanceKm} km</strong>
          </div>
        </div>
      </div>
    </aside>
  );
}
