import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { LayerPanel } from './components/LayerPanel';
import { MapView } from './components/MapView';
import { LocationPanel } from './components/LocationPanel';
import { Timeline } from './components/Timeline';
import { Footer } from './components/Footer';
import { AboutModal } from './components/AboutModal';
import { Info } from 'lucide-react';
import {
  getField,
  getProfile,
  AVAILABLE_DATES,
} from './services/api';
import { getTranslation } from './data/i18n';

export function App() {
  // 1. Theme State (Dark mode is default, persisted in localStorage)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('oceanembed_theme') || 'dark';
  });

  // 2. Language State (English is default, persisted in localStorage)
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('oceanembed_lang') || 'en';
  });

  const t = useCallback((key) => getTranslation(currentLang, key), [currentLang]);

  // Apply theme attribute to documentElement & body
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('oceanembed_theme', theme);
  }, [theme]);

  // Save language to localStorage
  const handleChangeLang = useCallback((lang) => {
    setCurrentLang(lang);
    localStorage.setItem('oceanembed_lang', lang);
  }, []);

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // 3. Layer & Depth State
  const [activeLayer, setActiveLayer] = useState('tchp'); // 'tchp' | 'temperature' | 'd20' | 'mld'
  const [selectedDepth, setSelectedDepth] = useState(0); // 0 (Surface), 50, 100, 200, 500, 1000
  const [currentDate, setCurrentDate] = useState('2026-08-27'); // Default 27 AUG 2026

  // 4. Selected Ocean Location (Initial default: Bay of Bengal Cyclone Genesis Core)
  const [selectedLocation, setSelectedLocation] = useState({
    lat: 18.25,
    lon: 88.5,
    isLand: false,
    basin: 'Bay of Bengal',
  });

  const [profileData, setProfileData] = useState(null);
  const [fieldData, setFieldData] = useState(null);

  // 5. Playback / Animation State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1);

  // 6. Loading & Interaction States
  const [isLoadingField, setIsLoadingField] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [mapFocusTarget, setMapFocusTarget] = useState(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // 7. Toast Alert State
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = useCallback((msg) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  // Handle Land Click
  const handleLandClick = useCallback(() => {
    showToast(t('location.landWarningToast'));
  }, [showToast, t]);

  // Pause animation on manual map drag/zoom interaction
  const handleMapInteraction = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
    }
  }, [isPlaying]);

  // Load 2D Field Grid on layer, depth, or date change
  useEffect(() => {
    let isCancelled = false;

    async function loadField() {
      if (!isPlaying) {
        setIsLoadingField(true);
      }
      try {
        const data = await getField({
          layer: activeLayer,
          depth: selectedDepth,
          date: currentDate,
        });

        if (!isCancelled && data) {
          setFieldData(data);
        }
      } catch (err) {
        console.error('Field fetch error:', err);
      } finally {
        if (!isCancelled) {
          setIsLoadingField(false);
        }
      }
    }

    loadField();

    return () => {
      isCancelled = true;
    };
  }, [activeLayer, selectedDepth, currentDate, isPlaying]);

  // Proactive background preloader for adjacent dates during animation
  useEffect(() => {
    if (!isPlaying) return;

    const currentIdx = AVAILABLE_DATES.findIndex((d) => d.id === currentDate);
    if (currentIdx >= 0 && currentIdx < AVAILABLE_DATES.length - 2) {
      // Preload next 2 days into memory
      getField({ layer: activeLayer, depth: selectedDepth, date: AVAILABLE_DATES[currentIdx + 1].id });
      getField({ layer: activeLayer, depth: selectedDepth, date: AVAILABLE_DATES[currentIdx + 2].id });
    }
  }, [currentDate, isPlaying, activeLayer, selectedDepth]);

  // Load Vertical Subsurface Profile on location or date change
  useEffect(() => {
    if (!selectedLocation || selectedLocation.isLand) {
      setProfileData(null);
      return;
    }

    let isCancelled = false;

    async function loadProfile() {
      if (!isPlaying) {
        setIsLoadingProfile(true);
      }

      try {
        const data = await getProfile({
          lat: selectedLocation.lat,
          lon: selectedLocation.lon,
          date: currentDate,
        });

        if (!isCancelled && data) {
          if (data.isLand) {
            handleLandClick();
          } else {
            setProfileData(data);
          }
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
      } finally {
        if (!isCancelled) {
          setIsLoadingProfile(false);
        }
      }
    }

    loadProfile();

    return () => {
      isCancelled = true;
    };
  }, [selectedLocation?.lat, selectedLocation?.lon, currentDate, handleLandClick, isPlaying]);

  // Select Location Handler
  const handleSelectLocation = useCallback((lat, lon) => {
    setSelectedLocation({ lat, lon, isLand: false });
  }, []);

  // Quick Preset Location (e.g. Bay of Bengal Genesis)
  const handleSelectSampleLocation = useCallback((lat, lon) => {
    setSelectedLocation({ lat, lon, isLand: false, basin: 'Bay of Bengal' });
    setMapFocusTarget({ lat, lon, zoom: 6 });
  }, []);

  const handleCloseLocationPanel = useCallback(() => {
    setSelectedLocation(null);
  }, []);

  // Controlled Animation Loop (~5.5 date steps per second at 1.0x)
  useEffect(() => {
    if (!isPlaying) return;

    const baseInterval = 180;
    const intervalMs = Math.max(50, Math.round(baseInterval / playSpeed));

    const timer = setInterval(() => {
      setCurrentDate((prevDate) => {
        const currentIdx = AVAILABLE_DATES.findIndex((d) => d.id === prevDate);
        const nextIdx = currentIdx < AVAILABLE_DATES.length - 1 ? currentIdx + 1 : 0;
        return AVAILABLE_DATES[nextIdx].id;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, playSpeed]);

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notification-pill">
          <Info size={14} style={{ color: 'var(--accent-cyan)' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <Header
        currentDate={currentDate}
        onOpenAbout={() => setIsAboutOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        currentLang={currentLang}
        onChangeLang={handleChangeLang}
      />

      {/* Main 3-Zone Viewport */}
      <main className="main-viewport">
        {/* Left Zone: Layers & Context Depth */}
        <LayerPanel
          activeLayer={activeLayer}
          onSelectLayer={setActiveLayer}
          selectedDepth={selectedDepth}
          onSelectDepth={setSelectedDepth}
          currentLang={currentLang}
        />

        {/* Center Zone: Leaflet Ocean Map */}
        <MapView
          activeLayer={activeLayer}
          selectedDepth={selectedDepth}
          currentDate={currentDate}
          fieldData={fieldData}
          selectedLocation={selectedLocation}
          onSelectLocation={handleSelectLocation}
          onLandClick={handleLandClick}
          isLoadingField={isLoadingField}
          mapFocusTarget={mapFocusTarget}
          currentLang={currentLang}
          onMapInteraction={handleMapInteraction}
        />

        {/* Right Zone: Location Details, Metrics, Chart & ARGO */}
        <LocationPanel
          selectedLocation={selectedLocation}
          profileData={profileData}
          isLoadingProfile={isLoadingProfile}
          onSelectSampleLocation={handleSelectSampleLocation}
          onClose={handleCloseLocationPanel}
          currentDate={currentDate}
          currentLang={currentLang}
          theme={theme}
          isPlaying={isPlaying}
        />
      </main>

      {/* Bottom Zone: Continuous 365-Day Daily Timeline & Date Picker */}
      <Timeline
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        playSpeed={playSpeed}
        onChangePlaySpeed={setPlaySpeed}
        currentLang={currentLang}
      />

      {/* Ultra-Thin Scientific Footer */}
      <Footer
        onOpenAbout={() => setIsAboutOpen(true)}
        currentLang={currentLang}
        selectedLocation={selectedLocation}
      />

      {/* About Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        currentLang={currentLang}
      />
    </div>
  );
}
