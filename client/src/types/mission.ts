export type Category = 
  | 'อาคาร'
  | 'แหล่งน้ำ'
  | 'ตลาด'
  | 'สถานพยาบาล'
  | 'สถานศึกษา'
  | 'ศาสนสถาน'
  | 'สวนสาธารณะ';

export type CatalogItem = [string, number, number]; // [name, price, score]

export type Catalog = Record<Category, CatalogItem[]>;

export interface PointRecord {
  id: number;
  category: Category;
  type: string;
  lat: number;
  lng: number;
  coords: string;
  matched: CatalogItem | null;
}

export type GameMode = 'time' | 'table';

export type ModalType = 'intro' | 'editor' | 'end' | 'result' | 'catalog' | 'leaderboard';

export interface LeaderboardEntry {
  id?: number;
  name: string;
  score: number;
  mode: string;
  date: string;
}

export interface OverallLeaderboardEntry {
  name: string;
  score: number;
  playedTopics: number;
  isComplete: boolean;
}
