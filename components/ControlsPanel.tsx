
import React from 'react';
import { Settings } from '../types';

interface ControlsPanelProps {
  settings: Settings;
  onSettingsChange: (field: keyof Settings, value: number) => void;
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
}

const NumberInput: React.FC<{ id: string; label: string; emoji: string; value: number; min: number; max: number; disabled: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = 
({ id, label, emoji, value, min, max, disabled, onChange }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2 text-center">
      {emoji} {label}
    </label>
    <input
      type="number"
      id={id}
      value={value}
      min={min}
      max={max}
      disabled={disabled}
      onChange={onChange}
      className="w-full p-3 border-2 border-gray-200 rounded-xl shadow-sm text-gray-900 font-semibold text-center focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition disabled:bg-gray-100"
    />
  </div>
);

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  settings, onSettingsChange, isRunning, onStart, onStop
}) => {
  return (
    <div className="space-y-6 flex flex-col">
      <div className="bg-gray-50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">⚙️ Configurações</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <NumberInput id="inhaleTime" label="Inspirar (s)" emoji="💨" value={settings.inhale} min={1} max={30} disabled={isRunning} onChange={(e) => onSettingsChange('inhale', parseInt(e.target.value, 10))} />
          <NumberInput id="holdTime" label="Segurar (s)" emoji="⏸️" value={settings.hold} min={0} max={30} disabled={isRunning} onChange={(e) => onSettingsChange('hold', parseInt(e.target.value, 10))} />
          <NumberInput id="exhaleTime" label="Expirar (s)" emoji="🌬️" value={settings.exhale} min={1} max={30} disabled={isRunning} onChange={(e) => onSettingsChange('exhale', parseInt(e.target.value, 10))} />
          <NumberInput id="waitTime" label="Pausar (s)" emoji="⏱️" value={settings.wait} min={0} max={30} disabled={isRunning} onChange={(e) => onSettingsChange('wait', parseInt(e.target.value, 10))} />
        </div>
        <div>
          <label htmlFor="totalTime" className="block text-sm font-medium text-gray-700 mb-2 text-center">
            🕐 Duração Total (minutos)
          </label>
          <input type="number" id="totalTime" value={settings.totalTime} min={1} max={60} disabled={isRunning} onChange={(e) => onSettingsChange('totalTime', parseInt(e.target.value, 10))} className="w-full p-3 border-2 border-gray-200 rounded-xl shadow-sm text-gray-900 font-semibold text-center focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition disabled:bg-gray-100" />
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onStart} disabled={isRunning} className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none">
          <span>▶️</span> Iniciar
        </button>
        <button onClick={onStop} disabled={!isRunning} className="flex-1 py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none">
          <span>⏹️</span> Parar
        </button>
      </div>
    </div>
  );
};