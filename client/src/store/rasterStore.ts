import { create } from 'zustand';
import type {
  RasterDisplayMode,
  EscapeStatus,
  ClassifyStatus,
  ResolutionStatus,
} from '../types/rasterMission';
import type { LeaderboardEntry } from '../types/mission';
import {
  COLS,
  ROWS,
  ESCAPE_COLS,
  ESCAPE_ROWS,
  ESCAPE_TIME_LIMIT,
  CLASSIFY_TARGET,
  CLASSIFY_TIME_LIMIT,
  CLASSIFY_TIMEOUT_PENALTY,
  elevAt,
  landCoverAtElevation,
  RES_CHALLENGE,
  QUESTIONS,
} from '../constants/rasterData';
import { fetchLeaderboard, submitScoreToBackend } from '../services/leaderboardService';

// Precompute explorer grid
export const explorerElevGrid: number[][] = [];
let minElev = Infinity;
let maxElev = -Infinity;
for (let y = 0; y < ROWS; y++) {
  const row: number[] = [];
  for (let x = 0; x < COLS; x++) {
    const e = elevAt(x, y, COLS, ROWS);
    row.push(e);
    if (e < minElev) minElev = e;
    if (e > maxElev) maxElev = e;
  }
  explorerElevGrid.push(row);
}
export { minElev, maxElev };

// Precompute escape grid
export const escapeElevGrid: number[][] = [];
let escapeMinE = Infinity;
let escapeMaxE = -Infinity;
let escapePeak = { x: 0, y: 0 };
let escapeStart = { x: 0, y: 0 };

for (let y = 0; y < ESCAPE_ROWS; y++) {
  const row: number[] = [];
  for (let x = 0; x < ESCAPE_COLS; x++) {
    const e = elevAt(x, y, ESCAPE_COLS, ESCAPE_ROWS);
    row.push(e);
    if (e < escapeMinE) {
      escapeMinE = e;
      escapeStart = { x, y };
    }
    if (e > escapeMaxE) {
      escapeMaxE = e;
      escapePeak = { x, y };
    }
  }
  escapeElevGrid.push(row);
}
export { escapeMinE, escapeMaxE, escapePeak, escapeStart };

// Keep the flood pressure meaningful without making the smoothest route
// mathematically unwinnable before the learner can reach the peak.
const floodStep = Math.max(20, Math.ceil((escapeMaxE - escapeMinE) / 18));

interface RasterState {
  resetMission: () => void;
  // Scores
  escapeScore: number;
  classifyScore: number;
  resolutionScore: number;
  quizScore: number;
  expertBonus: number;
  totalScore: () => number;

  // Explorer
  displayMode: RasterDisplayMode;
  selectedCell: { x: number; y: number; elev: number } | null;
  setDisplayMode: (mode: RasterDisplayMode) => void;
  setSelectedCell: (cell: { x: number; y: number; elev: number } | null) => void;

  // Escape Flood
  escapeStatus: EscapeStatus;
  escapePlayerPos: { x: number; y: number };
  escapeWaterLevel: number;
  escapeTurns: number;
  escapeTimeLeft: number;
  escapeMsg: string;
  escapeOutcomeModal: 'won' | 'lost' | null;
  startEscape: () => void;
  tickEscape: () => void;
  movePlayer: (x: number, y: number) => void;
  closeEscapeOutcomeModal: () => void;

  // Reclassify
  classifyStatus: ClassifyStatus;
  classifyTargets: { x: number; y: number; done: boolean }[];
  classifyTimeLeft: number;
  activeClassifyCell: { x: number; y: number; elev: number } | null;
  classifyMsg: string;
  startClassify: () => void;
  tickClassify: () => void;
  skipClassify: () => void;
  selectClassifyCell: (x: number, y: number) => void;
  answerClassify: (selectedLabel: string) => void;

  // Resolution Challenge
  resIndex: number;
  resStatus: ResolutionStatus;
  resExplain: string;
  resMsg: string;
  startResolution: () => void;
  answerResolution: (choice: 'A' | 'B') => void;

  // Quiz
  quizAnswered: boolean[];
  quizSelected: (number | null)[];
  answerQuiz: (qIndex: number, optIndex: number) => void;

  // Leaderboard
  leaderboard: LeaderboardEntry[];
  isLeaderboardLocal: boolean;
  isLoadingLeaderboard: boolean;
  savedRank: number | null;
  saveStatus: string;
  loadLeaderboard: () => Promise<void>;
  submitScore: (playerName: string) => Promise<boolean>;
}

export const useRasterStore = create<RasterState>((set, get) => ({
  resetMission: () => {
    set({
      escapeScore: 0,
      classifyScore: 0,
      resolutionScore: 0,
      quizScore: 0,
      expertBonus: 0,
      displayMode: 'color',
      selectedCell: null,
      escapeStatus: 'idle',
      escapePlayerPos: { ...escapeStart },
      escapeWaterLevel: escapeMinE - 100,
      escapeTurns: 0,
      escapeTimeLeft: ESCAPE_TIME_LIMIT,
      escapeMsg: 'กดปุ่ม "เริ่มภารกิจหนีน้ำ" เพื่อเริ่ม',
      escapeOutcomeModal: null,
      classifyStatus: 'idle',
      classifyTargets: [],
      classifyTimeLeft: CLASSIFY_TIME_LIMIT,
      activeClassifyCell: null,
      classifyMsg: 'กดปุ่ม "เริ่มภารกิจจำแนก" เพื่อเริ่ม',
      resIndex: 0,
      resStatus: 'idle',
      resExplain: '',
      resMsg: 'ตอบถูกครบ 5 ข้อเพื่อรับคะแนนพิเศษ +15 คะแนน',
      quizAnswered: Array(QUESTIONS.length).fill(false),
      quizSelected: Array(QUESTIONS.length).fill(null),
      savedRank: null,
      saveStatus: '',
    });
  },
  escapeScore: 0,
  classifyScore: 0,
  resolutionScore: 0,
  quizScore: 0,
  expertBonus: 0,

  totalScore: () => {
    const s = get();
    const allQuizOk = s.quizAnswered.every(Boolean) && s.quizScore === QUESTIONS.length * 4;
    const bonus = s.escapeScore > 0 && s.classifyScore > 0 && s.resolutionScore > 0 && allQuizOk ? 15 : 0;
    return s.escapeScore + s.classifyScore + s.resolutionScore + s.quizScore + bonus;
  },

  // Explorer
  displayMode: 'color',
  selectedCell: null,
  setDisplayMode: (mode) => set({ displayMode: mode }),
  setSelectedCell: (cell) => set({ selectedCell: cell }),

  // Escape Flood
  escapeStatus: 'idle',
  escapePlayerPos: { ...escapeStart },
  escapeWaterLevel: escapeMinE - 100,
  escapeTurns: 0,
  escapeTimeLeft: ESCAPE_TIME_LIMIT,
  escapeMsg: 'กดปุ่ม "เริ่มภารกิจหนีน้ำ" เพื่อเริ่ม',
  escapeOutcomeModal: null,

  startEscape: () => {
    set({
      escapeStatus: 'playing',
      escapePlayerPos: { ...escapeStart },
      escapeWaterLevel: escapeMinE - 100,
      escapeTurns: 0,
      escapeTimeLeft: ESCAPE_TIME_LIMIT,
      escapeMsg: 'คลิกเซลล์กรอบสีเหลืองเพื่อขยับ — มุ่งหน้าสู่ยอดเขาสูงสุดโดยระวังน้ำขึ้น',
      escapeOutcomeModal: null,
    });
  },

  tickEscape: () => {
    const { escapeStatus, escapeTimeLeft } = get();
    if (escapeStatus !== 'playing') return;
    if (escapeTimeLeft <= 1) {
      set({
        escapeStatus: 'lost',
        escapeTimeLeft: 0,
        escapeMsg: 'หมดเวลา! น้ำท่วมถึงตัวคุณแล้ว กดเริ่มใหม่เพื่อท้าทายอีกครั้ง',
        escapeOutcomeModal: 'lost',
      });
    } else {
      set({ escapeTimeLeft: escapeTimeLeft - 1 });
    }
  },

  movePlayer: (x: number, y: number) => {
    const { escapeStatus, escapePlayerPos, escapeWaterLevel, escapeTurns, escapeTimeLeft, escapeScore } = get();
    if (escapeStatus !== 'playing') return;

    const dx = Math.abs(x - escapePlayerPos.x);
    const dy = Math.abs(y - escapePlayerPos.y);
    if (dx > 1 || dy > 1 || (dx === 0 && dy === 0)) return;

    const targetElev = escapeElevGrid[y][x];
    if (targetElev <= escapeWaterLevel) return;

    const nextTurns = escapeTurns + 1;
    const nextWater = escapeWaterLevel + floodStep;

    if (x === escapePeak.x && y === escapePeak.y) {
      const speedBonus = Math.max(0, Math.min(10, Math.floor(escapeTimeLeft / 4)));
      const finalScore = Math.max(escapeScore, 20 + speedBonus);
      set({
        escapeStatus: 'won',
        escapePlayerPos: { x, y },
        escapeTurns: nextTurns,
        escapeScore: finalScore,
        escapeMsg: `ถึงยอดสูงสุดแล้ว! ใช้ ${nextTurns} ก้าว เหลือเวลา ${escapeTimeLeft}s — ได้รับคะแนน +${finalScore}`,
        escapeOutcomeModal: 'won',
      });
    } else if (targetElev <= nextWater) {
      set({
        escapeStatus: 'lost',
        escapePlayerPos: { x, y },
        escapeTurns: nextTurns,
        escapeWaterLevel: nextWater,
        escapeMsg: 'น้ำท่วมถึงตัวคุณแล้ว! ลองใหม่อีกครั้ง — กดปุ่มเริ่มใหม่',
        escapeOutcomeModal: 'lost',
      });
    } else {
      set({
        escapePlayerPos: { x, y },
        escapeTurns: nextTurns,
        escapeWaterLevel: nextWater,
      });
    }
  },

  closeEscapeOutcomeModal: () => set({ escapeOutcomeModal: null }),

  // Reclassify
  classifyStatus: 'idle',
  classifyTargets: [],
  classifyTimeLeft: CLASSIFY_TIME_LIMIT,
  activeClassifyCell: null,
  classifyMsg: 'กดปุ่ม "เริ่มภารกิจจำแนก" เพื่อเริ่ม',

  startClassify: () => {
    const all: { x: number; y: number }[] = [];
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        all.push({ x, y });
      }
    }
    all.sort(() => Math.random() - 0.5);
    const targets = all.slice(0, CLASSIFY_TARGET).map((p) => ({ ...p, done: false }));

    set({
      classifyStatus: 'playing',
      classifyTargets: targets,
      classifyTimeLeft: CLASSIFY_TIME_LIMIT,
      classifyScore: 0,
      activeClassifyCell: null,
      classifyMsg: 'คลิกที่เซลล์ ? เพื่ออ่านค่าความสูง แล้วเทียบตาราง Legend เพื่อจัดหมวดหมู่',
    });
  },

  tickClassify: () => {
    const { classifyStatus, classifyTimeLeft } = get();
    if (classifyStatus !== 'playing') return;
    if (classifyTimeLeft <= 1) {
      set({
        classifyStatus: 'lost',
        classifyTimeLeft: 0,
        classifyScore: -CLASSIFY_TIMEOUT_PENALTY,
        activeClassifyCell: null,
        classifyMsg: `หมดเวลา! หัก ${CLASSIFY_TIMEOUT_PENALTY} คะแนน และคุณสามารถไปทำภารกิจถัดไปได้`,
      });
    } else {
      set({ classifyTimeLeft: classifyTimeLeft - 1 });
    }
  },

  skipClassify: () => {
    set({
      classifyStatus: 'lost',
      classifyTimeLeft: 0,
      classifyScore: -CLASSIFY_TIMEOUT_PENALTY,
      activeClassifyCell: null,
      classifyMsg: `ข้ามภารกิจจัดหมวดหมู่ราสเตอร์! หัก ${CLASSIFY_TIMEOUT_PENALTY} คะแนน และคุณสามารถไปทำภารกิจถัดไปได้`,
    });
  },

  selectClassifyCell: (x: number, y: number) => {
    const { classifyStatus, classifyTargets } = get();
    if (classifyStatus !== 'playing') return;
    const target = classifyTargets.find((t) => t.x === x && t.y === y && !t.done);
    if (!target) return;

    const elev = explorerElevGrid[y][x];
    set({
      activeClassifyCell: { x, y, elev },
      classifyMsg: `ค่าความสูงของเซลล์: ${elev.toLocaleString()} ม. — เลือกหมวดหมู่ที่ตรงกัน:`,
    });
  },

  answerClassify: (selectedLabel: string) => {
    const { activeClassifyCell, classifyTargets, classifyTimeLeft, classifyScore } = get();
    if (!activeClassifyCell) return;

    const elev = activeClassifyCell.elev;
    const correctLabel = landCoverAtElevation(elev).label;

    if (selectedLabel === correctLabel) {
      const updated = classifyTargets.map((t) =>
        t.x === activeClassifyCell.x && t.y === activeClassifyCell.y ? { ...t, done: true } : t
      );
      const doneCount = updated.filter((t) => t.done).length;

      if (doneCount >= CLASSIFY_TARGET) {
        const speedBonus = Math.max(0, Math.min(10, Math.floor(classifyTimeLeft / 4)));
        const finalScore = Math.max(classifyScore, 20 + speedBonus);
        set({
          classifyStatus: 'won',
          classifyTargets: updated,
          activeClassifyCell: null,
          classifyScore: finalScore,
          classifyMsg: `จัดหมวดหมู่ Reclassify ครบทุกเซลล์แล้ว! เหลือเวลา ${classifyTimeLeft}s — ได้รับคะแนน +${finalScore}`,
        });
      } else {
        set({
          classifyTargets: updated,
          activeClassifyCell: null,
          classifyMsg: `✓ ถูกต้อง! ${elev.toLocaleString()} ม. จัดเป็น "${correctLabel}" (สำเร็จ ${doneCount}/${CLASSIFY_TARGET})`,
        });
      }
    } else {
      set({
        classifyMsg: `ยังไม่ถูกต้อง! ความสูง ${elev.toLocaleString()} ม. ไม่ได้อยู่ในช่วงของ "${selectedLabel}" ลองดูตาราง Legend อีกครั้ง`,
      });
    }
  },

  // Resolution Challenge
  resIndex: 0,
  resStatus: 'idle',
  resExplain: '',
  resMsg: 'ตอบถูกครบ 5 ข้อเพื่อรับคะแนนพิเศษ +15 คะแนน',

  startResolution: () => {
    set({
      resIndex: 0,
      resStatus: 'playing',
      resExplain: '',
      resMsg: 'เลือกคำตอบที่ถูกต้องตามหลักการ Spatial Resolution',
    });
  },

  answerResolution: (choice: 'A' | 'B') => {
    const { resIndex, resStatus } = get();
    if (resStatus !== 'playing') return;

    const item = RES_CHALLENGE[resIndex];
    if (!item) return;

    if (choice === item.answer) {
      const nextIndex = resIndex + 1;
      if (nextIndex >= RES_CHALLENGE.length) {
        set({
          resIndex: nextIndex,
          resStatus: 'won',
          resolutionScore: 15,
          resExplain: 'สรุปหลักการ: ขนาด Pixel ยิ่งเล็ก = จำนวน Pixel ยิ่งมาก = Spatial Resolution ยิ่งสูง (ภาพคมชัดขึ้น)',
          resMsg: 'ผ่านครบทั้ง 5 ข้อ! ได้รับคะแนน +15 คะแนน',
        });
      } else {
        set({
          resIndex: nextIndex,
          resExplain: `✓ ถูกต้อง! ${item.explain}`,
          resMsg: `ข้อ ${nextIndex} ผ่านแล้ว! ไปยังข้อถัดไป...`,
        });
      }
    } else {
      set({
        resExplain: '✕ ยังไม่ถูก! ลองพิจารณาขนาด Pixel อีกครั้ง (Pixel ขนาดเล็กกว่า = ภาพละเอียดคมชัดกว่า)',
      });
    }
  },

  // Quiz
  quizAnswered: Array(QUESTIONS.length).fill(false),
  quizSelected: Array(QUESTIONS.length).fill(null),

  answerQuiz: (qIndex: number, optIndex: number) => {
    const { quizAnswered, quizSelected, quizScore } = get();
    if (quizAnswered[qIndex]) return;

    const updatedAnswered = [...quizAnswered];
    updatedAnswered[qIndex] = true;

    const updatedSelected = [...quizSelected];
    updatedSelected[qIndex] = optIndex;

    const isCorrect = optIndex === QUESTIONS[qIndex].correct;
    const addedScore = isCorrect ? 4 : 0;

    set({
      quizAnswered: updatedAnswered,
      quizSelected: updatedSelected,
      quizScore: quizScore + addedScore,
    });
  },

  // Leaderboard
  leaderboard: [],
  isLeaderboardLocal: false,
  isLoadingLeaderboard: false,
  savedRank: null,
  saveStatus: '',

  loadLeaderboard: async () => {
    set({ isLoadingLeaderboard: true });
    try {
      const res = await fetch('/api/leaderboard?mission=raster');
      if (res.ok) {
        const data = await res.json();
        if (data.ok && Array.isArray(data.data)) {
          set({ leaderboard: data.data, isLeaderboardLocal: false, isLoadingLeaderboard: false });
          return;
        }
      }
    } catch {
      // Fallback
    }

    const { list } = await fetchLeaderboard();
    set({ leaderboard: list, isLeaderboardLocal: true, isLoadingLeaderboard: false });
  },

  submitScore: async (playerName: string) => {
    const score = get().totalScore();
    set({ saveStatus: 'กำลังบันทึกลงฐานข้อมูล...' });

    try {
      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: playerName.trim().slice(0, 30),
          score,
          mode: 'raster_complete',
          mission: 'raster',
        }),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.ok && result.data) {
          set({
            savedRank: result.data.rank,
            leaderboard: result.data.topList,
            isLeaderboardLocal: false,
            saveStatus: `บันทึกคะแนนเรียบร้อย ✓ อันดับ #${result.data.rank}`,
          });
          return true;
        }
      }
    } catch {
      // Local fallback
    }

    const res = await submitScoreToBackend(playerName, score, 'raster_complete');
    set({
      savedRank: res.rank,
      leaderboard: res.list,
      isLeaderboardLocal: true,
      saveStatus: `บันทึกคะแนนเรียบร้อย ✓ อันดับ #${res.rank}`,
    });
    return true;
  },
}));
