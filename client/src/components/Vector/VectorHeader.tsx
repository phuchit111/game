import React from 'react';
import { useVectorStore } from '../../store/vectorStore';
import { SCORE_CONFIG } from '../../constants/vectorData';
import { Star, Trophy, Home } from 'lucide-react';

interface VectorHeaderProps {
  onBackToHub: () => void;
}

export const VectorHeader: React.FC<VectorHeaderProps> = ({ onBackToHub }) => {
  const stage = useVectorStore((s) => s.stage);
  const pointRoundIndex = useVectorStore((s) => s.pointRoundIndex);
  const lineRoundIndex = useVectorStore((s) => s.lineRoundIndex);
  const score = useVectorStore((s) => s.score);
  const activeModal = useVectorStore((s) => s.activeModal);
  const openModal = useVectorStore((s) => s.openModal);
  const missionComplete = activeModal === 'complete';

  let stageLabel = '';
  if (stage === 1) {
    stageLabel = `STAGE 1: POINT (รอบ ${pointRoundIndex + 1}/${SCORE_CONFIG.point.rounds})`;
  } else if (stage === 2) {
    stageLabel = `STAGE 2: LINE (รอบ ${lineRoundIndex + 1}/${SCORE_CONFIG.line.rounds})`;
  } else {
    stageLabel = 'STAGE 3: POLYGON';
  }

  return (
    <header className="top-header vector-header">
      <div className="vector-header-left">
        <button
          className="btn vector-home-button"
          onClick={onBackToHub}
          title="กลับสู่เมนูเลือกด่าน"
        >
          <Home size={14} />
          <span>Hub</span>
        </button>

        <div className="vector-stage-copy">
          <span className="vector-stage-code">{stageLabel}</span>
          <span className="vector-stage-name">Vector Spatial Data</span>
        </div>
      </div>

      <div className="vector-header-status">
        <div className="vector-score">
          <Star size={16} fill="#facc15" />
          <span><small>คะแนน</small><strong>{score}</strong></span>
        </div>

        <button
          className="btn-header"
          disabled={!missionComplete}
          onClick={() => openModal('leaderboard')}
          title={missionComplete ? 'ดูกระดานอันดับคะแนน' : 'ทำ Point, Line และ Polygon ให้ครบก่อนดูกระดานอันดับ'}
        >
          <Trophy size={14} color="#f59e0b" />
          <span>Leaderboard</span>
        </button>
      </div>
    </header>
  );
};
