export interface RSStep {
  id: number;
  title: string;
  detail: string;
}

export interface RSQuizQuestion {
  q: string;
  a: string[];
  c: number;
}

export interface RSBand {
  id: 'B8' | 'B4' | 'B3' | 'B2';
  label: string;
  name: string;
  wavelength: string;
}

export interface RSLeaderboardEntry {
  id?: number;
  name: string;
  score: number;
  score1?: number;
  score2?: number;
  mode: string;
  mission: string;
  date?: string;
  created_at?: string;
}

export interface MixerVerdict {
  tier: 'good' | 'mid' | 'bad';
  points: number;
  label: string;
  detail: string;
}
