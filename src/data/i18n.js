// Centralized i18n translation system for OceanEmbed
// Supports English ('en') and Hindi ('hi') across the continuous 365-day operational dataset

export const MONTH_NAMES = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  hi: ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितम्बर', 'अक्टूबर', 'नवम्बर', 'दिसम्बर'],
};

export const MONTH_NAMES_FULL = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  hi: ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितम्बर', 'अक्टूबर', 'नवम्बर', 'दिसम्बर'],
};

export const MONTH_SHORT = {
  en: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
  hi: ['जन', 'फ़र', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुल', 'अग', 'सित', 'अक्टू', 'नव', 'दिस'],
};

export const TRANSLATIONS = {
  en: {
    brand: {
      tagline: 'North Indian Ocean Thermal Intelligence & Cyclone Heat Platform',
    },
    header: {
      statusOperational: 'OPERATIONAL',
      analysisCycle: 'Cycle:',
      cycleTag: '12Z',
      aboutBtn: 'About & References',
      themeToggleDark: 'Switch to Light Mode',
      themeToggleLight: 'Switch to Dark Mode',
      langSelect: 'Language',
    },
    layers: {
      header: 'OCEANOGRAPHIC LAYERS',
      depthHeader: 'VERTICAL SLICE / DEPTH LEVEL',
      integratedColumn: 'INTEGRATED COLUMN',
      active: 'ACTIVE',
      surfaceTo26: 'Surface → 26°C Isotherm',
      tchpDepthSub: 'Ocean Thermal Energy Available for Cyclogenesis',
      derivedIsotherm: 'DERIVED ISOTHERM',
      isotherm20Level: '20°C LEVEL',
      d20DepthVal: '20°C Isotherm Depth (m)',
      d20DepthSub: 'Mesoscale Thermocline Displacement',
      derivedMixedLayer: 'DERIVED MIXED LAYER',
      mldDepthVal: 'Mixed Layer Depth (m)',
      mldDepthSub: 'Density Gradient Barrier Layer',
      items: {
        tchp: {
          name: 'TCHP',
          subtitle: 'Tropical Cyclone Heat Potential',
          unitBadge: '0–160 kJ/cm²',
          aboutTitle: 'About TCHP',
          aboutText:
            'Integrated thermal energy between sea surface and 26°C isotherm. High values in the Bay of Bengal & Arabian Sea supply the upper-ocean heat flux governing tropical cyclogenesis and intensity shifts.',
        },
        temperature: {
          name: 'Subsurface Temperature',
          subtitle: 'Depth-Resolved Thermal Field',
          unitBadge: '4–32 °C',
          aboutTitle: 'About Subsurface Temperature',
          aboutText:
            '3D continuous ocean temperature field dynamically reconstructed across surface (SST), thermocline core (50–200m), and deep abyssal layers (500–1000m).',
        },
        d20: {
          name: 'D20',
          subtitle: '20°C Isotherm Depth',
          unitBadge: '20–140 m',
          aboutTitle: 'About D20',
          aboutText:
            'Depth of the 20°C isotherm across the Arabian Sea, Bay of Bengal, and Equatorial Indian Ocean. Primary proxy for thermocline displacement and warm-core eddy heat content.',
        },
        mld: {
          name: 'MLD',
          subtitle: 'Mixed Layer Depth',
          unitBadge: '10–80 m',
          aboutTitle: 'About MLD',
          aboutText:
            'Depth of the quasi-homogeneous wind-stirred surface layer governed by southwest monsoon friction and northern Bay of Bengal freshwater lenses.',
        },
      },
      depths: {
        0: { label: 'Surface (SST)', sub: '0 m' },
        50: { label: '50 m', sub: 'Upper Thermocline' },
        100: { label: '100 m', sub: 'Thermocline Core' },
        200: { label: '200 m', sub: 'Lower Thermocline' },
        500: { label: '500 m', sub: 'Intermediate Water' },
        1000: { label: '1000 m', sub: 'Deep Abyssal Water' },
      },
    },
    map: {
      zoomIn: 'Zoom In',
      zoomOut: 'Zoom Out',
      centerFocus: 'Center Inspection Point',
      resetView: 'Reset View',
      low: 'LOW',
      high: 'HIGH',
      legendDomain: '0.20° Grid · Hydrodynamic Conservation',
      renderingLayer: 'Updating ocean field...',
      argoPopupTitle: 'ARGO Profiling Float',
      distanceLabel: 'Distance to point:',
      qcLabel: 'Quality Control:',
      obsTimeLabel: 'Observation:',
      basins: {
        'Bay of Bengal': 'Bay of Bengal',
        'Arabian Sea': 'Arabian Sea',
        'Equatorial Indian Ocean': 'Equatorial Indian Ocean',
        'Andaman Sea': 'Andaman Sea',
        'Lakshadweep Sea': 'Lakshadweep Sea',
        'Maldives': 'Maldives',
        'Maldives Ridge': 'Maldives Ridge',
        'North Indian Ocean Basin': 'North Indian Ocean Basin',
        'Land Mass': 'Land Mass',
      },
    },
    location: {
      pointInspection: 'POINT INSPECTION',
      deselectLocation: 'Deselect location',
      integratedMetrics: 'INTEGRATED METRICS',
      subsurfaceTempProfile: 'SUBSURFACE TEMPERATURE PROFILE',
      sstLabel: 'SST:',
      highHeatPotential: 'Elevated Heat Potential (>80 kJ/cm²)',
      nominalThermalState: 'Nominal Thermal Potential',
      neuralOperator: 'Neural Operator',
      uncertaintyBand: 'Uncertainty (±1σ)',
      argoInSitu: 'ARGO In-Situ',
      argoValidation: 'ARGO IN-SITU VALIDATION',
      globalProfiling: 'Global Profiling Network',
      qcPassed: 'QC PASSED',
      wmoFloat: 'WMO Float:',
      deployingAgency: 'Deploying Agency:',
      observationTime: 'Observation Time:',
      sensorDistance: 'Sensor Distance:',
      emptyInspectorTitle: 'OCEAN PROFILE INSPECTOR',
      emptyInspectorDesc:
        'Click anywhere on the ocean to inspect depth-resolved thermal curves, TCHP heat fluxes, and ARGO float verifications.',
      sampleGenesisBtn: 'Bay of Bengal Genesis Core (18.25°N, 88.50°E)',
      landWarningToast: 'Select an ocean location to inspect the profile.',
      reconstructingProfile: 'Reconstructing vertical profile...',
      noProfileAvailable: 'No vertical profile available.',
    },
    timeline: {
      animateTchp: 'ANIMATE TCHP',
      pause: 'PAUSE',
      speedTitle: 'Playback Speed',
      dayStep: 'Daily Step',
      selectDate: 'Select Date',
      jumpMonsoonCore: 'Jump to 27 Aug',
      availableRangeNote: '2026 Operational Date Window (365 Days)',
    },
    footer: {
      domainDefault: 'North Indian Ocean Basin (5°S–26°N, 45°E–99°E)',
      referenceStandards: 'Reference Standards:',
      argoArray: 'ARGO Array',
      simulationGrid: 'Assimilated Model · 0.20° Grid',
    },
    about: {
      title: 'OceanEmbed Architecture & Scientific References',
      desc: 'OceanEmbed is a physics-informed deep ocean intelligence platform engineered to reconstruct high-resolution 3D subsurface thermal structures, Tropical Cyclone Heat Potential (TCHP), and thermocline dynamics across the oceanic basin.',
      dataSectionTitle: 'OPERATIONAL DATA ASSIMILATION & REFERENCES',
      incoisDesc:
        'Indian National Centre for Ocean Information Services. Moored buoy networks, coastal radar arrays, and observational archives.',
      noaaDesc:
        'High-resolution Multi-Scale Ultra-High Resolution (MUR) SST (0.01°) and oceanic cyclone heat content calibration metrics.',
      argoDesc:
        'Real-time CTD subsurface profiles (0–2000m) providing zero-latency in-situ truth for continuous physics verification and uncertainty bounds.',
      nasaDesc:
        'SWOT (Surface Water and Ocean Topography) & Sentinel-6 Michael Freilich altimetric sea surface height anomaly (SSHA) ingestion.',
      notice:
        'Model Architecture: OceanEmbed-NIO-v1.0 (Fourier Neural Operator + Hydrodynamic Conservation Laws). Spatial Resolution: 0.20° grid · Vertical levels: 11 standard depths (0 to 1000m).',
    },
  },
  hi: {
    brand: {
      tagline: 'महासागरीय तापीय बुद्धिमत्ता एवं चक्रवात ऊष्मा मंच',
    },
    header: {
      statusOperational: 'सक्रिय (OPERATIONAL)',
      analysisCycle: 'चक्र:',
      cycleTag: '12Z',
      aboutBtn: 'विवरण एवं संदर्भ',
      themeToggleDark: 'लाइट मोड पर स्विच करें',
      themeToggleLight: 'डार्क मोड पर स्विच करें',
      langSelect: 'भाषा',
    },
    layers: {
      header: 'महासागरीय परतें',
      depthHeader: 'ऊर्ध्वाधर स्तर / गहराई',
      integratedColumn: 'एकीकृत जल स्तंभ',
      active: 'सक्रिय',
      surfaceTo26: 'सतह → 26°C समताप रेखा',
      tchpDepthSub: 'चक्रवात उत्पत्ति हेतु उपलब्ध महासागरीय तापीय ऊर्जा',
      derivedIsotherm: 'प्राप्त समताप रेखा',
      isotherm20Level: '20°C स्तर',
      d20DepthVal: '20°C समताप रेखा गहराई (मी.)',
      d20DepthSub: 'मेसोस्केल थर्मोक्लाइन विस्थापन',
      derivedMixedLayer: 'मिश्रित परत स्तर',
      mldDepthVal: 'मिश्रित परत गहराई (मी.)',
      mldDepthSub: 'घनत्व प्रवणता अवरोधक परत',
      items: {
        tchp: {
          name: 'TCHP',
          subtitle: 'उष्णकटिबंधीय चक्रवात ऊष्मा क्षमता',
          unitBadge: '0–160 kJ/cm²',
          aboutTitle: 'TCHP के बारे में',
          aboutText:
            'समुद्र की सतह और 26°C समताप रेखा के बीच एकीकृत तापीय ऊर्जा। बंगाल की खाड़ी और अरब सागर में उच्च मान चक्रवात उत्पत्ति एवं तीव्रता में बदलाव को नियंत्रित करते हैं।',
        },
        temperature: {
          name: 'Subsurface Temperature',
          subtitle: 'गहराई-अनुसार तापीय क्षेत्र',
          unitBadge: '4–32 °C',
          aboutTitle: 'उपसतही तापमान के बारे में',
          aboutText:
            'सतह (SST), मुख्य थर्मोक्लाइन (50-200 मी.), और गहरे अगाध स्तरों (500-1000 मी.) पर गतिशील रूप से पुनर्निर्मित त्रि-आयामी (3D) तापमान क्षेत्र।',
        },
        d20: {
          name: 'D20',
          subtitle: '20°C समताप रेखा गहराई',
          unitBadge: '20–140 m',
          aboutTitle: 'D20 के बारे में',
          aboutText:
            'अरब सागर, बंगाल की खाड़ी और भूमध्यरेखीय क्षेत्र में 20°C समताप रेखा की गहराई। यह थर्मोक्लाइन विस्थापन और गर्म-कोर भंवर ऊष्मा का मुख्य संकेतक है।',
        },
        mld: {
          name: 'MLD',
          subtitle: 'मिश्रित परत गहराई',
          unitBadge: '10–80 m',
          aboutTitle: 'MLD के बारे में',
          aboutText:
            'दक्षिण-पश्चिम मानसूनी घर्षण और बंगाल की खाड़ी के मीठे पानी के प्रभाव से निर्धारित हवा-मिश्रित सतही परत की गहराई।',
        },
      },
      depths: {
        0: { label: 'समुद्री सतह (SST)', sub: '0 मी.' },
        50: { label: '50 मी.', sub: 'ऊपरी थर्मोक्लाइन' },
        100: { label: '100 मी.', sub: 'मुख्य थर्मोक्लाइन' },
        200: { label: '200 मी.', sub: 'निचला थर्मोक्लाइन' },
        500: { label: '500 मी.', sub: 'मध्यवर्ती जल' },
        1000: { label: '1000 मी.', sub: 'गहरा अगाध जल' },
      },
    },
    map: {
      zoomIn: 'ज़ूम इन',
      zoomOut: 'ज़ूम आउट',
      centerFocus: 'निरीक्षण बिंदु केंद्रित करें',
      resetView: 'दृश्य रीसेट करें',
      low: 'न्यूनतम',
      high: 'अधिकतम',
      legendDomain: '0.20° ग्रिड · हाइड्रोडायनामिक संरक्षण',
      renderingLayer: 'महासागरीय परत लोड हो रही है...',
      argoPopupTitle: 'ARGO प्रोफाइलिंग फ्लोट',
      distanceLabel: 'बिंदु से दूरी:',
      qcLabel: 'गुणवत्ता नियंत्रण:',
      obsTimeLabel: 'अवलोकन:',
      basins: {
        'Bay of Bengal': 'बंगाल की खाड़ी',
        'Arabian Sea': 'अरब सागर',
        'Equatorial Indian Ocean': 'भूमध्यरेखीय हिंद महासागर',
        'Andaman Sea': 'अंडमान सागर',
        'Lakshadweep Sea': 'लक्षद्वीप सागर',
        'Maldives': 'मालदीव',
        'Maldives Ridge': 'मालदीव रिज',
        'North Indian Ocean Basin': 'उत्तरी हिंद महासागर बेसिन',
        'Land Mass': 'भू-भाग',
      },
    },
    location: {
      pointInspection: 'बिंदु निरीक्षण',
      deselectLocation: 'स्थान हटाएं',
      integratedMetrics: 'एकीकृत मेट्रिक्स',
      subsurfaceTempProfile: 'उपसतही तापमान प्रोफ़ाइल',
      sstLabel: 'SST:',
      highHeatPotential: 'उच्च तापीय क्षमता (>80 kJ/cm²)',
      nominalThermalState: 'सामान्य तापीय क्षमता',
      neuralOperator: 'न्यूरल ऑपरेटर',
      uncertaintyBand: 'अनिश्चितता (±1σ)',
      argoInSitu: 'ARGO इन-सिटू',
      argoValidation: 'ARGO इन-सिटू सत्यापन',
      globalProfiling: 'वैश्विक प्रोफाइलिंग नेटवर्क',
      qcPassed: 'QC सफल',
      wmoFloat: 'WMO फ्लोट:',
      deployingAgency: 'तैनाती संस्था:',
      observationTime: 'अवलोकन समय:',
      sensorDistance: 'सेंसर दूरी:',
      emptyInspectorTitle: 'महासागर प्रोफ़ाइल विश्लेषक',
      emptyInspectorDesc:
        'गहराई-अनुसार तापीय वक्र, TCHP ऊष्मा प्रवाह और ARGO फ्लोट सत्यापन का निरीक्षण करने के लिए महासागर में कहीं भी क्लिक करें।',
      sampleGenesisBtn: 'बंगाल की खाड़ी चक्रवात उत्पत्ति केंद्र (18.25°N, 88.50°E)',
      landWarningToast: 'प्रोफ़ाइल देखने के लिए कृपया महासागरीय स्थान का चयन करें।',
      reconstructingProfile: 'ऊर्ध्वाधर प्रोफ़ाइल का पुनर्निर्माण हो रहा है...',
      noProfileAvailable: 'कोई ऊर्ध्वाधर प्रोफ़ाइल उपलब्ध नहीं है।',
    },
    timeline: {
      animateTchp: 'ANIMATE TCHP',
      pause: 'PAUSE',
      speedTitle: 'प्लेबैक गति',
      dayStep: 'दैनिक चरण',
      selectDate: 'तारीख चुनें',
      jumpMonsoonCore: '27 अगस्त पर जाएं',
      availableRangeNote: '2026 परिचालन तिथि सीमा (365 दिन)',
    },
    footer: {
      domainDefault: 'उत्तरी हिंद महासागर बेसिन (5°S–26°N, 45°E–99°E)',
      referenceStandards: 'संदर्भ मानक:',
      argoArray: 'ARGO ऐरे',
      simulationGrid: 'समेकित मॉडल · 0.20° ग्रिड',
    },
    about: {
      title: 'OceanEmbed संरचना एवं वैज्ञानिक संदर्भ',
      desc: 'OceanEmbed एक भौतिकी-आधारित डीप ओशन इंटेलिजेंस प्लेटफॉर्म है जिसे उच्च-रिज़ॉल्यूशन 3D उपसतही तापीय संरचनाओं, उष्णकटिबंधीय चक्रवात ऊष्मा क्षमता (TCHP) और थर्मोक्लाइन गतिशीलता को पुनर्निर्मित करने के लिए विकसित किया गया है।',
      dataSectionTitle: 'डेटा समावेशन एवं संदर्भ मानक',
      incoisDesc:
        'भारतीय राष्ट्रीय महासागर सूचना सेवा केंद्र। मूर किए गए बोया नेटवर्क, तटीय रडार और अवलोकन अभिलेखागार।',
      noaaDesc:
        'अल्ट्रा-हाई रिज़ॉल्यूशन SST (0.01°) और समुद्री चक्रवात ऊष्मा सामग्री अंशांकन मेट्रिक्स।',
      argoDesc:
        'वास्तविक समय CTD उपसतही प्रोफाइल (0–2000 मी.) जो भौतिकी सत्यापन और अनिश्चितता सीमाओं के लिए इन-सिटू सत्य डेटा प्रदान करते हैं।',
      nasaDesc:
        'SWOT और Sentinel-6 उपग्रहों से प्राप्त समुद्री सतह ऊंचाई विसंगति (SSHA) डेटा समावेशन।',
      notice:
        'मॉडल संरचना: OceanEmbed-NIO-v1.0 (फूरियर न्यूरल ऑपरेटर + द्रवगतिकी संरक्षण नियम)। स्थानिक रिज़ॉल्यूशन: 0.20° ग्रिड · ऊर्ध्वाधर स्तर: 11 मानक गहराई (0 से 1000 मी.)।',
    },
  },
};

export function getTranslation(lang, path) {
  const currentLang = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const fallbackLang = TRANSLATIONS.en;

  const resolve = (obj, keys) => {
    return keys.reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined), obj);
  };

  const keys = path.split('.');
  const res = resolve(currentLang, keys);
  if (res !== undefined) return res;

  const fallbackRes = resolve(fallbackLang, keys);
  return fallbackRes !== undefined ? fallbackRes : path;
}

export function formatLocalizedDate(dateStr, lang = 'en', includeTime = true) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;

  const yyyy = parts[0];
  const mIdx = parseInt(parts[1], 10) - 1;
  const dd = parseInt(parts[2], 10);

  const mName = (MONTH_NAMES[lang] || MONTH_NAMES.en)[mIdx] || parts[1];

  if (includeTime) {
    return `${dd} ${mName} ${yyyy} · 12:00 UTC (12Z)`;
  }
  return `${dd} ${mName}`;
}
