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
    </div>
  );
};

export default App;