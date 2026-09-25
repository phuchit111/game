import React, { useState, useEffect, useMemo } from 'react';
import { useRSStore } from '../../store/rsStore';
import { RS_STEPS, RS_QUIZ } from '../../constants/rsData';
import { Info, RotateCcw, Undo2, CheckCircle2, ArrowRight, HelpCircle, LockKeyhole, Clock3 } from 'lucide-react';

export const RSProcessStage: React.FC = () => {
  const selectedStepIds = useRSStore((s) => s.selectedStepIds);
  const processTime = useRSStore((s) => s.processTime);
  const processTimerRunning = useRSStore((s) => s.processTimerRunning);
  const processPassed = useRSStore((s) => s.processPassed);
  const processLocked = useRSStore((s) => s.processLocked);
  const processBaseScore = useRSStore((s) => s.processBaseScore);
  const processSpeedBonus = useRSStore((s) => s.processSpeedBonus);
  const processFeedback = useRSStore((s) => s.processFeedback);

  const quizIndex = useRSStore((s) => s.quizIndex);
  const quizScore = useRSStore((s) => s.quizScore);
  const quizFinished = useRSStore((s) => s.quizFinished);
  const quizFeedback = useRSStore((s) => s.quizFeedback);

  const pickStep = useRSStore((s) => s.pickStep);
  const undoStep = useRSStore((s) => s.undoStep);
  const resetSteps = useRSStore((s) => s.resetSteps);
  const checkProcess = useRSStore((s) => s.checkProcess);
  const tickProcessTimer = useRSStore((s) => s.tickProcessTimer);
  const answerQuiz = useRSStore((s) => s.answerQuiz);
  const setActiveTab = useRSStore((s) => s.setActiveTab);

  const [showBriefing, setShowBriefing] = useState(false);

  // Shuffled steps for display
  const displaySteps = useMemo(() => {
    const shuffled = [...RS_STEPS];
    let seed = 20260913;
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const j = seed % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  // Timer interval
  useEffect(() => {
    if (!processTimerRunning || processLocked) return;
    const interval = setInterval(() => {
      tickProcessTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [processTimerRunning, processLocked, tickProcessTimer]);

  const formatTimer = (sec: number) => {
    const s = Math.max(0, sec);
    const m = Math.floor(s / 60);
    const remainder = s % 60;
    return `${String(m).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

  const isAllPicked = selectedStepIds.length === RS_STEPS.length;

  return (
    <div className="rs-process-stage" style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Intro Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
              ภารกิจที่ 1 · REMOTE SENSING PROCESS
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              ตามรอยพลังงานจากดวงอาทิตย์
            </h2>
          </div>
          <button
            className="rs-inline-secondary-button"
            onClick={() => setShowBriefing(true)}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#cbd5e1',
              padding: '6px 12px',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12.5,
            }}
          >
            <Info size={15} />
            <span>คำแนะนำและวิธีเล่น</span>
          </button>
        </div>
        <p style={{ color: '#94a3b8', fontSize: 14.5, marginTop: 8, lineHeight: 1.6 }}>
          คลิกการ์ดตามลำดับกระบวนการที่ถูกต้อง ตั้งแต่ <b>พลังงานเริ่มต้นจากดวงอาทิตย์</b> → <b>ภาพดาวเทียมสำหรับวิเคราะห์</b>
        </p>
      </div>

      {/* Challenge Notice Box */}
      <div
        className="rs-process-notice"
        style={{
          background: 'rgba(30, 41, 59, 0.6)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: 12,
          padding: '14px 18px',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ fontSize: 14.5, fontWeight: 700, color: '#f8fafc', marginBottom: 4 }}>
          คุณคือนักวิเคราะห์ข้อมูลดาวเทียม จงเรียงลำดับ 8 ขั้นตอนให้ถูกต้อง
        </div>
        <div style={{ fontSize: 12.5, color: '#94a3b8' }}>
          <Clock3 size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} /> มีเวลา 90 วินาที · ยิ่งเสร็จเร็วยิ่งได้คะแนนโบนัสความเร็วสูงสุด 20 คะแนน · สามารถย้อนกลับและตรวจใหม่ได้ตราบใดที่เวลายังไม่หมด
        </div>
      </div>

      {/* Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '1.5rem' }}>
        {displaySteps.map((step) => {
          const selectedIndex = selectedStepIds.indexOf(step.id);
          const isSelected = selectedIndex !== -1;

          return (
            <div
              key={step.id}
              className={`rs-process-card ${isSelected ? 'selected' : ''}`}
              onClick={() => pickStep(step.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  pickStep(step.id);
                }
              }}
              role="button"
              tabIndex={processLocked ? -1 : 0}
              aria-pressed={isSelected}
              style={{
                background: isSelected ? 'rgba(37, 99, 235, 0.2)' : 'rgba(30, 41, 59, 0.7)',
                border: isSelected ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 10,
                padding: '12px 16px',
                cursor: processLocked || isSelected ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? '0 0 0 1px #3b82f6 inset' : 'none',
              }}
            >
              <div
                className="rs-process-card-number"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: isSelected ? '#2563eb' : 'rgba(255, 255, 255, 0.08)',
                  color: isSelected ? '#ffffff' : '#94a3b8',
                  border: isSelected ? '1px solid #60a5fa' : '1px solid rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 13,
                  flexShrink: 0,
                  fontFamily: 'monospace',
                }}
              >
                {isSelected ? selectedIndex + 1 : '+'}
              </div>

              <div>
                <div className="rs-process-card-title" style={{ fontSize: 14.5, fontWeight: 700, color: isSelected ? '#ffffff' : '#e2e8f0' }}>
                  {step.title}
                </div>
                <div className="rs-process-card-detail" style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 2 }}>
                  {step.detail}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Row & Timer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            className="rs-inline-secondary-button"
            onClick={undoStep}
            disabled={processLocked || selectedStepIds.length === 0}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#cbd5e1',
              padding: '9px 16px',
              borderRadius: 8,
              cursor: processLocked || selectedStepIds.length === 0 ? 'not-allowed' : 'pointer',
              opacity: processLocked || selectedStepIds.length === 0 ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <Undo2 size={15} />
            <span>ย้อนกลับ 1 ขั้น</span>
          </button>

          <button
            className="rs-inline-secondary-button"
            onClick={resetSteps}
            disabled={processLocked || selectedStepIds.length === 0}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#cbd5e1',
              padding: '9px 16px',
              borderRadius: 8,
              cursor: processLocked || selectedStepIds.length === 0 ? 'not-allowed' : 'pointer',
              opacity: processLocked || selectedStepIds.length === 0 ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <RotateCcw size={15} />
            <span>เริ่มเรียงใหม่</span>
          </button>

          <button
            className="rs-inline-primary-button"
            onClick={checkProcess}
            disabled={processLocked || !isAllPicked}
            style={{
              background: isAllPicked && !processLocked ? '#2563eb' : 'rgba(255, 255, 255, 0.1)',
              border: isAllPicked && !processLocked ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.1)',
              color: isAllPicked && !processLocked ? '#ffffff' : '#64748b',
              padding: '9px 20px',
              borderRadius: 8,
              cursor: processLocked || !isAllPicked ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13.5,
              fontWeight: 700,
            }}
          >
            <CheckCircle2 size={16} />
            <span>ตรวจคำตอบ</span>
          </button>
        </div>

        {/* Countdown Timer */}
        <div
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            background: processTime <= 20 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(15, 23, 42, 0.8)',
            border: processTime <= 20 ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255, 255, 255, 0.12)',
            color: processTime <= 20 ? '#f87171' : '#cbd5e1',
            fontFamily: 'monospace',
            fontSize: 16,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: processTime <= 20 ? '#ef4444' : '#22c55e' }} />
          <span>{formatTimer(processTime)}</span>
        </div>
      </div>

      {/* Feedback Message */}
      {processFeedback.message && (
        <div
          style={{
            padding: '16px 20px',
            borderRadius: 10,
            marginBottom: '2rem',
            background: processFeedback.type === 'good' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: processFeedback.type === 'good' ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700, color: processFeedback.type === 'good' ? '#4ade80' : '#f87171', marginBottom: 4 }}>
            {processFeedback.message}
          </div>
          {processFeedback.submessage && (
            <div style={{ fontSize: 13.5, color: '#e2e8f0', lineHeight: 1.6 }}>
              {processFeedback.submessage}
            </div>
          )}
        </div>
      )}

      {/* Section 2: Quiz Check */}
      <section
        className="rs-quiz-section"
        style={{
          marginTop: '2.5rem',
          padding: '24px',
          borderRadius: 14,
          background: 'rgba(30, 41, 59, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <HelpCircle size={18} color="#60a5fa" />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', margin: 0 }}>
              เช็กความเข้าใจ (คะแนนโบนัส 30 คะแนน)
            </h3>
          </div>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>
            คะแนนควิซ: <b style={{ color: '#60a5fa' }}>{quizScore} / 30</b>
          </span>
        </div>

        {!processPassed && !processLocked ? (
          <div style={{ color: '#94a3b8', fontSize: 13.5, padding: '20px', textAlign: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
            <LockKeyhole size={15} style={{ verticalAlign: 'middle', marginRight: 5 }} /> ผ่านภารกิจเรียงลำดับ 8 ขั้นตอนก่อน หรือรอจนหมดเวลาเพื่อปลดล็อกคำถามเช็กความเข้าใจ
          </div>
        ) : quizFinished ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#4ade80', marginBottom: 6 }}>
              <CheckCircle2 size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} /> ยินดีด้วย! คุณตอบคำถามครบทั้ง 3 ข้อแล้ว
            </div>
            <p style={{ color: '#cbd5e1', fontSize: 14 }}>
              คะแนนสะสมด่านที่ 1 ทั้งหมด: <b>{processBaseScore + processSpeedBonus + quizScore} คะแนน</b>
            </p>

            {/* Next Mission Card */}
            <div
              style={{
                marginTop: '1.5rem',
                background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(30, 41, 59, 0.8) 100%)',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                borderRadius: 12,
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 14,
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', marginBottom: 4 }}>
                  พร้อมลุยด่านต่อไปแล้วหรือยัง?
                </div>
                <div style={{ fontSize: 13, color: '#cbd5e1' }}>
                  ด่านที่ 2: ผสมแถบคลื่นดาวเทียม Sentinel-2 ค้นหาป่าไม้ขอนแก่น
                </div>
              </div>
              <button
                className="rs-inline-primary-button"
                onClick={() => setActiveTab('mixer')}
                style={{
                  background: '#2563eb',
                  border: 'none',
                  color: '#ffffff',
                  padding: '10px 20px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                }}
              >
                <span>ลุยต่อ ด่านที่ 2: ผสมแถบคลื่น</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#f8fafc', marginBottom: 14 }}>
              ข้อที่ {quizIndex + 1} / {RS_QUIZ.length}: {RS_QUIZ[quizIndex].q}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
              {RS_QUIZ[quizIndex].a.map((ans, idx) => (
                <button
                  className="rs-quiz-answer"
                  key={idx}
                  onClick={() => answerQuiz(idx)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#e2e8f0',
                    padding: '12px 16px',
                    borderRadius: 8,
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: 13.5,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {ans}
                </button>
              ))}
            </div>

            {quizFeedback.message && (
              <div
                style={{
                  marginTop: 14,
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: 13,
                  background: quizFeedback.type === 'good' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: quizFeedback.type === 'good' ? '#4ade80' : '#f87171',
                  border: quizFeedback.type === 'good' ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                }}
              >
                {quizFeedback.message}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Briefing Modal */}
      {showBriefing && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            style={{
              background: '#1e293b',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 16,
              maxWidth: 580,
              width: '100%',
              padding: '24px',
              color: '#f8fafc',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}><Info size={16} style={{ verticalAlign: 'middle', marginRight: 5 }} /> คำแนะนำและวิธีเล่น</h3>
              <button
                onClick={() => setShowBriefing(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 20, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <div style={{ fontSize: 13.5, color: '#cbd5e1', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <b>1. เป้าหมายภารกิจ:</b> เรียงลำดับกระบวนการ Remote Sensing ทั้ง 8 ขั้นตอน ตั้งแต่พลังงานจากดวงอาทิตย์ จนกลายเป็นภาพถ่ายดาวเทียม
              </div>
              <div>
                <b>2. วิธีเล่น:</b> คลิกเลือกการ์ดตามลำดับ 1 ถึง 8 หากเลือกผิดสามารถกด "ย้อนกลับ 1 ขั้น" หรือ "เริ่มเรียงใหม่" เมื่อครบ 8 การ์ดกด "ตรวจคำตอบ"
              </div>
              <div>
                <b>3. วิธีคิดคะแนนของภารกิจแรก:</b>
                <ul style={{ margin: '6px 0 0 18px', padding: 0 }}>
                  <li>เรียงถูกต้องครบ 8 ขั้นตอน: <b>100 คะแนน</b></li>
                  <li>โบนัสเวลา (Speed Bonus): สูงสุด <b>20 คะแนน</b></li>
                  <li>ควิซเช็กความเข้าใจ 3 ข้อ: <b>30 คะแนน</b> (ข้อละ 10 คะแนน)</li>
                </ul>
              </div>
            </div>
            <button
              onClick={() => setShowBriefing(false)}
              style={{
                width: '100%',
                marginTop: 20,
                padding: '10px',
                background: '#2563eb',
                border: 'none',
                borderRadius: 8,
                color: '#ffffff',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              เข้าใจแล้ว เริ่มภารกิจ!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
