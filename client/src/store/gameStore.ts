import { create } from 'zustand';
import type { PointRecord, Category, GameMode, ModalType, LeaderboardEntry } from '../types/mission';
import { GAME_CONFIG } from '../constants/catalog';
import {
  matchCatalogType,
  calculateTotalSpent,
  calculateBudgetPenalty,
  calculateEffectiveScore,
  formatMoney,
} from '../utils/scoring';
import { fetchLeaderboard, submitScoreToBackend } from '../services/leaderboardService';

interface GameState {
  points: PointRecord[];
  started: boolean;
  seconds: number;
  finalScore: number | null;
  mode: GameMode | '';
  activeModal: ModalType | null;
  pendingLatLng: { lat: number; lng: number } | null;
  feedback: string;
  leaderboard: LeaderboardEntry[];
  isLeaderboardLocal: boolean;
  isLoadingLeaderboard: boolean;
  savedRank: number | null;
  saveStatus: string;

  // Actions
  resetMission: () => void;
  startMission: () => void;
  tickTimer: () => void;
  setPendingLatLng: (coords: { lat: number; lng: number } | null) => void;
  addPoint: (category: Category, type?: string) => boolean;
  updatePointType: (index: number, newType: string) => void;
  deletePoint: (index: number) => void;
  clearAllPoints: () => void;
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  checkTable: () => void;
  chooseEndMode: (mode: GameMode) => void;
  loadScores: () => Promise<void>;
  submitScore: (playerName: string) => Promise<boolean>;
}

export const useGameStore = create<GameState>((set, get) => ({
  points: [],
  started: false,
  seconds: GAME_CONFIG.TOTAL_TIME,
  finalScore: null,
  mode: '',
  activeModal: 'intro', // Show intro mission brief first
  pendingLatLng: null,
  feedback: '',
  leaderboard: [],
  isLeaderboardLocal: false,
  isLoadingLeaderboard: false,
  savedRank: null,
  saveStatus: '',

  resetMission: () => {
    set({
      points: [],
      started: false,
      seconds: GAME_CONFIG.TOTAL_TIME,
      finalScore: null,
      mode: '',
      activeModal: 'intro',
      pendingLatLng: null,
      feedback: '',
      savedRank: null,
      saveStatus: '',
    });
  },

  startMission: () => {
    set({
      started: true,
      activeModal: null,
      seconds: GAME_CONFIG.TOTAL_TIME,
    });
  },

  tickTimer: () => {
    const { started, seconds } = get();
    if (!started || seconds <= 0) return;
    const nextSec = seconds - 1;
    if (nextSec <= 0) {
      set({
        seconds: 0,
        feedback: 'หมดเวลาแล้ว แต่คุณยังสามารถตรวจทานและส่ง Attribute Table ได้',
      });
    } else {
      set({ seconds: nextSec });
    }
  },

  setPendingLatLng: (coords) => {
    set({ pendingLatLng: coords });
    if (coords) {
      set({ activeModal: 'editor' });
    }
  },

  addPoint: (category: Category, type = '') => {
    const { points, pendingLatLng } = get();
    if (!pendingLatLng) return false;
    if (points.length >= GAME_CONFIG.MAX_POINTS) return false;

    const countInCategory = points.filter((p) => p.category === category).length;
    if (countInCategory >= GAME_CONFIG.MAX_PER_CATEGORY) {
      return false;
    }

    const nextId = points.length + 1;
    const newPoint: PointRecord = {
      id: nextId,
      category,
      type,
      lat: pendingLatLng.lat,
      lng: pendingLatLng.lng,
      coords: `${pendingLatLng.lat.toFixed(5)}, ${pendingLatLng.lng.toFixed(5)}`,
      matched: matchCatalogType(category, type),
    };

    set({
      points: [...points, newPoint],
      pendingLatLng: null,
      activeModal: null,
    });
    return true;
  },

  updatePointType: (index: number, newType: string) => {
    const { points } = get();
    const target = points[index];
    if (!target) return;

    const matched = matchCatalogType(target.category, newType);
    const updatedPoints = [...points];
    updatedPoints[index] = {
      ...target,
      type: newType,
      matched,
    };

    set({ points: updatedPoints });
  },

  deletePoint: (index: number) => {
    const { points } = get();
    const updated = points.filter((_, i) => i !== index);
    // Re-index IDs
    const reindexed = updated.map((p, i) => ({ ...p, id: i + 1 }));
    set({
      points: reindexed,
    });
  },

  clearAllPoints: () => {
    set({
      points: [],
      finalScore: null,
      feedback: '',
    });
  },

  openModal: (modal: ModalType) => {
    set({ activeModal: modal });
    if (modal === 'leaderboard' || modal === 'result') {
      get().loadScores();
    }
  },

  closeModal: () => {
    set({ activeModal: null });
  },

  checkTable: () => {
    const { points } = get();
    const validPoints = points.filter((p) => p.matched !== null).length;
    const spent = calculateTotalSpent(points);
    const overBudget = spent > GAME_CONFIG.TOTAL_BUDGET;
    const penalty = calculateBudgetPenalty(spent);

    let msg = '';
    if (validPoints === points.length && points.length > 0 && !overBudget) {
      msg = '✓ ข้อมูล Attribute Table ถูกต้องครบทุกแถว และอยู่ในงบประมาณยอดเยี่ยม!';
    } else if (overBudget) {
      msg = `ตรงตามหมวดหมู่แล้ว แต่ใช้งบเกิน ${formatMoney(spent - GAME_CONFIG.TOTAL_BUDGET)} บาท (หัก ${penalty} คะแนน) ลองเปลี่ยนเป็นประเภทที่ประหยัดขึ้น`;
    } else {
      msg = 'ยังมีข้อมูลที่ไม่ตรงกับตารางอ้างอิง ลองเปิด "ตารางอ้างอิง" เพื่อตรวจสอบชื่อประเภทในหมวดนั้นๆ';
    }

    if (points.length === GAME_CONFIG.MAX_POINTS) {
      set({
        feedback: msg,
        started: false,
        activeModal: 'end',
      });
      return;
    }

    set({ feedback: msg });
  },

  chooseEndMode: (endMode: GameMode) => {
    const { points, seconds } = get();
    const attrScore = calculateEffectiveScore(points);

    if (endMode === 'time') {
      const timeBonus = Math.round((Math.max(0, seconds) / GAME_CONFIG.TOTAL_TIME) * 10);
      const total = attrScore + timeBonus;
      set({
        finalScore: total,
        mode: 'time',
        activeModal: 'result',
        savedRank: null,
        saveStatus: '',
      });
    } else {
      set({
        finalScore: attrScore,
        mode: 'table',
        activeModal: 'result',
        savedRank: null,
        saveStatus: '',
      });
    }
    get().loadScores();
  },

  loadScores: async () => {
    set({ isLoadingLeaderboard: true });
    const { list, isLocal } = await fetchLeaderboard();
    set({
      leaderboard: list,
      isLeaderboardLocal: isLocal,
      isLoadingLeaderboard: false,
    });
  },

  submitScore: async (playerName: string) => {
    const { finalScore, mode } = get();
    if (finalScore === null) return false;

    set({ saveStatus: 'กำลังบันทึกลงฐานข้อมูล...' });
    const result = await submitScoreToBackend(playerName, finalScore, mode || 'custom');

    if (result.ok) {
      set({
        savedRank: result.rank,
        leaderboard: result.list,
        isLeaderboardLocal: result.isLocal,
        saveStatus: `บันทึกคะแนนเรียบร้อย ✓ อันดับของคุณตอนนี้: #${result.rank}`,
      });
      return true;
    } else {
      set({
        saveStatus: result.error || 'เกิดข้อผิดพลาดในการบันทึกคะแนน',
      });
      return false;
    }
  },
}));
