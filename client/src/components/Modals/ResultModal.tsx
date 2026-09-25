import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { formatMoney } from '../../utils/scoring';
import { Award, Trophy, Save, BookOpen, Check, RefreshCw, Home } from 'lucide-react';
import confetti from 'canvas-confetti';
import { usePlayerStore } from '../../store/playerStore';
import { LeaderboardPodium } from '../LeaderboardPodium';
import { getScoreTier } from '../../utils/gameRewards';

interface ResultModalProps {
  onBackToHub: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({ onBackToHub }) => {
  const activeModal = useGameStore((s) => s.activeModal);
  const points = useGameStore((s) => s.points);
  const finalScore = useGameStore((s) => s.finalScore);
  const mode = useGameStore((s) => s.mode);
  const leaderboard = useGameStore((s) => s.leaderboard);
  const saveStatus = useGameStore((s) => s.saveStatus);
  const savedRank = useGameStore((s) => s.savedRank);
  const submitScore = useGameStore((s) => s.submitScore);
  const openModal = useGameStore((s) => s.openModal);
  const setProfileName = usePlayerStore((s) => s.setPlayerName);
  const markMissionComplete = usePlayerStore((s) => s.markMissionComplete);

  const [playerName, setPlayerName] = useState(() => usePlayerStore.getState().playerName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (activeModal === 'result' && finalScore !== null && finalScore > 0) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [activeModal, finalScore]);

  useEffect(() => {
    if (activeModal === 'result' && finalScore !== null) {
      markMissionComplete('attribute', finalScore);
    }
  }, [activeModal, finalScore, markMissionComplete]);

  if (activeModal !== 'result') return null;

  const handleSave = async () => {
    if (!playerName.trim()) {
      setNameError('กรุณากรอกชื่อผู้เล่นก่อนบันทึกคะแนน');
      return;
    }
    setNameError('');
    setProfileName(playerName);
    setIsSubmitting(true);
    await submitScore(playerName);
    setIsSubmitting(false);
  };

  const top5 = leaderboard.slice(0, 5);
  const reward = getScoreTier(finalScore ?? 0, 200);

  return (
    <div className="modal-backdrop">
      <div className="modal-box wide">
        <div className="modal-eyebrow">
          <Award size={14} /> RESULT & SUMMARY
        </div>
        <h2 className="modal-title">สรุปผล</h2>

        {/* Score Card Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a, #1e293b)',
            borderRadius: 'var(--radius-md)',
            padding: '20px 24px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.2)',
          }}
        >
          <div>
            <span style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              โหมด: {mode === 'time' ? 'รับโบนัสเวลา' : 'ตรวจแก้ Attribute Table'}
            </span>
            <h3 style={{ fontSize: 28, color: '#2dd4bf', fontWeight: 700, marginTop: 4 }}>
              {finalScore ?? 0} <span style={{ fontSize: 16, color: '#f8fafc', fontWeight: 500 }}>คะแนน</span>
            </h3>
            <p style={{ fontSize: 12.5, color: '#cbd5e1', marginTop: 4 }}>
              คะแนนคำนวณจากข้อมูลคุณลักษณะในตาราง {savedRank ? `• อันดับ #${savedRank}` : ''}
            </p>
          </div>

          <button
            className="btn-header"
            onClick={() => openModal('leaderboard')}
            style={{ padding: '9px 16px', background: '#0d9488', borderColor: '#14b8a6' }}
          >
            <Trophy size={16} color="#fef08a" />
            <span>กระดานอันดับทั้งหมด</span>
          </button>
        </div>

        <div className={`mission-reward-card ${reward.tier}`}>
          <span className="mission-reward-icon"><Trophy size={27} /></span>
          <div>
            <strong>{reward.label}</strong>
            <span>{reward.description} · คะแนนดีที่สุดจะถูกจำไว้ในหน้า Hub</span>
          </div>
        </div>

        {/* Save to Leaderboard Section */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-md)',
            padding: 16,
            marginBottom: 20,
          }}
        >
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
            บันทึกคะแนนลงกระดานอันดับ:
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="text"
              placeholder="พิมพ์ชื่อของคุณ (ไม่เกิน 24 ตัวอักษร)..."
              value={playerName}
              onChange={(e) => {
                setPlayerName(e.target.value);
                setProfileName(e.target.value);
                if (e.target.value.trim()) setNameError('');
              }}
              disabled={savedRank !== null || isSubmitting}
              maxLength={24}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--line)',
                fontSize: 13.5,
              }}
            />
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={savedRank !== null || isSubmitting || !playerName.trim()}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={14} className="spin" />
                  <span>กำลังบันทึก...</span>
                </>
              ) : savedRank !== null ? (
                <>
                  <Check size={14} />
                  <span>บันทึกแล้ว (# {savedRank})</span>
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

        {/* Top 5 Leaderboard Preview */}
        <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--brand)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Trophy size={15} /> กระดาน 5 อันดับแรก
        </h4>
        <LeaderboardPodium entries={top5} />
        <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: 20 }}>
          <table className="attribute-table" style={{ minWidth: 0 }}>
            <thead>
              <tr>
                <th style={{ width: 60 }}>อันดับ</th>
                <th>ชื่อผู้เล่น</th>
                <th style={{ width: 90 }}>คะแนน</th>
                <th style={{ width: 110 }}>โหมด</th>
              </tr>
            </thead>
            <tbody>
              {top5.map((entry, i) => (
                <tr key={entry.id ?? i} style={{ background: i === 0 ? 'rgba(254, 240, 138, 0.15)' : 'inherit' }}>
                  <td className="mono-cell" style={{ fontWeight: 700, color: i < 3 ? 'var(--brand)' : 'inherit' }}>
                    #{i + 1}
                  </td>
                  <td style={{ fontWeight: 500 }}>{entry.name}</td>
                  <td className="mono-cell" style={{ fontWeight: 700 }}>{entry.score}</td>
                  <td style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                    {entry.mode === 'time' ? 'โบนัสเวลา' : entry.mode === 'table' ? 'ตรวจตาราง' : 'ทั่วไป'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recap Table */}
        <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--brand)', marginBottom: 8 }}>
          ตาราง Attribute Table ที่คุณสร้าง ({points.length} จุด)
        </h4>
        <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', overflow: 'auto', maxHeight: 200, marginBottom: 24 }}>
          <table className="attribute-table" style={{ minWidth: 0 }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>หมวด</th>
                <th>ประเภท</th>
                <th>ราคา (บาท)</th>
                <th>พิกัด</th>
                <th>คะแนน</th>
              </tr>
            </thead>
            <tbody>
              {points.map((p, i) => (
                <tr key={p.id}>
                  <td className="mono-cell">{i + 1}</td>
                  <td><span className="category-tag">{p.category}</span></td>
                  <td>{p.type || '-'}</td>
                  <td className="mono-cell">{p.matched ? formatMoney(p.matched[1]) : '-'}</td>
                  <td className="mono-cell" style={{ fontSize: 11 }}>{p.coords}</td>
                  <td className="mono-cell" style={{ fontWeight: 700, color: 'var(--brand)' }}>
                    {p.matched ? p.matched[2] : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* GIS Educational Section */}
        <div
          style={{
            background: 'var(--brand-soft)',
            border: '1px solid var(--brand-border)',
            borderRadius: 'var(--radius-md)',
            padding: '18px 20px',
            fontSize: 13,
            lineHeight: 1.75,
            color: '#134e4a',
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
            <BookOpen size={16} /> เสริมความรู้: Attribute Table สำคัญอย่างไรในระบบ GIS?
          </div>
          <p>
            <b>1. นิยาม:</b> Attribute Table คือตารางฐานข้อมูลที่เก็บข้อมูลเชิงบรรยาย (Non-spatial data) ของสิ่งต่างๆ บนแผนที่ โดยแต่ละแถวแทน 1 Feature และแต่ละคอลัมน์แทน 1 Attribute
          </p>
          <p>
            <b>2. การเชื่อมโยง:</b> การคลิกจุดบนแผนที่จะไฮไลต์แถวในตาราง และการเลือกแถวในตารางก็จะไฮไลต์จุดบนแผนที่ (Bidirectional Selection)
          </p>
          <p>
            <b>3. หัวใจของการวิเคราะห์:</b> ช่วยในการสืบค้น (Query), จัดสัญลักษณ์สีตามหมวดหมู่ (Symbology), และคำนวณสถิติ เช่น ผลรวมงบประมาณและคะแนนที่คุณเพิ่งทำในภารกิจนี้
          </p>

          <div style={{ marginTop: 10, fontSize: 11.5, color: '#0f766e' }}>
            <b>แหล่งอ้างอิง:</b> Esri GIS Dictionary • QGIS Documentation (Working with Vector Attribute Table)
          </div>
        </div>

        <div className="mission-completion-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button className="btn mission-return-hub-button" onClick={onBackToHub}>
            <Home size={14} />
            <span>กลับ Hub</span>
          </button>
        </div>
      </div>
    </div>
  );
};
