export interface LandCategory {
  min: number;
  max: number;
  color: string;
  label: string;
  rangeText: string;
}

export interface ResChallengeItem {
  a: number;
  b: number;
  question: string;
  answer: 'A' | 'B';
  explain: string;
}

export interface QuizQuestion {
  q: string;
  opts: string[];
  correct: number;
  explain: string;
}

export type RasterDisplayMode = 'color' | 'shade' | 'land';
export type EscapeStatus = 'idle' | 'playing' | 'won' | 'lost';
export type ClassifyStatus = 'idle' | 'playing' | 'won' | 'lost';
export type ResolutionStatus = 'idle' | 'playing' | 'won';
