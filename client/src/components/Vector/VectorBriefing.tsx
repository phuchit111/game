import React from 'react';
import { useVectorStore } from '../../store/vectorStore';
import { ArrowRight, BookOpen, Layers, Lightbulb, MapPin, Ruler, Square } from 'lucide-react';

interface VectorBriefingProps {
  onBackToHub?: () => void;
}

export const VectorBriefing: React.FC<VectorBriefingProps> = ({ onBackToHub }) => {
  const initGame = useVectorStore((s) => s.initGame);

  return (
    <div className="vector-briefing-page" style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Top Banner */}
      <div className="vector-briefing-banner" style={{ padding: '2.5rem 2rem', textAlign: 'center', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: '#dbeafe', color: '#1d4ed8', borderRadius: 20, fontSize: 12, fontWeight: 700, marginBottom: 12 }}>
          <Layers size={14} /> BRIEFING
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>บทเรียนข้อมูลเชิงพื้นที่แบบ Vector</h1>
        <p style={{ fontSize: 14, color: '#64748b', marginTop: 6, maxWidth: 640, margin: '6px auto 0' }}>
          เรียนรู้โครงสร้างเรขาคณิตตามมาตรฐาน OGC Simple Feature Access ผ่านภารกิจสำรวจพื้นที่ มหาวิทยาลัยขอนแก่น
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="vector-briefing-content" style={{ maxWidth: 740, margin: '0 auto', padding: '2rem 1.5rem', flex: 1, lineHeight: 1.8 }}>
        <p style={{ fontSize: 14, color: '#334155' }}>
          ข้อมูลเวกเตอร์ (Vector Data) คือการแทนตำแหน่งของวัตถุบนพื้นผิวโลกด้วยพิกัดทางภูมิศาสตร์ (x, y) บนระบบพิกัด <b>WGS84 (EPSG:4326)</b> ซึ่งแบ่งออกเป็น 3 รูปทรงเรขาคณิตหลัก:
        </p>

        {/* 3 Vector Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, margin: '22px 0' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18, textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <MapPin size={30} color="#2563eb" style={{ marginBottom: 8 }} />
            <b style={{ display: 'block', fontSize: 15, color: '#0f172a', marginBottom: 4 }}>Point (จุด)</b>
            <span style={{ fontSize: 12, color: '#64748b' }}>
              พิกัดเดี่ยว (x, y) ไม่มีความยาวหรือพื้นที่ แต่มี <b>Attribute Table</b> กำกับคุณลักษณะ เช่น ชื่ออาคาร
            </span>
            <span style={{ display: 'block', marginTop: 9, color: '#2563eb', fontSize: 11.5, fontWeight: 700 }}>
              เมื่อพร้อมแล้วกด “เล่น” เพื่อเริ่มจับเวลา 60 วินาที
            </span>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18, textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <Ruler size={30} color="#2563eb" style={{ marginBottom: 8 }} />
            <b style={{ display: 'block', fontSize: 15, color: '#0f172a', marginBottom: 4 }}>Line (เส้น)</b>
            <span style={{ fontSize: 12, color: '#64748b' }}>
              จุดตั้งแต่ 2 จุดขึ้นไปเชื่อมต่อกันเป็นเส้น มี 1 มิติ สามารถคำนวณ <b>ความยาว (Length)</b> ได้
            </span>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18, textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <Square size={30} color="#16a34a" style={{ marginBottom: 8 }} />
            <b style={{ display: 'block', fontSize: 15, color: '#0f172a', marginBottom: 4 }}>Polygon (พื้นที่)</b>
            <span style={{ fontSize: 12, color: '#64748b' }}>
              เส้นปิดที่บรรจบจุดเริ่มต้น มี 2 มิติ สามารถคำนวณ <b>พื้นที่ (Area)</b> และเส้นรอบรูป (Perimeter) ได้
            </span>
          </div>
        </div>

        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '14px 16px', fontSize: 13, color: '#78350f', lineHeight: 1.7, marginBottom: 20 }}>
          <Lightbulb size={15} style={{ verticalAlign: 'middle' }} /> <b>หัวใจสำคัญ:</b> ในระบบ GIS ข้อมูลเชิงตำแหน่ง (Geometry) ต้องทำงานควบคู่กับข้อมูลเชิงบรรยาย (Attribute Data) เสมอ เพื่อให้สามารถสืบค้น คัดกรอง และประมวลผลได้อย่างมีประสิทธิภาพ
        </div>

        {/* References */}
        <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: 18, marginTop: 24 }}>
          <h3 style={{ fontSize: 13.5, color: '#475569', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <BookOpen size={15} /> แหล่งอ้างอิงทางวิชาการ
          </h3>
          <ol style={{ paddingLeft: 20, fontSize: 12, color: '#64748b', lineHeight: 1.7 }}>
            <li>Open Geospatial Consortium (OGC) — <i>OGC Simple Feature Access</i> (Point, LineString, Polygon)</li>
            <li>ISO 19125-1:2004, <i>Geographic information — Simple feature access</i></li>
            <li>ESRI GIS Dictionary — Vector data model, Attribute data, Geodesic area</li>
          </ol>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="vector-briefing-footer" style={{ padding: '1.25rem', background: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center', gap: 12 }}>
        {onBackToHub && (
          <button className="btn" onClick={onBackToHub}>
            ← กลับหน้าหลัก (Hub)
          </button>
        )}
        <button className="btn btn-primary" style={{ padding: '10px 24px', fontSize: 14 }} onClick={initGame}>
          <span>เข้าสู่การเล่น Vector Mission</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
