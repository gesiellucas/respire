
export enum Phase {
  IDLE = 'IDLE',
  INHALE = 'INHALE',
  HOLD = 'HOLD',
  EXHALE = 'EXHALE',
  WAIT = 'WAIT',
}

export interface Settings {
  inhale: number;
  hold: number;
  exhale: number;
  wait: number;
  totalTime: number;
}

export interface Stats {
  cycles: number;
  elapsedTime: number;
  breaths: number;
}
