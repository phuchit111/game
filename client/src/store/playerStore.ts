import { create } from 'zustand';
import type { MissionId, PlayerProfile } from '../types/player';

const PROFILE_KEY = 'gis_mission_player_profile';

const emptyCompleted = (): Record<MissionId, boolean> => ({
  attribute: false,
  vector: false,
  raster: false,
  rs: false,
  coordinate: false,
});

const readProfile = (): PlayerProfile => {
  const fallback: PlayerProfile = { playerName: '', completedMissions: emptyCompleted(), bestScores: {} };
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<PlayerProfile>;
    return {
      playerName: typeof parsed.playerName === 'string' ? parsed.playerName : '',
      completedMissions: { ...emptyCompleted(), ...(parsed.completedMissions ?? {}) },
      bestScores: parsed.bestScores ?? {},
    };
  } catch {
    return fallback;
  }
};

const persistProfile = (profile: PlayerProfile) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // Storage may be disabled in private browsing; the in-memory state still works.
  }
};

interface PlayerState extends PlayerProfile {
  setPlayerName: (playerName: string) => void;
  markMissionComplete: (missionId: MissionId, score: number) => void;
  resetProgress: () => void;
}

const initialProfile = readProfile();

export const usePlayerStore = create<PlayerState>((set, get) => ({
  ...initialProfile,

  setPlayerName: (playerName) => {
    const nextProfile = { ...get(), playerName: playerName.trim().slice(0, 30) };
    set({ playerName: nextProfile.playerName });
    persistProfile({
      playerName: nextProfile.playerName,
      completedMissions: get().completedMissions,
      bestScores: get().bestScores,
    });
  },

  markMissionComplete: (missionId, score) => {
    const currentBest = get().bestScores[missionId];
    const bestScores = {
      ...get().bestScores,
      [missionId]: currentBest === undefined ? score : Math.max(currentBest, score),
    };
    const completedMissions = { ...get().completedMissions, [missionId]: true };
    set({ completedMissions, bestScores });
    persistProfile({ playerName: get().playerName, completedMissions, bestScores });
  },

  resetProgress: () => {
    const completedMissions = emptyCompleted();
    const bestScores = {};
    set({ completedMissions, bestScores });
    persistProfile({ playerName: get().playerName, completedMissions, bestScores });
  },
}));
