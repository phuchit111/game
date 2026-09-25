import type { LeaderboardEntry, OverallLeaderboardEntry } from '../types/mission';

const API_BASE = window.location.port === '5173' ? '/api' : 'http://localhost:3001/api';
const LOCAL_STORAGE_KEY = 'attribute_mission_leaderboard';
const PROFILE_KEY = 'gis_mission_player_profile';
const MISSION_IDS = ['attribute', 'vector', 'raster', 'rs', 'coordinate'] as const;

const getLocalProfileLeaderboard = (): OverallLeaderboardEntry[] => {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return [];

    const profile = JSON.parse(raw) as {
      playerName?: unknown;
      completedMissions?: Partial<Record<(typeof MISSION_IDS)[number], boolean>>;
      bestScores?: Partial<Record<(typeof MISSION_IDS)[number], number>>;
    };
    const name = typeof profile.playerName === 'string' ? profile.playerName.trim() : '';
    if (!name) return [];

    const playedTopics = MISSION_IDS.filter((missionId) =>
      profile.completedMissions?.[missionId] || typeof profile.bestScores?.[missionId] === 'number'
    ).length;
    if (playedTopics === 0) return [];

    const score = MISSION_IDS.reduce((total, missionId) => {
      const missionScore = profile.bestScores?.[missionId];
      return total + (typeof missionScore === 'number' ? missionScore : 0);
    }, 0);

    return [{
      name,
      score,
      playedTopics,
      isComplete: playedTopics === MISSION_IDS.length,
    }];
  } catch {
    return [];
  }
};

const sortOverallLeaderboard = (list: OverallLeaderboardEntry[]) => [...list].sort((a, b) =>
  b.score - a.score || b.playedTopics - a.playedTopics || a.name.localeCompare(b.name, 'th')
);

const mergeLocalProfile = (list: OverallLeaderboardEntry[]) => {
  const localProfile = getLocalProfileLeaderboard()[0];
  if (!localProfile) return sortOverallLeaderboard(list);

  const merged = [...list];
  const existingIndex = merged.findIndex((entry) => entry.name === localProfile.name);
  if (existingIndex === -1) {
    merged.push(localProfile);
  } else if (
    localProfile.score > merged[existingIndex].score ||
    localProfile.playedTopics > merged[existingIndex].playedTopics
  ) {
    merged[existingIndex] = localProfile;
  }
  return sortOverallLeaderboard(merged);
};

export async function fetchOverallLeaderboard(): Promise<{ list: OverallLeaderboardEntry[]; isLocal: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/leaderboard/overall`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      if (data.ok && Array.isArray(data.data)) {
        return { list: mergeLocalProfile(data.data), isLocal: false };
      }
    }
  } catch (err) {
    console.warn('[Leaderboard] Overall leaderboard unavailable, using LocalStorage fallback:', err);
  }

  return { list: sortOverallLeaderboard(getLocalProfileLeaderboard()), isLocal: true };
}

export async function fetchLeaderboard(): Promise<{ list: LeaderboardEntry[]; isLocal: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/leaderboard`, { signal: AbortSignal.timeout(2500) });
    if (res.ok) {
      const data = await res.json();
      if (data.ok && Array.isArray(data.data)) {
        return { list: data.data, isLocal: false };
      }
    }
  } catch (err) {
    console.warn('[Leaderboard] Backend not reachable, using LocalStorage fallback:', err);
  }

  // Fallback to LocalStorage
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    const list: LeaderboardEntry[] = stored ? JSON.parse(stored) : [
      { id: 1, name: 'GIS_Explorer', score: 145, mode: 'table', date: new Date().toISOString() },
      { id: 2, name: 'MapperPro', score: 138, mode: 'time', date: new Date().toISOString() },
      { id: 3, name: 'GeoMaster', score: 120, mode: 'table', date: new Date().toISOString() },
    ];
    return { list, isLocal: true };
  } catch {
    return { list: [], isLocal: true };
  }
}

export async function submitScoreToBackend(
  name: string,
  score: number,
  mode: string
): Promise<{ ok: boolean; rank: number; list: LeaderboardEntry[]; isLocal: boolean; error?: string }> {
  const cleanName = name.trim().slice(0, 24);

  // Try API first
  try {
    const res = await fetch(`${API_BASE}/leaderboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: cleanName, score, mode }),
      signal: AbortSignal.timeout(3000),
    });

    if (res.ok) {
      const result = await res.json();
      if (result.ok && result.data) {
        return {
          ok: true,
          rank: result.data.rank,
          list: result.data.topList,
          isLocal: false,
        };
      }
    }
  } catch (err) {
    console.warn('[Leaderboard] API submit failed, falling back to LocalStorage:', err);
  }

  // Local fallback
  try {
    const { list } = await fetchLeaderboard();
    const newEntry: LeaderboardEntry = {
      id: Date.now(),
      name: cleanName,
      score,
      mode,
      date: new Date().toISOString(),
    };
    list.push(newEntry);
    list.sort((a, b) => b.score - a.score);
    const trimmed = list.slice(0, 20);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(trimmed));
    const rank = trimmed.findIndex(e => e.id === newEntry.id) + 1;

    return {
      ok: true,
      rank: rank > 0 ? rank : trimmed.length,
      list: trimmed,
      isLocal: true,
    };
  } catch {
    return {
      ok: false,
      rank: 0,
      list: [],
      isLocal: true,
      error: 'Cannot save score locally',
    };
  }
}
