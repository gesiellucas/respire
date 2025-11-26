
import React from 'react';
import { Settings } from '../types';

interface ControlsPanelProps {
  settings: Settings;
  onSettingsChange: (field: keyof Settings, value: number) => void;
  isRunning: boolean;
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
  settings, onSettingsChange, isRunning
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
      >
        <span className="font-semibold text-gray-700 flex items-center gap-2">
          ⚙️ Configurações
        </span>
        <span className={`transform transition-transform duration-200 text-gray-400 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[600px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
        <div className="bg-gray-50 rounded-2xl p-6 space-y-6 border border-gray-100">
          <div className="grid grid-cols-2 gap-4">
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
      </div>
    </div>
  );
};