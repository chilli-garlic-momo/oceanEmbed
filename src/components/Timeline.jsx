import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { AVAILABLE_DATES } from '../data/mock';
import { getTranslation, formatLocalizedDate, MONTH_SHORT, MONTH_NAMES_FULL } from '../data/i18n';

// 12 Monthly anchors for clean timeline navigation
const MONTH_ANCHORS = [
  { month: 0, dayIndex: 0 },   // 1 Jan
  { month: 1, dayIndex: 31 },  // 1 Feb
  { month: 2, dayIndex: 59 },  // 1 Mar
  { month: 3, dayIndex: 90 },  // 1 Apr
  { month: 4, dayIndex: 120 }, // 1 May
  { month: 5, dayIndex: 151 }, // 1 Jun
  { month: 6, dayIndex: 181 }, // 1 Jul
  { month: 7, dayIndex: 212 }, // 1 Aug
  { month: 8, dayIndex: 243 }, // 1 Sep
  { month: 9, dayIndex: 273 }, // 1 Oct
  { month: 10, dayIndex: 304 },// 1 Nov
  { month: 11, dayIndex: 334 },// 1 Dec
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function Timeline({
  currentDate = '2026-08-27',
  onDateChange,
  isPlaying = false,
  onTogglePlay,
  playSpeed = 1,
  onChangePlaySpeed,
  currentLang = 'en',
}) {
  const t = (key) => getTranslation(currentLang, key);

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef(null);

  const currentIndex = AVAILABLE_DATES.findIndex((d) => d.id === currentDate);
  const safeIndex = currentIndex >= 0 ? currentIndex : 238; // Default 27 AUG (Day index 238)

  const activeDateObj = AVAILABLE_DATES[safeIndex] || AVAILABLE_DATES[238];
  const progressPercent = (safeIndex / (AVAILABLE_DATES.length - 1)) * 100;

  // Browsable month in popover (0 to 11 for 2026)
  const [calendarViewMonth, setCalendarViewMonth] = useState(() => activeDateObj.monthIndex);

  // Sync calendar month view with active date when date changes externally
  useEffect(() => {
    if (!isCalendarOpen) {
      setCalendarViewMonth(activeDateObj.monthIndex);
    }
  }, [activeDateObj.monthIndex, isCalendarOpen]);

  // Close calendar popover on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setIsCalendarOpen(false);
      }
    }
    if (isCalendarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCalendarOpen]);

  // Move exactly 1 day backward
  const handlePrevDay = useCallback(() => {
    if (safeIndex > 0) {
      onDateChange(AVAILABLE_DATES[safeIndex - 1].id);
    }
  }, [safeIndex, onDateChange]);

  // Move exactly 1 day forward
  const handleNextDay = useCallback(() => {
    if (safeIndex < AVAILABLE_DATES.length - 1) {
      onDateChange(AVAILABLE_DATES[safeIndex + 1].id);
    }
  }, [safeIndex, onDateChange]);

  // Slider scrubber
  const handleSliderChange = (e) => {
    const idx = parseInt(e.target.value, 10);
    if (AVAILABLE_DATES[idx]) {
      onDateChange(AVAILABLE_DATES[idx].id);
    }
  };

  const prevDateObj = safeIndex > 0 ? AVAILABLE_DATES[safeIndex - 1] : null;
  const nextDateObj = safeIndex < AVAILABLE_DATES.length - 1 ? AVAILABLE_DATES[safeIndex + 1] : null;
  const currentMonthIdx = activeDateObj.monthIndex;

  // Compute days in calendar view month (Year 2026)
  const calendarDays = useMemo(() => {
    const year = 2026;
    const firstDayOfWeek = new Date(Date.UTC(year, calendarViewMonth, 1)).getUTCDay();
    const daysInMonth = new Date(Date.UTC(year, calendarViewMonth + 1, 0)).getUTCDate();

    const cells = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push({ isPadding: true, key: `pad-${i}` });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const mm = String(calendarViewMonth + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      const dateId = `2026-${mm}-${dd}`;
      const isSelected = dateId === currentDate;
      cells.push({
        isPadding: false,
        dayNumber: d,
        dateId,
        isSelected,
        key: dateId,
      });
    }
    return cells;
  }, [calendarViewMonth, currentDate]);

  const handleSelectCalendarDate = (dateId) => {
    onDateChange(dateId);
    setIsCalendarOpen(false);
  };

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    setCalendarViewMonth((prev) => (prev > 0 ? prev - 1 : 11));
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    setCalendarViewMonth((prev) => (prev < 11 ? prev + 1 : 0));
  };

  const monthNameView = (MONTH_NAMES_FULL[currentLang] || MONTH_NAMES_FULL.en)[calendarViewMonth];

  return (
    <div className="app-timeline">
      {/* 1. Direct Date Navigation: ‹ Previous Day  [📅 27 Aug 2026]  Next Day › */}
      <div className="timeline-nav-group" ref={calendarRef}>
        {/* Previous Day Button (Exact 1-Day Step) */}
        <button
          id="btn-prev-date"
          className="timeline-step-btn"
          onClick={handlePrevDay}
          disabled={safeIndex === 0}
          title={prevDateObj ? `Previous Day: ${prevDateObj.id}` : 'Earliest date in range (1 Jan 2026)'}
        >
          <ChevronLeft size={14} />
          <span>{prevDateObj ? formatLocalizedDate(prevDateObj.id, currentLang, false) : '—'}</span>
        </button>

        {/* Compact Glass Date Picker Trigger Pill */}
        <div className="timeline-datepicker-anchor">
          <button
            id="btn-open-datepicker"
            className={`timeline-datepicker-btn ${isCalendarOpen ? 'active' : ''}`}
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            title={t('timeline.selectDate') || 'Select exact date'}
          >
            <Calendar size={13} style={{ color: 'var(--accent-primary)' }} />
            <span className="datepicker-btn-label">
              {formatLocalizedDate(activeDateObj.id, currentLang, false)} 2026
            </span>
          </button>

          {/* Polished Glass Calendar Popover */}
          {isCalendarOpen && (
            <div className="calendar-popover-glass" onClick={(e) => e.stopPropagation()}>
              <div className="calendar-popover-header">
                <button
                  className="cal-month-nav-btn"
                  onClick={handlePrevMonth}
                  title="Previous Month"
                >
                  <ChevronLeft size={14} />
                </button>
                <div className="cal-header-title">
                  <span>{monthNameView}</span>
                  <span className="cal-header-year">2026</span>
                </div>
                <button
                  className="cal-month-nav-btn"
                  onClick={handleNextMonth}
                  title="Next Month"
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* Day of Week Headers */}
              <div className="cal-weekdays-row">
                {DAYS_OF_WEEK.map((d) => (
                  <span key={d} className="cal-weekday-label">
                    {d}
                  </span>
                ))}
              </div>

              {/* Days Grid */}
              <div className="cal-days-grid">
                {calendarDays.map((cell) => {
                  if (cell.isPadding) {
                    return <div key={cell.key} className="cal-day-cell padding" />;
                  }
                  return (
                    <button
                      key={cell.key}
                      className={`cal-day-cell ${cell.isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectCalendarDate(cell.dateId)}
                      title={cell.dateId}
                    >
                      <span>{cell.dayNumber}</span>
                      {cell.isSelected && <span className="cal-selected-dot" />}
                    </button>
                  );
                })}
              </div>

              {/* Quick Jump & Range Footer */}
              <div className="cal-quick-footer">
                <button
                  className="cal-quick-btn"
                  onClick={() => handleSelectCalendarDate('2026-08-27')}
                  title="Jump to Late-Monsoon Thermal Peak"
                >
                  <span>{t('timeline.jumpMonsoonCore')}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Next Day Button (Exact 1-Day Step) */}
        <button
          id="btn-next-date"
          className="timeline-step-btn"
          onClick={handleNextDay}
          disabled={safeIndex === AVAILABLE_DATES.length - 1}
          title={nextDateObj ? `Next Day: ${nextDateObj.id}` : 'Latest date in range (31 Dec 2026)'}
        >
          <span>{nextDateObj ? formatLocalizedDate(nextDateObj.id, currentLang, false) : '—'}</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* 2. Center Timeline Track with 12 Month Markers */}
      <div className="timeline-center-track">
        {/* Floating Bubble displaying exact daily date */}
        <div className="timeline-bubble-container">
          <div
            className="timeline-active-bubble"
            style={{ left: `${progressPercent}%` }}
          >
            {formatLocalizedDate(activeDateObj.id, currentLang, true)}
          </div>
        </div>

        {/* 365-Day Continuous Scrubber Bar */}
        <div className="timeline-bar-wrapper">
          <div
            className="timeline-bar-fill"
            style={{ width: `${progressPercent}%` }}
          />

          {/* Month Marker Nodes */}
          <div className="timeline-nodes-row">
            {MONTH_ANCHORS.map((m) => {
              const isPassed = m.dayIndex <= safeIndex;
              const isActive = m.month === currentMonthIdx;
              return (
                <div
                  key={m.month}
                  className={`timeline-node-dot ${isActive ? 'active' : isPassed ? 'passed' : ''}`}
                  title={`1 ${AVAILABLE_DATES[m.dayIndex].month}`}
                  onClick={() => onDateChange(AVAILABLE_DATES[m.dayIndex].id)}
                />
              );
            })}
          </div>

          <input
            id="timeline-range-slider"
            type="range"
            min="0"
            max={AVAILABLE_DATES.length - 1}
            step="1"
            value={safeIndex}
            onChange={handleSliderChange}
            className="timeline-range-input"
            aria-label="365-Day Timeline Scrubber"
          />
        </div>

        {/* 12 Monthly Markers across the 1-Year Scope */}
        <div className="timeline-labels-row">
          {MONTH_ANCHORS.map((m) => {
            const isCurrent = m.month === currentMonthIdx;
            const mText = (MONTH_SHORT[currentLang] || MONTH_SHORT.en)[m.month];
            return (
              <span
                key={m.month}
                onClick={() => onDateChange(AVAILABLE_DATES[m.dayIndex].id)}
                style={{
                  cursor: 'pointer',
                  color: isCurrent ? 'var(--accent-primary)' : 'inherit',
                  fontWeight: isCurrent ? 700 : 400,
                  transform: isCurrent ? 'scale(1.08)' : 'none',
                  transition: 'all 0.15s ease',
                }}
                title={`Jump to 1 ${mText}`}
              >
                {mText}
              </span>
            );
          })}
        </div>
      </div>

      {/* 3. Right Step Forward & Playback Controls */}
      <div className="timeline-action-right">
        <button
          id="btn-animate-tchp"
          className={`btn-play-action ${isPlaying ? 'playing' : ''}`}
          onClick={onTogglePlay}
          title="Chronological 365-Day TCHP Heat Flux Animation"
        >
          {isPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
          <span>{isPlaying ? t('timeline.pause') : t('timeline.animateTchp')}</span>
        </button>

        <select
          className="timeline-speed-dropdown"
          value={playSpeed}
          onChange={(e) => onChangePlaySpeed(Number(e.target.value))}
          title={t('timeline.speedTitle')}
        >
          <option value={0.25}>0.25×</option>
          <option value={0.5}>0.5×</option>
          <option value={1}>1.0×</option>
          <option value={2}>2.0×</option>
          <option value={4}>4.0×</option>
        </select>
      </div>
    </div>
  );
}
