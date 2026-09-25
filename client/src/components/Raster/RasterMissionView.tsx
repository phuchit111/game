import React from 'react';
import { RasterHeader } from './RasterHeader';
import { RasterExplorer } from './RasterExplorer';
import { RasterFloodGame } from './RasterFloodGame';
import { RasterReclassifyGame } from './RasterReclassifyGame';
import { RasterResolutionChallenge } from './RasterResolutionChallenge';
import { RasterQuiz } from './RasterQuiz';
import { RasterResultSection } from './RasterResultSection';
import { RasterMissionNav } from './RasterMissionNav';
import { useRasterStore } from '../../store/rasterStore';
import type { MissionId } from '../../types/player';
import { isRasterMissionComplete } from '../../utils/rasterMission';

interface RasterMissionViewProps {
  onBackToHub: () => void;
  onSelectMission: (missionId: MissionId) => void;
}

export const RasterMissionView: React.FC<RasterMissionViewProps> = ({ onBackToHub, onSelectMission }) => {
  const escapeStatus = useRasterStore((s) => s.escapeStatus);
  const classifyStatus = useRasterStore((s) => s.classifyStatus);
  const resStatus = useRasterStore((s) => s.resStatus);
  const quizAnswered = useRasterStore((s) => s.quizAnswered);
  const missionComplete = isRasterMissionComplete(escapeStatus, classifyStatus, resStatus, quizAnswered);

  return (
    <div
      className="raster-page"
    >
      <RasterHeader onBackToHub={onBackToHub} />
      <RasterMissionNav />

      <main className="raster-main">
        <RasterExplorer />
        <RasterFloodGame />
        <RasterReclassifyGame />
        <RasterResolutionChallenge />
        <RasterQuiz />
        {missionComplete && <RasterResultSection onBackToHub={onBackToHub} onSelectMission={onSelectMission} />}
      </main>
    </div>
  );
};
