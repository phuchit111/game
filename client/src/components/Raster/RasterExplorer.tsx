import React, { useEffect, useRef, useState } from 'react';
import { useRasterStore, explorerElevGrid, minElev, maxElev } from '../../store/rasterStore';
import { COLS, ROWS, rampColor, landCoverAtElevation, hillshade, LAND_CATEGORIES, RES_PRESETS, elevAt } from '../../constants/rasterData';
import { Lightbulb } from 'lucide-react';

export const RasterExplorer: React.FC = () => {
  const displayMode = useRasterStore((s) => s.displayMode);
  const selectedCell = useRasterStore((s) => s.selectedCell);
  const setDisplayMode = useRasterStore((s) => s.setDisplayMode);
  const setSelectedCell = useRasterStore((s) => s.setSelectedCell);

  const [activeModalIdx, setActiveModalIdx] = useState<number | null>(null);
  const [hoveredModalCell, setHoveredModalCell] = useState<{ x: number; y: number; elev: number } | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);

  const closeResolutionModal = () => {
    setActiveModalIdx(null);
    setHoveredModalCell(null);
    window.requestAnimationFrame(() => lastTriggerRef.current?.focus());
  };

  useEffect(() => {
    if (activeModalIdx === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeResolutionModal();
    };
    document.addEventListener('keydown', handleKeyDown);
    const focusTimer = window.setTimeout(() => closeButtonRef.current?.focus(), 0);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [activeModalIdx]);

  return (
    <div>
      {/* 1. Theory Box */}
      <section className="block" id="raster-explorer">
        <div className="eyebrow mono">แนวคิด</div>
        <h2 className="display">ข้อมูลราสเตอร์ (Raster) คืออะไร</h2>
        <p>
          <b>Raster</b> คือวิธีจัดเก็บข้อมูลเชิงพื้นที่แบบตารางเซลล์ (Grid of cells) โดยแต่ละเซลล์เก็บ <b>"ค่าเดียว"</b> ไว้ข้างใน — แทนที่จะเก็บขอบเขตเป็นเส้นหรือรูปทรงแบบ Vector ราสเตอร์จะแบ่งพื้นที่ออกเป็นตารางเท่าๆ กัน ยิ่งขนาดเซลล์เล็ก (ความละเอียดสูง) ภาพยิ่งคมชัด
          ราสเตอร์ใช้เก็บข้อมูลได้หลากหลาย เช่น ภาพถ่ายดาวเทียม, Land Cover, ดัชนีพืชพรรณ NDVI, และ <b>DEM (Digital Elevation Model)</b> ซึ่งแต่ละเซลล์เก็บค่าความสูงของภูมิประเทศ
        </p>
      </section>

      {/* 2. Interactive Explorer Grid */}
      <section className="block">
        <div className="eyebrow mono">ทดลอง 01</div>
        <h2 className="display">สำรวจตารางราสเตอร์จำลอง</h2>
        <p>
          คลิกเซลล์เพื่ออ่านค่าความสูงที่เก็บอยู่ในเซลล์นั้น แล้วลองสลับโหมดแสดงผลทั้ง 3 แบบ (สีตามความสูง / แสงเงา / จำแนกประเภท) เพื่อดูว่าข้อมูลเดียวกันสามารถสื่อความหมายเชิงพื้นที่ได้หลายรูปแบบ
        </p>

        <div className="grid-wrap">
          <div className="raster-panel">
            <div className="toolbar">
              <span className="mono" style={{ fontSize: 13, color: 'var(--muted)' }}>โหมดแสดงผล:</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button
                  className={`btn small ${displayMode === 'color' ? 'teal' : 'ghost'}`}
                  onClick={() => setDisplayMode('color')}
                >
                  Hypsometric (สีตามความสูง)
                </button>
                <button
                  className={`btn small ${displayMode === 'shade' ? 'teal' : 'ghost'}`}
                  onClick={() => setDisplayMode('shade')}
                >
                  Hillshade (แสงเงา)
                </button>
                <button
                  className={`btn small ${displayMode === 'land' ? 'teal' : 'ghost'}`}
                  onClick={() => setDisplayMode('land')}
                >
                  Land Cover (จำแนกประเภท)
                </button>
              </div>
            </div>

            {/* The 12x7 Grid */}
            <div
              className="raster-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                gridTemplateRows: `repeat(${ROWS}, 1fr)`,
                height: 380,
              }}
            >
              {explorerElevGrid.map((row, y) =>
                row.map((elev, x) => {
                  let bg = '';
                  if (displayMode === 'color') {
                    bg = rampColor((elev - minElev) / (maxElev - minElev || 1));
                  } else if (displayMode === 'shade') {
                    bg = hillshade(x, y, explorerElevGrid, COLS, ROWS);
                  } else {
                    bg = landCoverAtElevation(elev).color;
                  }

                  const isSelected = selectedCell?.x === x && selectedCell?.y === y;

                  return (
                    <button
                      type="button"
                      key={`exp-${x}-${y}`}
                      className="raster-cell"
                      style={{
                        backgroundColor: bg,
                        outline: isSelected ? '3px solid #e9e4d6' : undefined,
                        zIndex: isSelected ? 3 : 1,
                        padding: 0,
                      }}
                      onClick={() => setSelectedCell({ x, y, elev })}
                      aria-label={`เซลล์คอลัมน์ ${x + 1} แถว ${y + 1} ความสูง ${elev} เมตร`}
                      title={`เซลล์ (${x + 1}, ${y + 1}): ${elev} ม.`}
                    />
                  );
                })
              )}
            </div>

            <div className="cell-readout" style={{ marginTop: 12 }}>
              {selectedCell ? (
                <>
                  เซลล์ (คอลัมน์ <b>{selectedCell.x + 1}</b>, แถว <b>{selectedCell.y + 1}</b>) → ความสูง{' '}
                  <b>{selectedCell.elev.toLocaleString()} ม.</b> ({landCoverAtElevation(selectedCell.elev).label})
                </>
              ) : (
                'คลิกเซลล์ใดๆ บนตารางเพื่ออ่านค่าที่บันทึกไว้'
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="legend">
            <div className="mono" style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase' }}>
              คำอธิบายสัญลักษณ์
            </div>

            {displayMode !== 'land' ? (
              <>
                <div style={{ fontSize: 13, marginTop: 8 }}>
                  {displayMode === 'color'
                    ? 'โทนสีแทนความสูงจากต่ำ (เขียว) ไปสูง (ขาว/หิมะ) — Continuous Raster'
                    : 'ความสว่างแทนมุมตกกระทบของแสงจำลองจากทิศ NW — Hillshade'}
                </div>
                <div className="ramp" />
                <div className="ramp-labels">
                  <span>ต่ำ ({minElev} ม.)</span>
                  <span>สูง ({maxElev} ม.)</span>
                </div>
              </>
            ) : (
              <div style={{ marginTop: 10 }}>
                {LAND_CATEGORIES.map((cat) => (
                  <div key={cat.label} className="cat-item">
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="cat-swatch" style={{ backgroundColor: cat.color }} />
                      {cat.label}
                    </span>
                    <b className="mono">{cat.rangeText}</b>
                  </div>
                ))}
              </div>
            )}

            <div className="divider" />
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>
              <Lightbulb size={14} style={{ verticalAlign: 'middle' }} /> <b>ข้อมูลน่ารู้:</b> ในโปรแกรม GIS อย่าง QGIS หรือ ArcGIS เราสามารถนำข้อมูล DEM ชุดเดียวกัน มาแสดงผลได้ทั้งแบบ Color Ramp, Hillshade 3 มิติ, หรือจัดหมวดหมู่ Reclassify ตามต้องการ
            </p>
          </div>
        </div>
      </section>

      {/* 3. Resolution Comparison */}
      <section className="block">
        <div className="eyebrow mono">ทดลอง 02</div>
        <h2 className="display">ขนาดเซลล์ (Spatial Resolution) สำคัญแค่ไหน</h2>
        <p>
          ตารางทั้ง 3 ด้านล่างคือ <b>ภูมิประเทศเดียวกันทุกประการ</b> เพียงแต่แบ่งขนาดพิกเซลต่างกัน สังเกตว่ายิ่งเซลล์มีขนาดใหญ่ ภาพยิ่งดูหยาบและยอดเขาจะเบลอหายไป เพราะแต่ละเซลล์ต้อง "เฉลี่ยค่า" ของพื้นที่กว้างๆ ให้เหลือค่าเดียว
        </p>

        <div className="res-row">
          {RES_PRESETS.map((preset, idx) => (
            <button
              key={preset.label}
              type="button"
              className="res-item"
              style={{
                cursor: 'pointer',
                transition: 'transform 0.15s ease, border-color 0.15s ease',
                width: '100%',
                textAlign: 'left',
                font: 'inherit',
                color: 'inherit',
              }}
              onClick={(event) => {
                lastTriggerRef.current = event.currentTarget;
                setHoveredModalCell(null);
                setActiveModalIdx(idx);
              }}
              aria-label={`เปิดรายละเอียดความละเอียด${preset.label}`}
              title="คลิกเพื่อขยายดูรายละเอียดแต่ละหน้า"
            >
              <div className="res-label">
                <b>{preset.label}</b>
                <span>{preset.cols} × {preset.rows} = {preset.cols * preset.rows} เซลล์</span>
              </div>
              <div
                className="res-grid"
                style={{
                  gridTemplateColumns: `repeat(${preset.cols}, 1fr)`,
                  gridTemplateRows: `repeat(${preset.rows}, 1fr)`,
                  height: 180,
                }}
              >
                {Array.from({ length: preset.rows }).map((_, py) =>
                  Array.from({ length: preset.cols }).map((_, px) => {
                    const e = elevAt(px, py, preset.cols, preset.rows);
                    const bg = rampColor((e - minElev) / (maxElev - minElev || 1));
                    return <div key={`${px}-${py}`} className="res-cell" style={{ backgroundColor: bg }} />;
                  })
                )}
              </div>
              <div style={{ marginTop: 8, textAlign: 'center', fontSize: 12, color: 'var(--teal, #2dd4bf)', fontWeight: 600 }}>
                🔍 คลิกเพื่อดูรายละเอียดหน้านี้
              </div>
            </button>
          ))}
        </div>

        {/* Modal for viewing each resolution preset page */}
        {activeModalIdx !== null && (
          <div
            className="modal-backdrop"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeResolutionModal();
            }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.75)',
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
              aria-labelledby="raster-resolution-modal-title"
              aria-describedby="raster-resolution-modal-description"
              onMouseDown={(event) => event.stopPropagation()}
              style={{
                background: '#16202c',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 14,
                maxWidth: 680,
                width: '100%',
                padding: '24px',
                color: '#f8fafc',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              }}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div>
                  <div className="mono" style={{ fontSize: 12, color: 'var(--teal, #2dd4bf)', textTransform: 'uppercase' }}>
                    หน้ารายละเอียดขนาดเซลล์ ({activeModalIdx + 1} / {RES_PRESETS.length})
                  </div>
                  <h3 id="raster-resolution-modal-title" style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 700 }}>
                    ความละเอียด: {RES_PRESETS[activeModalIdx].label} ({RES_PRESETS[activeModalIdx].cols} × {RES_PRESETS[activeModalIdx].rows} = {RES_PRESETS[activeModalIdx].cols * RES_PRESETS[activeModalIdx].rows} เซลล์)
                  </h3>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={closeResolutionModal}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 22, cursor: 'pointer' }}
                  aria-label="ปิดหน้าต่าง"
                >
                  ✕
                </button>
              </div>

              <p id="raster-resolution-modal-description" style={{ fontSize: 13.5, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 14 }}>
                <strong style={{ color: '#facc15' }}>ความละเอียดของภาพ Raster ใช้หน่วยเมตร (m)</strong><br />
                {activeModalIdx === 0 && 'ความละเอียดหยาบมาก: 1 เซลล์ครอบคลุมพื้นที่กว้างใหญ่ ค่าความสูงถูกเฉลี่ยรวมกัน ทำให้ยอดเขาแหลมและหุบเขาแคบๆ เบลอกลืนหายไป'}
                {activeModalIdx === 1 && 'ความละเอียดปานกลาง: เริ่มเห็นโครงสร้างสันเขาและความลาดชันทั่วไปได้ชัดเจนขึ้น แต่ขอบแนวเขายังเป็นขั้นบันได (Pixellation)'}
                {activeModalIdx === 2 && 'ความละเอียดละเอียดมาก: เก็บรายละเอียดภูมิประเทศ ยอดเขาสองยอด ร่องน้ำ และความสูงได้คมชัดสมจริงตามภูมิประเทศจริง'}
              </p>

              {/* Enlarged Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${RES_PRESETS[activeModalIdx].cols}, 1fr)`,
                  gridTemplateRows: `repeat(${RES_PRESETS[activeModalIdx].rows}, 1fr)`,
                  height: 280,
                  border: '2px solid rgba(255,255,255,0.15)',
                  borderRadius: 8,
                  overflow: 'hidden',
                  background: '#0f172a',
                }}
              >
                {Array.from({ length: RES_PRESETS[activeModalIdx].rows }).map((_, py) =>
                  Array.from({ length: RES_PRESETS[activeModalIdx].cols }).map((_, px) => {
                    const e = elevAt(px, py, RES_PRESETS[activeModalIdx].cols, RES_PRESETS[activeModalIdx].rows);
                    const bg = rampColor((e - minElev) / (maxElev - minElev || 1));
                    const isHovered = hoveredModalCell?.x === px && hoveredModalCell?.y === py;
                    return (
                      <button
                        type="button"
                        key={`modal-${px}-${py}`}
                        style={{
                          backgroundColor: bg,
                          outline: isHovered ? '2px solid #ffffff' : '1px solid rgba(0,0,0,0.15)',
                          cursor: 'pointer',
                          padding: 0,
                          border: 0,
                          appearance: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: RES_PRESETS[activeModalIdx].cols <= 8 ? 12 : 9,
                          fontWeight: 700,
                          color: '#ffffff',
                          textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                        }}
                        onMouseEnter={() => setHoveredModalCell({ x: px, y: py, elev: e })}
                        onFocus={() => setHoveredModalCell({ x: px, y: py, elev: e })}
                        onClick={() => setHoveredModalCell({ x: px, y: py, elev: e })}
                        aria-label={`เซลล์คอลัมน์ ${px + 1} แถว ${py + 1} ความสูง ${e} เมตร`}
                      >
                        {RES_PRESETS[activeModalIdx].cols <= 8 ? e : ''}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Cell Readout */}
              <div className="cell-readout" style={{ marginTop: 12, padding: '8px 14px', background: 'rgba(255,255,255,0.06)', borderRadius: 6, fontSize: 13 }}>
                {hoveredModalCell ? (
                  <span>
                    ตำแหน่งเซลล์ (คอลัมน์ <b>{hoveredModalCell.x + 1}</b>, แถว <b>{hoveredModalCell.y + 1}</b>) → ความสูง <b>{hoveredModalCell.elev.toLocaleString()} ม.</b> ({landCoverAtElevation(hoveredModalCell.elev).label})
                  </span>
                ) : (
                  <span style={{ color: '#94a3b8' }}>ชี้หรือคลิกที่ช่องเซลล์ด้านบนเพื่ออ่านค่าความสูงจริงของแต่ละพิกเซล</span>
                )}
              </div>

              {/* Navigation Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 }}>
                <button
                  className="btn small ghost"
                  disabled={activeModalIdx === 0}
                  onClick={() => {
                    setActiveModalIdx(activeModalIdx - 1);
                    setHoveredModalCell(null);
                  }}
                >
                  ← ระดับก่อนหน้า
                </button>
                <div style={{ display: 'flex', gap: 6 }}>
                  {RES_PRESETS.map((p, i) => (
                    <button
                      key={p.label}
                      className={`btn small ${activeModalIdx === i ? 'teal' : 'ghost'}`}
                      style={{ padding: '4px 10px', fontSize: 12 }}
                      onClick={() => {
                        setActiveModalIdx(i);
                        setHoveredModalCell(null);
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <button
                  className="btn small ghost"
                  disabled={activeModalIdx === RES_PRESETS.length - 1}
                  onClick={() => {
                    setActiveModalIdx(activeModalIdx + 1);
                    setHoveredModalCell(null);
                  }}
                >
                  ระดับถัดไป →
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
