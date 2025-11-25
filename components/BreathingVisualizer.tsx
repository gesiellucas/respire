
import React from 'react';
import { Phase, Stats } from '../types';

interface BreathingVisualizerProps {
  phase: Phase;
  timeLeft: number;
  stats: Stats;
  progress: number;
}

const phaseMap: { [key in Phase]: { text: string; description: string; gradient: string; scale: string; innerScale: string; animation: string } } = {
  [Phase.IDLE]: { text: 'Pressione Iniciar', description: '', gradient: 'from-indigo-500 to-purple-600', scale: 'scale-100', innerScale: 'scale-100', animation: '' },
  [Phase.INHALE]: { text: 'Inspirar', description: 'Inspire profundamente pelo nariz', gradient: 'from-indigo-500 to-purple-600', scale: 'scale-140', innerScale: 'scale-110', animation: 'animate-pulse' },
  [Phase.HOLD]: { text: 'Segurar', description: 'Mantenha o ar nos pulmões', gradient: 'from-pink-500 to-rose-500', scale: 'scale-140', innerScale: 'scale-110', animation: '' },
  [Phase.EXHALE]: { text: 'Expirar', description: 'Expire lentamente pela boca', gradient: 'from-sky-400 to-cyan-400', scale: 'scale-90', innerScale: 'scale-90', animation: 'animate-pulse' },
  [Phase.WAIT]: { text: 'Pausar', description: 'Relaxe e prepare-se', gradient: 'from-emerald-400 to-teal-400', scale: 'scale-90', innerScale: 'scale-90', animation: '' },
};

const StatCard: React.FC<{ value: string | number; label: string }> = ({ value, label }) => (
  <div className="stat-card rounded-xl p-4 text-center bg-gradient-to-r from-indigo-500 to-purple-600 transition-transform duration-300 hover:scale-105">
    <p className="text-2xl font-bold text-white">{value}</p>
    <p className="text-xs text-white text-opacity-80 mt-1">{label}</p>
  </div>
);

const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const BreathingVisualizer: React.FC<BreathingVisualizerProps> = ({ phase, timeLeft, stats, progress }) => {
  const { text, description, gradient, scale, innerScale } = phaseMap[phase];
  const circumference = 2 * Math.PI * 130;
  const offset = circumference - progress * circumference;

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="relative flex items-center justify-center w-[280px] h-[280px]">
        <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 280 280">
          <circle className="text-gray-200" stroke="currentColor" strokeWidth="4" fill="transparent" r="130" cx="140" cy="140" />
          <circle
            className="text-indigo-500 transition-all duration-500 ease-linear"
            stroke="url(#gradient)"
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            r="130"
            cx="140"
            cy="140"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#667eea" />
              <stop offset="100%" stopColor="#764ba2" />
            </linearGradient>
          </defs>
        </svg>

        <div
          className={`absolute w-48 h-48 rounded-full flex items-center justify-center shadow-2xl transition-all duration-1000 ease-in-out bg-gradient-to-br ${gradient} ${scale}`}
        >
          <div className={`w-40 h-40 rounded-full bg-white bg-opacity-20 flex items-center justify-center transition-transform duration-1000 ease-in-out ${innerScale}`}>
            <span className="text-5xl font-bold text-white">{stats.breaths}</span>
          </div>
        </div>
      </div>

      <div className="text-center space-y-2 w-full">
        <p className={`text-2xl font-semibold text-gray-800 ${phase !== Phase.IDLE && 'breathing-text'}`}>{text}</p>
        <p className="text-sm text-gray-500 min-h-[20px]">{description}</p>
      </div>

      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 w-full max-w-sm mx-auto">
        <p className="text-sm font-medium text-gray-600 text-center mb-1">Tempo Restante</p>
        <p className="text-5xl font-bold text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          {formatTime(timeLeft)}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full max-w-sm mx-auto">
        <StatCard value={stats.cycles} label="Ciclos" />
        <StatCard value={`${Math.floor(stats.elapsedTime / 60)}m`} label="Tempo" />
        <StatCard value={stats.breaths} label="Respirações" />
      </div>
    </div>
  );
};
