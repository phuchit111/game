export type MissionId = 'attribute' | 'vector' | 'raster' | 'rs' | 'coordinate';

export interface PlayerProfile {
  playerName: string;
  completedMissions: Record<MissionId, boolean>;
  bestScores: Partial<Record<MissionId, number>>;
}
