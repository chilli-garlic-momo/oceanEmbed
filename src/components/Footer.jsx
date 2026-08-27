import React from 'react';
import { Info, Compass } from 'lucide-react';
import { IncoisLogo, NoaaLogo, ArgoLogo, NasaLogo } from './InstitutionalLogos';
import { getTranslation } from '../data/i18n';

export function Footer({ onOpenAbout, currentLang = 'en', selectedLocation }) {
  const t = (key) => getTranslation(currentLang, key);

  const basinText = selectedLocation && !selectedLocation.isLand && selectedLocation.basin
    ? `${t(`map.basins.${selectedLocation.basin}`) || selectedLocation.basin} · ${t('footer.domainDefault')}`
    : t('footer.domainDefault');

  return (
    <footer className="app-footer">
      <div className="footer-item-group">
        <Compass size={12} style={{ color: 'var(--text-secondary)' }} />
        <span>{basinText}</span>
      </div>

      <div className="footer-item-group footer-partner-strip" onClick={onOpenAbout} title="Operational Data Assimilation & Reference Standards">
        <span className="footer-ref-label">{t('footer.referenceStandards')}</span>
        <span className="footer-badge-unit"><IncoisLogo size={13} /> INCOIS</span>
        <span className="footer-bullet">•</span>
        <span className="footer-badge-unit"><NoaaLogo size={13} /> NOAA</span>
        <span className="footer-bullet">•</span>
        <span className="footer-badge-unit"><ArgoLogo size={13} /> {t('footer.argoArray')}</span>
        <span className="footer-bullet">•</span>
        <span className="footer-badge-unit"><NasaLogo size={13} /> NASA SWOT</span>
        <Info size={11} style={{ color: 'var(--text-muted)', marginLeft: '4px' }} />
      </div>

      <div className="footer-item-group">
        <span>{t('footer.simulationGrid')}</span>
      </div>
    </footer>
  );
}
