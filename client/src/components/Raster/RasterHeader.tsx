import React from 'react';
import { useRasterStore } from '../../store/rasterStore';
import { Grid, Sparkles, Home, Trophy } from 'lucide-react';
import { isRasterMissionComplete } from '../../utils/rasterMission';

interface RasterHeaderProps {
  onBackToHub: () => void;
}

export const RasterHeader: React.FC<RasterHeaderProps> = ({ onBackToHub }) => {
  const totalScore = useRasterStore((s) => s.totalScore());
  const escapeStatus = useRasterStore((s) => s.escapeStatus);
  const classifyStatus = useRasterStore((s) => s.classifyStatus);
  const resStatus = useRasterStore((s) => s.resStatus);
  const quizAnswered = useRasterStore((s) => s.quizAnswered);
  const missionComplete = isRasterMissionComplete(escapeStatus, classifyStatus, resStatus, quizAnswered);

  return (
    <header className="top-header raster-header" style={{ position: 'sticky', top: 0, zIndex: 1000, background: 'rgba(15, 22, 32, 0.95)' }}>
      <div className="raster-header-left" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          className="btn"
          style={{ padding: '6px 10px', fontSize: 12, background: '#1e2836', color: '#cbd5e1', border: '1px solid #2c3b4c' }}
          onClick={onBackToHub}
          title="กลับสู่เมนูเลือกด่าน"
        >
          <Home size={14} />
          <span>Hub</span>
        </button>

        <div className="raster-header-brand" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="raster-header-mark" style={{ width: 32, height: 32, borderRadius: 6, background: '#4fb8af', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Grid size={18} color="#0f1620" />
          </div>
          <div>
            <span className="raster-header-kicker" style={{ fontSize: 11, color: '#4fb8af', fontWeight: 700, letterSpacing: '0.08em' }}>MISSION 3</span>
            <h2 className="raster-header-title" style={{ fontSize: 15, fontWeight: 700, color: '#e9e4d6', margin: 0 }}>ข้อมูลเชิงพื้นที่ Raster</h2>
          </div>
        </div>
      </div>

        <div className="raster-header-right" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          className="raster-leaderboard-button"
          disabled={!missionComplete}
          onClick={() => document.getElementById('raster-leaderboard')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          title={missionComplete ? 'ไปยังกระดานอันดับ' : 'เล่นภารกิจให้ครบทุกข้อก่อนดูกระดานอันดับ'}
        >
          <Trophy size={15} />
          <span>Leaderboard</span>
        </button>
        <div className="raster-score-badge" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: 'rgba(217, 164, 65, 0.15)', border: '1px solid rgba(217, 164, 65, 0.35)', borderRadius: 20 }}>
          <Sparkles size={15} color="#d9a441" />
          <span style={{ fontSize: 12, color: '#8496a6' }}>คะแนนสะสม</span>
          <span style={{ fontSize: 17, fontWeight: 700, color: '#d9a441' }}>{totalScore}</span>
        </div>
      </div>
    </header>
  );
};
