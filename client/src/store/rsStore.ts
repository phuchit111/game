import { create } from 'zustand';
import type { MixerVerdict, RSLeaderboardEntry } from '../types/rsMission';
import { RS_STEPS, RS_QUIZ } from '../constants/rsData';
import { SoundFX } from '../utils/soundFX';
import confetti from 'canvas-confetti';

interface RSState {
  // Navigation & Preferences
  activeTab: 'process' | 'mixer' | 'theory';
  theoryAcknowledged: boolean;
  soundEnabled: boolean;
  toggleSound: () => void;
  setActiveTab: (tab: 'process' | 'mixer' | 'theory') => void;
  completeTheory: () => void;

  // Stage 1: RS Process
  selectedStepIds: number[];
  processTime: number;
  processTimerRunning: boolean;
  processPassed: boolean;
  processLocked: boolean;
  processBaseScore: number;
  processSpeedBonus: number;
  processFeedback: { type: 'good' | 'bad' | ''; message: string; submessage?: string };

  // Stage 1 Quiz
  quizIndex: number;
  quizScore: number;
  quizFinished: boolean;
  quizFeedback: { type: 'good' | 'bad' | ''; message: string };

  // Stage 2: Band Mixer
  channelR: string | null;
  channelG: string | null;
  channelB: string | null;
  mixed: boolean;
  mixerTime: number;
  mixerTimerRunning: boolean;
  mixerLocked: boolean;
  mixerScore: number;
  mixerAttempts: number;
  mixerVerdict: MixerVerdict | null;

  // Leaderboard & Submission
  leaderboard: RSLeaderboardEntry[];
  isLoadingLeaderboard: boolean;
  isLeaderboardLocal: boolean;
  savedRank: number | null;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';

  // Actions
  resetMission: () => void;
  pickStep: (id: number) => void;
  undoStep: () => void;
  resetSteps: () => void;
  checkProcess: () => void;
  tickProcessTimer: () => void;
  answerQuiz: (answerIdx: number) => void;

  selectBand: (channel: 'r' | 'g' | 'b', bandId: string) => void;
  mixImage: () => void;
  submitMixer: () => void;
  tickMixerTimer: () => void;

  totalScore: () => number;
  loadLeaderboard: () => Promise<void>;
  submitScore: (playerName: string) => Promise<void>;
}

export const useRSStore = create<RSState>((set, get) => ({
  resetMission: () => {
    set({
      activeTab: 'theory',
      theoryAcknowledged: false,
      selectedStepIds: [],
      processTime: 90,
      processTimerRunning: false,
      processPassed: false,
      processLocked: false,
      processBaseScore: 0,
      processSpeedBonus: 0,
      processFeedback: { type: '', message: '' },
      quizIndex: 0,
      quizScore: 0,
      quizFinished: false,
      quizFeedback: { type: '', message: '' },
      channelR: null,
      channelG: null,
      channelB: null,
      mixed: false,
      mixerTime: 120,
      mixerTimerRunning: false,
      mixerLocked: false,
      mixerScore: 0,
      mixerAttempts: 0,
      mixerVerdict: null,
      savedRank: null,
      saveStatus: 'idle',
    });
  },
  activeTab: 'theory',
  theoryAcknowledged: false,
  soundEnabled: SoundFX.enabled,
  toggleSound: () => {
    const next = SoundFX.toggle();
    set({ soundEnabled: next });
  },
  setActiveTab: (tab) => {
    const { theoryAcknowledged } = get();
    if (tab !== 'theory' && !theoryAcknowledged) return;
    SoundFX.click();
    set({ activeTab: tab });
  },
  completeTheory: () => {
    SoundFX.correct();
    set({ theoryAcknowledged: true });
  },

  // Stage 1 initial
  selectedStepIds: [],
  processTime: 90,
  processTimerRunning: false,
  processPassed: false,
  processLocked: false,
  processBaseScore: 0,
  processSpeedBonus: 0,
  processFeedback: { type: '', message: '' },

  quizIndex: 0,
  quizScore: 0,
  quizFinished: false,
  quizFeedback: { type: '', message: '' },

  // Stage 2 initial
  channelR: null,
  channelG: null,
  channelB: null,
  mixed: false,
  mixerTime: 120,
  mixerTimerRunning: false,
  mixerLocked: false,
  mixerScore: 0,
  mixerAttempts: 0,
  mixerVerdict: null,

  // Leaderboard initial
  leaderboard: [],
  isLoadingLeaderboard: false,
  isLeaderboardLocal: false,
  savedRank: null,
  saveStatus: 'idle',

  // Stage 1 actions
  pickStep: (id) => {
    const { selectedStepIds, processLocked, processTimerRunning, processPassed } = get();
    if (processLocked) return;
    if (selectedStepIds.includes(id)) {
      SoundFX.undo();
      set({
        selectedStepIds: selectedStepIds.filter((stepId) => stepId !== id),
        processFeedback: { type: '', message: '' },
      });
      return;
    }
    SoundFX.pick();
    const next = [...selectedStepIds, id];
    set({
      selectedStepIds: next,
      processTimerRunning: !processPassed && !processTimerRunning ? true : processTimerRunning,
    });
  },

  undoStep: () => {
    const { selectedStepIds, processLocked } = get();
    if (processLocked || !selectedStepIds.length) return;
    SoundFX.undo();
    set({ selectedStepIds: selectedStepIds.slice(0, -1) });
  },

  resetSteps: () => {
    const { processLocked } = get();
    if (processLocked) return;
    SoundFX.click();
    set({
      selectedStepIds: [],
      processFeedback: { type: '', message: '' },
    });
  },

  checkProcess: () => {
    const { selectedStepIds, processLocked, processTime } = get();
    if (processLocked || selectedStepIds.length !== RS_STEPS.length) return;

    const ok = selectedStepIds.every((id, i) => id === RS_STEPS[i].id);
    if (ok) {
      SoundFX.correct();
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      const base = 100;
      const speed = Math.max(0, Math.round((processTime / 90) * 20));
      set({
        processLocked: true,
        processTimerRunning: false,
        processPassed: true,
        processBaseScore: base,
        processSpeedBonus: speed,
        processFeedback: {
          type: 'good',
          message: 'ถูกต้องยอดเยี่ยม!',
          submessage: `คุณเข้าใจลำดับทั้ง 8 ขั้นตอนของ Remote Sensing อย่างแม่นยำ (คะแนนภารกิจ ${base} + โบนัสเวลา ${speed} = ${base + speed} คะแนน)`,
        },
      });
    } else {
      SoundFX.wrong();
      const correctCount = selectedStepIds.filter((id, i) => id === RS_STEPS[i].id).length;
      const base = Math.round((correctCount / RS_STEPS.length) * 100);
      set({
        processBaseScore: base,
        processFeedback: {
          type: 'bad',
          message: 'ยังไม่ถูกต้องทั้งหมด',
          submessage: `คุณวางถูกตำแหน่ง ${correctCount} จาก ${RS_STEPS.length} ขั้นตอน (ปัจจุบันได้รับ ${base} คะแนน) เวลายังเหลือ ลองกด "ย้อนกลับ 1 ขั้น" หรือ "เริ่มเรียงใหม่" เพื่อแก้ไข`,
        },
      });
    }
  },

  tickProcessTimer: () => {
    const { processTime, processTimerRunning, processLocked, selectedStepIds } = get();
    if (!processTimerRunning || processLocked) return;
    const nextTime = processTime - 1;
    if (nextTime <= 0) {
      const ok = selectedStepIds.length === RS_STEPS.length && selectedStepIds.every((id, i) => id === RS_STEPS[i].id);
      if (ok) {
        SoundFX.correct();
        set({
          processTime: 0,
          processTimerRunning: false,
          processLocked: true,
          processPassed: true,
          processBaseScore: 100,
          processSpeedBonus: 0,
          processFeedback: {
            type: 'good',
            message: 'ถูกต้องทันเวลาพอดี!',
            submessage: 'คุณเรียงลำดับครบทั้ง 8 ขั้นตอนถูกต้อง (ได้รับคะแนนภารกิจ 100 คะแนน)',
          },
        });
      } else {
        SoundFX.wrong();
        const penalty = -20;
        set({
          processTime: 0,
          processTimerRunning: false,
          processLocked: true,
          // Timeout is a completed attempt: keep the penalty, but unlock the quiz
          // and the next stage so the learner is never trapped in this mission.
          processPassed: true,
          processBaseScore: penalty,
          processSpeedBonus: 0,
          processFeedback: {
            type: 'bad',
            message: 'หมดเวลา! คุณยังเรียงลำดับไม่ถูกต้อง (ถูกหัก 20 คะแนน)',
            submessage: 'ระบบหัก 20 คะแนนเนื่องจากหมดเวลา แต่คุณสามารถทำคำถามเช็กความเข้าใจเพื่อเก็บคะแนนชดเชย และไปลุยด่านที่ 2 ต่อได้',
          },
        });
      }
    } else {
      set({ processTime: nextTime });
    }
  },

  answerQuiz: (answerIdx) => {
    const { quizIndex, quizFinished, quizScore } = get();
    if (quizFinished || quizIndex >= RS_QUIZ.length) return;

    const currentQ = RS_QUIZ[quizIndex];
    const isCorrect = answerIdx === currentQ.c;

    if (isCorrect) {
      SoundFX.correct();
      const nextScore = quizScore + 10;
      const nextIdx = quizIndex + 1;
      const isDone = nextIdx >= RS_QUIZ.length;
      if (isDone) {
        SoundFX.victory();
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      }
      set({
        quizScore: nextScore,
        quizIndex: nextIdx,
        quizFinished: isDone,
        quizFeedback: {
          type: 'good',
          message: 'ถูกต้อง! +10 คะแนนโบนัส',
        },
      });
    } else {
      SoundFX.wrong();
      const nextIdx = quizIndex + 1;
      const isDone = nextIdx >= RS_QUIZ.length;
      set({
        quizIndex: nextIdx,
        quizFinished: isDone,
        quizFeedback: {
          type: 'bad',
          message: `ยังไม่ถูก คำตอบที่ถูกต้องคือ: "${currentQ.a[currentQ.c]}"`,
        },
      });
    }
  },

  // Stage 2 actions
  selectBand: (channel, bandId) => {
    const { mixerLocked, mixerTimerRunning } = get();
    if (mixerLocked) return;
    SoundFX.pick();

    const update: Partial<RSState> = {
      mixed: false,
      mixerVerdict: null,
      mixerTimerRunning: !mixerTimerRunning ? true : mixerTimerRunning,
    };
    if (channel === 'r') update.channelR = bandId;
    if (channel === 'g') update.channelG = bandId;
    if (channel === 'b') update.channelB = bandId;

    set(update);
  },

  mixImage: () => {
    const { mixerLocked, mixerTimerRunning, channelR, channelG, channelB } = get();
    if (mixerLocked || !channelR || !channelG || !channelB) return;
    SoundFX.click();
    set({
      mixed: true,
      mixerTimerRunning: !mixerTimerRunning ? true : mixerTimerRunning,
    });
  },

  submitMixer: () => {
    const { mixerLocked, mixed, channelR, channelG, channelB, mixerTime, mixerAttempts } = get();
    if (mixerLocked || !mixed || !channelR || !channelG || !channelB) return;

    const attempts = mixerAttempts + 1;

    if (channelR === 'B8') {
      const base = 100;
      const speedBonus = Math.max(0, Math.round((mixerTime / 120) * 30));
      const firstTryBonus = attempts === 1 ? 20 : 0;
      const totalStage2 = base + speedBonus + firstTryBonus;

      SoundFX.victory();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

      set({
        mixerAttempts: attempts,
        mixerScore: totalStage2,
        mixerLocked: true,
        mixerTimerRunning: false,
        mixerVerdict: {
          tier: 'good',
          points: totalStage2,
          label: 'ถูกต้องยอดเยี่ยม! นี่คือ False Color Standard (ชุดมาตรฐานสากล)',
          detail: `B8 (NIR) อยู่ช่อง Red ทำให้พืชพรรณสมบูรณ์สะท้อนพลังงานแรงและปรากฏเป็นสีแดงสดเด่นชัดที่สุด (คะแนนฐาน ${base} + โบนัสเวลา ${speedBonus} + ตอบถูกครั้งแรก ${firstTryBonus} = ${totalStage2} คะแนน)`,
        },
      });
    } else if (channelG === 'B8') {
      SoundFX.wrong();
      set({
        mixerAttempts: attempts,
        mixerScore: 50,
        mixerVerdict: {
          tier: 'mid',
          points: 50,
          label: 'ใกล้เคียง แต่ยังไม่ใช่คำตอบที่ดีที่สุด',
          detail: 'B8 อยู่ช่อง Green พืชพรรณจะออกโทนเขียว/เหลือง พอสังเกตได้ แต่ไม่เด่นเท่าการนำ NIR ไว้ช่อง Red ลองสลับ B8 ไปช่อง Red แล้วผสมใหม่',
        },
      });
    } else if (channelB === 'B8') {
      SoundFX.wrong();
      set({
        mixerAttempts: attempts,
        mixerScore: 20,
        mixerVerdict: {
          tier: 'bad',
          points: 20,
          label: 'ยังไม่เหมาะกับโจทย์นี้',
          detail: 'B8 อยู่ช่อง Blue พืชพรรณจะกลายเป็นโทนม่วง/น้ำเงินผิดธรรมชาติ แยกป่าไม้ออกจากผืนน้ำหรือพื้นที่อื่นได้ยาก ย้าย B8 ไปช่อง Red ดูครับ',
        },
      });
    } else {
      SoundFX.wrong();
      set({
        mixerAttempts: attempts,
        mixerScore: 0,
        mixerVerdict: {
          tier: 'bad',
          points: 0,
          label: 'ไม่มีข้อมูลคลื่นอินฟราเรดใกล้ (NIR) เลย',
          detail: 'ชุดนี้ไม่มี B8 อยู่เลย เท่ากับภาพสีธรรมชาติ (True Color) ซึ่งแยกพืชพรรณออกจากพื้นที่อื่นได้ยาก ลองเลือกใส่ B8 (NIR) เข้าไปในช่อง Red',
        },
      });
    }
  },

  tickMixerTimer: () => {
    const { mixerTime, mixerTimerRunning, mixerLocked } = get();
    if (!mixerTimerRunning || mixerLocked) return;
    const nextTime = mixerTime - 1;
    if (nextTime <= 0) {
      SoundFX.wrong();
      set({
        mixerTime: 0,
        mixerTimerRunning: false,
        mixerLocked: true,
        mixerScore: 0,
        mixerVerdict: {
          tier: 'bad',
          points: 0,
          label: 'หมดเวลา (0 คะแนน)',
          detail: 'คำตอบที่ถูกต้องที่สุดคือ R = B8, G = B4, B = B3 (False Color Standard) เพื่อให้พืชพรรณปรากฏเป็นสีแดงสดเด่นชัด',
        },
      });
    } else {
      set({ mixerTime: nextTime });
    }
  },

  totalScore: () => {
    const { processBaseScore, processSpeedBonus, quizScore, mixerScore } = get();
    return processBaseScore + processSpeedBonus + quizScore + mixerScore;
  },

  loadLeaderboard: async () => {
    set({ isLoadingLeaderboard: true });
    try {
      const res = await fetch('/api/leaderboard?mission=rs');
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
      const raw = localStorage.getItem('rs_grand_leaderboard');
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
    const name = playerName.trim() || 'GeoAnalyst';
    const score = get().totalScore();
    set({ saveStatus: 'saving' });

    try {
      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          score,
          mode: 'rs_campaign',
          mission: 'rs',
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
      // Fallback
    }

    // LocalStorage fallback
    const raw = localStorage.getItem('rs_grand_leaderboard');
    const list: RSLeaderboardEntry[] = raw ? JSON.parse(raw) : [];
    const newEntry: RSLeaderboardEntry = {
      name,
      score,
      mode: 'rs_campaign',
      mission: 'rs',
      date: new Date().toISOString(),
    };
    list.push(newEntry);
    list.sort((a, b) => b.score - a.score);
    const top20 = list.slice(0, 20);
    localStorage.setItem('rs_grand_leaderboard', JSON.stringify(top20));
    const rank = top20.findIndex((e) => e.name === name && e.score === score) + 1;

    set({
      saveStatus: 'saved',
      savedRank: rank > 0 ? rank : 1,
      leaderboard: top20,
      isLeaderboardLocal: true,
    });
  },
}));
