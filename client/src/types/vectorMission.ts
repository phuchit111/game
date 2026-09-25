export interface KKULocation {
  name: string;
  lat: number;
  lng: number;
  img: string;
}

export type VectorStage = 1 | 2 | 3;

export type VectorModalType = 
  | 'brief' 
  | 'howto' 
  | 'info' 
  | 'knowledge' 
  | 'complete' 
  | 'leaderboard';

export interface AttributeData {
  name: string;
  cat: string;
  lat: string;
  lng: string;
}

export interface StageScoreConfig {
  base: number;
  rounds: number;
  time: number;
}
