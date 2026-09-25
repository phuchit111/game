import React from 'react';
import { Medal, Trophy } from 'lucide-react';

export interface PodiumEntry {
  name: string;
  score: number;
}

interface LeaderboardPodiumProps {
  entries: PodiumEntry[];
  scoreSuffix?: string;
}

const PODIUM = [
  { rank: 2, className: 'silver' },
  { rank: 1, className: 'gold' },
  { rank: 3, className: 'bronze' },
] as const;

export const LeaderboardPodium: React.FC<LeaderboardPodiumProps> = ({ entries, scoreSuffix = 'คะแนน' }) => {
  if (entries.length === 0) return null;

  return (
    <div className="leaderboard-podium" aria-label="สามอันดับแรก">
      {PODIUM.map((place) => {
        const entry = entries[place.rank - 1];
        const RankIcon = place.rank === 1 ? Trophy : Medal;
        return (
          <div key={place.rank} className={`podium-card ${place.className} ${entry ? '' : 'empty'}`}>
            <div className="podium-icon"><RankIcon size={23} /></div>
            <div className="podium-rank">อันดับ {place.rank}</div>
            <strong>{entry?.name ?? '—'}</strong>
            <span>{entry ? `${entry.score} ${scoreSuffix}` : 'รอผู้เล่น'}</span>
          </div>
        );
      })}
    </div>
  );
};
