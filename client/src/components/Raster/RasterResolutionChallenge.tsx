import React from 'react';
import { useRasterStore, minElev, maxElev } from '../../store/rasterStore';
import { RES_CHALLENGE, elevAt, rampColor } from '../../constants/rasterData';

function getGridDim(pixelSizeMeters: number): { cols: number; rows: number } {
  // Simulate a 120m x 80m field
  const cols = Math.max(3, Math.min(24, Math.round(120 / pixelSizeMeters)));
  const rows = Math.max(2, Math.min(16, Math.round(80 / pixelSizeMeters)));
  return { cols, rows };
}

export const RasterResolutionChallenge: React.FC = () => {
  const resIndex = useRasterStore((s) => s.resIndex);
  const resStatus = useRasterStore((s) => s.resStatus);
  const resExplain = useRasterStore((s) => s.resExplain);
  const resMsg = useRasterStore((s) => s.resMsg);
  const resolutionScore = useRasterStore((s) => s.resolutionScore);

  const startResolution = useRasterStore((s) => s.startResolution);
  const answerResolution = useRasterStore((s) => s.answerResolution);

  const currentItem = resIndex < RES_CHALLENGE.length ? RES_CHALLENGE[resIndex] : null;
  const dimA = currentItem ? getGridDim(currentItem.a) : null;
  const dimB = currentItem ? getGridDim(currentItem.b) : null;

  return (
    <section className="block raster-resolution" id="raster-resolution">
      <div className="eyebrow mono" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>ภารกิจ 04</span>
        <span className={`task-status ${resStatus === 'won' ? 'done' : ''}`}>
          {resStatus === 'idle' ? 'ยังไม่เริ่ม' : resStatus === 'playing' ? `ข้อ ${resIndex + 1}/${RES_CHALLENGE.length}` : `สำเร็จ (+${resolutionScore} คะแนน)`}
        </span>
      </div>

      <h2 className="display">Resolution Challenge — เปรียบเทียบความละเอียด Pixel</h2>
      <p>
        ความละเอียดเชิงพื้นที่ (Spatial Resolution) อธิบายจาก <b>ขนาดของจุดภาพ (Pixel Size)</b> ในพื้นที่เดียวกัน ยิ่งขนาดพิกเซลเล็ก (เช่น 5m หรือ 10m) จะเห็นรายละเอียดคมชัดกว่าพิกเซลขนาดใหญ่ (เช่น 20m หรือ 30m)
      </p>

      {/* Comparison Cards with Simulated Raster Grids */}
      {currentItem && dimA && dimB && (
        <div className="color-lab" style={{ marginBottom: 16 }}>
          <div className="color-card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>Raster A</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#d9a441', margin: '4px 0 2px' }}>
              {currentItem.a} เมตร
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
              1 พิกเซล = {currentItem.a} × {currentItem.a} ม. ({dimA.cols * dimA.rows} พิกเซลในพื้นที่ตัวอย่าง)
            </div>

            {/* Raster A Simulated Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${dimA.cols}, 1fr)`,
                gridTemplateRows: `repeat(${dimA.rows}, 1fr)`,
                height: 130,
                width: '100%',
                maxWidth: 220,
                borderRadius: 6,
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
                background: '#0f172a',
              }}
            >
              {Array.from({ length: dimA.rows }).map((_, py) =>
                Array.from({ length: dimA.cols }).map((_, px) => {
                  const e = elevAt(px, py, dimA.cols, dimA.rows);
                  const bg = rampColor((e - minElev) / (maxElev - minElev || 1));
                  return (
                    <div
                      key={`a-${px}-${py}`}
                      style={{
                        backgroundColor: bg,
                        border: dimA.cols <= 8 ? '0.5px solid rgba(0,0,0,0.25)' : 'none',
                      }}
                    />
                  );
                })
              )}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>
              {currentItem.a >= 25 ? '⚠️ ขนาดพิกเซลใหญ่ ภาพหยาบ' : 'ภาพจำลองความละเอียดพิกเซล'}
            </div>
          </div>

          <div className="color-card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>Raster B</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#d9a441', margin: '4px 0 2px' }}>
              {currentItem.b} เมตร
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
              1 พิกเซล = {currentItem.b} × {currentItem.b} ม. ({dimB.cols * dimB.rows} พิกเซลในพื้นที่ตัวอย่าง)
            </div>

            {/* Raster B Simulated Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${dimB.cols}, 1fr)`,
                gridTemplateRows: `repeat(${dimB.rows}, 1fr)`,
                height: 130,
                width: '100%',
                maxWidth: 220,
                borderRadius: 6,
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
                background: '#0f172a',
              }}
            >
              {Array.from({ length: dimB.rows }).map((_, py) =>
                Array.from({ length: dimB.cols }).map((_, px) => {
                  const e = elevAt(px, py, dimB.cols, dimB.rows);
                  const bg = rampColor((e - minElev) / (maxElev - minElev || 1));
                  return (
                    <div
                      key={`b-${px}-${py}`}
                      style={{
                        backgroundColor: bg,
                        border: dimB.cols <= 8 ? '0.5px solid rgba(0,0,0,0.25)' : 'none',
                      }}
                    />
                  );
                })
              )}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>
              {currentItem.b <= 10 ? '✨ ขนาดพิกเซลเล็ก คมชัดสูง' : 'ภาพจำลองความละเอียดพิกเซล'}
            </div>
          </div>
        </div>
      )}

      {/* Challenge Card */}
      <div className="quiz-card resolution-challenge-card">
        <div className="qn mono">
          {resStatus === 'won' ? 'ครบ 5 / 5 ข้อ' : `ข้อ ${resIndex + 1} / ${RES_CHALLENGE.length}`}
        </div>
        <div className="resolution-question" aria-live="polite">
          <div className="resolution-question-label">คำถามภารกิจ</div>
          <div className="resolution-question-text">
            {resStatus === 'won'
              ? 'ยินดีด้วย! คุณผ่าน Resolution Challenge เรียบร้อยแล้ว'
              : currentItem?.question || 'กดปุ่ม “เริ่มภารกิจ Resolution” เพื่อเริ่มตอบคำถาม 5 ข้อ'}
          </div>
        </div>

        {resStatus === 'playing' && currentItem && (
          <div className="resolution-options" aria-label="ตัวเลือกคำตอบ">
            <button className="btn small ghost resolution-option" onClick={() => answerResolution('A')}>
              Raster A <span>({currentItem.a} เมตร)</span>
            </button>
            <button className="btn small ghost resolution-option" onClick={() => answerResolution('B')}>
              Raster B <span>({currentItem.b} เมตร)</span>
            </button>
          </div>
        )}

        {resExplain && (
          <div
            className="qexplain show"
            style={{
              marginTop: 14,
              background: 'rgba(22, 32, 44, 0.8)',
              padding: '12px 16px',
              borderLeft: '3px solid var(--teal)',
              borderRadius: 4,
            }}
          >
            {resExplain}
          </div>
        )}
      </div>

      <div className="cell-readout" style={{ marginTop: 10 }}>
        {resMsg}
      </div>

      {resStatus === 'idle' && (
        <button className="btn small" style={{ marginTop: 12 }} onClick={startResolution}>
          เริ่มภารกิจ Resolution
        </button>
      )}
    </section>
  );
};
