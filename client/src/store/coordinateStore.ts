import { create } from 'zustand';
import type { CoordinateLeaderboardEntry, GlobeTarget, UTMTarget } from '../types/coordinateMission';
import { gridToUTM, randInt, GRID_X_MIN, GRID_X_MAX, GRID_Y_MIN, GRID_Y_MAX, fmtNum } from '../constants/coordinateData';
import { REFERENCE_LAT, REFERENCE_LON } from '../constants/coordinateData';
import { SoundFX } from '../utils/soundFX';
import confetti from 'canvas-confetti';

const ROUNDS_PER_PHASE = 5;
const POINTS_PER_ROUND = 2;
export const MAX_COORDINATE_SCORE = ROUNDS_PER_PHASE * POINTS_PER_ROUND * 2; // 20

type GlobeMarker = {
  lat: number;
  lon: number;
  color: string;
  isTarget?: boolean;
  label?: string;
};

interface KnowledgeModalState {
  open: boolean;
  title: string;
  html: string;
  nextLabel: string;
  onNext: () => void;
}

interface CoordinateState {
  page: 'start' | 'brief' | 'game';
  setPage: (page: 'start' | 'brief' | 'game') => void;

  phase: 'A' | 'B';
  roundIndex: number;
  score: number;
  timer: number;
  timerTotal: number;
  timerRunning: boolean;

  // Phase A: UTM Grid
  roundTypeA: 'plot' | 'read';
  targetA: UTMTarget | null;
  markersA: Array<{ x: number; y: number; color: string }>;
  guideA: { x: number; y: number } | null;
  activeBaseLayer: 'street' | 'satellite';
  setActiveBaseLayer: (layer: 'street' | 'satellite') => void;

  // Phase B: 3D Globe
  targetB: GlobeTarget | null;
  globeMarkers: GlobeMarker[];

  // Feedback & Modals
  toast: { ok: boolean; text: string } | null;
  setToast: (toast: { ok: boolean; text: string } | null) => void;
  modal: KnowledgeModalState;
  closeModal: () => void;
  missionCompleted: boolean;

  // Leaderboard
  leaderboard: CoordinateLeaderboardEntry[];
  isLoadingLeaderboard: boolean;
  isLeaderboardLocal: boolean;
  savedRank: number | null;
  saveStatus: 'idle' | 'saving' | 'saved';

  // Game Flow
  beginMission: () => void;
  startRoundA: (round: number) => void;
  clickPlotA: (guessX: number, guessY: number) => void;
  submitReadA: (easting: number, northing: number) => void;
  finishRoundA: (correct: boolean) => void;

  transitionToPhaseB: () => void;
  startRoundB: (round: number) => void;
  clickGlobeB: (latGuess: number, lonGuess: number) => void;
  finishRoundB: (correct: boolean) => void;

  tickTimer: () => void;
  loadLeaderboard: () => Promise<void>;
  submitScore: (playerName: string) => Promise<void>;
}

export const useCoordinateStore = create<CoordinateState>((set, get) => ({
  page: 'start',
  setPage: (page) => {
    SoundFX.click();
    set({ page });
  },

  phase: 'A',
  roundIndex: 0,
  score: 0,
  timer: 90,
  timerTotal: 90,
  timerRunning: false,

  roundTypeA: 'plot',
  targetA: null,
  markersA: [],
  guideA: null,
  activeBaseLayer: 'street',
  setActiveBaseLayer: (layer) => {
    SoundFX.click();
    set({ activeBaseLayer: layer });
  },

  targetB: null,
  globeMarkers: [],

  toast: null,
  setToast: (toast) => set({ toast }),
  modal: {
    open: false,
    title: '',
    html: '',
    nextLabel: '',
    onNext: () => {},
  },
  closeModal: () => {
    const { modal } = get();
    set({ modal: { ...modal, open: false } });
  },
  missionCompleted: false,

  leaderboard: [],
  isLoadingLeaderboard: false,
  isLeaderboardLocal: false,
  savedRank: null,
  saveStatus: 'idle',

  beginMission: () => {
    set({
      score: 0,
      phase: 'A',
      page: 'game',
      missionCompleted: false,
      modal: {
        open: true,
        title: 'พิกัด UTM (Easting / Northing) คืออะไร?',
        html: 'ระบบพิกัด <b>UTM โซน 48 Datum WGS84</b> ครอบคลุมพื้นที่ประเทศไทยตอนบน ลาว และเวียดนาม — โดยแปลงหน่วยเป็น "เมตร" บนพื้นโลกจริง — <b>Easting (E)</b> คือระยะทางไปทางตะวันออก (เส้นเมริเดียนกลางกำหนดเป็น False Easting = <b>500,000 เมตร</b>) และ <b>Northing (N)</b> คือระยะทางขึ้นเหนือจากศูนย์สูตร (บริเวณนี้ประมาณ <b>1,600,000 เมตร</b>) จุดอ้างอิงกลางกริดคือ <b>E=500,000 N=1,600,000</b> โดยแต่ละช่องตารางคือ <b>จัตุรัสแสนเมตร (100,000 × 100,000 เมตร หรือ 100 กม.)</b> ลองคลิกวางจุดตามพิกัดที่กำหนด แล้วลองอ่านพิกัดดู!',
        nextLabel: 'เริ่มเลย',
        onNext: () => {
          get().closeModal();
          get().startRoundA(1);
        },
      },
    });
  },

  startRoundA: (round) => {
    const isRead = round % 2 === 0;
    let x: number, y: number;
    do {
      x = randInt(GRID_X_MIN + 1, GRID_X_MAX - 1);
      y = randInt(GRID_Y_MIN + 1, GRID_Y_MAX - 1);
    } while (x === 0 && y === 0);

    const target = gridToUTM(x, y);
    const initialMarkers = isRead ? [{ x, y, color: '#2563eb' }] : [];

    set({
      roundIndex: round,
      roundTypeA: isRead ? 'read' : 'plot',
      targetA: target,
      markersA: initialMarkers,
      guideA: null,
      timer: 90,
      timerTotal: 90,
      timerRunning: true,
      toast: null,
    });
  },

  clickPlotA: (guessX, guessY) => {
    const { targetA, timerRunning, markersA } = get();
    if (!timerRunning || !targetA) return;

    const correct = guessX === targetA.x && guessY === targetA.y;
    const color = correct ? '#16a34a' : '#dc2626';
    set({ markersA: [...markersA, { x: guessX, y: guessY, color }] });

    if (correct) {
      SoundFX.correct();
      set({
        timerRunning: false,
        toast: { ok: true, text: `ถูกต้อง! (E=${fmtNum(targetA.E)}, N=${fmtNum(targetA.N)})` },
      });
      setTimeout(() => get().finishRoundA(true), 600);
    } else {
      SoundFX.wrong();
      const guessUTM = gridToUTM(guessX, guessY);
      set({
        toast: { ok: false, text: `ยังไม่ตรง ลองใหม่ (คลิกที่ E=${fmtNum(guessUTM.E)}, N=${fmtNum(guessUTM.N)})` },
      });
    }
  },

  submitReadA: (easting, northing) => {
    const { targetA, timerRunning } = get();
    if (!timerRunning || !targetA) return;

    const correct = easting === targetA.E && northing === targetA.N;
    if (correct) {
      SoundFX.correct();
      set({
        timerRunning: false,
        toast: { ok: true, text: `ถูกต้อง! (E=${fmtNum(targetA.E)}, N=${fmtNum(targetA.N)})` },
      });
      setTimeout(() => get().finishRoundA(true), 600);
    } else {
      SoundFX.wrong();
      set({
        toast: { ok: false, text: 'ยังไม่ตรง ลองอ่านค่าแกน Easting และ Northing ดูใหม่อีกครั้ง' },
      });
    }
  },

  finishRoundA: (correct) => {
    const { score, roundIndex, targetA } = get();
    if (!targetA) return;

    const newScore = correct ? score + POINTS_PER_ROUND : score;
    const isLastRound = roundIndex >= ROUNDS_PER_PHASE;

    set({
      timerRunning: false,
      score: newScore,
      guideA: { x: targetA.x, y: targetA.y },
      modal: {
        open: true,
        title: correct ? 'ยินดีด้วย ตอบถูกต้อง!' : 'หมดเวลา ไม่เป็นไรนะ',
        html: correct
          ? `เก่งมาก! พิกัดที่ถูกต้องคือ <b>E=${fmtNum(targetA.E)}, N=${fmtNum(targetA.N)}</b><br>คุณได้รับ +${POINTS_PER_ROUND} คะแนน (รวม ${newScore} / ${MAX_COORDINATE_SCORE})`
          : `เฉลย: พิกัดที่ถูกต้องคือ <b>E=${fmtNum(targetA.E)}, N=${fmtNum(targetA.N)}</b><br>ตารางด้านหลังจะแสดงจุดสีเหลืองและเส้นนำทางไปยังตำแหน่งที่ถูกต้อง ลองใหม่ในรอบถัดไปนะ!`,
        nextLabel: isLastRound ? 'ไปต่อส่วนที่ 2 (ลูกโลก 3 มิติ)' : `ไปต่อ (รอบ ${roundIndex + 1}/${ROUNDS_PER_PHASE})`,
        onNext: () => {
          get().closeModal();
          if (!isLastRound) {
            get().startRoundA(roundIndex + 1);
          } else {
            get().transitionToPhaseB();
          }
        },
      },
    });
  },

  transitionToPhaseB: () => {
    set({
      modal: {
        open: true,
        title: 'ทีนี้มาลองบนลูกโลกจริงกันบ้าง!',
        html: 'บนโลกทรงกลม เราใช้ <b>Latitude (เส้นรุ้ง)</b> วัดจากเส้นศูนย์สูตร (0°) ขึ้นเหนือหรือลงใต้ ถึง 90° และ <b>Longitude (เส้นแวง)</b> วัดจากเส้นเมริเดียนแรก (0°) ไปตะวันออกหรือตะวันตก ถึง 180° เส้นสีเหลืองบนลูกโลกคือเส้นศูนย์สูตรและเมริเดียนแรก ลองหมุนลูกโลกแล้วคลิกหาตำแหน่งที่กำหนดดู!',
        nextLabel: 'เริ่มส่วนที่ 2',
        onNext: () => {
          get().closeModal();
          set({ phase: 'B' });
          get().startRoundB(1);
        },
      },
    });
  },

  startRoundB: (round) => {
    // Keep the globe challenge aligned with the survey map reference point.
    const lat = REFERENCE_LAT;
    const lon = REFERENCE_LON;
    const latLabel = `${Math.abs(lat)}°${lat >= 0 ? 'N' : 'S'}`;
    const lonLabel = `${Math.abs(lon)}°${lon >= 0 ? 'E' : 'W'}`;

    set({
      roundIndex: round,
      targetB: { lat, lon, latLabel, lonLabel },
      globeMarkers: [],
      timer: 120,
      timerTotal: 120,
      timerRunning: true,
      toast: null,
    });
  },

  clickGlobeB: (latGuess, lonGuess) => {
    const { targetB, timerRunning, globeMarkers } = get();
    if (!timerRunning || !targetB) return;

    const latDiff = Math.abs(latGuess - targetB.lat);
    const lonDiff = Math.abs(((lonGuess - targetB.lon + 540) % 360) - 180);
    const correct = latDiff <= 10 && lonDiff <= 15;

    const color = correct ? '#16a34a' : '#dc2626';
    set({ globeMarkers: [...globeMarkers, { lat: latGuess, lon: lonGuess, color }] });

    if (correct) {
      SoundFX.correct();
      set({
        timerRunning: false,
        toast: { ok: true, text: `ใกล้เคียงมาก! Lat ${latGuess.toFixed(0)}°, Lon ${lonGuess.toFixed(0)}°` },
      });
      setTimeout(() => get().finishRoundB(true), 600);
    } else {
      SoundFX.wrong();
      set({
        toast: { ok: false, text: `ยังไม่ตรง (คลิกที่ Lat ${latGuess.toFixed(0)}°, Lon ${lonGuess.toFixed(0)}°) ลองหมุนลูกโลกใหม่` },
      });
    }
  },

  finishRoundB: (correct) => {
    const { score, roundIndex, targetB, globeMarkers } = get();
    if (!targetB) return;

    const newScore = correct ? score + POINTS_PER_ROUND : score;
    const isLastRound = roundIndex >= ROUNDS_PER_PHASE;
    const revealedTarget: GlobeMarker = {
      lat: targetB.lat,
      lon: targetB.lon,
      color: '#f59e0b',
      isTarget: true,
      label: `Lat ${targetB.latLabel}, Lon ${targetB.lonLabel}`,
    };

    if (isLastRound) {
      SoundFX.victory();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }

    set({
      timerRunning: false,
      score: newScore,
      globeMarkers: correct ? globeMarkers : [...globeMarkers, revealedTarget],
      missionCompleted: isLastRound,
      modal: {
        open: true,
        title: isLastRound
          ? correct
            ? 'จบภารกิจระบบพิกัด!'
            : 'หมดเวลา — เฉลยตำแหน่งสุดท้าย'
          : correct
          ? 'ยินดีด้วย ตำแหน่งถูกต้อง!'
          : 'หมดเวลา ไม่เป็นไรนะ',
        html: isLastRound
          ? `${correct ? `คุณทำคะแนนได้ <b>${newScore} / ${MAX_COORDINATE_SCORE} คะแนน</b>!` : `หมดเวลาในรอบสุดท้าย คุณทำคะแนนได้ <b>${newScore} / ${MAX_COORDINATE_SCORE} คะแนน</b>`} ตอนนี้คุณเข้าใจทั้งพิกัด UTM (Easting/Northing) บนระนาบ และ Latitude/Longitude บนทรงกลม 3 มิติแล้ว ทั้งสองระบบนี้คือรากฐานของการอ้างอิงตำแหน่งในโลก GIS ทั้งหมด${correct ? '' : '<br>ลูกโลกด้านหลังแสดงจุดสีเหลืองและซูมไปยังตำแหน่งที่ถูกต้องแล้ว'}`
          : correct
          ? `เยี่ยมมาก! ตำแหน่งคือ <b>Lat ${targetB.latLabel}, Lon ${targetB.lonLabel}</b><br>คุณได้รับ +${POINTS_PER_ROUND} คะแนน (รวม ${newScore} / ${MAX_COORDINATE_SCORE})`
          : `เฉลย: ตำแหน่งที่ถูกต้องคือ <b>Lat ${targetB.latLabel}, Lon ${targetB.lonLabel}</b><br>ลูกโลกด้านหลังจะแสดงจุดเฉลยพร้อมซูมไปยังตำแหน่งนั้นให้ดูชัดเจน ลองใหม่ในรอบถัดไปนะ!`,
        nextLabel: isLastRound ? 'ดูผลคะแนนและบันทึกอันดับ' : `ไปต่อ (รอบ ${roundIndex + 1}/${ROUNDS_PER_PHASE})`,
        onNext: () => {
          get().closeModal();
          if (!isLastRound) {
            get().startRoundB(roundIndex + 1);
          }
        },
      },
    });
  },

  tickTimer: () => {
    const { timer, timerRunning, phase } = get();
    if (!timerRunning) return;
    const next = timer - 1;
    if (next <= 0) {
      SoundFX.wrong();
      set({ timer: 0, timerRunning: false });
      if (phase === 'A') {
        get().finishRoundA(false);
      } else {
        get().finishRoundB(false);
      }
    } else {
      set({ timer: next });
    }
  },

  loadLeaderboard: async () => {
    set({ isLoadingLeaderboard: true });
    try {
      const res = await fetch('/api/leaderboard?mission=coordinate');
      const json = await res.json();
      if (json.ok && Array.isArray(json.data)) {
        set({
          leaderboard: json.data,
          isLoadingLeaderboard: false,
          isLeaderboardLocal: false,
        });
        return;
      }
    } catch {
      // Offline fallback
    }

    try {
      const raw = localStorage.getItem('coordinate_leaderboard');
      const local = raw ? JSON.parse(raw) : [];
      set({
        leaderboard: local,
        isLoadingLeaderboard: false,
        isLeaderboardLocal: true,
      });
    } catch {
      set({
        leaderboard: [],
        isLoadingLeaderboard: false,
        isLeaderboardLocal: true,
      });
    }
  },

  submitScore: async (playerName) => {
    const name = playerName.trim() || 'Cartographer';
    const score = get().score;
    set({ saveStatus: 'saving' });

    try {
      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          score,
          mode: 'utm_globe',
          mission: 'coordinate',
        }),
      });
      const data = await res.json();
      if (data.ok) {
        set({
          saveStatus: 'saved',
          savedRank: data.data.rank,
          leaderboard: data.data.topList,
          isLeaderboardLocal: false,
        });
        return;
      }
    } catch {
      // Offline
    }

    // Local fallback
    const raw = localStorage.getItem('coordinate_leaderboard');
    const list: CoordinateLeaderboardEntry[] = raw ? JSON.parse(raw) : [];
    const newEntry: CoordinateLeaderboardEntry = {
      name,
      score,
      mode: 'utm_globe',
      mission: 'coordinate',
      date: new Date().toISOString(),
    };
    list.push(newEntry);
    list.sort((a, b) => b.score - a.score);
    const top20 = list.slice(0, 20);
    localStorage.setItem('coordinate_leaderboard', JSON.stringify(top20));
    const rank = top20.findIndex((e) => e.name === name && e.score === score) + 1;

    set({
      saveStatus: 'saved',
      savedRank: rank > 0 ? rank : 1,
      leaderboard: top20,
      isLeaderboardLocal: true,
    });
  },
}));
