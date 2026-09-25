import React, { useState, useEffect } from 'react';
import { useRasterStore } from '../../store/rasterStore';
import { QUESTIONS } from '../../constants/rasterData';
import { Trophy, Save, RefreshCw, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { usePlayerStore } from '../../store/playerStore';
import { LeaderboardPodium } from '../LeaderboardPodium';
import { MissionNextStagePicker } from '../MissionNextStagePicker';
import type { MissionId } from '../../types/player';
import { getScoreTier } from '../../utils/gameRewards';
import { isRasterMissionComplete } from '../../utils/rasterMission';

interface RasterResultSectionProps {
  onBackToHub: () => void;
  onSelectMission: (missionId: MissionId) => void;
}

export const RasterResultSection: React.FC<RasterResultSectionProps> = ({ onBackToHub, onSelectMission }) => {
  const escapeScore = useRasterStore((s) => s.escapeScore);
  const classifyScore = useRasterStore((s) => s.classifyScore);
  const resolutionScore = useRasterStore((s) => s.resolutionScore);
  const quizScore = useRasterStore((s) => s.quizScore);
  const quizAnswered = useRasterStore((s) => s.quizAnswered);
  const escapeStatus = useRasterStore((s) => s.escapeStatus);
  const classifyStatus = useRasterStore((s) => s.classifyStatus);
  const resStatus = useRasterStore((s) => s.resStatus);
  const totalScore = useRasterStore((s) => s.totalScore());

  const leaderboard = useRasterStore((s) => s.leaderboard);
  const isLoadingLeaderboard = useRasterStore((s) => s.isLoadingLeaderboard);
  const savedRank = useRasterStore((s) => s.savedRank);
  const saveStatus = useRasterStore((s) => s.saveStatus);

  const loadLeaderboard = useRasterStore((s) => s.loadLeaderboard);
  const submitScore = useRasterStore((s) => s.submitScore);
  const setProfileName = usePlayerStore((s) => s.setPlayerName);
  const markMissionComplete = usePlayerStore((s) => s.markMissionComplete);
  const completedMissions = usePlayerStore((s) => s.completedMissions);

  const [playerName, setPlayerName] = useState(() => usePlayerStore.getState().playerName);
  const [isSaving, setIsSaving] = useState(false);
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  const allQuizOk = quizAnswered.every(Boolean) && quizScore === QUESTIONS.length * 4;
  const expertBonus = escapeScore > 0 && classifyScore > 0 && resolutionScore > 0 && allQuizOk ? 15 : 0;
  const missionComplete = isRasterMissionComplete(escapeStatus, classifyStatus, resStatus, quizAnswered);

  useEffect(() => {
    if (missionComplete) markMissionComplete('raster', totalScore);
  }, [markMissionComplete, missionComplete, totalScore]);

  const handleSave = async () => {
    if (!playerName.trim()) {
      setNameError('กรุณากรอกชื่อผู้เล่นก่อนบันทึกคะแนน');
      return;
    }
    setNameError('');
    setProfileName(playerName);
    setIsSaving(true);
    await submitScore(playerName);
    setIsSaving(false);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.8 } });
  };
  const reward = getScoreTier(totalScore, 114);

  if (!missionComplete) return null;

  return (
    <div className="modal-backdrop raster-result-backdrop" id="raster-leaderboard">
      <div className="modal-box wide raster-result-modal" role="dialog" aria-modal="true" aria-labelledby="raster-result-title">
      <div className="modal-eyebrow">
        <Trophy size={16} color="#fbbf24" />
        RASTER MISSION LEADERBOARD
      </div>

      <h2 className="modal-title" id="raster-result-title">สรุปผลภารกิจ Raster</h2>

      {/* Result Card */}
      <div className="result-box">
        <div className="bignum">{totalScore}</div>
        <div className="outof">คะแนนสะสมรวมทุกส่วน (ทำครบทุกส่วนได้รับโบนัส Expert)</div>

        <div className="breakdown">
          <div>
            หนีน้ำท่วม<b>{escapeScore}</b>
          </div>
          <div>
            จำแนกราสเตอร์<b>{classifyScore}</b>
          </div>
          <div>
            Resolution<b>{resolutionScore}</b>
          </div>
          <div>
            ควิซ<b>{quizScore}</b>
          </div>
          <div>
            Expert Bonus<b>+{expertBonus}</b>
          </div>
        </div>
      </div>

      <div className={`mission-reward-card ${reward.tier}`}>
        <span className="mission-reward-icon"><Trophy size={27} /></span>
        <div>
          <strong>{missionComplete ? reward.label : 'ภารกิจยังไม่ครบ'}</strong>
          <span>{missionComplete ? `${reward.description} · ระบบบันทึกความคืบหน้าให้แล้ว` : 'ทำภารกิจย่อยให้ครบทุกส่วน แล้วกลับมารับเหรียญรางวัล'}</span>
        </div>
      </div>

      {/* Leaderboard Card */}
      <div className="leaderboard">
        <div className="leaderboard-head">
          <div>
            <div className="leaderboard-title">Raster Mission Leaderboard</div>
          </div>
          <button
            className="btn small ghost"
            onClick={() => loadLeaderboard()}
            disabled={isLoadingLeaderboard}
          >
            <RefreshCw size={12} className={isLoadingLeaderboard ? 'spin' : ''} />
            <span>รีเฟรช</span>
          </button>
        </div>

        {/* Save score form */}
        <div className="score-save">
          <input
            type="text"
            placeholder="พิมพ์ชื่อของคุณเพื่อบันทึกอันดับ..."
            value={playerName}
            onChange={(e) => {
              setPlayerName(e.target.value);
              setProfileName(e.target.value);
              if (e.target.value.trim()) setNameError('');
            }}
            disabled={savedRank !== null || isSaving}
            maxLength={30}
          />
          <button
            className="btn small"
            onClick={handleSave}
            disabled={savedRank !== null || isSaving || !playerName.trim()}
          >
            {isSaving ? (
              <span>กำลังบันทึก...</span>
            ) : savedRank !== null ? (
              <span><Check size={14} /> บันทึกแล้ว (#{savedRank})</span>
            ) : (
              <span><Save size={14} /> บันทึกคะแนน</span>
            )}
          </button>
        </div>

        {nameError && <div className="form-error">{nameError}</div>}

        {saveStatus && (
          <p style={{ fontSize: 12, color: savedRank ? 'var(--teal)' : 'var(--muted)', margin: '4px 0 12px' }}>
            {saveStatus}
          </p>
        )}

        {/* Leaderboard Table */}
        <LeaderboardPodium entries={leaderboard.slice(0, 5)} />
        <ol className="leaderboard-list">
          {leaderboard.length === 0 ? (
            <li className="leaderboard-empty">
              {isLoadingLeaderboard ? 'กำลังโหลดข้อมูล...' : 'ยังไม่มีคะแนนในด่านนี้ — เป็นคนแรกที่ขึ้นอันดับได้เลย!'}
            </li>
          ) : (
            leaderboard.slice(0, 10).map((item, i) => (
              <li key={item.id ?? i} className="leaderboard-row">
                <span className="leaderboard-rank" style={{ color: i === 0 ? 'var(--amber)' : 'inherit' }}>
                  #{i + 1}
                </span>
                <span className="leaderboard-name">{item.name}</span>
                <span className="leaderboard-score">{item.score} คะแนน</span>
              </li>
            ))
          )}
        </ol>
        <MissionNextStagePicker
          currentMission="raster"
          completedMissions={completedMissions}
          scoreSaved={savedRank !== null}
          onSelectMission={onSelectMission}
          onBackToHub={onBackToHub}
        />
      </div>
      </div>
    </div>
  );
};
