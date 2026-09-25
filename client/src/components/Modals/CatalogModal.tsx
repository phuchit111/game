import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { CATALOG } from '../../constants/catalog';
import { formatMoney } from '../../utils/scoring';
import { BookOpen, X } from 'lucide-react';

export const CatalogModal: React.FC = () => {
  const activeModal = useGameStore((s) => s.activeModal);
  const closeModal = useGameStore((s) => s.closeModal);

  if (activeModal !== 'catalog') return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-box wide">
        <div className="modal-eyebrow">
          <BookOpen size={14} /> REFERENCE TABLE
        </div>
        <h2 className="modal-title">ตารางอ้างอิงประเภท ราคา และคะแนน</h2>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>
          ใช้ตารางนี้เพื่อดูว่าในแต่ละหมวดหมู่ มีประเภทใดบ้างที่คุณสามารถนำไปกรอกลงใน Attribute Table
        </p>

        <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', overflow: 'auto', maxHeight: '55vh', marginBottom: 16 }}>
          <table className="attribute-table">
            <thead>
              <tr>
                <th style={{ width: 140 }}>หมวด</th>
                <th>ประเภท (พิมพ์ด้วยตนเอง)</th>
                <th style={{ width: 140 }}>ราคา (บาท)</th>
                <th style={{ width: 140 }}>พิกัด</th>
                <th style={{ width: 80 }}>คะแนน</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(CATALOG).map(([category, items]) =>
                items.map((item, index) => (
                  <tr key={`${category}-${item[0]}`}>
                    <td>
                      {index === 0 ? <b style={{ color: 'var(--ink)' }}>{category}</b> : ''}
                    </td>
                    <td style={{ fontWeight: 500 }}>{item[0]}</td>
                    <td className="mono-cell">{formatMoney(item[1])}</td>
                    <td style={{ color: 'var(--muted)', fontSize: 11.5 }}>กำหนดจากจุดบนแผนที่</td>
                    <td className="mono-cell" style={{ fontWeight: 700, color: 'var(--brand)' }}>{item[2]}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={closeModal}>
            <X size={14} />
            <span>กลับสู่เกม</span>
          </button>
        </div>
      </div>
    </div>
  );
};
