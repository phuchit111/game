import React from 'react';
import { HelpCircle } from 'lucide-react';

export const HelpCard: React.FC = () => {
  return (
    <aside className="help-card">
      <h4>
        <HelpCircle size={15} /> วิธีสร้างจุดข้อมูล
      </h4>
      <p style={{ marginBottom: 8 }}>
        คลิกตำแหน่งบนแผนที่ แล้วเลือกทั้ง <b>หมวด</b> และ <b>ประเภท</b> ในป๊อปอัป ระบบจะเติมข้อมูลลงตารางพร้อมพิกัด GIS และปลดล็อกราคา/คะแนนให้ทันที
      </p>
      <p style={{ color: 'var(--muted)', fontSize: 11 }}>
        <b>หมายเหตุ:</b> แต่ละหมวดสร้างได้ไม่เกิน 2 จุด (กระจายอย่างน้อย 5 หมวดให้ครบ 10 จุด) หากใช้งบเกิน <b>10,000,000 บาท</b> จะถูกหักคะแนนตามยอดที่เกิน
      </p>
    </aside>
  );
};
