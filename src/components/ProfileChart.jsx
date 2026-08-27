import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getTranslation } from '../data/i18n';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

export function ProfileChart({ profileData, theme = 'dark', currentLang = 'en', isPlaying = false }) {
  const t = (key) => getTranslation(currentLang, key);

  if (!profileData || !profileData.profile || profileData.profile.length === 0) {
    return (
      <div className="profile-chart-empty">
        <span>{t('location.noProfileAvailable')}</span>
      </div>
    );
  }

  const { profile } = profileData;

  const predictedPoints = useMemo(() => profile.map((p) => ({ x: p.predictedTemp, y: p.depth })), [profile]);
  const maxPoints = useMemo(() => profile.map((p) => ({ x: p.tempMax, y: p.depth })), [profile]);
  const minPoints = useMemo(() => profile.map((p) => ({ x: p.tempMin, y: p.depth })), [profile]);

  const isLight = theme === 'light';

  const datasets = useMemo(() => {
    const sets = [
      // 0: OceanEmbed Prediction
      {
        label: 'OceanEmbed Prediction',
        data: predictedPoints,
        borderColor: isLight ? '#0284C7' : '#00D9FF',
        backgroundColor: isLight ? '#0284C7' : '#00D9FF',
        borderWidth: 2.2,
        pointRadius: isPlaying ? 0 : 2.5,
        pointHoverRadius: 5.5,
        pointBackgroundColor: isLight ? '#0284C7' : '#00D9FF',
        pointBorderColor: isLight ? '#FFFFFF' : '#05080D',
        pointBorderWidth: 1.2,
        tension: 0.30,
        order: 1,
      },
      // 1: Uncertainty Upper Bound
      {
        label: 'Uncertainty (+1σ)',
        data: maxPoints,
        borderColor: isLight ? 'rgba(2, 132, 199, 0.65)' : 'rgba(0, 217, 255, 0.65)',
        borderWidth: 1.4,
        borderDash: [4, 3],
        pointRadius: 0,
        fill: '+1',
        backgroundColor: isLight ? 'rgba(2, 132, 199, 0.18)' : 'rgba(0, 217, 255, 0.26)',
        tension: 0.30,
        order: 3,
      },
      // 2: Uncertainty Lower Bound
      {
        label: 'Uncertainty (-1σ)',
        data: minPoints,
        borderColor: isLight ? 'rgba(2, 132, 199, 0.65)' : 'rgba(0, 217, 255, 0.65)',
        borderWidth: 1.4,
        borderDash: [4, 3],
        pointRadius: 0,
        fill: false,
        tension: 0.30,
        order: 4,
      },
    ];

    // 3: ARGO In-Situ Observation Points
    const argoPoints = profile
      .filter((p) => p.argoTemp !== null && p.argoTemp !== undefined)
      .map((p) => ({ x: p.argoTemp, y: p.depth }));

    if (argoPoints.length > 0) {
      sets.push({
        label: 'ARGO In-Situ Ground Truth',
        data: argoPoints,
        borderColor: '#FFFFFF',
        borderWidth: 2.2,
        showLine: false,
        pointRadius: isPlaying ? 4.0 : 6.5,
        pointHoverRadius: 9.0,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2.2,
        order: 0,
      });
    }

    return sets;
  }, [predictedPoints, maxPoints, minPoints, profile, isLight, isPlaying]);

  const chartData = useMemo(() => ({ datasets }), [datasets]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: isPlaying ? false : { duration: 160 },
    interaction: {
      mode: 'nearest',
      axis: 'y',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: !isPlaying,
        backgroundColor: isLight ? 'rgba(255, 255, 255, 0.98)' : 'rgba(8, 14, 24, 0.96)',
        titleColor: isLight ? '#0284C7' : '#00D9FF',
        bodyColor: isLight ? '#0F172A' : '#F5F7FA',
        borderColor: isLight ? 'rgba(2, 132, 199, 0.35)' : 'rgba(0, 217, 255, 0.4)',
        borderWidth: 1,
        padding: 8,
        cornerRadius: 7,
        titleFont: { family: 'JetBrains Mono', size: 10, weight: '700' },
        bodyFont: { family: 'JetBrains Mono', size: 9.5 },
        callbacks: {
          title: (items) => {
            if (!items.length) return '';
            return `${currentLang === 'hi' ? 'गहराई' : 'Depth'}: ${items[0].parsed.y} m`;
          },
          label: (item) => {
            const raw = item.raw;
            const pt = profile.find((p) => p.depth === raw.y);
            if (!pt) return '';

            if (item.datasetIndex === 0) {
              return `Model: ${pt.predictedTemp} °C (±${pt.uncertainty}°C)`;
            }
            if (item.dataset.label?.includes('ARGO') && pt.argoTemp !== null) {
              return `● ARGO In-Situ: ${pt.argoTemp} °C [Verified]`;
            }
            return null;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        min: 4,
        max: 32,
        title: {
          display: true,
          text: currentLang === 'hi' ? 'तापमान (°C)' : 'Temperature (°C)',
          color: isLight ? '#64748B' : '#5E6D82',
          font: { family: 'Inter', size: 9.5, weight: '600' },
          padding: { top: 3 },
        },
        grid: {
          color: isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.04)',
        },
        ticks: {
          color: isLight ? '#475569' : '#8D9AAA',
          font: { family: 'JetBrains Mono', size: 9 },
          stepSize: 4,
        },
      },
      y: {
        type: 'linear',
        reverse: true, // 0m Surface -> 1000m Deep
        min: 0,
        max: 1000,
        title: {
          display: true,
          text: currentLang === 'hi' ? 'गहराई (मी.)' : 'Depth (m)',
          color: isLight ? '#64748B' : '#5E6D82',
          font: { family: 'Inter', size: 9.5, weight: '600' },
          padding: { bottom: 3 },
        },
        grid: {
          color: isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.04)',
        },
        ticks: {
          color: isLight ? '#475569' : '#8D9AAA',
          font: { family: 'JetBrains Mono', size: 9 },
          stepSize: 200,
        },
      },
    },
  }), [isPlaying, isLight, currentLang, profile]);

  return (
    <div className="profile-canvas-container">
      <Line data={chartData} options={chartOptions} />
    </div>
  );
}
