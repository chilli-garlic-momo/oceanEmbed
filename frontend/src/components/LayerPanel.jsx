import React from 'react';
import { Flame, Thermometer, Info } from 'lucide-react';
import { STANDARD_DEPTHS } from '../data/mock';
import { getTranslation } from '../data/i18n';

const LAYER_CONFIGS = [
  { id: 'tchp', icon: Flame, iconColorClass: 'icon-fire-colored' },
  { id: 'temperature', icon: Thermometer, iconColorClass: 'icon-thermometer-colored' },
];

export function LayerPanel({
  activeLayer,
  onSelectLayer,
  selectedDepth,
  onSelectDepth,
  currentLang = 'en',
}) {
  const t = (key) => getTranslation(currentLang, key);

  const activeLayerConfig = LAYER_CONFIGS.find((l) => l.id === activeLayer) || LAYER_CONFIGS[0];
  const activeLayerItem = t(`layers.items.${activeLayerConfig.id}`);

  return (
    <aside className="left-panel">
      {/* 1. Layers Section */}
      <div className="panel-group-box">
        <div className="panel-header-label">{t('layers.header')}</div>
        <div className="layers-list">
          {LAYER_CONFIGS.map((config) => {
            const Icon = config.icon;
            const isActive = activeLayer === config.id;
            const item = t(`layers.items.${config.id}`);

            return (
              <button
                key={config.id}
                id={`layer-btn-${config.id}`}
                className={`layer-card-btn ${isActive ? 'active' : ''}`}
                onClick={() => onSelectLayer(config.id)}
              >
                <div className="layer-left-group">
                  <div className={`layer-icon-tile ${config.iconColorClass}`}>
                    <Icon size={17} />
                  </div>
                  <div className="layer-info-column">
                    <div className="layer-title-row">
                      <span className="layer-text-title">{item.name}</span>
                      <span className="layer-unit-pill">{item.unitBadge}</span>
                    </div>
                    <div className="layer-text-subtitle">{item.subtitle}</div>
                  </div>
                </div>

                <div className={`radio-indicator ${isActive ? 'active' : ''}`}>
                  {isActive && <span className="radio-indicator-dot" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Context-Aware Depth Section */}
      <div className="panel-group-box">
        <div className="panel-header-label">{t('layers.depthHeader')}</div>

        {activeLayer === 'tchp' && (
          <div className="depth-context-card">
            <div className="depth-context-header">
              <span className="depth-context-label">{t('layers.integratedColumn')}</span>
              <span className="depth-status-tag">{t('layers.active')}</span>
            </div>
            <div className="depth-context-value">{t('layers.surfaceTo26')}</div>
            <div className="depth-context-sub">{t('layers.tchpDepthSub')}</div>
          </div>
        )}

        {activeLayer === 'temperature' && (
          <div className="depth-list">
            {STANDARD_DEPTHS.map((item) => {
              const isActive = selectedDepth === item.depth;
              const depthI18n = t(`layers.depths.${item.depth}`);

              return (
                <button
                  key={item.depth}
                  id={`depth-btn-${item.depth}`}
                  className={`depth-row-btn ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectDepth(item.depth)}
                >
                  <div className="depth-radio-group">
                    <div className={`depth-radio-circle ${isActive ? 'active' : ''}`}>
                      {isActive && <span className="depth-radio-circle-dot" />}
                    </div>
                    <span className="depth-label-text">{depthI18n?.label || item.label}</span>
                  </div>
                  <span className="depth-sub-tag">{depthI18n?.sub || item.sub}</span>
                </button>
              );
            })}
          </div>
        )}

        {activeLayer === 'd20' && (
          <div className="depth-context-card">
            <div className="depth-context-header">
              <span className="depth-context-label">{t('layers.derivedIsotherm')}</span>
              <span className="depth-status-tag">{t('layers.isotherm20Level')}</span>
            </div>
            <div className="depth-context-value">{t('layers.d20DepthVal')}</div>
            <div className="depth-context-sub">{t('layers.d20DepthSub')}</div>
          </div>
        )}

        {activeLayer === 'mld' && (
          <div className="depth-context-card">
            <div className="depth-context-header">
              <span className="depth-context-label">{t('layers.derivedMixedLayer')}</span>
              <span className="depth-status-tag">Δσ = 0.125</span>
            </div>
            <div className="depth-context-value">{t('layers.mldDepthVal')}</div>
            <div className="depth-context-sub">{t('layers.mldDepthSub')}</div>
          </div>
        )}
      </div>

      {/* 3. Scientific Layer Description Box */}
      <div className="about-layer-card">
        <div className="about-layer-header">
          <span className="about-layer-title">{activeLayerItem.aboutTitle}</span>
          <Info size={13} style={{ color: 'var(--text-secondary)' }} />
        </div>
        <p className="about-layer-body">{activeLayerItem.aboutText}</p>
      </div>
    </aside>
  );
}
