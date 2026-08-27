import React from 'react';
import { Info, Calendar, Sun, Moon } from 'lucide-react';
import oceanEmbedLogo from '../assets/oceanembed-icon.png';
import { IncoisLogo, NoaaLogo, ArgoLogo, NasaLogo } from './InstitutionalLogos';
import { getTranslation, formatLocalizedDate, SUPPORTED_LANGUAGES } from '../data/i18n';

export function Header({
  onOpenAbout,
  currentDate = '2026-08-27',
  theme = 'dark',
  onToggleTheme,
  currentLang = 'en',
  onChangeLang,
}) {
  const t = (key) => getTranslation(currentLang, key);

  return (
    <header className="app-header">
      {/* 1. Brand Section */}
      <div className="header-left">
        <div className="brand-logo-link" onClick={() => window.location.reload()} title="Reload OceanEmbed Platform">
          <div className="brand-wave-icon" title="OceanEmbed Logo">
            <img
              src={oceanEmbedLogo}
              alt="OceanEmbed Logo"
              className="brand-logo-img"
              width="36"
              height="36"
            />
          </div>
          <div className="brand-text-block">
            <h1 className="brand-title">
              <span className="brand-word-ocean">Ocean</span>
              <span className="brand-word-embed">Embed</span>
            </h1>
            <span className="brand-tagline">{t('brand.tagline')}</span>
          </div>
        </div>
      </div>

      {/* 2. Operational Status & Reference Ingestion Badges */}
      <div className="header-center">
        <div className="system-status-chip">
          <div className="status-operational-indicator">
            <span className="status-live-dot" />
            <span className="status-operational-text">{t('header.statusOperational')}</span>
          </div>

          <span className="status-divider">|</span>

          <div className="institutional-partner-badges" title="Operational Reference Standards: INCOIS, NOAA, ARGO, NASA">
            <div className="partner-badge-item incois-badge">
              <IncoisLogo size={18} />
              <span>INCOIS</span>
            </div>
            <div className="partner-badge-item noaa-badge">
              <NoaaLogo size={18} />
              <span>NOAA</span>
            </div>
            <div className="partner-badge-item argo-badge">
              <ArgoLogo size={18} />
              <span>ARGO</span>
            </div>
            <div className="partner-badge-item nasa-badge">
              <NasaLogo size={18} />
              <span>NASA</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Ingestion Time, Theme Toggle, Language Switcher & About */}
      <div className="header-right">
        <div className="header-data-date">
          <Calendar size={13} style={{ color: 'var(--text-secondary)' }} />
          <span>{t('header.analysisCycle')}</span>
          <strong>{formatLocalizedDate(currentDate, currentLang, true)}</strong>
        </div>

        <div className="header-controls-cluster">
          {/* Theme Toggle Button (Sun/Moon) */}
          <button
            id="btn-theme-toggle"
            className="btn-theme-toggle"
            onClick={onToggleTheme}
            title={theme === 'dark' ? t('header.themeToggleDark') : t('header.themeToggleLight')}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Multi-Language Selector (English primary, Hindi 2nd, followed by Indian Regional Languages) */}
          <select
            id="select-language"
            className="lang-switcher-dropdown"
            value={currentLang}
            onChange={(e) => onChangeLang(e.target.value)}
            title={t('header.langSelect')}
            aria-label="Select Language"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.native} ({lang.label})
              </option>
            ))}
          </select>
        </div>

        <button className="btn-header-about" onClick={onOpenAbout} title="Scientific References, Model Architecture & Datasets">
          <Info size={13} />
          <span>{t('header.aboutBtn')}</span>
        </button>
      </div>
    </header>
  );
}
