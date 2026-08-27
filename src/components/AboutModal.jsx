import React from 'react';
import { X, Cpu } from 'lucide-react';
import { IncoisLogo, NoaaLogo, NasaLogo, ArgoLogo } from './InstitutionalLogos';
import { getTranslation } from '../data/i18n';

export function AboutModal({ isOpen, onClose, currentLang = 'en' }) {
  if (!isOpen) return null;
  const t = (key) => getTranslation(currentLang, key);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Cpu size={16} style={{ color: 'var(--accent-cyan)' }} />
            <span>{t('about.title')}</span>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        <div className="modal-body">
          <p>{t('about.desc')}</p>

          <div className="modal-section-title">{t('about.dataSectionTitle')}</div>

          <div className="modal-feature-grid">
            <div className="feature-box">
              <div className="feature-box-title">
                <IncoisLogo size={16} style={{ marginRight: '6px' }} />
                <span>INCOIS / MoES</span>
              </div>
              <p className="feature-box-desc">{t('about.incoisDesc')}</p>
            </div>

            <div className="feature-box">
              <div className="feature-box-title">
                <NoaaLogo size={16} style={{ marginRight: '6px' }} />
                <span>NOAA Coral Reef Watch & AOML</span>
              </div>
              <p className="feature-box-desc">{t('about.noaaDesc')}</p>
            </div>

            <div className="feature-box">
              <div className="feature-box-title">
                <ArgoLogo size={16} style={{ marginRight: '6px' }} />
                <span>ARGO Global Profiling Network</span>
              </div>
              <p className="feature-box-desc">{t('about.argoDesc')}</p>
            </div>

            <div className="feature-box">
              <div className="feature-box-title">
                <NasaLogo size={16} style={{ marginRight: '6px' }} />
                <span>NASA Ocean Physics / JPL</span>
              </div>
              <p className="feature-box-desc">{t('about.nasaDesc')}</p>
            </div>
          </div>

          <div className="modal-demo-notice">{t('about.notice')}</div>
        </div>
      </div>
    </div>
  );
}
