import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { calculateBudgetPenalty, calculateTotalSpent, formatMoney } from '../../utils/scoring';
import { GAME_CONFIG } from '../../constants/catalog';
import { Flag, Timer, CheckSquare, X } from 'lucide-react';

export const EndChoiceModal: React.FC = () => {
  const activeModal = useGameStore((s) => s.activeModal);
  const points = useGameStore((s) => s.points);
  const chooseEndMode = useGameStore((s) => s.chooseEndMode);
  const closeModal = useGameStore((s) => s.closeModal);

  if (activeModal !== 'end') return null;

  const spent = calculateTotalSpent(points);
  const penalty = calculateBudgetPenalty(spent);

  return (
    <div className="modal-backdrop">
      <div className="modal-box">
        <div className="modal-eyebrow">
          <Flag size={14} /> MISSION COMPLETE
        </div>
        <h2 className="modal-title">คุณสร้างครบ 10 จุดแล้ว!</h2>

        <p style={{ fontSize: 13.5, color: '#334155', marginBottom: 12 }}>
          คะแนนสุดท้ายของคุณจะคำนวณจากผลรวมคะแนนทุกแถวที่ถูกต้อง หักด้วยคะแนนที่ใช้งบเกิน (ถ้ามี)
          {penalty > 0 && (
            <span style={{ color: 'var(--danger)', fontWeight: 600 }}>
              {' '}— ขณะนี้มีการใช้งบเกิน {formatMoney(spent - GAME_CONFIG.TOTAL_BUDGET)} บาท (หัก {penalty} คะแนน)
            </span>
          )}
        </p>

        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
          กรุณาเลือกวิธีการสรุปคะแนนของคุณ:
        </p>

        {/* Choice A: Time Bonus */}
        <button className="choice-card" onClick={() => chooseEndMode('time')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Timer size={18} color="#0d9488" />
            <b>ตัวเลือกที่ 1: รับโบนัสจากเวลาที่เหลือ</b>
          </div>
          <span>
            คำนวณคะแนนปัจจุบันรวมกับคะแนนพิเศษตามเวลาที่เหลืออยู่ (เหมาะสำหรับผู้ที่ทำเวลาได้รวดเร็ว)
          </span>
        </button>

        {/* Choice B: Table verification */}
        <button className="choice-card" onClick={() => chooseEndMode('table')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <CheckSquare size={18} color="#0d9488" />
            <b>ตัวเลือกที่ 2: ตรวจแก้ Attribute Table เพื่อคะแนนสูงสุด</b>
          </div>
          <span>
            ตรวจสอบความถูกต้องของข้อมูลทุกแถว เพื่อให้ได้คะแนนเต็มในแต่ละหมวดหมู่
          </span>
        </button>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
          <button className="btn" onClick={closeModal}>
            <X size={14} />
            <span>กลับไปตรวจตาราง</span>
          </button>
        </div>
      </div>
    </div>
  );
};
