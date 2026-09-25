import { create } from 'zustand';
import type { KKULocation, VectorStage, VectorModalType } from '../types/vectorMission';
import type { LeaderboardEntry } from '../types/mission';
import { ALL_LOCATIONS, SCORE_CONFIG, PLASTIC_POND_BOUNDS } from '../constants/vectorData';
import {
  calculateLineLengthMeters,
  calculateGeodesicArea,
  calculatePerimeterMeters,
  lineVisitsTargetsInOrder,
  computeSpeedBonus,
} from '../utils/geoMath';
import { fetchLeaderboard, submitScoreToBackend } from '../services/leaderboardService';
import L from 'leaflet';

interface VectorGameState {
  page: 'start' | 'brief' | 'game';
  stage: VectorStage;
  pointRoundIndex: number;
  lineRoundIndex: number;
  score: number;
  timer: number;
  timerRunning: boolean;
  currentTarget: KKULocation | null;
  currentLineTargets: KKULocation[];
  lastPointTarget: KKULocation | null;
  activeModal: VectorModalType | null;
  modalStatsHtml: string;
  tutorialShown: { 2: boolean; 3: boolean };
  feedbackMsg: string;

  // Leaderboard
  leaderboard: LeaderboardEntry[];
  isLeaderboardLocal: boolean;
  isLoadingLeaderboard: boolean;
  savedRank: number | null;
  saveStatus: string;

  // Actions
  resetMission: () => void;
  setPage: (page: 'start' | 'brief' | 'game') => void;
  initGame: () => void;
  startStage: (stageNum: VectorStage) => void;
  startTimer: () => void;
  tickTimer: () => void;
  openModal: (modal: VectorModalType) => void;
  closeModal: () => void;
  nextStep: () => void;
  loadLeaderboard: () => Promise<void>;
  submitScore: (playerName: string) => Promise<boolean>;
  validateSubmission: (layer: any) => { success: boolean; message?: string };
}

export const useVectorStore = create<VectorGameState>((set, get) => ({
  resetMission: () => {
    set({
      page: 'start',
      stage: 1,
      pointRoundIndex: 0,
      lineRoundIndex: 0,
      score: 0,
      timer: SCORE_CONFIG.point.time,
      timerRunning: false,
      currentTarget: null,
      currentLineTargets: [],
      lastPointTarget: null,
      activeModal: null,
      modalStatsHtml: '',
      tutorialShown: { 2: false, 3: false },
      feedbackMsg: '',
      savedRank: null,
      saveStatus: '',
    });
  },
  page: 'start',
  stage: 1,
  pointRoundIndex: 0,
  lineRoundIndex: 0,
  score: 0,
  timer: SCORE_CONFIG.point.time,
  timerRunning: false,
  currentTarget: null,
  currentLineTargets: [],
  lastPointTarget: null,
  activeModal: null,
  modalStatsHtml: '',
  tutorialShown: { 2: false, 3: false },
  feedbackMsg: '',

  leaderboard: [],
  isLeaderboardLocal: false,
  isLoadingLeaderboard: false,
  savedRank: null,
  saveStatus: '',

  setPage: (page) => set({ page }),

  initGame: () => {
    set({
      page: 'game',
      pointRoundIndex: 0,
      lineRoundIndex: 0,
      score: 0,
      timerRunning: false,
      lastPointTarget: null,
      feedbackMsg: '',
    });
    get().startStage(1);
  },

  startStage: (stageNum: VectorStage) => {
    const { lastPointTarget, tutorialShown } = get();

    let allottedTime = 90;
    let timerRunning = false;
    let currentTarget: KKULocation | null = null;
    let currentLineTargets: KKULocation[] = [];

    if (stageNum === 1) {
      allottedTime = SCORE_CONFIG.point.time;
      let picked: KKULocation;
      do {
        picked = ALL_LOCATIONS[Math.floor(Math.random() * ALL_LOCATIONS.length)];
      } while (picked === lastPointTarget && ALL_LOCATIONS.length > 1);

      currentTarget = picked;
      set({ lastPointTarget: picked });
    } else if (stageNum === 2) {
      allottedTime = SCORE_CONFIG.line.time;
      const shuffled = [...ALL_LOCATIONS].sort(() => Math.random() - 0.5);
      currentLineTargets = shuffled.slice(0, 3);

      if (!tutorialShown[2]) {
        set({
          tutorialShown: { ...tutorialShown, 2: true },
          activeModal: 'howto',
        });
      }
    } else if (stageNum === 3) {
      allottedTime = SCORE_CONFIG.polygon.time;
      if (!tutorialShown[3]) {
        set({
          tutorialShown: { ...tutorialShown, 3: true },
          activeModal: 'howto',
        });
      }
    }

    set({
      stage: stageNum,
      timer: allottedTime,
      timerRunning,
      currentTarget,
      currentLineTargets,
      feedbackMsg: '',
    });
  },

  startTimer: () => {
    const { page, timer } = get();
    if (page === 'game' && timer > 0) {
      set({ timerRunning: true });
    }
  },

  tickTimer: () => {
    const { page, timer, timerRunning, stage } = get();
    if (page !== 'game' || !timerRunning || timer <= 0) return;

    const next = timer - 1;
    if (next <= 0) {
      get().startStage(stage);
      set({ feedbackMsg: 'หมดเวลา! ระบบเริ่มรอบนี้ใหม่ให้แล้ว ลองอีกครั้งนะ' });
    } else {
      set({ timer: next });
    }
  },

  validateSubmission: (layer: any) => {
    const { stage, currentTarget, currentLineTargets, timer, timerRunning, score } = get();
    if (!timerRunning) {
      return { success: false, message: 'กรุณากดปุ่ม “เล่น” ก่อนเริ่มตรวจคำตอบ' };
    }
    if (!layer) {
      return { success: false, message: 'คุณยังไม่ได้ปักหมุด หรือวาดข้อมูล Vector บนแผนที่' };
    }

    let isCorrect = false;
    let statsHtml = '';

    let base = 0;
    let allotted = 90;

    if (stage === 1) {
      base = SCORE_CONFIG.point.base;
      allotted = SCORE_CONFIG.point.time;

      if (!layer.attributeData) {
        return { success: false, message: "กรุณากดปุ่ม 'บันทึก Attribute Data' ใน Pop-up ให้เรียบร้อยก่อนครับ" };
      }
      if (!currentTarget) return { success: false };

      const userLatLng = layer.getLatLng();
      const distance = userLatLng.distanceTo([currentTarget.lat, currentTarget.lng]);
      if (distance < 180) {
        isCorrect = true;
      }
    } else if (stage === 2) {
      base = SCORE_CONFIG.line.base;
      allotted = SCORE_CONFIG.line.time;

      const latlngs = layer.getLatLngs() as L.LatLng[];
      isCorrect = latlngs.length >= 2 && lineVisitsTargetsInOrder(latlngs, currentLineTargets, 150);

      const lengthM = calculateLineLengthMeters(latlngs);
      statsHtml = `
        <div class="stat-row"><span>ความยาวเส้นที่วาด (Length)</span><b>${(lengthM / 1000).toFixed(2)} กม.</b></div>
        <div class="stat-row"><span>จำนวนจุดหัก (Vertices)</span><b>${latlngs.length}</b></div>
      `;
    } else if (stage === 3) {
      base = SCORE_CONFIG.polygon.base;
      allotted = SCORE_CONFIG.polygon.time;

      const targetPoly = L.polygon(PLASTIC_POND_BOUNDS);
      isCorrect = layer.getBounds().contains(targetPoly.getBounds());

      const latlngs = layer.getLatLngs()[0] as L.LatLng[];
      const areaM2 = calculateGeodesicArea(latlngs);
      const perimeterM = calculatePerimeterMeters(latlngs);

      statsHtml = `
        <div class="stat-row"><span>พื้นที่ที่วาด (Area)</span><b>${Math.round(areaM2).toLocaleString('th-TH')} ตร.ม.</b></div>
        <div class="stat-row"><span>เส้นรอบรูป (Perimeter)</span><b>${perimeterM.toFixed(1)} ม.</b></div>
      `;
    }

    if (isCorrect) {
      const timeUsed = Math.max(0, allotted - timer);
      const bonus = computeSpeedBonus(base, timeUsed, allotted);
      const roundScore = base + bonus;
      const newTotal = score + roundScore;

      statsHtml += `<div class="stat-row"><span>คะแนนรอบนี้ (ฐาน ${base}${bonus > 0 ? ' + โบนัสเร็ว ' + bonus : ''})</span><b>+${roundScore} คะแนน</b></div>`;
      if (bonus > 0) {
        statsHtml += `<div class="stat-row" style="background:#fef9c3;"><span>ทำเวลาไว</span><b>ใช้เวลา ${timeUsed}s จาก ${allotted}s</b></div>`;
      }

      set({
        score: newTotal,
        modalStatsHtml: statsHtml,
        timerRunning: false,
        activeModal: 'knowledge',
      });
      return { success: true };
    } else {
      const msg =
        stage === 2
          ? 'เส้นยังไม่ผ่านครบทั้ง 3 จุดตามลำดับ (ต้องอยู่ในรัศมีประมาณ 150 เมตรจากแต่ละจุด) ลองใหม่อีกครั้ง'
          : 'ตำแหน่งหรือรูปทรงยังไม่ถูกต้อง ลองใหม่อีกครั้ง';
      return { success: false, message: msg };
    }
  },

  nextStep: () => {
    const { stage, pointRoundIndex, lineRoundIndex } = get();
    set({ activeModal: null });

    if (stage === 1 && pointRoundIndex < SCORE_CONFIG.point.rounds - 1) {
      set({ pointRoundIndex: pointRoundIndex + 1 });
      get().startStage(1);
    } else if (stage === 1) {
      get().startStage(2);
    } else if (stage === 2 && lineRoundIndex < SCORE_CONFIG.line.rounds - 1) {
      set({ lineRoundIndex: lineRoundIndex + 1 });
      get().startStage(2);
    } else if (stage === 2) {
      get().startStage(3);
    } else {
      // Completed all stages!
      set({ activeModal: 'complete' });
      get().loadLeaderboard();
    }
  },

  openModal: (modal) => {
    set({ activeModal: modal });
    if (modal === 'leaderboard') {
      get().loadLeaderboard();
    }
  },

  closeModal: () => set({ activeModal: null }),

  loadLeaderboard: async () => {
    set({ isLoadingLeaderboard: true });
    try {
      const res = await fetch('/api/leaderboard?mission=vector');
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
    const { score } = get();
    set({ saveStatus: 'กำลังบันทึกลงฐานข้อมูล...' });

    try {
      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: playerName.trim().slice(0, 30),
          score,
          mode: 'vector_all',
          mission: 'vector',
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

    const res = await submitScoreToBackend(playerName, score, 'vector_all');
    set({
      savedRank: res.rank,
      leaderboard: res.list,
      isLeaderboardLocal: true,
      saveStatus: `บันทึกคะแนนเรียบร้อย ✓ อันดับ #${res.rank}`,
    });
    return true;
  },
}));
