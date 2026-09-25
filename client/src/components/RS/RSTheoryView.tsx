import React, { useState } from 'react';
import { useRSStore } from '../../store/rsStore';
import { ArrowRight, BookOpen, Rocket, Palette, CheckCircle2, LockKeyhole } from 'lucide-react';

const VISIBLE_LIGHT_COLORS = [
  { id: 'purple', label: 'ม่วง', symbol: 'P', color: '#7c3aed' },
  { id: 'blue', label: 'น้ำเงิน', symbol: 'B', color: '#2563eb' },
  { id: 'green', label: 'เขียว', symbol: 'G', color: '#22c55e' },
  { id: 'yellow', label: 'เหลือง', symbol: 'Y', color: '#eab308' },
  { id: 'orange', label: 'ส้ม', symbol: 'O', color: '#f97316' },
  { id: 'red', label: 'แดง', symbol: 'R', color: '#ef4444' },
] as const;

const shuffleVisibleColors = () => {
  const shuffled = [...VISIBLE_LIGHT_COLORS];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
};

export const RSTheoryView: React.FC = () => {
  const setActiveTab = useRSStore((s) => s.setActiveTab);
  const theoryAcknowledged = useRSStore((s) => s.theoryAcknowledged);
  const completeTheory = useRSStore((s) => s.completeTheory);
  const [selectedColorIds, setSelectedColorIds] = useState<Array<string | null>>(() => Array(VISIBLE_LIGHT_COLORS.length).fill(null));
  const [shuffledColors, setShuffledColors] = useState(() => shuffleVisibleColors());
  const [colorOrderStatus, setColorOrderStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [draggedColorId, setDraggedColorId] = useState<string | null>(null);
  const [dragOverSlotIndex, setDragOverSlotIndex] = useState<number | null>(null);

  const placeColorInSlot = (colorId: string, slotIndex: number) => {
    if (colorOrderStatus === 'success') return;
    setSelectedColorIds((current) => {
      const next = [...current];
      const sourceIndex = next.indexOf(colorId);

      if (sourceIndex === slotIndex) return next;
      if (sourceIndex === -1 && next[slotIndex] !== null) return next;

      if (sourceIndex !== -1) {
        next[sourceIndex] = next[slotIndex];
      }
      next[slotIndex] = colorId;
      return next;
    });
  };

  const pickColorForOrder = (colorId: string) => {
    if (selectedColorIds.includes(colorId) || colorOrderStatus === 'success') return;
    const firstEmptySlot = selectedColorIds.indexOf(null);
    if (firstEmptySlot !== -1) placeColorInSlot(colorId, firstEmptySlot);
  };

  const removeColorFromSlot = (slotIndex: number) => {
    if (colorOrderStatus === 'success') return;
    setSelectedColorIds((current) => {
      const next = [...current];
      next[slotIndex] = null;
      return next;
    });
  };

  const checkColorOrder = () => {
    if (selectedColorIds.some((id) => id === null)) return;
    const correctOrder = VISIBLE_LIGHT_COLORS.map((color) => color.id);
    setColorOrderStatus(selectedColorIds.every((id, index) => id === correctOrder[index]) ? 'success' : 'error');
  };

  const resetColorOrder = () => {
    setSelectedColorIds(Array(VISIBLE_LIGHT_COLORS.length).fill(null));
    setShuffledColors(shuffleVisibleColors());
    setColorOrderStatus('idle');
    setDraggedColorId(null);
    setDragOverSlotIndex(null);
  };

  const handleColorDragStart = (colorId: string) => {
    setDraggedColorId(colorId);
  };

  const handleColorDrop = (event: React.DragEvent<HTMLDivElement>, slotIndex: number) => {
    event.preventDefault();
    const colorId = draggedColorId ?? event.dataTransfer.getData('text/plain');
    if (colorId) placeColorInSlot(colorId, slotIndex);
    setDraggedColorId(null);
    setDragOverSlotIndex(null);
  };

  return (
    <div className="rs-theory-stage" style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Intro */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
          ทฤษฎีและหลักการเชิงวิทยาศาสตร์
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#f8fafc', margin: 0 }}>
          ทำไมพืชพรรณถึงเด่นในภาพผสมสีบางชุด
        </h2>
        <p style={{ color: '#94a3b8', fontSize: 14.5, marginTop: 8, lineHeight: 1.6 }}>
          หลักการ Spectral Reflectance และการรับรู้ระยะไกล (Remote Sensing) เบื้องหลังการผสมภาพถ่ายดาวเทียม Sentinel-2
        </p>
      </div>

      {/* Video Embed */}
      <section style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 14, padding: '20px' }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: '#ffffff', marginTop: 0, marginBottom: 12 }}>
          <BookOpen size={16} style={{ verticalAlign: 'middle', marginRight: 5 }} /> วิดีโอประกอบการเรียนรู้ Remote Sensing
        </h3>
        <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 10 }}>
          <iframe
            src="https://www.youtube.com/embed/fAxZkezCT8s?si=EMfN0z7LI7mGqu_9"
            title="Remote Sensing Educational Video"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </section>

      {/* Spectral Reflectance Curve */}
      <section style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 14, padding: '20px' }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: '#ffffff', marginTop: 0, marginBottom: 6 }}>
          <BookOpen size={16} style={{ verticalAlign: 'middle', marginRight: 5 }} /> ค่าการสะท้อนพลังงานคลื่น (Spectral Reflectance)
        </h3>
        <p style={{ fontSize: 13.5, color: '#cbd5e1', lineHeight: 1.75, marginBottom: 14 }}>
          กราฟนี้แสดงสเปกตรัมแม่เหล็กไฟฟ้าหลักที่ใช้ในการตรวจจับระยะไกล โดยความยาวคลื่นจะเพิ่มขึ้นจากซ้ายไปขวา ตั้งแต่ 0.1 ถึง 0.4 ไมครอนเรียกว่า <b>รังสีอัลตราไวโอเลต (Ultraviolet)</b> ตั้งแต่ 0.4 ถึง 0.7 ไมครอนเรียกว่า <b>แสงที่มองเห็นได้ (Visible)</b> เพราะดวงตาของเรามองเห็นแสงในช่วงนี้ได้ ตั้งแต่ 0.7 ไมครอนถึง 1 มิลลิเมตรเรียกว่า <b>อินฟราเรด (Infrared)</b> และตั้งแต่ 1 มิลลิเมตรถึงประมาณ 1 เมตรเรียกว่า <b>ไมโครเวฟ (Microwave)</b>
        </p>

        <figure style={{ margin: '0 0 18px', padding: '14px', borderRadius: 10, background: 'rgba(248, 250, 252, 0.96)', border: '1px solid rgba(255, 255, 255, 0.12)', textAlign: 'center' }}>
          <img
            src="/images/rs/spectral-reflectance-reference.jpg"
            alt="กราฟค่าการสะท้อนพลังงานคลื่นของดิน พืชพรรณ และน้ำ"
            style={{ display: 'block', width: '100%', maxWidth: 620, height: 'auto', margin: '0 auto', borderRadius: 6 }}
          />
          <figcaption style={{ marginTop: 9, color: '#475569', fontSize: 12.5, lineHeight: 1.5 }}>
            ตัวอย่างค่าการสะท้อนพลังงานคลื่น: พืชพรรณจะสะท้อน NIR สูง ขณะที่น้ำสะท้อนพลังงานต่ำ และดินมีค่าการสะท้อนเพิ่มขึ้นตามความยาวคลื่น
          </figcaption>
        </figure>

        <div className="rs-spectrum-summary" style={{ padding: '14px 16px', borderRadius: 10, background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0', fontSize: 13.5, lineHeight: 1.75 }}>
          <strong style={{ display: 'block', color: '#f8fafc', marginBottom: 5 }}>สรุปสเปกตรัมแม่เหล็กไฟฟ้าและสีของแสง</strong>
          <p style={{ margin: 0 }}>
            ช่วงแสงที่ตามองเห็นอยู่ระหว่าง <b>0.4–0.7 ไมครอน</b> และเรียงจากความยาวคลื่นสั้นไปยาวได้เป็น <b>ม่วง → น้ำเงิน → เขียว → เหลือง → ส้ม → แดง</b> ส่วนอินฟราเรดและไมโครเวฟมองไม่เห็นด้วยตา แต่เซนเซอร์ดาวเทียมสามารถตรวจวัดพลังงานในช่วงเหล่านี้ได้ จึงนำไปใช้จำแนกพืชพรรณ น้ำ และดินในงาน Remote Sensing
          </p>
        </div>

      </section>

      {/* Wavelength guide + ordering game */}
      <section className="rs-knowledge-card rs-spectrum-guide">
        <div className="rs-card-kicker">เสริมความรู้ · WAVELENGTH GUIDE</div>
        <h3>สีที่เราเห็นสัมพันธ์กับช่วงคลื่นอย่างไร?</h3>
        <p className="rs-card-lead">
          แสงที่ตามองเห็นอยู่ประมาณ <b>400–700 นาโนเมตร (nm)</b> จากน้ำเงินไปเขียวและแดง ส่วน <b>อินฟราเรดใกล้ (NIR)</b> อยู่ถัดจากสีแดงประมาณ 700–1,100 nm จึงมองไม่เห็นด้วยตา แต่พืชสะท้อนช่วงนี้ได้แรงมาก
        </p>
        <div className="rs-spectrum-bar" aria-label="ช่วงคลื่นแสงที่มองเห็นและอินฟราเรดใกล้">
          <span className="rs-spectrum-visible-label">แสงที่ตามองเห็น 400–700 nm</span>
          <span className="rs-spectrum-nir-label">NIR 700–1,100 nm</span>
        </div>
        <div className="rs-spectrum-axis"><span>400 nm · น้ำเงิน</span><span>560 nm · เขียว</span><span>665 nm · แดง</span><span>842 nm · NIR</span></div>

        <div className="rs-order-game">
          <div className="rs-order-game-heading">
            <div>
              <div className="rs-card-kicker">MINI GAME · เรียงสีของแสง</div>
              <h4>กดเรียงสีจากความยาวคลื่นสั้น → ยาว</h4>
            </div>
            <button className="rs-reset-button" onClick={resetColorOrder}>เริ่มใหม่</button>
          </div>
          <p>ลากการ์ดสีลงในช่องตามลำดับจาก Ultraviolet ไป Infrared แล้วกด “ตรวจคำตอบ” (หรือคลิกสีเพื่อใส่ช่องถัดไป)</p>
          <div className="rs-color-order-row">
            <span className="rs-spectrum-endpoint ultraviolet">Ultraviolet</span>
            <div className="rs-color-order-slots">
              {VISIBLE_LIGHT_COLORS.map((_, index) => {
                const selectedId = selectedColorIds[index];
                const color = VISIBLE_LIGHT_COLORS.find((item) => item.id === selectedId);
                return (
                  <div
                    className={`rs-order-slot ${color ? 'filled' : ''} ${dragOverSlotIndex === index ? 'drag-over' : ''}`}
                    key={index}
                    draggable={Boolean(color) && colorOrderStatus !== 'success'}
                    onDragStart={(event) => {
                      if (!color) return;
                      event.dataTransfer.effectAllowed = 'move';
                      event.dataTransfer.setData('text/plain', color.id);
                      handleColorDragStart(color.id);
                    }}
                    onDragEnd={() => {
                      setDraggedColorId(null);
                      setDragOverSlotIndex(null);
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDragOverSlotIndex(index);
                    }}
                    onDragEnter={(event) => {
                      event.preventDefault();
                      setDragOverSlotIndex(index);
                    }}
                    onDragLeave={() => setDragOverSlotIndex(null)}
                    onDrop={(event) => handleColorDrop(event, index)}
                    onClick={() => color && removeColorFromSlot(index)}
                    role={color ? 'button' : undefined}
                    tabIndex={color ? 0 : -1}
                    onKeyDown={(event) => {
                      if (color && (event.key === 'Enter' || event.key === ' ' || event.key === 'Backspace' || event.key === 'Delete')) {
                        event.preventDefault();
                        removeColorFromSlot(index);
                      }
                    }}
                    aria-label={color ? `ล้างสี${color.label}จากช่องที่ ${index + 1}` : `ช่องเรียงสีที่ ${index + 1}`}
                    title={color ? 'คลิกเพื่อนำสีออกจากช่อง' : 'ลากสีมาวางที่ช่องนี้'}
                  >
                    <span>{index + 1}</span>
                    <strong style={{ color: color?.color }}>{color?.symbol ?? 'วาง'}</strong>
                    {color && <small>{color.label}</small>}
                  </div>
                );
              })}
            </div>
            <span className="rs-spectrum-endpoint infrared">Infrared</span>
          </div>
          <div className="rs-band-buttons rs-color-buttons">
            {shuffledColors.map((color) => (
              <button
                key={color.id}
                className="rs-color-button"
                data-color={color.id}
                disabled={selectedColorIds.includes(color.id) || colorOrderStatus === 'success'}
                onClick={() => pickColorForOrder(color.id)}
                draggable={!selectedColorIds.includes(color.id) && colorOrderStatus !== 'success'}
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = 'copy';
                  event.dataTransfer.setData('text/plain', color.id);
                  handleColorDragStart(color.id);
                }}
                onDragEnd={() => {
                  setDraggedColorId(null);
                  setDragOverSlotIndex(null);
                }}
                style={{ background: color.color }}
                aria-label={`ลากสี${color.label}ไปใส่ช่อง หรือคลิกเพื่อเลือก`}
              >
                <span>{color.symbol}</span>
                <span>{color.label}</span>
              </button>
            ))}
            <button
              className="rs-color-check-button"
              disabled={selectedColorIds.some((id) => id === null) || colorOrderStatus === 'success'}
              onClick={checkColorOrder}
            >
              ตรวจคำตอบ
            </button>
          </div>
          {colorOrderStatus !== 'idle' && (
            <div className={`rs-order-feedback ${colorOrderStatus}`}>
              {colorOrderStatus === 'success'
                ? '✓ ถูกต้อง! สีเรียงจากความยาวคลื่นสั้นไปยาวคือ ม่วง → น้ำเงิน → เขียว → เหลือง → ส้ม → แดง'
                : 'ยังไม่ถูก ลองเรียงจากสีม่วงไปสีแดง แล้วกดเริ่มใหม่อีกครั้ง'}
            </div>
          )}
        </div>
      </section>

      {/* References */}
      <section style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 14, padding: '20px' }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: '#ffffff', marginTop: 0, marginBottom: 10 }}>
          <BookOpen size={16} style={{ verticalAlign: 'middle', marginRight: 5 }} /> แหล่งอ้างอิงทางวิชาการ (References)
        </h3>
        <ul style={{ margin: 0, paddingLeft: 20, color: '#94a3b8', fontSize: 13, lineHeight: 1.8 }}>
          <li>
            <b>GIS Geography:</b> <em>Sentinel-2 Bands and Combinations</em> — มาตรฐานการผสมแถบคลื่นดาวเทียม Sentinel-2
          </li>
          <li>
            <b>ESA STEP Forum:</b> <em>List of band combinations for Sentinel-2</em> — ชุมชนผู้ใช้งานดาวเทียมองค์การอวกาศยุโรป
          </li>
          <li>
            <b>mundialis:</b> <em>How We Create Our Satellite Images</em> — หลักการ Colour Infrared และการจำแนกพืชพรรณ
          </li>
          <li>
            <b>satellittdata.no:</b> <em>False Colour Vegetation Composite</em> — การสะท้อนพลังงานคลื่น NIR ของสิ่งปกคลุมดิน
          </li>
        </ul>
      </section>

      {/* Required briefing acknowledgement */}
      <section
        aria-labelledby="rs-briefing-title"
        style={{
          background: theoryAcknowledged ? 'rgba(34, 197, 94, 0.12)' : 'linear-gradient(135deg, rgba(37, 99, 235, 0.18), rgba(30, 41, 59, 0.8))',
          border: theoryAcknowledged ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(96, 165, 250, 0.45)',
          borderRadius: 14,
          padding: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ color: theoryAcknowledged ? '#4ade80' : '#93c5fd', paddingTop: 2 }}>
            {theoryAcknowledged ? <CheckCircle2 size={22} /> : <LockKeyhole size={22} />}
          </div>
          <div style={{ flex: 1 }}>
            <h3 id="rs-briefing-title" style={{ fontSize: 17, fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              {theoryAcknowledged ? 'ปลดล็อกภารกิจแล้ว' : 'อ่านคำอธิบายและวิธีเล่นก่อนเริ่มภารกิจ'}
            </h3>
            <p style={{ color: '#cbd5e1', fontSize: 13.5, lineHeight: 1.65, margin: '8px 0 14px' }}>
              {theoryAcknowledged
                ? 'คุณอ่านเนื้อหาพื้นฐานและวิธีเล่นแล้ว กำลังเข้าสู่ภารกิจที่ 1'
                : 'ดูวิดีโอ ศึกษาแถบสเปกตรัมคลื่นแสง และทำความเข้าใจวิธีเล่นด้านบนให้เรียบร้อย จากนั้นกดปุ่มเพื่อเริ่มภารกิจที่ 1 ทันที'}
            </p>
            {!theoryAcknowledged && (
              <div className="rs-briefing-methods" style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
                <strong style={{ display: 'block', color: '#e2e8f0', fontSize: 13.5, marginBottom: 6 }}>วิธีเล่นที่ต้องรู้</strong>
                <ol style={{ margin: 0, paddingLeft: 20, color: '#cbd5e1', fontSize: 13, lineHeight: 1.7 }}>
                  <li>ภารกิจ 1: คลิกการ์ดเรียงกระบวนการ RS ทั้ง 8 ขั้นตอน แล้วตรวจคำตอบและทำแบบทดสอบให้ครบ</li>
                  <li>ภารกิจ 2: เลือกแถบคลื่นที่ไม่ซ้ำกันใส่ช่อง Red / Green / Blue กดผสมภาพ แล้วส่งคำตอบ</li>
                </ol>
              </div>
            )}
            {!theoryAcknowledged && (
              <button
                onClick={() => {
                  completeTheory();
                  setActiveTab('process');
                }}
                style={{
                  background: '#2563eb',
                  border: '1px solid #60a5fa',
                  color: '#ffffff',
                  padding: '11px 18px',
                  borderRadius: 9,
                  fontSize: 13.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <CheckCircle2 size={16} />
                อ่านแล้ว พร้อมเริ่มเล่น (ไปยังภารกิจที่ 1)
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Quick Launch Buttons */}
      <div className="rs-theory-actions" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('process')}
          disabled={!theoryAcknowledged}
          className="rs-theory-primary-action"
          style={{
            background: theoryAcknowledged ? '#2563eb' : 'rgba(255, 255, 255, 0.08)',
            border: theoryAcknowledged ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.12)',
            color: theoryAcknowledged ? '#ffffff' : '#64748b',
            padding: '12px 24px',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 700,
            cursor: theoryAcknowledged ? 'pointer' : 'not-allowed',
            opacity: theoryAcknowledged ? 1 : 0.65,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span><Rocket size={15} style={{ verticalAlign: 'middle', marginRight: 5 }} />เริ่มภารกิจ 1: กระบวนการ RS</span>
          <ArrowRight size={16} />
        </button>

        <button
          onClick={() => setActiveTab('mixer')}
          disabled={!theoryAcknowledged}
          className="rs-theory-secondary-action"
          style={{
            background: theoryAcknowledged ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: theoryAcknowledged ? '#f8fafc' : '#64748b',
            padding: '12px 24px',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 700,
            cursor: theoryAcknowledged ? 'pointer' : 'not-allowed',
            opacity: theoryAcknowledged ? 1 : 0.65,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span><Palette size={15} style={{ verticalAlign: 'middle', marginRight: 5 }} />ภารกิจ 2: ผสมแถบคลื่น</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
