import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, Calendar, Sparkles } from 'lucide-react';
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
const AVAILABLE_YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

// Helper: Calculate Day of Year (0-based)
function getDayOfYear(year, monthIdx, day) {
  const start = new Date(Date.UTC(year, 0, 1));
  const curr = new Date(Date.UTC(year, monthIdx, day));
  return Math.round((curr - start) / 86400000);
}

// Helper: Get total days in year (366 for leap years like 2020, 2024; 365 otherwise)
function getDaysInYear(year) {
  return new Date(Date.UTC(year, 1, 29)).getUTCMonth() === 1 ? 366 : 365;
}

// Helper: Convert Day of Year index (0..365) to YYYY-MM-DD
function getDateFromDayOfYear(year, dayOfYear) {
  const date = new Date(Date.UTC(year, 0, 1 + dayOfYear));
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

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

  // Parse active date components
  const parsedYear = parseInt(currentDate.slice(0, 4), 10) || 2026;
  const parsedMonthIdx = (parseInt(currentDate.slice(5, 7), 10) || 8) - 1;
  const parsedDay = parseInt(currentDate.slice(8, 10), 10) || 27;

  // Browsable Year & Month in popover
  const [calendarViewYear, setCalendarViewYear] = useState(parsedYear);
  const [calendarViewMonth, setCalendarViewMonth] = useState(parsedMonthIdx);

  // Sync calendar popover state when external date changes
  useEffect(() => {
    setCalendarViewYear(parsedYear);
    if (!isCalendarOpen) {
      setCalendarViewMonth(parsedMonthIdx);
    }
  }, [parsedYear, parsedMonthIdx, isCalendarOpen]);

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

  // Compute total days and current slider index for active year
  const totalDaysInYear = getDaysInYear(parsedYear);
  const currentDayOfYear = Math.min(totalDaysInYear - 1, Math.max(0, getDayOfYear(parsedYear, parsedMonthIdx, parsedDay)));
  const progressPercent = (currentDayOfYear / (totalDaysInYear - 1)) * 100;

  // Move exactly 1 day backward
  const handlePrevDay = useCallback(() => {
    const curr = new Date(Date.UTC(parsedYear, parsedMonthIdx, parsedDay));
    curr.setUTCDate(curr.getUTCDate() - 1);
    const yyyy = curr.getUTCFullYear();
    const mm = String(curr.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(curr.getUTCDate()).padStart(2, '0');
    onDateChange(`${yyyy}-${mm}-${dd}`);
  }, [parsedYear, parsedMonthIdx, parsedDay, onDateChange]);

  // Move exactly 1 day forward
  const handleNextDay = useCallback(() => {
    const curr = new Date(Date.UTC(parsedYear, parsedMonthIdx, parsedDay));
    curr.setUTCDate(curr.getUTCDate() + 1);
    const yyyy = curr.getUTCFullYear();
    const mm = String(curr.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(curr.getUTCDate()).padStart(2, '0');
    onDateChange(`${yyyy}-${mm}-${dd}`);
  }, [parsedYear, parsedMonthIdx, parsedDay, onDateChange]);

  // Direct Slider scrubber
  const handleSliderChange = (e) => {
    const dayIdx = parseInt(e.target.value, 10);
    const dateStr = getDateFromDayOfYear(parsedYear, dayIdx);
    onDateChange(dateStr);
  };

  // Calendar month / year navigation
  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (calendarViewMonth > 0) {
      setCalendarViewMonth(calendarViewMonth - 1);
    } else {
      setCalendarViewMonth(11);
      setCalendarViewYear((y) => Math.max(AVAILABLE_YEARS[0], y - 1));
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (calendarViewMonth < 11) {
      setCalendarViewMonth(calendarViewMonth + 1);
    } else {
      setCalendarViewMonth(0);
      setCalendarViewYear((y) => Math.min(AVAILABLE_YEARS[AVAILABLE_YEARS.length - 1], y + 1));
    }
  };

  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value, 10);
    setCalendarViewYear(newYear);
    // Switch the active date to this year preserving month and day
    const mm = String(parsedMonthIdx + 1).padStart(2, '0');
    const dd = String(Math.min(parsedDay, new Date(Date.UTC(newYear, parsedMonthIdx + 1, 0)).getUTCDate())).padStart(2, '0');
    onDateChange(`${newYear}-${mm}-${dd}`);
  };

  const handleSelectCalendarDate = (dateId) => {
    onDateChange(dateId);
    setIsCalendarOpen(false);
  };

  // Compute days in calendar view month
  const calendarDays = useMemo(() => {
    const firstDayOfWeek = new Date(Date.UTC(calendarViewYear, calendarViewMonth, 1)).getUTCDay();
    const daysInMonth = new Date(Date.UTC(calendarViewYear, calendarViewMonth + 1, 0)).getUTCDate();

    const cells = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push({ isPadding: true, key: `pad-${i}` });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const mm = String(calendarViewMonth + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      const dateId = `${calendarViewYear}-${mm}-${dd}`;
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
  }, [calendarViewYear, calendarViewMonth, currentDate]);

  const monthNameView = (MONTH_NAMES_FULL[currentLang] || MONTH_NAMES_FULL.en)[calendarViewMonth];
  const shortMonths = MONTH_SHORT[currentLang] || MONTH_SHORT.en;

  // Previous and next date strings
  const prevDateStr = getDateFromDayOfYear(parsedYear, Math.max(0, currentDayOfYear - 1));
  const nextDateStr = getDateFromDayOfYear(parsedYear, Math.min(totalDaysInYear - 1, currentDayOfYear + 1));

  return (
    <div className="app-timeline">
      {/* 1. Direct Date Navigation: ‹ Previous Day  [📅 27 Aug 2026]  Next Day › */}
      <div className="timeline-nav-group" ref={calendarRef}>
        {/* Previous Day Button */}
        <button
          id="btn-prev-date"
          className="timeline-step-btn"
          onClick={handlePrevDay}
          title={`Previous Day: ${prevDateStr}`}
        >
          <ChevronLeft size={14} />
          <span>{formatLocalizedDate(prevDateStr, currentLang, false)}</span>
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
              {formatLocalizedDate(currentDate, currentLang, false)}
            </span>
          </button>

          {/* Polished Glass Calendar Popover with Year & Month Selection */}
          {isCalendarOpen && (
            <div className="calendar-popover-glass" onClick={(e) => e.stopPropagation()}>
              {/* Year & Month Control Header */}
              <div className="calendar-popover-header">
                <button
                  className="cal-month-nav-btn"
                  onClick={handlePrevMonth}
                  title="Previous Month"
                >
                  <ChevronLeft size={14} />
                </button>

                <div className="cal-header-title-group">
                  <span className="cal-header-month-text">{monthNameView}</span>
                  <select
                    className="cal-year-select"
                    value={calendarViewYear}
                    onChange={handleYearChange}
                    title="Switch Analysis Year"
                  >
                    {AVAILABLE_YEARS.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr} {yr === 2020 ? '· Dataset Ground Truth' : yr === 2026 ? '· Live Operational' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  className="cal-month-nav-btn"
                  onClick={handleNextMonth}
                  title="Next Month"
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* 1-Click Quick Month Grid */}
              <div className="cal-quick-months-row">
                {shortMonths.map((mShort, idx) => (
                  <button
                    key={idx}
                    className={`cal-month-pill ${calendarViewMonth === idx ? 'active' : ''}`}
                    onClick={() => setCalendarViewMonth(idx)}
                  >
                    {mShort}
                  </button>
                ))}
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

              {/* Quick Jump & Year Presets Footer */}
              <div className="cal-quick-footer">
                <button
                  className="cal-quick-btn"
                  onClick={() => handleSelectCalendarDate('2026-08-27')}
                  title="Jump to 2026 Operational Late-Monsoon"
                >
                  <span>2026 Monsoon</span>
                </button>
                <button
                  className="cal-quick-btn"
                  onClick={() => handleSelectCalendarDate('2020-05-15')}
                  title="Jump to 2020 Pre-Monsoon Genesis (Amphan)"
                >
                  <Sparkles size={11} style={{ display: 'inline', marginRight: '3px' }} />
                  <span>2020 Ground Truth</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Next Day Button */}
        <button
          id="btn-next-date"
          className="timeline-step-btn"
          onClick={handleNextDay}
          title={`Next Day: ${nextDateStr}`}
        >
          <span>{formatLocalizedDate(nextDateStr, currentLang, false)}</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* 2. Interactive Scrubber Timeline with Active Year Badge */}
      <div className="timeline-center-track">
        <div className="timeline-bubble-container" style={{ left: `${progressPercent}%` }}>
          <div className="timeline-active-bubble">
            <span>{formatLocalizedDate(currentDate, currentLang, true)}</span>
          </div>
        </div>

        <div className="timeline-bar-wrapper">
          <div className="timeline-bar-fill" style={{ width: `${progressPercent}%` }} />

          {/* Month Node Markers */}
          <div className="timeline-nodes-row">
            {MONTH_ANCHORS.map((anchor) => {
              const nodePercent = (anchor.dayIndex / (totalDaysInYear - 1)) * 100;
              const isPassed = currentDayOfYear >= anchor.dayIndex;
              const isActive = parsedMonthIdx === anchor.month;

              return (
                <div
                  key={anchor.month}
                  className={`timeline-node-dot ${isActive ? 'active' : isPassed ? 'passed' : ''}`}
                  style={{ left: `${nodePercent}%` }}
                />
              );
            })}
          </div>

          <input
            type="range"
            id="timeline-range-slider"
            min="0"
            max={totalDaysInYear - 1}
            value={currentDayOfYear}
            onChange={handleSliderChange}
            className="timeline-range-input"
            aria-label="Oceanographic Time Scrubber"
          />
        </div>

        {/* Month Labels with Click-to-Jump */}
        <div className="timeline-labels-row">
          {shortMonths.map((mName, idx) => {
            const anchor = MONTH_ANCHORS[idx];
            const percent = (anchor.dayIndex / (totalDaysInYear - 1)) * 100;
            const isCurrentMonth = parsedMonthIdx === idx;

            return (
              <span
                key={idx}
                className={`timeline-month-label ${isCurrentMonth ? 'active' : ''}`}
                style={{ left: `${percent}%` }}
                onClick={() => {
                  const targetDate = getDateFromDayOfYear(parsedYear, anchor.dayIndex);
                  onDateChange(targetDate);
                }}
                title={`Jump to 1 ${mName} ${parsedYear}`}
              >
                {mName}
              </span>
            );
          })}
        </div>
      </div>

      {/* 3. Animation Controls: Play/Pause, Speed & Status */}
      <div className="timeline-action-right">
        <button
          id="btn-play-pause-animation"
          className={`timeline-play-btn ${isPlaying ? 'playing' : ''}`}
          onClick={onTogglePlay}
          title={isPlaying ? t('timeline.pauseAnimation') : t('timeline.playAnimation')}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          <span>{isPlaying ? t('timeline.pause') : t('timeline.animateTchp')}</span>
        </button>

        {/* Speed Selector */}
        <select
          id="select-playback-speed"
          className="timeline-speed-dropdown"
          value={playSpeed}
          onChange={(e) => onChangePlaySpeed(parseFloat(e.target.value))}
          title={t('timeline.playbackSpeed')}
        >
          <option value="0.5">0.5×</option>
          <option value="1">1.0×</option>
          <option value="1.5">1.5×</option>
          <option value="2">2.0×</option>
        </select>
      </div>
    </div>
  );
}
