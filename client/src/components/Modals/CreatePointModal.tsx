import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { CATALOG, GAME_CONFIG } from '../../constants/catalog';
import type { Category } from '../../types/mission';
import { PlusCircle, X } from 'lucide-react';

export const CreatePointModal: React.FC = () => {
  const activeModal = useGameStore((s) => s.activeModal);
  const pendingLatLng = useGameStore((s) => s.pendingLatLng);
  const points = useGameStore((s) => s.points);
  const addPoint = useGameStore((s) => s.addPoint);
  const closeModal = useGameStore((s) => s.closeModal);

  const categories = Object.keys(CATALOG) as Category[];
  const [selectedCategory, setSelectedCategory] = useState<Category>(categories[0]);
  const [selectedType, setSelectedType] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const typeOptions = CATALOG[selectedCategory];
  const matchedType = typeOptions.find(([type]) => type === selectedType.trim());

  if (activeModal !== 'editor' || !pendingLatLng) return null;

  const handleSave = () => {
    if (!selectedType.trim()) {
      setErrorMessage('กรุณาพิมพ์ประเภทข้อมูลก่อนบันทึก');
      return;
    }

    const success = addPoint(selectedCategory, selectedType);
    if (!success) {
      setErrorMessage(`หมวด "${selectedCategory}" สร้างครบโควตา ${GAME_CONFIG.MAX_PER_CATEGORY} จุดแล้ว กรุณาเลือกหมวดอื่น`);
    } else {
      setErrorMessage('');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-box" style={{ maxWidth: 480 }}>
        <div className="modal-eyebrow">
          <PlusCircle size={14} /> NEW RECORD
        </div>
        <h2 className="modal-title">สร้างจุดข้อมูลใหม่</h2>
        <p className="modal-subtitle">กรอกข้อมูลให้ครบในป๊อปอัป โดยสร้างแต่ละหมวดได้ไม่เกิน 2 จุด</p>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>
          พิกัดที่เลือก: <code className="mono-cell" style={{ color: 'var(--brand)', fontWeight: 600 }}>{pendingLatLng.lat.toFixed(5)}, {pendingLatLng.lng.toFixed(5)}</code>
        </p>

        <div style={{ marginBottom: 16 }}>
          <label className="field-label">
            หมวดข้อมูล
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value as Category);
              setSelectedType('');
              setErrorMessage('');
            }}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--line)',
              fontSize: 14,
              backgroundColor: '#fff',
            }}
          >
            {categories.map((cat) => {
              const count = points.filter((p) => p.category === cat).length;
              const isFull = count >= GAME_CONFIG.MAX_PER_CATEGORY;
              return (
                <option key={cat} value={cat} disabled={isFull}>
                  {cat} {count > 0 ? `(${count}/${GAME_CONFIG.MAX_PER_CATEGORY})` : ''} {isFull ? '— ครบโควตาแล้ว' : ''}
                </option>
              );
            })}
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label className="field-label">
            ประเภทข้อมูล <span className="field-label-hint"></span>
          </label>
          <input
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setErrorMessage('');
            }}
            className="field-input"
            placeholder={`พิมพ์ประเภทของ ${selectedCategory} เช่น ${typeOptions[0]?.[0] ?? ''}`}
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <div className="modal-reference-table">
          <div className="modal-reference-heading">
            <div>
              <span className="modal-reference-kicker">REFERENCE TABLE</span>
              <strong>ประเภทที่ใช้ได้ในหมวด {selectedCategory}</strong>
            </div>
            <span className="modal-reference-hint">พิมพ์ชื่อจากตารางนี้</span>
          </div>
          <div className="modal-reference-scroll">
            <table className="reference-table">
              <thead>
                <tr>
                  <th>ประเภท</th>
                  <th>ราคา (บาท)</th>
                  <th>คะแนน</th>
                </tr>
              </thead>
              <tbody>
                {typeOptions.map(([type, price, score]) => (
                  <tr key={type} className={selectedType.trim() === type ? 'is-selected' : undefined}>
                    <td>{type}</td>
                    <td className="mono-cell">{price.toLocaleString('th-TH')}</td>
                    <td className="mono-cell">{score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedType.trim() && (
          <div className={`record-preview ${matchedType ? '' : 'invalid'}`}>
            <span className="record-preview-label">{matchedType ? 'ข้อมูลที่จะบันทึก' : 'ตรวจสอบข้อมูล'}</span>
            <strong>{selectedType}</strong>
            <span>
              {matchedType
                ? `${selectedCategory} · ${matchedType[2]} คะแนน`
                : `ไม่พบประเภทนี้ในหมวด ${selectedCategory}`}
            </span>
          </div>
        )}

        <div className="modal-note" style={{ fontSize: 12 }}>
          พิมพ์ประเภทให้ตรงกับตารางอ้างอิง ระบบจะตรวจสอบและบันทึกข้อมูลพร้อมพิกัดลง Attribute Table
        </div>

        {errorMessage && <div className="form-error">{errorMessage}</div>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
          <button className="btn" onClick={closeModal}>
            <X size={14} />
            <span>ยกเลิก</span>
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            <span>บันทึกลงตาราง</span>
          </button>
        </div>
      </div>
    </div>
  );
};
