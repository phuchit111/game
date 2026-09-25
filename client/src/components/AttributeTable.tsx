import React from 'react';
import { useGameStore } from '../store/gameStore';
import { formatMoney } from '../utils/scoring';
import { Table, BookOpen, Trash2, CheckCircle } from 'lucide-react';

export const AttributeTable: React.FC = () => {
  const points = useGameStore((s) => s.points);
  const feedback = useGameStore((s) => s.feedback);
  const updatePointType = useGameStore((s) => s.updatePointType);
  const deletePoint = useGameStore((s) => s.deletePoint);
  const clearAllPoints = useGameStore((s) => s.clearAllPoints);
  const checkTable = useGameStore((s) => s.checkTable);
  const openModal = useGameStore((s) => s.openModal);

  const handleClear = () => {
    if (window.confirm('คุณต้องการล้างจุดทั้งหมดบนแผนที่หรือไม่?')) {
      clearAllPoints();
    }
  };

  return (
    <section className="panel-table">
      {/* Header */}
      <div className="panel-header">
        <div className="panel-header-title">
          <Table size={18} color="#0d9488" />
          <h2>Attribute Table</h2>
        </div>

        <div className="panel-header-actions">
          <button
            className="btn"
            style={{ fontSize: 11.5, padding: '5px 9px' }}
            onClick={() => openModal('catalog')}
          >
            <BookOpen size={13} />
            <span>ตารางอ้างอิง</span>
          </button>

          <button
            className="btn"
            style={{ fontSize: 11.5, padding: '5px 9px' }}
            onClick={handleClear}
            disabled={points.length === 0}
          >
            <Trash2 size={13} />
            <span>ล้างจุด</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="table-scroll-wrap">
        <table className="attribute-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}>ID</th>
              <th style={{ width: 110 }}>หมวด<br /><small style={{ fontWeight: 400, color: 'var(--muted)' }}>มีให้</small></th>
              <th style={{ minWidth: 150 }}>ประเภท<br /><small style={{ fontWeight: 400, color: 'var(--muted)' }}>พิมพ์ด้วยตนเอง</small></th>
              <th style={{ width: 120 }}>ราคา (บาท)<br /><small style={{ fontWeight: 400, color: 'var(--muted)' }}>ปลดล็อก</small></th>
              <th style={{ width: 150 }}>พิกัด<br /><small style={{ fontWeight: 400, color: 'var(--muted)' }}>พิกัด GIS</small></th>
              <th style={{ width: 70 }}>คะแนน<br /><small style={{ fontWeight: 400, color: 'var(--muted)' }}>ปลดล็อก</small></th>
              <th style={{ width: 60 }}>ปรับแก้</th>
            </tr>
          </thead>
          <tbody>
            {points.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: '28px 10px' }}>
                  ยังไม่มีข้อมูล — คลิกบนแผนที่เพื่อปักหมุดจุดแรก
                </td>
              </tr>
            ) : (
              points.map((p, index) => {
                const hasText = p.type.trim().length > 0;
                const isMatched = p.matched !== null;
                const inputClass = !hasText
                  ? 'input-type'
                  : isMatched
                  ? 'input-type correct'
                  : 'input-type incorrect';

                return (
                  <tr key={`point-${index}`}>
                    <td className="mono-cell" style={{ fontWeight: 700 }}>
                      {index + 1}
                    </td>
                    <td>
                      <span className="category-tag">{p.category}</span>
                    </td>
                    <td>
                      <input
                        type="text"
                        className={inputClass}
                        value={p.type}
                        placeholder="พิมพ์ประเภทด้วยตนเอง..."
                        onChange={(e) => updatePointType(index, e.target.value)}
                        autoComplete="off"
                        spellCheck={false}
                      />
                      {hasText && (
                        <span className={`hint-msg ${isMatched ? 'ok' : 'bad'}`}>
                          {isMatched ? '✓ ถูกต้องตรงตามหมวด' : `ยังไม่ตรง — ตรวจสอบในหมวด ${p.category}`}
                        </span>
                      )}
                    </td>
                    <td className="mono-cell">
                      {isMatched ? formatMoney(p.matched![1]) : <span className="cell-locked">พิมพ์ประเภทให้ถูก</span>}
                    </td>
                    <td className="mono-cell" style={{ fontSize: 11 }}>
                      {p.coords}
                    </td>
                    <td className="mono-cell" style={{ fontWeight: 700, color: isMatched ? 'var(--brand)' : 'inherit' }}>
                      {isMatched ? p.matched![2] : <span className="cell-locked">-</span>}
                    </td>
                    <td>
                      <button
                        className="btn btn-danger-outline"
                        onClick={() => deletePoint(index)}
                        title="ลบจุดนี้"
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Actions */}
      <div className="panel-footer-actions">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="btn btn-primary" onClick={checkTable}>
            <CheckCircle size={15} />
            <span>ตรวจ Attribute Table</span>
          </button>

        </div>

        {feedback && (
          <span style={{ fontSize: 12, color: 'var(--ink-secondary)', fontWeight: 500 }}>
            {feedback}
          </span>
        )}
      </div>
    </section>
  );
};
