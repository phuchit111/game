import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Trophy, MapPin, Sparkles, Home } from 'lucide-react';
import { calculateEffectiveScore } from '../utils/scoring';

interface HeaderProps {
  onBackToHub?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onBackToHub }) => {
  const points = useGameStore((s) => s.points);
  const finalScore = useGameStore((s) => s.finalScore);
  const openModal = useGameStore((s) => s.openModal);
  const missionComplete = finalScore !== null;

  const displayScore = finalScore !== null ? finalScore : calculateEffectiveScore(points);

  return (
    <header className="top-header attribute-header">
      <div className="logo-group">
        {onBackToHub && (
          <button
            className="btn"
            style={{ padding: '6px 10px', fontSize: 12, background: '#1e293b', color: '#cbd5e1', border: '1px solid #334155', marginRight: 4 }}
            onClick={onBackToHub}
            title="กลับสู่เมนูเลือกด่าน"
          >
            <Home size={14} />
            <span>Hub</span>
          </button>
        )}
        <div className="logo-icon">
          <MapPin size={22} color="#ffffff" />
        </div>
        <div className="title-box">
          <h1>Attribute Table Mission</h1>
          <p>เรียนรู้การสร้างข้อมูลจุดและตารางคุณลักษณะเชิงพื้นที่ GIS</p>
        </div>
      </div>

      <div className="header-actions">
        <button
          className="btn-header"
          disabled={!missionComplete}
          onClick={() => openModal('leaderboard')}
          title={missionComplete ? 'ดูกระดานอันดับคะแนน' : 'สร้างข้อมูลให้ครบภารกิจก่อนดูกระดานอันดับ'}
        >
          <Trophy size={16} color="#fbbf24" />
          <span>กระดานอันดับ</span>
        </button>

        <div className="live-score-badge">
          <Sparkles size={16} color="#2dd4bf" />
          <span style={{ fontSize: 12, color: '#94a3b8' }}>คะแนน</span>
          <span className="score-num">{displayScore}</span>
        </div>
      </div>
    </header>
  );
};
