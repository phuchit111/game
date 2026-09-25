export interface UTMTarget {
  x: number;
  y: number;
  E: number;
  N: number;
}

export interface GlobeTarget {
  lat: number;
  lon: number;
  latLabel: string;
  lonLabel: string;
}

export interface CoordinateLeaderboardEntry {
  id?: number;
  name: string;
  score: number;
  mode: string;
  mission: string;
  date?: string;
  created_at?: string;
}
