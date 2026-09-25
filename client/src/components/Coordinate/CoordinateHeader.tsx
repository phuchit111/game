import React from 'react';
import { useCoordinateStore, MAX_COORDINATE_SCORE } from '../../store/coordinateStore';
import { ArrowLeft, Timer, Star, Trophy } from 'lucide-react';

interface CoordinateHeaderProps {
  onBackToHub: () => void;
}

export const CoordinateHeader: React.FC<CoordinateHeaderProps> = ({ onBackToHub }) => {
  const phase = useCoordinateStore((s) => s.phase);
  const roundIndex = useCoordinateStore((s) => s.roundIndex);
  const score = useCoordinateStore((s) => s.score);
  const timer = useCoordinateStore((s) => s.timer);
  const timerTotal = useCoordinateStore((s) => s.timerTotal);
  const missionCompleted = useCoordinateStore((s) => s.missionCompleted);

  const pct = Math.max(0, (timer / timerTotal) * 100);
  const isUrgent = timer <= 15;

  return (
    <header className="coordinate-header">
      <div className="coordinate-header-inner" style={{ maxWidth: 1180, margin: '0 auto', padding: '10px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        {/* Left: Hub Back & Phase Badge */}
        <div className="coordinate-header-left" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onBackToHub}
            className="coordinate-hub-button"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#f8fafc',
              padding: '6px 12px',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={16} />
            <span>กลับสู่ Hub</span>
          </button>

          <div className="coordinate-phase-copy" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
                className="coordinate-phase-badge"
                style={{
                fontFamily: 'monospace',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                padding: '3px 10px',
                borderRadius: 20,
                background: 'rgba(201, 151, 46, 0.15)',
                border: '1px solid #c9972e',
                color: '#e0b657',
                textTransform: 'uppercase',
              }}
            >
              {phase === 'A' ? 'PART 1: UTM GRID' : 'PART 2: LAT / LONG GLOBE'}
            </span>
            <span className="coordinate-round-label" style={{ fontSize: 13, color: '#94a3b8' }}>
              รอบที่ <b>{roundIndex} / 5</b>
            </span>
          </div>
        </div>

        {/* Right: Timer & Score Gauges */}
        <div className="coordinate-header-status" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            className="coordinate-leaderboard-button"
            disabled={!missionCompleted}
            onClick={() => document.getElementById('coordinate-leaderboard')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            title={missionCompleted ? 'ไปยังกระดานอันดับ' : 'เล่นภารกิจให้ครบทุกข้อก่อนดูกระดานอันดับ'}
          >
            <Trophy size={15} />
            <span>Leaderboard</span>
          </button>
          <div
            className="coordinate-timer"
            style={{
              background: isUrgent ? 'rgba(220, 38, 38, 0.25)' : 'rgba(255, 255, 255, 0.08)',
              border: isUrgent ? '1px solid #dc2626' : '1px solid rgba(255, 255, 255, 0.15)',
              color: isUrgent ? '#f87171' : '#ffffff',
              padding: '5px 12px',
              borderRadius: 20,
              fontFamily: 'monospace',
              fontSize: 13,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Timer size={15} />
            <span>{timer}s</span>
          </div>

          <div
            className="coordinate-score"
            style={{
              background: 'rgba(201, 151, 46, 0.15)',
              border: '1px solid #c9972e',
              color: '#facc15',
              padding: '5px 14px',
              borderRadius: 20,
              fontFamily: 'monospace',
              fontSize: 13,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Star size={15} />
            <span>{score} / {MAX_COORDINATE_SCORE}</span>
          </div>
        </div>
      </div>

      {/* Timer Bar */}
      <div className="coordinate-timer-track" style={{ height: 3, width: '100%', background: 'rgba(255,255,255,0.12)' }}>
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: isUrgent ? '#ef4444' : '#c9972e',
            transition: 'width 1s linear, background 0.3s ease',
          }}
        />
      </div>
    </header>
  );
};
