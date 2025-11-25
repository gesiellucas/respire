import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Phase, Settings, Stats } from './types';
import { BreathingVisualizer } from './components/BreathingVisualizer';
import { ControlsPanel } from './components/ControlsPanel';
import { useAudio } from './hooks/useAudio';

const App: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    inhale: 4,
    hold: 7,
    exhale: 8,
    wait: 1,
    totalTime: 2,
  });
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentPhase, setCurrentPhase] = useState<Phase>(Phase.IDLE);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [stats, setStats] = useState<Stats>({ cycles: 0, elapsedTime: 0, breaths: 0 });
  const [phaseProgress, setPhaseProgress] = useState<number>(0);

  const { initialize: initializeAudio, playSound } = useAudio();
  const audioInitialized = useRef(false);

  // Timers refs
  const sessionTimerRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);
  const phaseTimerRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  const cleanUpTimers = useCallback(() => {
    if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  }, []);

  const handleStop = useCallback(() => {
    setIsRunning(false);
    setCurrentPhase(Phase.IDLE);
    cleanUpTimers();
  }, [cleanUpTimers]);


  useEffect(() => {
    return () => cleanUpTimers(); // Cleanup on unmount
  }, [cleanUpTimers]);

  useEffect(() => {
    if (!isRunning) return;

    const phaseDurations = {
      [Phase.INHALE]: settings.inhale * 1000,
      [Phase.HOLD]: settings.hold * 1000,
      [Phase.EXHALE]: settings.exhale * 1000,
      [Phase.WAIT]: settings.wait * 1000,
      [Phase.IDLE]: 0,
    };
    
    const nextPhaseMap = {
      [Phase.INHALE]: Phase.HOLD,
      [Phase.HOLD]: Phase.EXHALE,
      [Phase.EXHALE]: Phase.WAIT,
      [Phase.WAIT]: Phase.INHALE,
      [Phase.IDLE]: Phase.IDLE,
    };
    
    const runPhase = (phase: Phase) => {
        if (phase === Phase.IDLE) return;
        
        const durationMs = phaseDurations[phase];
        playSound(phase, durationMs / 1000);
        setCurrentPhase(phase);

        if (phase === Phase.INHALE) {
            setStats(prev => ({ ...prev, breaths: prev.breaths + 1 }));
        }
        if (phase === Phase.WAIT) {
            setStats(prev => ({ ...prev, cycles: prev.cycles + 1 }));
        }

        // Progress animation
        let startTime = Date.now();
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = window.setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / durationMs, 1);
            setPhaseProgress(progress);
            if (progress >= 1) {
                if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            }
        }, 50);

        phaseTimerRef.current = window.setTimeout(() => {
            if (isRunning) { // Check if still running before scheduling next
                 runPhase(nextPhaseMap[phase]);
            }
        }, durationMs);
    }
    
    runPhase(Phase.INHALE);

  }, [isRunning, playSound, settings]);

  const handleStart = useCallback(async () => {
    if (!audioInitialized.current) {
      await initializeAudio();
      audioInitialized.current = true;
    }

    setStats({ cycles: 0, elapsedTime: 0, breaths: 0 });
    const totalDurationSeconds = settings.totalTime * 60;
    setTimeLeft(totalDurationSeconds);
    setIsRunning(true);
    
    countdownIntervalRef.current = window.setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
      setStats(prev => ({ ...prev, elapsedTime: prev.elapsedTime + 1 }));
    }, 1000);

    sessionTimerRef.current = window.setTimeout(() => {
      handleStop();
    }, totalDurationSeconds * 1000);
  }, [settings.totalTime, handleStop, initializeAudio]);


  const handleSettingsChange = (field: keyof Settings, value: number) => {
    if (isNaN(value) || value < 0) return;
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Respiração Consciente
        </h1>
        <p className="text-gray-500 text-sm">Encontre paz interior através da respiração guiada</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <BreathingVisualizer phase={currentPhase} timeLeft={timeLeft} stats={stats} progress={phaseProgress} />
        <ControlsPanel
          settings={settings}
          onSettingsChange={handleSettingsChange}
          isRunning={isRunning}
          onStart={handleStart}
          onStop={handleStop}
        />
      </div>
      
      <footer className="mt-12 pt-8 border-t border-gray-100">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all hover:shadow-md">
          <div className="text-center sm:text-left">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 justify-center sm:justify-start">
              <span className="text-xl">🚀</span>
              Contribua com o projeto
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Ajude-nos a melhorar o Respire! Sugira recursos ou reporte bugs no GitHub.
            </p>
          </div>
          <a
            href="https://github.com/gesiellucas/respire"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200 group"
          >
            <svg className="w-6 h-6 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Acessar Repositório</span>
          </a>
        </div>
      </footer>
    </div>
  );
};

export default App;