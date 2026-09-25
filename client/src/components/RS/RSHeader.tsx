import React from 'react';
import { useRSStore } from '../../store/rsStore';
import { Volume2, VolumeX, ArrowLeft, Layers, Sliders, BookOpen, Trophy, Rocket, CheckCircle2, ChevronRight, LockKeyhole } from 'lucide-react';

interface RSHeaderProps {
  onBackToHub: () => void;
}

export const RSHeader: React.FC<RSHeaderProps> = ({ onBackToHub }) => {
  const activeTab = useRSStore((s) => s.activeTab);
  const theoryAcknowledged = useRSStore((s) => s.theoryAcknowledged);
  const setActiveTab = useRSStore((s) => s.setActiveTab);
  const soundEnabled = useRSStore((s) => s.soundEnabled);
  const toggleSound = useRSStore((s) => s.toggleSound);

  const processPassed = useRSStore((s) => s.processPassed);
  const processScore = useRSStore((s) => s.processBaseScore + s.processSpeedBonus);
  const quizScore = useRSStore((s) => s.quizScore);
  const s1Total = processScore + quizScore;

  const mixerScore = useRSStore((s) => s.mixerScore);
  const mixerLocked = useRSStore((s) => s.mixerLocked);
  const grandTotal = useRSStore((s) => s.totalScore());
  const quizFinished = useRSStore((s) => s.quizFinished);
  const missionComplete = processPassed && quizFinished && mixerLocked;

  return (
    <header className="rs-header" style={{ background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="rs-header-inner" style={{ maxWidth: 1180, margin: '0 auto', padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Top Control Bar */}
        <div className="rs-header-top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div className="rs-header-brand" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              className="rs-hub-button"
              onClick={onBackToHub}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#cbd5e1',
                padding: '6px 14px',
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

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="rs-mission-badge" style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
                  MISSION 4
                </span>
                <h1 className="rs-header-title" style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#f8fafc' }}>
                  Remote Sensing (RS) Campaign
                </h1>
              </div>
              <p className="rs-header-subtitle" style={{ margin: 0, fontSize: 11.5, color: '#94a3b8' }}>
                ตามรอยพลังงานจากดวงอาทิตย์ & ผสมแถบคลื่นดาวเทียม Sentinel-2 ขอนแก่น
              </p>
            </div>
          </div>

          <div className="rs-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              className="rs-leaderboard-button"
              disabled={!missionComplete}
              onClick={() => document.getElementById('rs-leaderboard')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              title={missionComplete ? 'ไปยังกระดานอันดับ' : 'เล่นทุกภารกิจย่อยให้ครบก่อนดูกระดานอันดับ'}
            >
              <Trophy size={15} />
              <span>Leaderboard</span>
            </button>
            <button
              onClick={toggleSound}
              className="rs-sound-toggle"
              style={{
                background: soundEnabled ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                border: soundEnabled ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(255, 255, 255, 0.15)',
                color: soundEnabled ? '#4ade80' : '#94a3b8',
                padding: '6px 14px',
                borderRadius: 20,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12.5,
                fontWeight: 600,
              }}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span>{soundEnabled ? 'เปิดเสียง' : 'ปิดเสียง'}</span>
            </button>
          </div>
        </div>

        {/* Campaign HUD */}
        <div className="rs-campaign-hud"
          style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            borderRadius: 12,
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div className="rs-progress-group" style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <span className="rs-progress-label" style={{ fontSize: 13, fontWeight: 700, color: '#93c5fd', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Rocket size={14} /> RS Campaign Progress:
            </span>
            <div className="rs-progress-steps" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('process')}
                  disabled={!theoryAcknowledged}
                  aria-current={activeTab === 'process' ? 'step' : undefined}
                  className={`rs-progress-step rs-process-step ${activeTab === 'process' ? 'active' : ''} ${processPassed ? 'done' : ''}`}
                style={{
                  padding: '3px 10px',
                  borderRadius: 16,
                  background: activeTab === 'process' ? '#2563eb' : processPassed ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                  color: activeTab === 'process' ? '#ffffff' : processPassed ? '#4ade80' : '#94a3b8',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  fontWeight: 600,
                  cursor: theoryAcknowledged ? 'pointer' : 'not-allowed',
                }}
              >
                {processPassed ? <CheckCircle2 size={13} /> : '1'} ด่าน 1: กระบวนการ
              </button>
              <ChevronRight size={14} color="#64748b" />
                <button
                  type="button"
                  onClick={() => setActiveTab('mixer')}
                  disabled={!theoryAcknowledged}
                  aria-current={activeTab === 'mixer' ? 'step' : undefined}
                  className={`rs-progress-step rs-mixer-step ${activeTab === 'mixer' ? 'active' : ''} ${mixerLocked ? 'done' : ''}`}
                style={{
                  padding: '3px 10px',
                  borderRadius: 16,
                  background: activeTab === 'mixer' ? '#2563eb' : mixerLocked ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                  color: activeTab === 'mixer' ? '#ffffff' : mixerLocked ? '#4ade80' : '#94a3b8',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  fontWeight: 600,
                  cursor: theoryAcknowledged ? 'pointer' : 'not-allowed',
                }}
              >
                {mixerLocked ? <CheckCircle2 size={13} /> : '2'} ด่าน 2: ผสมแถบคลื่น
              </button>
            </div>
          </div>

          <div className="rs-score-summary" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div className="rs-score-chip" style={{ fontSize: 12, padding: '3px 10px', borderRadius: 8, background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              ด่าน 1: <b style={{ color: '#60a5fa' }}>{processPassed || s1Total !== 0 ? `${s1Total} คะแนน` : '-'}</b>
            </div>
            <div className="rs-score-chip" style={{ fontSize: 12, padding: '3px 10px', borderRadius: 8, background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              ด่าน 2: <b style={{ color: '#fbbf24' }}>{mixerLocked || mixerScore > 0 ? `${mixerScore} คะแนน` : '-'}</b>
            </div>
            <div className="rs-total-chip" style={{ fontSize: 12.5, padding: '4px 12px', borderRadius: 8, background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
              คะแนนรวม: <b style={{ color: '#93c5fd', fontSize: 14 }}>{grandTotal} คะแนน</b>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="rs-tab-nav" style={{ display: 'flex', gap: 8, borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: 6 }}>
          <button
            onClick={() => setActiveTab('theory')}
            className={`rs-tab-button ${activeTab === 'theory' ? 'active theory' : ''}`}
            style={{
              background: activeTab === 'theory' ? 'rgba(34, 197, 94, 0.2)' : 'transparent',
              border: activeTab === 'theory' ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid transparent',
              color: activeTab === 'theory' ? '#86efac' : '#94a3b8',
              padding: '8px 16px',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13.5,
              fontWeight: 600,
              transition: 'all 0.15s ease',
            }}
          >
            <BookOpen size={16} />
            <span>{theoryAcknowledged ? 'หน้าอธิบายทฤษฎี & วิดีโอ' : 'อ่านคำอธิบายก่อนเริ่มเล่น'}</span>
          </button>

          <button
            onClick={() => setActiveTab('process')}
            disabled={!theoryAcknowledged}
            className={`rs-tab-button ${activeTab === 'process' ? 'active process' : ''}`}
            style={{
              background: activeTab === 'process' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
              border: activeTab === 'process' ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent',
              color: activeTab === 'process' ? '#93c5fd' : '#94a3b8',
              padding: '8px 16px',
              borderRadius: 8,
              cursor: theoryAcknowledged ? 'pointer' : 'not-allowed',
              opacity: theoryAcknowledged ? 1 : 0.55,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13.5,
              fontWeight: 600,
              transition: 'all 0.15s ease',
            }}
          >
            {theoryAcknowledged ? <Layers size={16} /> : <LockKeyhole size={15} />}
            <span>ภารกิจ 1: กระบวนการ RS</span>
          </button>

          <button
            onClick={() => setActiveTab('mixer')}
            disabled={!theoryAcknowledged}
            className={`rs-tab-button ${activeTab === 'mixer' ? 'active mixer' : ''}`}
            style={{
              background: activeTab === 'mixer' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
              border: activeTab === 'mixer' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent',
              color: activeTab === 'mixer' ? '#fcd34d' : '#94a3b8',
              padding: '8px 16px',
              borderRadius: 8,
              cursor: theoryAcknowledged ? 'pointer' : 'not-allowed',
              opacity: theoryAcknowledged ? 1 : 0.55,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13.5,
              fontWeight: 600,
              transition: 'all 0.15s ease',
            }}
          >
            {theoryAcknowledged ? <Sliders size={16} /> : <LockKeyhole size={15} />}
            <span>ภารกิจ 2: ผสมแถบคลื่น</span>
          </button>

        </div>
      </div>
    </header>
  );
};
