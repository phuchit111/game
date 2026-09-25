import React, { useEffect, useState } from 'react';
import { useRSStore } from '../../store/rsStore';
import { RS_BANDS } from '../../constants/rsData';
import { Palette, Send, Info, Eye, Target, Lightbulb, Clock3, AlertTriangle } from 'lucide-react';

export const RSMixerStage: React.FC = () => {
  const channelR = useRSStore((s) => s.channelR);
  const channelG = useRSStore((s) => s.channelG);
  const channelB = useRSStore((s) => s.channelB);
  const mixed = useRSStore((s) => s.mixed);
  const mixerTime = useRSStore((s) => s.mixerTime);
  const mixerTimerRunning = useRSStore((s) => s.mixerTimerRunning);
  const mixerLocked = useRSStore((s) => s.mixerLocked);
  const mixerVerdict = useRSStore((s) => s.mixerVerdict);

  const selectBand = useRSStore((s) => s.selectBand);
  const mixImage = useRSStore((s) => s.mixImage);
  const submitMixer = useRSStore((s) => s.submitMixer);
  const tickMixerTimer = useRSStore((s) => s.tickMixerTimer);

  const [showBriefing, setShowBriefing] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Timer interval
  useEffect(() => {
    if (!mixerTimerRunning || mixerLocked) return;
    const interval = setInterval(() => {
      tickMixerTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [mixerTimerRunning, mixerLocked, tickMixerTimer]);

  const formatTimer = (sec: number) => {
    const s = Math.max(0, sec);
    const m = Math.floor(s / 60);
    const remainder = s % 60;
    return `${String(m).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

  const chosenBands = [channelR, channelG, channelB];
  const allPicked = chosenBands.every(Boolean);
  const hasDupes = allPicked && new Set(chosenBands).size !== 3;
  const combo = allPicked ? `${channelR}_${channelG}_${channelB}` : '';
  const canMix = allPicked && !hasDupes && !mixerLocked;
  const canSubmit = mixed && !mixerLocked;

  return (
    <div className="rs-mixer-stage" style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Intro Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
              ภารกิจที่ 2 · BAND COMBINATION MIXER
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              ผสมแถบคลื่นดาวเทียม ขอนแก่น
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
            <span>คำแนะนำและเกณฑ์คะแนน</span>
          </button>
        </div>
        <p style={{ color: '#94a3b8', fontSize: 14.5, marginTop: 8, lineHeight: 1.6 }}>
          นำข้อมูลภาพถ่ายดาวเทียม Sentinel-2 บริเวณจังหวัดขอนแก่นมาผสมแถบคลื่นลงช่องสี <b>Red / Green / Blue</b> เพื่อเน้นพื้นที่ <b>ป่าไม้และพืชพรรณ</b> ให้เด่นชัดที่สุด
        </p>
      </div>

      {/* Target Notice Box */}
      <div
        className="rs-mixer-notice"
        style={{
          background: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: 12,
          padding: '14px 18px',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
          <span className="rs-mixer-target-title" style={{ fontSize: 14.5, fontWeight: 700, color: '#fde68a' }}>
            <Target size={15} /> ภารกิจหลัก: ผสมภาพให้เห็น "ป่าไม้ / พืชพรรณ" ชัดเจนที่สุด
          </span>
          <span className="rs-mixer-time" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#cbd5e1' }}><Clock3 size={13} /> เวลา: 2 นาที (120 วินาที)</span>
        </div>
        <div className="rs-mixer-hint" style={{ fontSize: 12.5, color: '#fef3c7' }}>
          <Lightbulb size={14} style={{ verticalAlign: 'middle' }} /> คำใบ้ทางวิทยาศาสตร์: พืชพรรณที่สมบูรณ์สะท้อนคลื่นอินฟราเรดใกล้ <b>B8 (NIR)</b> สูงมาก การนำ B8 ไปใส่ในช่องสีที่ถูกต้องจะทำให้เห็นป่าไม้เป็นสีแดงสดเด่นชัด
        </div>
      </div>

      {/* Band Combination Concept Table */}
      <section style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 14, padding: '20px', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', marginTop: 0, marginBottom: 12 }}>
          <Palette size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> หลักการผสมแถบคลื่น (Band Combination)
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.15)', color: '#94a3b8', textAlign: 'left' }}>
                <th style={{ padding: '8px 10px' }}>ตำแหน่งแถบคลื่น B8 (NIR)</th>
                <th style={{ padding: '8px 10px' }}>ผลลัพธ์ที่ปรากฏในภาพ</th>
                <th style={{ padding: '8px 10px' }}>ระดับความเหมาะสม</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <td style={{ padding: '10px', fontWeight: 700, color: '#60a5fa', fontFamily: 'monospace' }}>
                  R = B8, G = B4, B = B3
                </td>
                <td style={{ padding: '10px', color: '#cbd5e1' }}>
                  พืชพรรณสมบูรณ์ปรากฏเป็นสีแดงสดเด่นชัดที่สุด (False Color Standard)
                </td>
                <td style={{ padding: '10px' }}>
                  <span style={{ background: 'rgba(34, 197, 94, 0.2)', border: '1px solid rgba(34, 197, 94, 0.4)', color: '#4ade80', padding: '2px 8px', borderRadius: 6, fontSize: 11.5, fontWeight: 700 }}>
                    ถูกต้องที่สุด
                  </span>
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <td style={{ padding: '10px', fontWeight: 700, color: '#fbbf24', fontFamily: 'monospace' }}>
                  G = B8 (เช่น R=B4, G=B8, B=B3)
                </td>
                <td style={{ padding: '10px', color: '#cbd5e1' }}>
                  พืชพรรณออกโทนเขียว/เหลือง พอสังเกตได้ แต่ไม่เด่นเท่าอยู่ช่อง Red
                </td>
                <td style={{ padding: '10px' }}>
                  <span style={{ background: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.4)', color: '#fbbf24', padding: '2px 8px', borderRadius: 6, fontSize: 11.5, fontWeight: 700 }}>
                    ใกล้เคียง
                  </span>
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <td style={{ padding: '10px', fontWeight: 700, color: '#f87171', fontFamily: 'monospace' }}>
                  B = B8 (เช่น R=B4, G=B3, B=B8)
                </td>
                <td style={{ padding: '10px', color: '#cbd5e1' }}>
                  พืชพรรณกลายเป็นโทนม่วง/น้ำเงินผิดธรรมชาติ แยกยาก
                </td>
                <td style={{ padding: '10px' }}>
                  <span style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#f87171', padding: '2px 8px', borderRadius: 6, fontSize: 11.5, fontWeight: 700 }}>
                    ยังไม่เหมาะ
                  </span>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '10px', fontWeight: 700, color: '#94a3b8', fontFamily: 'monospace' }}>
                  ไม่มี B8 (เช่น B4, B3, B2)
                </td>
                <td style={{ padding: '10px', color: '#cbd5e1' }}>
                  คือภาพสีธรรมชาติ (True Color) ไม่มีข้อมูลคลื่น NIR ช่วยเน้นพืชพรรณ
                </td>
                <td style={{ padding: '10px' }}>
                  <span style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#f87171', padding: '2px 8px', borderRadius: 6, fontSize: 11.5, fontWeight: 700 }}>
                    ไม่เหมาะ
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Mixer Channel Control Matrix */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: '1.5rem' }}>
        {/* Channel RED */}
        <div className="rs-channel-card rs-channel-red" style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 12, padding: '14px 18px' }}>
          <div className="rs-channel-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 14, fontWeight: 700, color: '#f87171' }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
            <span>ช่องสีแดง (RED CHANNEL)</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 8 }}>
            {RS_BANDS.map((b) => {
              const active = channelR === b.id;
              return (
                <button
                  key={b.id}
                  className={`rs-band-choice ${active ? 'active' : ''}`}
                  disabled={mixerLocked}
                  onClick={() => selectBand('r', b.id)}
                  style={{
                    background: active ? '#ef4444' : 'rgba(255, 255, 255, 0.05)',
                    border: active ? '1px solid #f87171' : '1px solid rgba(255, 255, 255, 0.12)',
                    color: active ? '#ffffff' : '#cbd5e1',
                    padding: '8px 12px',
                    borderRadius: 8,
                    cursor: mixerLocked ? 'not-allowed' : 'pointer',
                    fontSize: 12.5,
                    fontWeight: 600,
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {b.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Channel GREEN */}
        <div className="rs-channel-card rs-channel-green" style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: 12, padding: '14px 18px' }}>
          <div className="rs-channel-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 14, fontWeight: 700, color: '#4ade80' }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e' }} />
            <span>ช่องสีเขียว (GREEN CHANNEL)</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 8 }}>
            {RS_BANDS.map((b) => {
              const active = channelG === b.id;
              return (
                <button
                  key={b.id}
                  className={`rs-band-choice ${active ? 'active' : ''}`}
                  disabled={mixerLocked}
                  onClick={() => selectBand('g', b.id)}
                  style={{
                    background: active ? '#22c55e' : 'rgba(255, 255, 255, 0.05)',
                    border: active ? '1px solid #4ade80' : '1px solid rgba(255, 255, 255, 0.12)',
                    color: active ? '#ffffff' : '#cbd5e1',
                    padding: '8px 12px',
                    borderRadius: 8,
                    cursor: mixerLocked ? 'not-allowed' : 'pointer',
                    fontSize: 12.5,
                    fontWeight: 600,
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {b.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Channel BLUE */}
        <div className="rs-channel-card rs-channel-blue" style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: 12, padding: '14px 18px' }}>
          <div className="rs-channel-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 14, fontWeight: 700, color: '#60a5fa' }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#3b82f6' }} />
            <span>ช่องสีน้ำเงิน (BLUE CHANNEL)</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 8 }}>
            {RS_BANDS.map((b) => {
              const active = channelB === b.id;
              return (
                <button
                  key={b.id}
                  className={`rs-band-choice ${active ? 'active' : ''}`}
                  disabled={mixerLocked}
                  onClick={() => selectBand('b', b.id)}
                  style={{
                    background: active ? '#2563eb' : 'rgba(255, 255, 255, 0.05)',
                    border: active ? '1px solid #60a5fa' : '1px solid rgba(255, 255, 255, 0.12)',
                    color: active ? '#ffffff' : '#cbd5e1',
                    padding: '8px 12px',
                    borderRadius: 8,
                    cursor: mixerLocked ? 'not-allowed' : 'pointer',
                    fontSize: 12.5,
                    fontWeight: 600,
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {b.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Buttons & Timer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            className="rs-inline-primary-button"
            onClick={() => {
              setImgError(false);
              mixImage();
            }}
            disabled={!canMix}
            style={{
              background: canMix ? '#2563eb' : 'rgba(255, 255, 255, 0.1)',
              border: canMix ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.1)',
              color: canMix ? '#ffffff' : '#64748b',
              padding: '10px 20px',
              borderRadius: 8,
              cursor: canMix ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            <Palette size={16} />
            <span>ผสมภาพ</span>
          </button>

          <button
            className="rs-inline-primary-button"
            onClick={submitMixer}
            disabled={!canSubmit}
            style={{
              background: canSubmit ? '#16a34a' : 'rgba(255, 255, 255, 0.1)',
              border: canSubmit ? '1px solid #22c55e' : '1px solid rgba(255, 255, 255, 0.1)',
              color: canSubmit ? '#ffffff' : '#64748b',
              padding: '10px 20px',
              borderRadius: 8,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            <Send size={16} />
            <span>ส่งคำตอบ</span>
          </button>

          {hasDupes && (
            <span style={{ fontSize: 13, color: '#f87171' }}>
              <AlertTriangle size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> เลือกแถบคลื่นซ้ำกันไม่ได้ ต้องเป็น 3 แถบที่ต่างกัน
            </span>
          )}
        </div>

        {/* Timer */}
        <div
          className="rs-mixer-verdict"
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            background: mixerTime <= 20 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(15, 23, 42, 0.8)',
            border: mixerTime <= 20 ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255, 255, 255, 0.12)',
            color: mixerTime <= 20 ? '#f87171' : '#cbd5e1',
            fontFamily: 'monospace',
            fontSize: 16,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: mixerTime <= 20 ? '#ef4444' : '#22c55e' }} />
          <span>{formatTimer(mixerTime)}</span>
        </div>
      </div>

      {/* Result Verdict */}
      {mixerVerdict && (
        <div
          style={{
            padding: '16px 20px',
            borderRadius: 10,
            marginBottom: '1.5rem',
            background: mixerVerdict.tier === 'good' ? 'rgba(34, 197, 94, 0.15)' : mixerVerdict.tier === 'mid' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: mixerVerdict.tier === 'good' ? '1px solid rgba(34, 197, 94, 0.4)' : mixerVerdict.tier === 'mid' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: mixerVerdict.tier === 'good' ? '#4ade80' : mixerVerdict.tier === 'mid' ? '#fbbf24' : '#f87171' }}>
              {mixerVerdict.label}
            </span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', background: 'rgba(0,0,0,0.3)', padding: '2px 10px', borderRadius: 12 }}>
              {mixerVerdict.points} คะแนน
            </span>
          </div>
          <div style={{ fontSize: 13.5, color: '#e2e8f0', lineHeight: 1.6 }}>
            {mixerVerdict.detail}
          </div>
        </div>
      )}

      {/* Satellite Image Viewfinder */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.9)',
          border: '2px solid rgba(59, 130, 246, 0.3)',
          borderRadius: 14,
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          minHeight: 380,
          boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
        }}
      >
        {!mixed || !combo ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 20px' }}>
            <Eye size={40} style={{ opacity: 0.4, marginBottom: 12 }} />
            <div style={{ fontSize: 16, fontWeight: 600 }}>ยังไม่ได้ผสมภาพ</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>
              เลือกแถบคลื่นทั้ง 3 ช่องสี (Red, Green, Blue) แล้วกดปุ่ม <b>"ผสมภาพ"</b>
            </div>
          </div>
        ) : imgError ? (
          <div style={{ textAlign: 'center', color: '#f87171', padding: '40px 20px' }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>ไม่พบภาพผสมสีชุดนี้</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>
              ({combo}.png)
            </div>
          </div>
        ) : (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img
              src={`/images/rs/${combo}.png`}
              alt={`Sentinel-2 Composite ${combo}`}
              onError={() => setImgError(true)}
              style={{
                maxWidth: '100%',
                maxHeight: 520,
                borderRadius: 8,
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                objectFit: 'contain',
              }}
            />
            <div
              style={{
                marginTop: 12,
                padding: '6px 14px',
                borderRadius: 20,
                background: 'rgba(0, 0, 0, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                fontSize: 12.5,
                fontWeight: 700,
                color: '#cbd5e1',
                fontFamily: 'monospace',
              }}
            >
              RED = {channelR} | GREEN = {channelG} | BLUE = {channelB}
            </div>
          </div>
        )}
      </div>

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
            className="rs-mixer-viewfinder"
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
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}><Info size={16} style={{ verticalAlign: 'middle', marginRight: 5 }} /> วิธีเล่น & เกณฑ์คะแนน</h3>
              <button
                onClick={() => setShowBriefing(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 20, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <div style={{ fontSize: 13.5, color: '#cbd5e1', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <b>1. โจทย์:</b> เลือกผสมแถบคลื่นอย่างไรจึงจะเห็น "ป่าไม้ / พืชพรรณ" ในภาพถ่ายดาวเทียม Sentinel-2 บริเวณขอนแก่นได้เด่นชัดที่สุด
              </div>
              <div>
                <b>2. ขั้นตอน:</b> เลือก 1 แถบคลื่นให้กับแต่ละช่องสี Red, Green, Blue (ห้ามซ้ำกัน) แล้วกด "ผสมภาพ" จากนั้นกด "ส่งคำตอบ"
              </div>
              <div>
                <b>3. วิธีคิดคะแนน:</b>
                <ul style={{ margin: '6px 0 0 18px', padding: 0 }}>
                  <li>สูตรมาตรฐานสากล (R=B8, G=B4, B=B3): <b>100 คะแนน</b></li>
                  <li>โบนัสเวลา (Speed Bonus): สูงสุด <b>30 คะแนน</b></li>
                  <li>โบนัสตอบถูกครั้งแรก: <b>20 คะแนน</b></li>
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
