import React from 'react';
import { useRSStore } from '../../store/rsStore';
import { RSHeader } from './RSHeader';
import { RSProcessStage } from './RSProcessStage';
import { RSMixerStage } from './RSMixerStage';
import { RSTheoryView } from './RSTheoryView';
import { RSLeaderboard } from './RSLeaderboard';
import type { MissionId } from '../../types/player';

interface RSMissionViewProps {
  onBackToHub: () => void;
  onSelectMission: (missionId: MissionId) => void;
}

export const RSMissionView: React.FC<RSMissionViewProps> = ({ onBackToHub, onSelectMission }) => {
  const activeTab = useRSStore((s) => s.activeTab);

  return (
    <div
      className="rs-page"
    >
      <RSHeader onBackToHub={onBackToHub} />

      <main className="rs-main">
        {activeTab === 'process' && <RSProcessStage />}
        {activeTab === 'mixer' && <RSMixerStage />}
        {activeTab === 'theory' && <RSTheoryView />}

        {/* Every RS view keeps the leaderboard accessible at the bottom. */}
        <RSLeaderboard onBackToHub={onBackToHub} onSelectMission={onSelectMission} />
      </main>
    </div>
  );
};
