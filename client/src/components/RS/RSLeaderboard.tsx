import React, { useState, useEffect } from 'react';
import { useRSStore } from '../../store/rsStore';
import { ArrowLeft, Trophy, Save, RefreshCw, CheckCircle, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { usePlayerStore } from '../../store/playerStore';
import { LeaderboardPodium } from '../LeaderboardPodium';
import { MissionNextStagePicker } from '../MissionNextStagePicker';
import { getScoreTier } from '../../utils/gameRewards';
import type { MissionId } from '../../types/player';

interface RSLeaderboardProps {
  onBackToHub: () => void;
  onSelectMission: (missionId: MissionId) => void;
}

export const RSLeaderboard: React.FC<RSLeaderboardProps> = ({ onBackToHub, onSelectMission }) => {
  const totalScore = useRSStore((s) => s.totalScore());
  const processScore = useRSStore((s) => s.processBaseScore + s.processSpeedBonus);
  const quizScore = useRSStore((s) => s.quizScore);
  const mixerScore = useRSStore((s) => s.mixerScore);

  const leaderboard = useRSStore((s) => s.leaderboard);
  const isLoadingLeaderboard = useRSStore((s) => s.isLoadingLeaderboard);
  const savedRank = useRSStore((s) => s.savedRank);
  const saveStatus = useRSStore((s) => s.saveStatus);

  const loadLeaderboard = useRSStore((s) => s.loadLeaderboard);
  const submitScore = useRSStore((s) => s.submitScore);
  const processPassed = useRSStore((s) => s.processPassed);
  const quizFinished = useRSStore((s) => s.quizFinished);
  const mixerLocked = useRSStore((s) => s.mixerLocked);
  const setProfileName = usePlayerStore((s) => s.setPlayerName);
  const markMissionComplete = usePlayerStore((s) => s.markMissionComplete);
  const completedMissions = usePlayerStore((s) => s.completedMissions);

  const [playerName, setPlayerName] = useState(() => usePlayerStore.getState().playerName);
  const [nameError, setNameError] = useState('');
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);

  const missionComplete = processPassed && quizFinished && mixerLocked;
  const reward = getScoreTier(totalScore, 300);

  useEffect(() => {
    if (missionComplete) {
      loadLeaderboard();
    }
  }, [loadLeaderboard, missionComplete]);

  const handleSave = async () => {
    if (!missionComplete) return;
    if (!playerName.trim()) {
      setNameError('กรุณากรอกชื่อผู้เล่นก่อนบันทึกคะแนน');
      return;
    }
    setNameError('');
    setProfileName(playerName);
    await submitScore(playerName);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.8 } });
  };

  useEffect(() => {
    if (missionComplete) markMissionComplete('rs', totalScore);
  }, [markMissionComplete, missionComplete, totalScore]);

  useEffect(() => {
    if (missionComplete) setShowCompletionPopup(true);
  }, [missionComplete]);

  // Do not expose the Grand Leaderboard or score submission before every RS stage is complete.
  if (!missionComplete) return null;

  return (
    <>
      <section
      className="rs-leaderboard-section"
      id="rs-leaderboard"
      style={{
        maxWidth: 900,
        margin: '3rem auto 0',
        padding: '24px',
        borderRadius: 16,
        background: 'rgba(30, 41, 59, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Trophy size={20} color="#fbbf24" />
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#ffffff' }}>
            สรุปผล
          </h3>
        </div>

      </div>

      <div className={`mission-reward-card ${reward.tier}`}>
        <span className="mission-reward-icon"><Trophy size={27} /></span>
        <div>
          <strong>{missionComplete ? reward.label : 'ภารกิจ RS กำลังดำเนินการ'}</strong>
          <span>{missionComplete ? `${reward.description} · บันทึกความคืบหน้าแล้ว` : 'ผ่านกระบวนการ RS, ควิซ และ Band Mixer ให้ครบเพื่อปลดล็อกเหรียญ'}</span>
        </div>
      </div>

      {/* Score Summary Box */}
      <div className="rs-leaderboard-score-box"
        style={{
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: 12,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 14,
          marginBottom: 20,
        }}
      >
        <div>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>คะแนนสะสมรวมสุทธิทุกด่าน (Grand Total)</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#60a5fa', fontFamily: 'monospace' }}>
            {totalScore} <span style={{ fontSize: 16, color: '#94a3b8' }}>คะแนน</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13 }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <span style={{ color: '#94a3b8' }}>ด่าน 1 (กระบวนการ + ควิซ): </span>
            <b style={{ color: '#ffffff' }}>{processScore + quizScore} คะแนน</b>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <span style={{ color: '#94a3b8' }}>ด่าน 2 (ผสมแถบคลื่น): </span>
            <b style={{ color: '#ffffff' }}>{mixerScore} คะแนน</b>
          </div>
        </div>
      </div>

      {/* Save Input Row */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        <input
          type="text"
          value={playerName}
          onChange={(e) => {
            setPlayerName(e.target.value);
            setProfileName(e.target.value);
            if (e.target.value.trim()) setNameError('');
          }}
          placeholder="พิมพ์ชื่อของคุณเพื่อบันทึกสถิติ"
          maxLength={25}
          style={{
            flex: 1,
            minWidth: 200,
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 8,
            padding: '10px 14px',
            color: '#ffffff',
            fontSize: 14,
            outline: 'none',
          }}
        />
        <button
          onClick={handleSave}
          disabled={!playerName.trim() || saveStatus === 'saving'}
          style={{
            background: '#2563eb',
            border: 'none',
            color: '#ffffff',
            padding: '10px 20px',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 14,
            cursor: !playerName.trim() || saveStatus === 'saving' ? 'not-allowed' : 'pointer',
            opacity: !playerName.trim() || saveStatus === 'saving' ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {saveStatus === 'saving' ? (
            <>
              <RefreshCw size={16} className="spin" />
              <span>กำลังบันทึก...</span>
            </>
          ) : (
            <>
              <Save size={16} />
              <span>บันทึกคะแนน</span>
            </>
          )}
        </button>
      </div>

      {nameError && <div className="form-error dark-form-error">{nameError}</div>}

      {saveStatus === 'saved' && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            background: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            color: '#4ade80',
            fontSize: 13.5,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 20,
          }}
        >
          <CheckCircle size={16} />
          <span>บันทึกข้อมูลเรียบร้อยแล้ว! อันดับของคุณ: <b>อันดับที่ #{savedRank || 1}</b></span>
        </div>
      )}

      {/* Leaderboard Table */}
      <LeaderboardPodium entries={leaderboard.slice(0, 5)} />
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.15)', color: '#94a3b8', textAlign: 'left' }}>
              <th style={{ padding: '8px 12px', width: 50 }}>#</th>
              <th style={{ padding: '8px 12px' }}>ชื่อผู้เล่น</th>
              <th style={{ padding: '8px 12px', textAlign: 'right' }}>คะแนนรวม</th>
            </tr>
          </thead>
          <tbody>
            {isLoadingLeaderboard ? (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                  กำลังโหลดข้อมูลอันดับ...
                </td>
              </tr>
            ) : leaderboard.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                  ยังไม่มีสถิติในระบบ เป็นคนแรกที่บันทึกคะแนนเลย!
                </td>
              </tr>
            ) : (
              leaderboard.slice(0, 10).map((row, idx) => (
                <tr
                  key={row.id || idx}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    background: idx === 0 ? 'rgba(245, 158, 11, 0.08)' : 'transparent',
                  }}
                >
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: idx === 0 ? '#fbbf24' : '#94a3b8', fontFamily: 'monospace' }}>
                    {idx + 1}
                  </td>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: '#f8fafc' }}>
                    {row.name}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: '#60a5fa', fontFamily: 'monospace' }}>
                    {row.score}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {missionComplete && (
        <div className="mission-completion-actions rs-completion-actions">
          <button className="btn mission-return-hub-button" onClick={onBackToHub} disabled={savedRank === null}>
            <ArrowLeft size={14} />
            <span>เลือกด่านที่ยังไม่เล่น</span>
          </button>
        </div>
      )}
      </section>

      {missionComplete && showCompletionPopup && (
        <div className="modal-backdrop" style={{ zIndex: 3000 }}>
          <div className="modal-box wide" role="dialog" aria-modal="true" aria-labelledby="rs-completion-popup-title">
            <div className="modal-eyebrow">
              <Trophy size={15} color="#fbbf24" /> RS CAMPAIGN COMPLETE
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <h2 className="modal-title" id="rs-completion-popup-title" style={{ marginBottom: 6 }}>
                  สรุปผล
                </h2>
                <p style={{ margin: 0, color: '#64748b', fontSize: 13.5 }}>
                  ดูอันดับคะแนนของคุณ แล้วเลือกไปด่านไหนก็ได้ที่ยังไม่เคยเล่น
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCompletionPopup(false)}
                aria-label="ปิดป๊อปอัป Leaderboard"
                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                marginTop: 18,
                padding: '14px 18px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <span style={{ color: '#94a3b8', fontSize: 13 }}>คะแนนรวม</span>
              <strong style={{ color: '#facc15', fontSize: 28, fontFamily: 'monospace' }}>
                {totalScore} <span style={{ color: '#ffffff', fontSize: 15, fontWeight: 500 }}>คะแนน</span>
              </strong>
            </div>

            <div
              style={{
                marginTop: 18,
                padding: 16,
                borderRadius: 10,
                background: '#f8fafc',
                border: '1px solid var(--line)',
              }}
            >
              <label style={{ display: 'block', color: '#0f172a', fontSize: 13, fontWeight: 700, marginBottom: 7 }}>
                บันทึกคะแนนลง Grand Leaderboard
              </label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={playerName}
                  onChange={(event) => {
                    setPlayerName(event.target.value);
                    setProfileName(event.target.value);
                    if (event.target.value.trim()) setNameError('');
                  }}
                  placeholder="พิมพ์ชื่อของคุณเพื่อบันทึกคะแนน"
                  maxLength={25}
                  disabled={savedRank !== null || saveStatus === 'saving'}
                  style={{
                    flex: 1,
                    minWidth: 190,
                    padding: '10px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    color: '#0f172a',
                    fontSize: 14,
                  }}
                />
                <button
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={!playerName.trim() || savedRank !== null || saveStatus === 'saving'}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}
                >
                  {saveStatus === 'saving' ? (
                    <>
                      <RefreshCw size={15} className="spin" />
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : savedRank !== null ? (
                    <>
                      <CheckCircle size={15} />
                      <span>บันทึกแล้ว (#{savedRank})</span>
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      <span>บันทึกคะแนน</span>
                    </>
                  )}
                </button>
              </div>
              {nameError && <div className="form-error" style={{ marginTop: 8 }}>{nameError}</div>}
              {saveStatus === 'saved' && (
                <div style={{ marginTop: 8, color: '#166534', fontSize: 12.5 }}>
                  บันทึกข้อมูลเรียบร้อยแล้ว! อันดับของคุณ: <b>#{savedRank || 1}</b>
                </div>
              )}
            </div>

            <div style={{ marginTop: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10, color: '#0f172a', fontWeight: 800 }}>
                <Trophy size={17} color="#d97706" />
                <span>Leaderboard 5 อันดับแรก</span>
              </div>
              <LeaderboardPodium entries={leaderboard.slice(0, 5)} />
              <div style={{ border: '1px solid var(--line)', borderRadius: 10, overflow: 'auto', maxHeight: 220, marginTop: 12 }}>
                <table className="attribute-table" style={{ minWidth: 0 }}>
                  <thead>
                    <tr>
                      <th style={{ width: 60 }}>อันดับ</th>
                      <th>ชื่อผู้เล่น</th>
                      <th style={{ width: 100 }}>คะแนน</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingLeaderboard ? (
                      <tr><td colSpan={3} style={{ textAlign: 'center', padding: 18, color: 'var(--muted)' }}>กำลังโหลดข้อมูลอันดับ...</td></tr>
                    ) : leaderboard.length === 0 ? (
                      <tr><td colSpan={3} style={{ textAlign: 'center', padding: 18, color: 'var(--muted)' }}>ยังไม่มีผู้เล่นบันทึกคะแนน</td></tr>
                    ) : (
                      leaderboard.slice(0, 5).map((row, index) => (
                        <tr key={row.id ?? index}>
                          <td className="mono-cell" style={{ fontWeight: 700 }}>#{index + 1}</td>
                          <td style={{ fontWeight: 600 }}>{row.name}</td>
                          <td className="mono-cell" style={{ fontWeight: 700 }}>{row.score}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <MissionNextStagePicker
              currentMission="rs"
              completedMissions={completedMissions}
              scoreSaved={savedRank !== null}
              onSelectMission={onSelectMission}
              onBackToHub={onBackToHub}
            />

            <div className="mission-completion-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
              <button className="btn" onClick={() => setShowCompletionPopup(false)}>
                ดูรายละเอียดคะแนน
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
