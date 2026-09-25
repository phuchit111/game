import React, { useState, useEffect } from 'react';
import { useCoordinateStore, MAX_COORDINATE_SCORE } from '../../store/coordinateStore';
import { Trophy, Save, RefreshCw, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { usePlayerStore } from '../../store/playerStore';
import { LeaderboardPodium } from '../LeaderboardPodium';
import { MissionNextStagePicker } from '../MissionNextStagePicker';
import type { MissionId } from '../../types/player';
import { getScoreTier } from '../../utils/gameRewards';

interface CoordinateResultModalProps {
  onBackToHub: () => void;
  onSelectMission: (missionId: MissionId) => void;
}

export const CoordinateResultModal: React.FC<CoordinateResultModalProps> = ({ onBackToHub, onSelectMission }) => {
  const modal = useCoordinateStore((s) => s.modal);
  const missionCompleted = useCoordinateStore((s) => s.missionCompleted);
  const score = useCoordinateStore((s) => s.score);

  const leaderboard = useCoordinateStore((s) => s.leaderboard);
  const isLoadingLeaderboard = useCoordinateStore((s) => s.isLoadingLeaderboard);
  const savedRank = useCoordinateStore((s) => s.savedRank);
  const saveStatus = useCoordinateStore((s) => s.saveStatus);

  const loadLeaderboard = useCoordinateStore((s) => s.loadLeaderboard);
  const submitScore = useCoordinateStore((s) => s.submitScore);
  const setProfileName = usePlayerStore((s) => s.setPlayerName);
  const markMissionComplete = usePlayerStore((s) => s.markMissionComplete);
  const completedMissions = usePlayerStore((s) => s.completedMissions);

  const [playerName, setPlayerName] = useState(() => usePlayerStore.getState().playerName);
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (missionCompleted) {
      loadLeaderboard();
    }
  }, [missionCompleted, loadLeaderboard]);

  useEffect(() => {
    if (missionCompleted) markMissionComplete('coordinate', score);
  }, [markMissionComplete, missionCompleted, score]);

  const handleSave = async () => {
    if (!playerName.trim()) {
      setNameError('กรุณากรอกชื่อผู้เล่นก่อนบันทึกคะแนน');
      return;
    }
    setNameError('');
    setProfileName(playerName);
    await submitScore(playerName);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.8 } });
  };

  // 1. Between-round Knowledge Modal
  if (modal.open) {
    return (
      <div className="coordinate-knowledge-backdrop"
        style={{
          position: 'fixed',
          inset: 0,
          // Keep the solved grid visible behind the between-round dialog.
          // The previous blur made the yellow answer marker and guide lines
          // effectively disappear on top of the map.
          background: 'rgba(11, 32, 54, 0.42)',
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          pointerEvents: 'auto',
          padding: 20,
        }}
      >
        <div className="coordinate-knowledge-card"
          style={{
            background: '#f7f2e4',
            borderTop: '4px solid #c9972e',
            borderRadius: 14,
            padding: '26px 28px',
            maxWidth: 480,
            width: '100%',
            boxShadow: '0 22px 40px rgba(0,0,0,0.3)',
            color: '#1c2b3a',
            pointerEvents: 'auto',
          }}
        >
          <div style={{ fontSize: 18.5, fontWeight: 800, color: '#0b2036', marginBottom: 10 }}>
            {modal.title}
          </div>
          <div
            style={{ fontSize: 14, lineHeight: 1.7, color: '#1c2b3a', marginBottom: 20 }}
            dangerouslySetInnerHTML={{ __html: modal.html }}
          />
          <button
            type="button"
            onClick={modal.onNext}
            style={{
              width: '100%',
              padding: '11px',
              background: 'linear-gradient(180deg, #e0b657, #c9972e)',
              border: '1px solid #8a6a1f',
              borderRadius: 8,
              color: '#0b2036',
              fontWeight: 700,
              fontSize: 14.5,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(138,106,31,0.25)',
            }}
          >
            {modal.nextLabel}
          </button>
        </div>
      </div>
    );
  }

  // 2. Final Mission Complete Leaderboard Section
  if (!missionCompleted) return null;
  const reward = getScoreTier(score, MAX_COORDINATE_SCORE);

  return (
    <div className="modal-backdrop coordinate-result-backdrop">
    <section
      className="coordinate-result-section modal-box wide"
      id="coordinate-leaderboard"
      role="dialog"
      aria-modal="true"
      aria-labelledby="coordinate-result-title"
      style={{
        maxWidth: 780,
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        margin: 0,
        padding: '24px 26px',
        borderRadius: 14,
        background: '#f7f2e4',
        border: '1px solid #ddd0a6',
        borderTop: '4px solid #c9972e',
        boxShadow: '0 16px 34px rgba(11,32,54,0.18)',
        color: '#1c2b3a',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Trophy size={22} color="#c9972e" />
          <h3 id="coordinate-result-title" style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0b2036' }}>
            สรุปผลคะแนนและทำเนียบเกียรติยศ (Leaderboard)
          </h3>
        </div>
      </div>

      <div className="coordinate-result-score-box"
        style={{
          background: 'rgba(201, 151, 46, 0.12)',
          border: '1px solid #c9972e',
          borderRadius: 10,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div>
          <div style={{ fontSize: 13, color: '#8a6a1f', fontWeight: 600 }}>คะแนนรวมของภารกิจพิกัด</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#0b2036', fontFamily: 'monospace' }}>
            {score} <span style={{ fontSize: 16, color: '#5b6b78' }}>/ {MAX_COORDINATE_SCORE}</span>
          </div>
        </div>
        <div style={{ fontSize: 13.5, color: '#0b2036', maxWidth: 440, lineHeight: 1.6 }}>
          เก่งมาก! คุณผ่านทั้งการอ่าน/ปักพิกัดฉาก <b>UTM Grid</b> และการระบุพิกัด <b>Latitude / Longitude</b> บนลูกโลก 3 มิติ
        </div>
      </div>

      <div className={`mission-reward-card coordinate-reward ${reward.tier}`}>
        <span className="mission-reward-icon"><Trophy size={27} /></span>
        <div>
          <strong>{reward.label}</strong>
          <span>{reward.description} · UTM Grid และ 3D Globe ผ่านครบแล้ว</span>
        </div>
      </div>

      {/* Save Score Form */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
          <input
            type="text"
          value={playerName}
          onChange={(e) => {
            setPlayerName(e.target.value);
            setProfileName(e.target.value);
            if (e.target.value.trim()) setNameError('');
          }}
            placeholder="พิมพ์ชื่อของคุณเพื่อบันทึกคะแนน"
            maxLength={25}
            disabled={savedRank !== null || saveStatus === 'saving'}
          style={{
            flex: 1,
            minWidth: 200,
            padding: '10px 14px',
            border: '1px solid #234868',
            borderRadius: 8,
            fontSize: 14,
            background: '#ffffff',
            outline: 'none',
          }}
        />
        <button
          onClick={handleSave}
          disabled={!playerName.trim() || savedRank !== null || saveStatus === 'saving'}
          style={{
            background: 'linear-gradient(180deg, #e0b657, #c9972e)',
            border: '1px solid #8a6a1f',
            color: '#0b2036',
            fontWeight: 700,
            fontSize: 14,
            padding: '10px 20px',
            borderRadius: 8,
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
              <span>บันทึกสถิติ</span>
            </>
          )}
        </button>
      </div>

      {nameError && <div className="form-error coordinate-form-error">{nameError}</div>}

      {saveStatus === 'saved' && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            background: '#dcf3df',
            border: '1px solid #97c9a0',
            color: '#2f5233',
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
            <tr style={{ borderBottom: '2px solid #ddd0a6', color: '#5b6b78', textAlign: 'left' }}>
              <th style={{ padding: '8px 10px', width: 50 }}>#</th>
              <th style={{ padding: '8px 10px' }}>ชื่อผู้สำรวจ</th>
              <th style={{ padding: '8px 10px', textAlign: 'right' }}>คะแนน</th>
            </tr>
          </thead>
          <tbody>
            {isLoadingLeaderboard ? (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: '20px', color: '#5b6b78' }}>
                  กำลังโหลดข้อมูลอันดับ...
                </td>
              </tr>
            ) : leaderboard.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: '20px', color: '#5b6b78' }}>
                  ยังไม่มีสถิติในระบบ เป็นคนแรกที่บันทึกคะแนนเลย!
                </td>
              </tr>
            ) : (
              leaderboard.slice(0, 10).map((row, idx) => (
                <tr
                  key={row.id || idx}
                  style={{
                    borderBottom: '1px solid #eee5cb',
                    background: idx === 0 ? 'rgba(201, 151, 46, 0.1)' : 'transparent',
                  }}
                >
                  <td style={{ padding: '9px 10px', fontWeight: 700, color: idx === 0 ? '#8a6a1f' : '#5b6b78', fontFamily: 'monospace' }}>
                    {idx + 1}
                  </td>
                  <td style={{ padding: '9px 10px', fontWeight: 600, color: '#0b2036' }}>
                    {row.name}
                  </td>
                  <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 800, color: '#0b2036', fontFamily: 'monospace' }}>
                    {row.score}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <MissionNextStagePicker
        currentMission="coordinate"
        completedMissions={completedMissions}
        scoreSaved={savedRank !== null}
        onSelectMission={onSelectMission}
        onBackToHub={onBackToHub}
      />
    </section>
    </div>
  );
};
