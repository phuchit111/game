import React, { useState, useEffect } from 'react';
import { useVectorStore } from '../../store/vectorStore';
import { STAGE_INFO, HOW_TO_DRAW, SCORE_CONFIG } from '../../constants/vectorData';
import { Award, Trophy, Save, BookOpen, X, RefreshCw, Check, Ruler, Square } from 'lucide-react';
import confetti from 'canvas-confetti';
import { usePlayerStore } from '../../store/playerStore';
import { LeaderboardPodium } from '../LeaderboardPodium';
import { MissionNextStagePicker } from '../MissionNextStagePicker';
import type { MissionId } from '../../types/player';
import { getScoreTier } from '../../utils/gameRewards';

interface VectorModalsProps {
  onBackToHub: () => void;
  onSelectMission: (missionId: MissionId) => void;
}

const LineStringTutorialGraphic: React.FC = () => (
  <div className="line-tutorial-visual">
    <svg
      viewBox="0 0 440 174"
      role="img"
      aria-label="ตัวอย่างการลากเส้นจากจุดที่ 1 ไปจุดที่ 2 แล้วดับเบิลคลิกจุดที่ 3"
    >
      <line x1="58" y1="119" x2="218" y2="38" className="line-tutorial-solid" />
      <line x1="218" y1="38" x2="382" y2="101" className="line-tutorial-dashed" />

      <circle cx="58" cy="119" r="13" className="line-tutorial-node line-tutorial-node-blue" />
      <circle cx="218" cy="38" r="13" className="line-tutorial-node line-tutorial-node-blue" />
      <circle cx="382" cy="101" r="13" className="line-tutorial-node line-tutorial-node-green" />

      <text x="58" y="119" className="line-tutorial-node-number">1</text>
      <text x="218" y="38" className="line-tutorial-node-number">2</text>
      <text x="382" y="101" className="line-tutorial-node-number">3</text>

      <text x="58" y="146" textAnchor="middle" className="line-tutorial-action">คลิก</text>
      <text x="218" y="20" textAnchor="middle" className="line-tutorial-action">คลิก</text>
      <text x="382" y="132" textAnchor="middle" className="line-tutorial-action line-tutorial-action-end">ดับเบิลคลิกจบ</text>
    </svg>
  </div>
);

const PolygonTutorialGraphic: React.FC = () => (
  <div className="polygon-tutorial-visual">
    <svg
      viewBox="0 0 440 190"
      role="img"
      aria-label="ตัวอย่างการวาด Polygon โดยคลิกจุดที่ 1 ถึง 4 แล้วปิดรูปกลับมาที่จุดเริ่มต้น"
    >
      <polygon points="82,141 136,57 278,43 369,130" className="polygon-tutorial-shape" />

      <circle cx="82" cy="141" r="13" className="polygon-tutorial-node polygon-tutorial-node-green" />
      <circle cx="136" cy="57" r="13" className="polygon-tutorial-node polygon-tutorial-node-purple" />
      <circle cx="278" cy="43" r="13" className="polygon-tutorial-node polygon-tutorial-node-purple" />
      <circle cx="369" cy="130" r="13" className="polygon-tutorial-node polygon-tutorial-node-purple" />

      <text x="82" y="141" className="polygon-tutorial-node-number">1</text>
      <text x="136" y="57" className="polygon-tutorial-node-number">2</text>
      <text x="278" y="43" className="polygon-tutorial-node-number">3</text>
      <text x="369" y="130" className="polygon-tutorial-node-number">4</text>

      <text x="10" y="171" className="polygon-tutorial-action">คลิกจุดเริ่มต้น/ดับเบิลคลิกปิดรูป</text>
    </svg>
  </div>
);

export const VectorModals: React.FC<VectorModalsProps> = ({ onBackToHub, onSelectMission }) => {
  const activeModal = useVectorStore((s) => s.activeModal);
  const stage = useVectorStore((s) => s.stage);
  const pointRoundIndex = useVectorStore((s) => s.pointRoundIndex);
  const lineRoundIndex = useVectorStore((s) => s.lineRoundIndex);
  const score = useVectorStore((s) => s.score);
  const modalStatsHtml = useVectorStore((s) => s.modalStatsHtml);
  const leaderboard = useVectorStore((s) => s.leaderboard);
  const isLoadingLeaderboard = useVectorStore((s) => s.isLoadingLeaderboard);
  const savedRank = useVectorStore((s) => s.savedRank);
  const saveStatus = useVectorStore((s) => s.saveStatus);
  const closeModal = useVectorStore((s) => s.closeModal);
  const nextStep = useVectorStore((s) => s.nextStep);
  const loadLeaderboard = useVectorStore((s) => s.loadLeaderboard);
  const submitScore = useVectorStore((s) => s.submitScore);
  const setProfileName = usePlayerStore((s) => s.setPlayerName);
  const markMissionComplete = usePlayerStore((s) => s.markMissionComplete);
  const completedMissions = usePlayerStore((s) => s.completedMissions);

  const [playerName, setPlayerName] = useState(() => usePlayerStore.getState().playerName);
  const [isSaving, setIsSaving] = useState(false);
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (activeModal === 'complete') {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  }, [activeModal]);

  useEffect(() => {
    if (activeModal === 'complete') markMissionComplete('vector', score);
  }, [activeModal, markMissionComplete, score]);

  if (!activeModal) return null;

  const handleSaveScore = async () => {
    if (!playerName.trim()) {
      setNameError('กรุณากรอกชื่อผู้เล่นก่อนบันทึกคะแนน');
      return;
    }
    setNameError('');
    setProfileName(playerName);
    setIsSaving(true);
    await submitScore(playerName);
    setIsSaving(false);
  };

  // 1. Info Modal
  if (activeModal === 'info') {
    const info = STAGE_INFO[stage];
    return (
      <div className="modal-backdrop">
        <div className="modal-box">
          <div className="modal-eyebrow">
            <BookOpen size={14} /> KNOWLEDGE REFERENCE
          </div>
          <h2 className="modal-title">{info.title}</h2>
          <div
            className="modal-text"
            dangerouslySetInnerHTML={{ __html: info.body }}
          />
          <div className="modal-note" style={{ fontSize: 12, marginTop: 14 }}>
            <BookOpen size={13} /> <b>อ้างอิง:</b> {info.ref.replace(/^อ้างอิง:\s*/, '')}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <button className="btn" onClick={closeModal}>
              <X size={14} /> ปิด
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. How To Draw Modal
  if (activeModal === 'howto') {
    const drawInfo = HOW_TO_DRAW[stage as 2 | 3];
    return (
      <div className="modal-backdrop">
        <div className="modal-box" style={{ maxWidth: 520 }}>
          <div className="modal-eyebrow">
            <Award size={14} /> TUTORIAL
          </div>
          <h2 className="modal-title vector-tutorial-title">
            {stage === 2 && <Ruler size={22} strokeWidth={2.5} />}
            {stage === 3 && <Square size={22} strokeWidth={2.5} />}
            <span>{drawInfo?.title || 'วิธีใช้เครื่องมือวาด'}</span>
          </h2>

          {stage === 2 && <LineStringTutorialGraphic />}
          {stage === 3 && <PolygonTutorialGraphic />}
          
          <div
            className="vector-tutorial-steps"
            dangerouslySetInnerHTML={{ __html: drawInfo?.steps || '' }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary vector-tutorial-button" onClick={closeModal}>
              เข้าใจแล้ว กด “เล่น” เพื่อเริ่ม
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Knowledge Modal (Between rounds/stages)
  if (activeModal === 'knowledge') {
    const info = STAGE_INFO[stage];
    let roundLabel = '';
    if (stage === 1) roundLabel = ` (รอบ ${pointRoundIndex + 1}/${SCORE_CONFIG.point.rounds})`;
    else if (stage === 2) roundLabel = ` (รอบ ${lineRoundIndex + 1}/${SCORE_CONFIG.line.rounds})`;

    let nextBtnText = 'ลุยภารกิจถัดไป';
    if (stage === 1 && pointRoundIndex < SCORE_CONFIG.point.rounds - 1) {
      nextBtnText = 'ลุยรอบถัดไป (Point)';
    } else if (stage === 2 && lineRoundIndex < SCORE_CONFIG.line.rounds - 1) {
      nextBtnText = 'ลุยรอบถัดไป (Line)';
    } else if (stage === 3) {
      nextBtnText = 'ดูสรุปผล';
    }

    return (
      <div className="modal-backdrop">
        <div className="modal-box">
          <div className="modal-eyebrow">
            <Award size={14} color="#16a34a" /> STAGE COMPLETE!
          </div>
          <h2 className="modal-title">
            {stage === 1
              ? `คุณได้สร้างข้อมูลจุด (point) ที่ ${pointRoundIndex + 1} เรียบร้อย!!!`
              : stage === 2
                ? `คุณได้สร้างข้อมูลเส้น (Line) ที่ ${lineRoundIndex + 1} เรียบร้อย!!!`
                : `สำเร็จ!${roundLabel} ${info.title}`}
          </h2>

          <div className="modal-text" dangerouslySetInnerHTML={{ __html: info.body }} />

          {modalStatsHtml && (
            <div
              style={{
                margin: '14px 0',
                background: '#f1f5f9',
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: 13,
              }}
              dangerouslySetInnerHTML={{ __html: modalStatsHtml }}
            />
          )}

          <div className="modal-note" style={{ fontSize: 11.5 }}>
            <BookOpen size={13} /> <b>อ้างอิง:</b> {info.ref.replace(/^อ้างอิง:\s*/, '')}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
            <button className="btn btn-primary" style={{ padding: '9px 20px', fontSize: 13.5 }} onClick={nextStep}>
              {nextBtnText}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Complete Modal
  if (activeModal === 'complete') {
    const reward = getScoreTier(score, 180);
    return (
      <div className="modal-backdrop">
        <div className="modal-box wide">
          <div className="modal-eyebrow">
            <Trophy size={14} color="#f59e0b" /> VICTORY!
          </div>

          <div className={`mission-reward-card ${reward.tier}`}>
            <span className="mission-reward-icon"><Trophy size={27} /></span>
            <div>
              <strong>{reward.label}</strong>
              <span>{reward.description} · ทำครบ Point, Line และ Polygon แล้ว</span>
            </div>
          </div>
          <h2 className="modal-title">สรุปผล</h2>

          <div
            style={{
              background: 'linear-gradient(135deg, #0f172a, #1e293b)',
              color: '#fff',
              borderRadius: 12,
              padding: '20px 24px',
              marginBottom: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <span style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase' }}>คะแนนรวม</span>
              <h3 style={{ fontSize: 32, color: '#facc15', fontWeight: 800, marginTop: 2 }}>
                {score} <span style={{ fontSize: 16, color: '#fff', fontWeight: 500 }}>คะแนน</span>
              </h3>
              <p style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 4 }}>
                สร้างข้อมูลครบทั้ง 3 รูปแบบ (Point x3 รอบ ➔ Line x3 รอบ ➔ Polygon สระพลาสติก)
              </p>
            </div>
          </div>

          {/* Save score section */}
          <div style={{ background: '#f8fafc', border: '1px solid var(--line)', borderRadius: 10, padding: 16, marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              บันทึกคะแนนลงกระดานอันดับ:
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="text"
                placeholder="พิมพ์ชื่อของคุณ (ไม่เกิน 30 ตัวอักษร)..."
                value={playerName}
                onChange={(e) => {
                  setPlayerName(e.target.value);
                  setProfileName(e.target.value);
                  if (e.target.value.trim()) setNameError('');
                }}
                disabled={savedRank !== null || isSaving}
                maxLength={30}
                style={{ flex: 1, padding: '9px 12px', borderRadius: 6, border: '1px solid var(--line)', fontSize: 13.5 }}
              />
              <button
                className="btn btn-primary"
                onClick={handleSaveScore}
                disabled={savedRank !== null || isSaving || !playerName.trim()}
              >
                {isSaving ? (
                  <>
                    <RefreshCw size={14} className="spin" />
                    <span>กำลังบันทึก...</span>
                  </>
                ) : savedRank !== null ? (
                  <>
                    <Check size={14} />
                    <span>บันทึกแล้ว (#{savedRank})</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>บันทึกคะแนน</span>
                  </>
                )}
              </button>
            </div>
            {nameError && <div className="form-error">{nameError}</div>}
            {saveStatus && (
              <p style={{ fontSize: 12, marginTop: 8, color: savedRank ? 'var(--brand)' : 'var(--muted)' }}>
                {saveStatus}
              </p>
            )}
          </div>

          <section style={{ border: '1px solid var(--line)', borderRadius: 10, padding: 16, marginBottom: 18, background: '#ffffff' }} aria-labelledby="vector-summary-leaderboard-title">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
              <div>
                <div className="modal-eyebrow"><Trophy size={14} color="#f59e0b" /> VECTOR LEADERBOARD</div>
                <h3 id="vector-summary-leaderboard-title" style={{ margin: '4px 0 0', fontSize: 18, color: '#0f172a' }}>Leaderboard</h3>
              </div>
              <button className="btn" style={{ padding: '6px 10px', fontSize: 11.5 }} onClick={() => loadLeaderboard()} disabled={isLoadingLeaderboard}>
                <RefreshCw size={12} className={isLoadingLeaderboard ? 'spin' : ''} />
                <span>รีเฟรช</span>
              </button>
            </div>

            <LeaderboardPodium entries={leaderboard.slice(0, 5)} />

            <div style={{ border: '1px solid var(--line)', borderRadius: 10, overflow: 'auto', maxHeight: 300 }}>
              <table className="attribute-table" style={{ minWidth: 0 }}>
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>อันดับ</th>
                    <th>ชื่อผู้เล่น</th>
                    <th style={{ width: 100 }}>คะแนน</th>
                    <th style={{ width: 120 }}>วันที่</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: 20, color: 'var(--muted)' }}>
                        {isLoadingLeaderboard ? 'กำลังโหลด...' : 'ยังไม่มีผู้เล่นบันทึกคะแนน'}
                      </td>
                    </tr>
                  ) : (
                    leaderboard.map((entry, index) => (
                      <tr key={entry.id ?? index} style={{ background: index === 0 ? 'rgba(254, 240, 138, 0.2)' : 'inherit' }}>
                        <td className="mono-cell" style={{ fontWeight: 700, color: index === 0 ? '#d97706' : index < 3 ? 'var(--brand)' : 'inherit' }}>#{index + 1}</td>
                        <td style={{ fontWeight: 600 }}>{entry.name}</td>
                        <td className="mono-cell" style={{ fontWeight: 700, color: '#2563eb' }}>{entry.score} คะแนน</td>
                        <td style={{ fontSize: 11, color: 'var(--muted)' }}>{entry.date ? new Date(entry.date).toLocaleDateString('th-TH') : '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <div style={{ fontSize: 13, lineHeight: 1.8, color: '#334155', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: 14, marginBottom: 18 }}>
            <b>สรุปสิ่งที่ได้เรียนรู้:</b> ข้อมูล Vector ทั้ง 3 ชนิดต่างกันที่มิติและคุณสมบัติทางเรขาคณิต — <b>Point</b> มีพิกัดคู่เดี่ยวผูกกับตาราง Attribute, <b>Line</b> คำนวณความยาว Geodesic ได้, <b>Polygon</b> คำนวณพื้นที่ผิวและเส้นรอบรูปได้ ทั้งหมดนี้เป็นหัวใจสำคัญของงานวิเคราะห์เชิงพื้นที่ (Spatial Analysis) ในระบบ GIS
          </div>

          <MissionNextStagePicker
            currentMission="vector"
            completedMissions={completedMissions}
            scoreSaved={savedRank !== null}
            onSelectMission={onSelectMission}
            onBackToHub={onBackToHub}
          />

        </div>
      </div>
    );
  }

  // 5. Leaderboard Modal
  if (activeModal === 'leaderboard') {
    return (
      <div className="modal-backdrop">
        <div className="modal-box" style={{ maxWidth: 560 }}>
          <div className="modal-eyebrow">
            <Trophy size={14} color="#f59e0b" /> VECTOR MISSION LEADERBOARD
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '4px 0 12px' }}>
            <h2 className="modal-title" style={{ margin: 0 }}>กระดานอันดับ Vector Mission</h2>
            <button
              className="btn"
              style={{ padding: '6px 10px', fontSize: 11.5 }}
              onClick={() => loadLeaderboard()}
              disabled={isLoadingLeaderboard}
            >
              <RefreshCw size={12} className={isLoadingLeaderboard ? 'spin' : ''} />
              <span>รีเฟรช</span>
            </button>
          </div>

          <LeaderboardPodium entries={leaderboard.slice(0, 5)} />

          <div style={{ border: '1px solid var(--line)', borderRadius: 10, overflow: 'auto', maxHeight: '50vh', marginBottom: 16 }}>
            <table className="attribute-table" style={{ minWidth: 0 }}>
              <thead>
                <tr>
                  <th style={{ width: 60 }}>อันดับ</th>
                  <th>ชื่อผู้เล่น</th>
                  <th style={{ width: 90 }}>คะแนน</th>
                  <th style={{ width: 120 }}>วันที่</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: 20, color: 'var(--muted)' }}>
                      {isLoadingLeaderboard ? 'กำลังโหลด...' : 'ยังไม่มีผู้เล่นบันทึกคะแนนในหัวข้อนี้'}
                    </td>
                  </tr>
                ) : (
                  leaderboard.map((r, i) => (
                    <tr key={r.id ?? i} style={{ background: i === 0 ? 'rgba(254, 240, 138, 0.2)' : 'inherit' }}>
                      <td className="mono-cell" style={{ fontWeight: 700, color: i === 0 ? '#d97706' : i < 3 ? 'var(--brand)' : 'inherit' }}>
                        #{i + 1}
                      </td>
                      <td style={{ fontWeight: 600 }}>{r.name}</td>
                      <td className="mono-cell" style={{ fontWeight: 700, color: '#2563eb' }}>{r.score} คะแนน</td>
                      <td style={{ fontSize: 11, color: 'var(--muted)' }}>
                        {r.date ? new Date(r.date).toLocaleDateString('th-TH') : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={closeModal}>
              <X size={14} /> ปิด
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
