import { Chart as ChartJS, RadialLinearScale, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Doughnut, Line, Radar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

// Each chart renders only when its page is mounted — no hidden-canvas sizing issues.

export function DemandSupplyChart({ rows }) {
  const labels = rows.map((s) => (s.skill.length > 22 ? s.skill.slice(0, 22) + '…' : s.skill));
  return (
    <Bar
      data={{ labels, datasets: [{ label: 'Demand', data: rows.map((s) => s.demand), backgroundColor: '#2563EB', borderRadius: 8 }, { label: 'Supply (institute output)', data: rows.map((s) => s.supply), backgroundColor: '#0D9488', borderRadius: 8 }] }}
      options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11, weight: 'bold' } } } }, scales: { y: { max: 100, grid: { color: '#F1F5F9' }, ticks: { font: { size: 10 } } }, x: { grid: { display: false }, ticks: { font: { size: 9 }, maxRotation: 30 } } } }}
    />
  );
}

export function SectorChart() {
  return (
    <Doughnut
      data={{ labels: ['EV', 'IT/AI', 'Mfg', 'Health', 'Energy', 'Others'], datasets: [{ data: [24, 22, 17, 13, 12, 12], backgroundColor: ['#2563EB', '#0D9488', '#059669', '#E11D48', '#F59E0B', '#94A3B8'], borderWidth: 3, borderColor: '#fff' }] }}
      options={{ responsive: true, maintainAspectRatio: false, cutout: '64%', plugins: { legend: { display: false } } }}
    />
  );
}

export function GapChart() {
  return (
    <Bar
      data={{ labels: ['EV Diagnostics', 'Battery Mgmt', 'CAN Protocol', 'Electrical Sys', 'EV Safety'], datasets: [{ label: 'Demand', data: [92, 90, 88, 80, 86], backgroundColor: '#2563EB', borderRadius: 8 }, { label: 'Supply', data: [25, 28, 30, 55, 32], backgroundColor: '#0D9488', borderRadius: 8 }] }}
      options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11, weight: 'bold' } } } }, scales: { y: { max: 100, grid: { color: '#F1F5F9' } } } }}
    />
  );
}

export function ForecastChart() {
  return (
    <Line
      data={{ labels: ['2024', '2025', '2026', '2027'], datasets: [{ label: 'EV Diagnostics', data: [42, 58, 76, 92], borderColor: '#2563EB', backgroundColor: '#2563EB', tension: 0.35 }, { label: 'Industrial Automation', data: [38, 50, 63, 74], borderColor: '#0D9488', backgroundColor: '#0D9488', tension: 0.35 }, { label: 'AI / Data', data: [45, 60, 78, 90], borderColor: '#059669', backgroundColor: '#059669', tension: 0.35 }] }}
      options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11, weight: 'bold' } } } }, scales: { y: { max: 100, grid: { color: '#F1F5F9' } } } }}
    />
  );
}

export function TraineeRadar({ axes, you, dem }) {
  return (
    <Radar
      data={{ labels: axes, datasets: [{ label: 'You', data: you, backgroundColor: 'rgba(37,99,235,.18)', borderColor: '#2563EB', pointBackgroundColor: '#2563EB' }, { label: 'Employer demand', data: dem, backgroundColor: 'rgba(13,148,136,.15)', borderColor: '#0D9488', pointBackgroundColor: '#0D9488' }] }}
      options={{ responsive: true, maintainAspectRatio: false, scales: { r: { min: 0, max: 100, ticks: { display: false }, pointLabels: { font: { size: 11, weight: 'bold' } } } } }}
    />
  );
}
