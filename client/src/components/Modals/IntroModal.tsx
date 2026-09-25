import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { Compass, Play, Info } from 'lucide-react';

export const IntroModal: React.FC = () => {
  const activeModal = useGameStore((s) => s.activeModal);
  const startMission = useGameStore((s) => s.startMission);

  if (activeModal !== 'intro') return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-box">
        <div className="modal-eyebrow">
          <Compass size={14} /> MISSION BRIEF
        </div>
        <h2 className="modal-title">ภารกิจนักวิเคราะห์ข้อมูล GIS</h2>

        <div className="modal-note">
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <Info size={18} color="#0d9488" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <b>Attribute Table คืออะไร?</b> คือตารางฐานข้อมูลที่จัดเก็บ "คุณลักษณะ" (non-spatial attribute) ของวัตถุบนแผนที่ แต่ละแถวแทน 1 จุด (Feature) และแต่ละคอลัมน์แทนคุณสมบัติ เช่น ประเภท ราคา หรือคะแนน
            </div>
          </div>
        </div>

        <p style={{ fontSize: 13.5, color: '#334155', marginBottom: 14 }}>
          <b>เป้าหมายภารกิจ:</b> คุณต้องสร้างจุดข้อมูล <b>10 จุดบนแผนที่</b> ภายในงบประมาณไม่เกิน <b>10,000,000 บาท</b> และบันทึกข้อมูลคุณลักษณะให้ถูกต้องสมบูรณ์
        </p>

        <ul className="modal-rules-list">
          <li>คลิกตำแหน่งบนแผนที่ → เลือก <b>หมวด</b> ที่ต้องการสร้าง</li>
          <li>ระบบจะให้ <b>พิกัด GIS</b> อัตโนมัติ จากนั้นเลือก <b>ประเภท</b> ที่มีอยู่ในหมวดนั้นจากป๊อปอัปได้เลย</li>
          <li>เมื่อพิมพ์ถูกต้อง ช่องจะเปลี่ยนเป็นสีเขียว พร้อมปลดล็อก <b>ราคาและคะแนน</b> ทันที</li>
          <li><b>งบประมาณจำกัด 10,000,000 บาท</b> — หากใช้งบเกิน จะถูกหัก 2 คะแนนต่อทุกๆ 500,000 บาทที่เกิน</li>
          <li><b>แต่ละหมวดสร้างได้ไม่เกิน 2 จุด</b> — ต้องกระจายอย่างน้อย 5 หมวดจาก 7 หมวด</li>
          <li>มีเวลาปฏิบัติการทั้งหมด <b>10 นาที</b></li>
          <li>เมื่อสร้างครบ 10 จุด สามารถบันทึกคะแนนเข้าสู่ <b>กระดานอันดับ (Leaderboard)</b> เพื่อแข่งกับผู้เล่นอื่น</li>
        </ul>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" style={{ padding: '10px 24px', fontSize: 14 }} onClick={startMission}>
            <Play size={16} />
            <span>เริ่มปฏิบัติภารกิจ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
