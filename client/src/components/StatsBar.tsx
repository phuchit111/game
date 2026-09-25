import React from 'react';
import { useGameStore } from '../store/gameStore';
import { GAME_CONFIG } from '../constants/catalog';
import {
  calculateTotalSpent,
  calculateBudgetPenalty,
  formatMoney,
  formatTime,
} from '../utils/scoring';
import { MapPin, Clock, CheckCircle2, Wallet, AlertTriangle, Activity } from 'lucide-react';

export const StatsBar: React.FC = () => {
  const points = useGameStore((s) => s.points);
  const seconds = useGameStore((s) => s.seconds);
  const started = useGameStore((s) => s.started);

  const spent = calculateTotalSpent(points);
  const remainingBudget = GAME_CONFIG.TOTAL_BUDGET - spent;
  const penalty = calculateBudgetPenalty(spent);
  const validCount = points.filter((p) => p.matched !== null).length;

  let statusText = 'พร้อมเริ่ม';
  if (started) {
    if (seconds <= 0) {
      statusText = 'หมดเวลา';
    } else if (points.length === GAME_CONFIG.MAX_POINTS) {
      statusText = 'ครบ 10 จุดแล้ว';
    } else {
      statusText = 'กำลังสร้าง';
    }
  }

  return (
    <div className="stats-floating-bar">
      {/* 1. จุดที่สร้าง */}
      <div className="stat-chip">
        <span className="stat-label">
          <MapPin size={13} /> จุดที่สร้าง
        </span>
        <span className="stat-val highlight">
          {points.length} <small style={{ fontSize: 13, color: 'var(--muted)' }}>/ {GAME_CONFIG.MAX_POINTS}</small>
        </span>
      </div>

      {/* 2. เวลาคงเหลือ */}
      <div className="stat-chip">
        <span className="stat-label">
          <Clock size={13} /> เวลาคงเหลือ
        </span>
        <span className={`stat-val ${seconds < 60 ? 'negative' : ''}`}>
          {formatTime(seconds)}
        </span>
      </div>

      {/* 3. ตารางถูกต้อง */}
      <div className="stat-chip">
        <span className="stat-label">
          <CheckCircle2 size={13} /> ตารางถูกต้อง
        </span>
        <span className="stat-val highlight">
          {validCount} <small style={{ fontSize: 13, color: 'var(--muted)' }}>/ {GAME_CONFIG.MAX_POINTS}</small>
        </span>
      </div>

      {/* 4. งบคงเหลือ */}
      <div className="stat-chip">
        <span className="stat-label">
          <Wallet size={13} /> งบคงเหลือ (บาท)
        </span>
        <span className={`stat-val ${remainingBudget < 0 ? 'negative' : ''}`}>
          {formatMoney(remainingBudget)}
        </span>
      </div>

      {/* 5. หักคะแนนงบเกิน */}
      <div className="stat-chip">
        <span className="stat-label">
          <AlertTriangle size={13} /> หักคะแนน (งบเกิน)
        </span>
        <span className={`stat-val ${penalty > 0 ? 'negative' : ''}`}>
          -{penalty}
        </span>
      </div>

      {/* 6. สถานะ */}
      <div className="stat-chip">
        <span className="stat-label">
          <Activity size={13} /> สถานะ
        </span>
        <span className="stat-val" style={{ fontSize: 15, paddingTop: 3 }}>
          {statusText}
        </span>
      </div>
    </div>
  );
};
