import React, { useEffect } from 'react';
import { useRasterStore, explorerElevGrid } from '../../store/rasterStore';
import { COLS, ROWS, LAND_CATEGORIES, CLASSIFY_TARGET, landCoverAtElevation } from '../../constants/rasterData';

export const RasterReclassifyGame: React.FC = () => {
  const classifyStatus = useRasterStore((s) => s.classifyStatus);
  const classifyTargets = useRasterStore((s) => s.classifyTargets);
  const classifyTimeLeft = useRasterStore((s) => s.classifyTimeLeft);
  const activeClassifyCell = useRasterStore((s) => s.activeClassifyCell);
  const classifyMsg = useRasterStore((s) => s.classifyMsg);
  const classifyScore = useRasterStore((s) => s.classifyScore);

  const startClassify = useRasterStore((s) => s.startClassify);
  const tickClassify = useRasterStore((s) => s.tickClassify);
  const skipClassify = useRasterStore((s) => s.skipClassify);
  const selectClassifyCell = useRasterStore((s) => s.selectClassifyCell);
  const answerClassify = useRasterStore((s) => s.answerClassify);

  useEffect(() => {
    if (classifyStatus !== 'playing') return;
    const timer = setInterval(() => {
      tickClassify();
    }, 1000);
    return () => clearInterval(timer);
  }, [classifyStatus, tickClassify]);

  const doneCount = classifyTargets.filter((t) => t.done).length;

  return (
    <section className="block" id="raster-reclassify">
      <div className="eyebrow mono" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>ภารกิจ 03</span>
        <span className={`task-status ${classifyStatus === 'won' ? 'done' : classifyStatus === 'lost' ? 'lost' : ''}`}>
          {classifyStatus === 'idle'
            ? 'ยังไม่เริ่ม'
            : classifyStatus === 'playing'
            ? 'กำลังจำแนก...'
            : classifyStatus === 'won'
            ? `สำเร็จ (+${classifyScore} คะแนน)`
            : 'หมดเวลา/ข้าม (หักคะแนน)'}
        </span>
      </div>

      <h2 className="display">การจัดหมวดหมู่ราสเตอร์ (Raster Reclassification)</h2>
      <p>
        ในระบบ GIS การแปลงค่าตัวเลขความสูงต่อเนื่อง (Continuous Data) ให้กลายเป็นหมวดหมู่ประเภทที่ดิน (Categorical Data) เรียกว่า <b>Reclassification</b> — เมื่อคุณคลิกเซลล์เป้าหมาย (สัญลักษณ์ <b>?</b>) ระบบจะแสดงค่าตัวเลขความสูงจริง (เมตร) ให้คุณนำไปเทียบกับช่วงขอบเขตในตาราง Legend แล้วเลือกหมวดหมู่ให้ถูกต้อง
      </p>

      {/* Analysis Steps */}
      <div className="color-lab reclassify-brief" style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}>
        <div className="color-card reclassify-steps-card">
          <div className="mono reclassify-steps-label">
            ขั้นตอนการวิเคราะห์ค่า Reclassify
          </div>
          <ol className="reclassify-steps-list">
            <li><b>คลิกเลือกเซลล์ ?</b> เพื่ออ่านค่าความสูงตัวเลขจริง (Elevation in meters)</li>
            <li><b>ดูขอบเขตช่วงค่าความสูง</b> จากตาราง Legend ด้านข้าง</li>
            <li><b>วิเคราะห์ว่าตัวเลขนั้นตกอยู่ในช่วงใด</b> แล้วกดปุ่มหมวดหมู่ที่ตรงกัน</li>
          </ol>
        </div>
      </div>

      {/* Classify Grid */}
      <div className="grid-wrap" style={{ marginTop: 22 }}>
        <div className="raster-panel">
          <div className="escape-hud">
            <div className="hud-item">
              <b>{doneCount}/{CLASSIFY_TARGET}</b>
              <span>จัดหมวดหมู่สำเร็จ</span>
            </div>
            <div className={`hud-item timer ${classifyTimeLeft <= 10 ? 'urgent' : ''}`}>
              <b>{classifyTimeLeft}s</b>
              <span>เวลาที่เหลือ</span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button className="btn small" onClick={startClassify}>
                {classifyStatus === 'idle' ? 'เริ่มภารกิจจำแนก' : 'เริ่มใหม่'}
              </button>
              {classifyStatus === 'playing' && (
                  <button
                    className="btn small ghost"
                    style={{ color: '#f87171', borderColor: 'rgba(239,68,68,0.4)' }}
                    onClick={skipClassify}
                  title="ยอมแพ้ภารกิจนี้เพื่อไปภารกิจถัดไป (หัก 10 คะแนน)"
                  >
                  ยอมแพ้ / ข้ามไปข้อถัดไป (หัก 10 คะแนน)
                  </button>
              )}
              {classifyStatus === 'lost' && (
                <button
                  className="btn small teal"
                  onClick={() => document.getElementById('raster-resolution')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  ไปทำข้อถัดไป →
                </button>
              )}
            </div>
          </div>

          <div
            className="raster-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${COLS}, 1fr)`,
              gridTemplateRows: `repeat(${ROWS}, 1fr)`,
              height: 380,
            }}
          >
            {Array.from({ length: ROWS }).map((_, y) =>
              Array.from({ length: COLS }).map((_, x) => {
                const target = classifyTargets.find((t) => t.x === x && t.y === y);
                let bg = 'rgba(255,255,255,0.05)';
                let content: React.ReactNode = null;

                if (target) {
                  if (target.done) {
                    bg = landCoverAtElevation(explorerElevGrid[y][x]).color;
                    content = <span className="marker" style={{ color: '#fff', fontSize: 15 }}>✓</span>;
                  } else {
                    bg = 'rgba(217, 164, 65, 0.2)';
                    content = <span className="marker" style={{ color: '#d9a441', fontSize: 16 }}>?</span>;
                  }
                }

                const isSelected = activeClassifyCell?.x === x && activeClassifyCell?.y === y;

                return (
                  <button
                    type="button"
                    key={`clf-${x}-${y}`}
                    className={`raster-cell ${target && !target.done && classifyStatus === 'playing' ? 'movable' : ''}`}
                    style={{
                      backgroundColor: bg,
                      outline: isSelected ? '3px solid #d9a441' : undefined,
                      padding: 0,
                    }}
                    onClick={() => selectClassifyCell(x, y)}
                    disabled={!target || target.done || classifyStatus !== 'playing'}
                    aria-label={target && !target.done ? `เลือกเซลล์เป้าหมายคอลัมน์ ${x + 1} แถว ${y + 1}` : `เซลล์คอลัมน์ ${x + 1} แถว ${y + 1}`}
                  >
                    {content}
                  </button>
                );
              })
            )}
          </div>

          <div className="cell-readout" style={{ marginTop: 12 }}>
            {classifyMsg}
          </div>

          {/* Category Buttons */}
          {activeClassifyCell && classifyStatus === 'playing' && (
            <div className="cat-buttons" style={{ marginTop: 12 }}>
              {LAND_CATEGORIES.map((cat) => (
                <button
                  key={cat.label}
                  className="btn small ghost"
                  onClick={() => answerClassify(cat.label)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="legend">
          <div className="mono" style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase' }}>
            ตารางช่วงค่าความสูง (Reclass Legend)
          </div>
          <div className="divider" style={{ margin: '10px 0' }} />
          {LAND_CATEGORIES.map((cat) => (
            <div key={cat.label} className="cat-item">
              <span>
                <span className="cat-swatch" style={{ backgroundColor: cat.color, display: 'inline-block', verticalAlign: 'middle', marginRight: 6 }} />
                <b>{cat.label}</b>
              </span>
              <span className="mono" style={{ color: '#d9a441', fontWeight: 600 }}>{cat.rangeText}</span>
            </div>
          ))}
          <div className="divider" />
          <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>
            นำตัวเลขความสูง (เมตร) ที่อ่านได้มาเทียบช่วงความสูง แล้วกดเลือกปุ่มหมวดหมู่ให้ตรงกัน
          </p>
        </div>
      </div>
    </section>
  );
};
