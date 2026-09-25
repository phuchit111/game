import React, { useEffect, useRef } from 'react';
import { useRasterStore, escapeElevGrid, escapeMinE, escapeMaxE } from '../../store/rasterStore';
import { ESCAPE_COLS, ESCAPE_ROWS, rampColor } from '../../constants/rasterData';

import { RotateCcw, Trophy, Waves, ArrowRight } from 'lucide-react';

export const RasterFloodGame: React.FC = () => {
  const escapeStatus = useRasterStore((s) => s.escapeStatus);
  const escapePlayerPos = useRasterStore((s) => s.escapePlayerPos);
  const escapeWaterLevel = useRasterStore((s) => s.escapeWaterLevel);
  const escapeTurns = useRasterStore((s) => s.escapeTurns);
  const escapeTimeLeft = useRasterStore((s) => s.escapeTimeLeft);
  const escapeMsg = useRasterStore((s) => s.escapeMsg);
  const escapeScore = useRasterStore((s) => s.escapeScore);
  const escapeOutcomeModal = useRasterStore((s) => s.escapeOutcomeModal);
  const closeEscapeOutcomeModal = useRasterStore((s) => s.closeEscapeOutcomeModal);

  const startEscape = useRasterStore((s) => s.startEscape);
  const tickEscape = useRasterStore((s) => s.tickEscape);
  const movePlayer = useRasterStore((s) => s.movePlayer);
  const outcomeActionRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (escapeStatus !== 'playing') return;
    const timer = setInterval(() => {
      tickEscape();
    }, 1000);
    return () => clearInterval(timer);
  }, [escapeStatus, tickEscape]);

  useEffect(() => {
    if (!escapeOutcomeModal) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeEscapeOutcomeModal();
    };
    document.addEventListener('keydown', handleKeyDown);
    const focusTimer = window.setTimeout(() => outcomeActionRef.current?.focus(), 0);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [escapeOutcomeModal, closeEscapeOutcomeModal]);

  const currentElev = escapeElevGrid[escapePlayerPos.y][escapePlayerPos.x];

  return (
    <section className="block" id="raster-flood">
      <div className="eyebrow mono" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>ภารกิจ 02</span>
        <span className={`task-status ${escapeStatus === 'won' ? 'done' : escapeStatus === 'lost' ? 'lost' : ''}`}>
          {escapeStatus === 'idle'
            ? 'ยังไม่เริ่ม'
            : escapeStatus === 'playing'
            ? 'กำลังหนี...'
            : escapeStatus === 'won'
            ? `สำเร็จ (+${escapeScore} คะแนน)`
            : 'จมน้ำ'}
        </span>
      </div>

      <h2 className="display">หนีน้ำท่วม — อ่านข้อมูล Raster เพื่อเอาชีวิตรอด</h2>
      <p>
        จำลองการใช้แบบจำลอง DEM เพื่อคิดเส้นทางอพยพ คุณเริ่มต้นในพื้นที่ต่ำและระดับน้ำจะสูงขึ้นทุกครั้งที่ก้าวเดิน
        จงวิเคราะห์ค่าความสูงและสีของพื้นผิว แล้วหาทางเดินไปยัง <b>จุดที่สูงที่สุด</b> ของภูมิประเทศให้ทันเวลา!
      </p>

      <div className="grid-wrap">
        <div className="raster-panel">
          {/* HUD */}
          <div className="escape-hud">
            <div className="hud-item">
              <b>{currentElev.toLocaleString()}</b>
              <span>ความสูงที่ยืน (ม.)</span>
            </div>
            <div className="hud-item">
              <b>{Math.max(0, Math.round(escapeWaterLevel)).toLocaleString()}</b>
              <span>ระดับน้ำ (ม.)</span>
            </div>
            <div className={`hud-item timer ${escapeTimeLeft <= 10 ? 'urgent' : ''}`}>
              <b>{escapeTimeLeft}s</b>
              <span>เวลาที่เหลือ</span>
            </div>
            <div className="hud-item">
              <b>{escapeTurns}</b>
              <span>จำนวนก้าว</span>
            </div>
            <button className="btn small" onClick={startEscape}>
              {escapeStatus === 'idle' ? 'เริ่มภารกิจหนีน้ำ' : 'เริ่มใหม่'}
            </button>
          </div>

          {/* 18x10 Grid */}
          <div
            className="raster-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${ESCAPE_COLS}, 1fr)`,
              gridTemplateRows: `repeat(${ESCAPE_ROWS}, 1fr)`,
              height: 380,
            }}
          >
            {escapeElevGrid.map((row, y) =>
              row.map((elev, x) => {
                const isPlayer = x === escapePlayerPos.x && y === escapePlayerPos.y;
                const isSubmerged = elev <= escapeWaterLevel;
                const dx = Math.abs(x - escapePlayerPos.x);
                const dy = Math.abs(y - escapePlayerPos.y);
                const isAdjacent = (dx === 1 && dy === 0) || (dx === 0 && dy === 1) || (dx === 1 && dy === 1);
                const isMovable = escapeStatus === 'playing' && isAdjacent && !isSubmerged;

                const bg = rampColor((elev - escapeMinE) / (escapeMaxE - escapeMinE || 1));

                return (
                    <button
                      type="button"
                      key={`esc-${x}-${y}`}
                      className={`raster-cell ${isSubmerged ? 'submerged' : ''} ${isMovable ? 'movable' : ''}`}
                    style={{ backgroundColor: bg, padding: 0, cursor: isMovable ? 'pointer' : 'default' }}
                    disabled={!isMovable}
                    aria-label={`เซลล์คอลัมน์ ${x + 1} แถว ${y + 1}${isMovable ? ' เดินไปได้' : ''}`}
                    onClick={() => movePlayer(x, y)}
                    >
                      {isPlayer && <span className="marker" style={{ color: '#fff' }}>▲</span>}
                    </button>
                );
              })
            )}
          </div>

          <div className={`escape-msg mono ${escapeStatus === 'won' ? 'win' : escapeStatus === 'lost' ? 'lose' : ''}`}>
            {escapeMsg}
          </div>
        </div>

        {/* Legend / Instructions */}
        <div className="legend">
          <div className="mono" style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase' }}>
            กติกาการเอาชีวิตรอด
          </div>
          <p style={{ fontSize: 12.5, lineHeight: 1.8, margin: '10px 0 0', color: '#cbd3db' }}>
            • <b>▲</b> = ตำแหน่งปัจจุบันของคุณ<br />
            • ไม่มีเครื่องหมายเฉลยจุดหมาย — ต้องดูจากสีและระดับความสูงเอง<br />
            • <b>กรอบสีเหลือง</b> = เซลล์ข้างเคียงที่คุณก้าวเดินไปได้<br />
            • <b>สีน้ำเงินทึบ</b> = พื้นที่ที่ถูกน้ำท่วมมิดแล้ว<br />
            • ทุกการก้าวเดิน 1 ช่อง = น้ำจะสูงขึ้น 1 ระดับ<br />
            • มีเวลา <b>45 วินาที</b>
          </p>
          <div className="divider" />
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>
            ถึงยอดสูงสุด = <b>+20 คะแนน</b> + โบนัสความเร็วสูงสุด <b>+10</b>
          </p>
        </div>
      </div>

      {/* Flood Outcome Pop-up */}
      {escapeOutcomeModal && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeEscapeOutcomeModal();
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
            padding: 20,
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="raster-flood-outcome-title"
            onMouseDown={(event) => event.stopPropagation()}
            style={{
              background: escapeOutcomeModal === 'won' ? '#11221f' : '#221515',
              border: escapeOutcomeModal === 'won' ? '1px solid #10b981' : '1px solid #ef4444',
              borderRadius: 16,
              maxWidth: 480,
              width: '100%',
              padding: '28px 24px',
              textAlign: 'center',
              color: '#f8fafc',
              boxShadow: escapeOutcomeModal === 'won'
                ? '0 20px 45px rgba(16, 185, 129, 0.25)'
                : '0 20px 45px rgba(239, 68, 68, 0.25)',
              position: 'relative',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            {/* Top Icon */}
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: escapeOutcomeModal === 'won' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                border: escapeOutcomeModal === 'won' ? '2px solid #10b981' : '2px solid #ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: escapeOutcomeModal === 'won' ? '#34d399' : '#f87171',
              }}
            >
              {escapeOutcomeModal === 'won' ? <Trophy size={32} /> : <Waves size={32} />}
            </div>

            {/* Title */}
              <h2
                id="raster-flood-outcome-title"
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: escapeOutcomeModal === 'won' ? '#34d399' : '#f87171',
                margin: '0 0 10px',
                letterSpacing: '0.02em',
              }}
            >
              {escapeOutcomeModal === 'won' ? 'ยินดีด้วย!! คุณรอดแล้ว' : 'คุณจมน้ำแล้ว !!!'}
            </h2>

            {/* Subtext */}
            <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.65, margin: '0 0 20px' }}>
              {escapeOutcomeModal === 'won' ? (
                <>
                  คุณอ่านข้อมูลแบบจำลองความสูง DEM ได้อย่างแม่นยำ และสามารถนำพาตัวเองขึ้นสู่ยอดเขาสูงสุดได้ก่อนที่น้ำจะท่วมถึงตัว!
                </>
              ) : (
                <>
                  {escapeTimeLeft <= 0
                    ? 'เวลา 45 วินาทีหมดลงแล้ว ระดับน้ำท่วมสูงขึ้นจนมิดพื้นที่'
                    : 'ระดับน้ำสูงขึ้นจนท่วมเซลล์ที่คุณก้าวเดินเข้าไป ไม่สามารถเดินทางต่อไปได้'}
                </>
              )}
            </p>

            {/* Stats summary */}
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 10,
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                marginBottom: 22,
                fontSize: 13,
              }}
            >
              {escapeOutcomeModal === 'won' ? (
                <>
                  <div>
                    <div style={{ color: '#94a3b8' }}>คะแนนที่ได้รับ</div>
                    <b style={{ fontSize: 18, color: '#34d399' }}>+{escapeScore}</b>
                  </div>
                  <div>
                    <div style={{ color: '#94a3b8' }}>จำนวนก้าว</div>
                    <b style={{ fontSize: 18, color: '#ffffff' }}>{escapeTurns} ก้าว</b>
                  </div>
                  <div>
                    <div style={{ color: '#94a3b8' }}>เวลาที่เหลือ</div>
                    <b style={{ fontSize: 18, color: '#facc15' }}>{escapeTimeLeft}s</b>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <div style={{ color: '#94a3b8' }}>จำนวนก้าวที่เดิน</div>
                    <b style={{ fontSize: 18, color: '#ffffff' }}>{escapeTurns} ก้าว</b>
                  </div>
                  <div>
                    <div style={{ color: '#94a3b8' }}>ระดับน้ำสุดท้าย</div>
                    <b style={{ fontSize: 18, color: '#f87171' }}>{Math.round(escapeWaterLevel)} ม.</b>
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                className="btn small"
                type="button"
                ref={outcomeActionRef}
                onClick={() => {
                  startEscape();
                }}
                style={{
                  background: escapeOutcomeModal === 'won' ? 'rgba(255, 255, 255, 0.1)' : '#ef4444',
                  color: '#ffffff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 18px',
                  fontWeight: 700,
                  fontSize: 13.5,
                  borderRadius: 8,
                  border: escapeOutcomeModal === 'won' ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
                }}
              >
                <RotateCcw size={15} />
                <span>{escapeOutcomeModal === 'won' ? 'เล่นใหม่อีกรอบ' : 'ลองใหม่อีกครั้ง'}</span>
              </button>

              {escapeOutcomeModal === 'won' ? (
                <button
                  className="btn small teal"
                  type="button"
                  onClick={() => {
                    closeEscapeOutcomeModal();
                    document.getElementById('raster-reclassify')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '10px 20px',
                    fontWeight: 700,
                    fontSize: 13.5,
                    borderRadius: 8,
                  }}
                >
                  <span>ไปภารกิจถัดไป</span>
                  <ArrowRight size={15} />
                </button>
              ) : (
                <button
                  className="btn small ghost"
                  type="button"
                  onClick={closeEscapeOutcomeModal}
                  style={{
                    padding: '10px 18px',
                    fontSize: 13.5,
                    borderRadius: 8,
                  }}
                >
                  ปิดหน้าต่าง
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
