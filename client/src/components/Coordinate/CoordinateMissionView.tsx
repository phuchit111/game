import React, { useEffect } from 'react';
import { useCoordinateStore } from '../../store/coordinateStore';
import { CoordinateHeader } from './CoordinateHeader';
import { UTMGridStage } from './UTMGridStage';
import { Globe3DStage } from './Globe3DStage';
import { CoordinateResultModal } from './CoordinateResultModal';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { MissionId } from '../../types/player';

interface CoordinateMissionViewProps {
  onBackToHub: () => void;
  onSelectMission: (missionId: MissionId) => void;
}

export const CoordinateMissionView: React.FC<CoordinateMissionViewProps> = ({ onBackToHub, onSelectMission }) => {
  const page = useCoordinateStore((s) => s.page);
  const setPage = useCoordinateStore((s) => s.setPage);
  const phase = useCoordinateStore((s) => s.phase);
  const timerRunning = useCoordinateStore((s) => s.timerRunning);
  const tickTimer = useCoordinateStore((s) => s.tickTimer);
  const beginMission = useCoordinateStore((s) => s.beginMission);

  // Global game timer ticker
  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      tickTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, tickTimer]);

  // 1. Start Page
  if (page === 'start') {
    return (
      <div className="coordinate-page coordinate-start-page"
        style={{
          minHeight: '100vh',
          background: 'radial-gradient(circle at 15% -10%, #eef2f6 0%, transparent 45%), radial-gradient(circle at 100% 0%, #e9eef3 0%, transparent 40%), #eef1f4',
          color: '#1c2b3a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1.5rem',
          fontFamily: "'Sarabun', sans-serif",
        }}
      >
        <div className="coordinate-start-card"
          style={{
            maxWidth: 580,
            width: '100%',
            background: '#f7f2e4',
            border: '1px solid #ddd0a6',
            borderRadius: 14,
            padding: '2.5rem 2.2rem',
            textAlign: 'center',
            boxShadow: '0 16px 34px rgba(11,32,54,0.14)',
            position: 'relative',
          }}
        >
          <div className="coordinate-start-frame"
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
              right: 10,
              bottom: 10,
              border: '1px solid #c9972e',
              borderRadius: 8,
              opacity: 0.55,
              pointerEvents: 'none',
            }}
          />

          <div className="coordinate-compass" style={{ width: 68, height: 68, margin: '0 auto 16px' }}>
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
              <circle cx="50" cy="50" r="46" fill="none" stroke="#0b2036" strokeWidth="3" />
              <circle cx="50" cy="50" r="38" fill="none" stroke="#c9972e" strokeWidth="1.4" />
              <line x1="50" y1="8" x2="50" y2="92" stroke="#c9972e" strokeWidth="1" />
              <line x1="8" y1="50" x2="92" y2="50" stroke="#c9972e" strokeWidth="1" />
              <polygon points="50,16 57,50 50,44 43,50" fill="#a3372a" />
              <polygon points="50,84 57,50 50,56 43,50" fill="#0b2036" />
              <text x="50" y="12" textAnchor="middle" fontSize="9" fill="#0b2036" fontFamily="monospace" fontWeight="700">
                N
              </text>
            </svg>
          </div>

          <div className="coordinate-start-kicker" style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.16em', color: '#8a6a1f', marginBottom: 6, textTransform: 'uppercase' }}>
            RTSD · FIELD TRAINING DIVISION
          </div>

          <h1 className="coordinate-start-title" style={{ fontSize: 24, fontWeight: 800, color: '#0b2036', marginBottom: 12 }}>
            ภารกิจระบบพิกัด
          </h1>

          <p className="coordinate-start-description" style={{ color: '#5b6b78', fontSize: 14.5, lineHeight: 1.7, marginBottom: 24 }}>
            เรียนรู้ระบบพิกัดตั้งแต่พื้นฐาน พิกัดฉาก <b>UTM (Easting / Northing หน่วยเมตร)</b> ไปจนถึงเส้นละติจูดและเส้นลองจิจูด <b>(Latitude / Longitude)</b> บนลูกโลก 3 มิติที่หมุนได้จริง
          </p>

          <div className="coordinate-start-actions" style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button
              type="button"
              onClick={onBackToHub}
              className="coordinate-secondary-action"
              style={{
                padding: '11px 20px',
                borderRadius: 8,
                border: '1px solid #0b2036',
                background: 'transparent',
                color: '#0b2036',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              กลับหน้าหลัก
            </button>
            <button
              type="button"
              onClick={() => setPage('brief')}
              className="coordinate-primary-action"
              style={{
                padding: '11px 24px',
                borderRadius: 8,
                border: '1px solid #8a6a1f',
                background: 'linear-gradient(180deg, #e0b657, #c9972e)',
                color: '#0b2036',
                fontWeight: 700,
                fontSize: 14.5,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(138,106,31,0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>เริ่มภารกิจ</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Briefing Page
  if (page === 'brief') {
    return (
      <div className="coordinate-page coordinate-brief-page"
        style={{
          minHeight: '100vh',
          background: '#f7f2e4',
          color: '#1c2b3a',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: "'Sarabun', sans-serif",
        }}
      >
        <div className="coordinate-brief-banner" style={{ padding: '1.8rem 2rem 1.2rem', textAlign: 'center', background: '#0b2036', color: '#ffffff', borderBottom: '3px solid #c9972e' }}>
          <div className="coordinate-brief-kicker" style={{ fontFamily: 'monospace', fontSize: 11.5, letterSpacing: '0.1em', color: '#e0b657', marginBottom: 4 }}>
            BRIEFING · เอกสารสรุปภารกิจ
          </div>
          <h2 className="coordinate-brief-title" style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', margin: 0 }}>
            บทเรียนระบบพิกัดแผนที่ (Coordinate Systems)
          </h2>
        </div>

        <div className="coordinate-brief-content" style={{ maxWidth: 720, margin: '0 auto', padding: '1.8rem 2rem 2.5rem', lineHeight: 1.8, fontSize: 14.5, flex: 1 }}>
          <h3 style={{ color: '#0b2036', fontSize: 17, fontWeight: 700, marginTop: 0, marginBottom: 8 }}>
            ส่วนที่ 1 — พิกัดโครงข่าย UTM (Easting / Northing)
          </h3>
          <p>
            พิกัดคาร์ทีเซียน (Cartesian) ใช้เส้นสองเส้นตัดกันที่ <b>จุดอ้างอิง (Origin)</b> แกนนอนคือ X แกนตั้งคือ Y — ในงานแผนที่และ GIS เราใช้ระบบพิกัด <b>UTM (Universal Transverse Mercator)</b> ซึ่งแปลงเป็นหน่วย <b>"เมตร"</b> บนพื้นโลกจริง โดยเรียกแกน X ว่า <b>Easting (E)</b> และแกน Y ว่า <b>Northing (N)</b> — เส้นเมริเดียนกลางของแต่ละโซนถูกกำหนดให้มีค่า Easting = <b>500,000 เมตร</b> เสมอ (False Easting) เพื่อป้องกันค่าพิกัดติดลบ
          </p>
          <div style={{ display: 'inline-block', margin: '4px 0 18px', padding: '5px 12px', background: 'rgba(201,151,46,0.15)', color: '#8a6a1f', border: '1px solid #c9972e', borderRadius: 6, fontSize: 13, fontFamily: 'monospace' }}>
            เช่น E = 500,000 ม. | N = 1,600,000 ม. (UTM Zone 48 Datum WGS84)
          </div>

          <h3 style={{ color: '#0b2036', fontSize: 17, fontWeight: 700, marginTop: 12, marginBottom: 8 }}>
            ส่วนที่ 2 — Latitude / Longitude บนลูกโลก
          </h3>
          <p>
            เมื่อขยายแนวคิดนี้ไปบนโลกทรงกลม เราจะได้ <b>เส้นละติจูด (Latitude)</b> วัดจากเส้นศูนย์สูตรขึ้นเหนือ/ลงใต้ (-90° ถึง 90°) และ <b>เส้นลองจิจูด (Longitude)</b> วัดจากเส้นเมริเดียนแรกไปตะวันออก/ตะวันตก (-180° ถึง 180°) ในส่วนที่ 2 คุณจะได้หมุนลูกโลก 3 มิติจริงและคลิกหาตำแหน่งที่กำหนด
          </p>

          <h3 style={{ color: '#0b2036', fontSize: 17, fontWeight: 700, marginTop: 18, marginBottom: 8 }}>
            แหล่งอ้างอิงข้อมูล (Data & Content Sources)
          </h3>
          <ul style={{ margin: 0, paddingLeft: 20, color: '#5b6b78', fontSize: 13, lineHeight: 1.8 }}>
            <li><b>มาตรฐานระบบพิกัด UTM/WGS84:</b> ข้อกำหนด National Geospatial-Intelligence Agency (NGA) และทะเบียน EPSG</li>
            <li><b>แผนที่ฐานถนน:</b> OpenStreetMap contributors</li>
            <li><b>แผนที่ฐานดาวเทียม:</b> Esri World Imagery (ArcGIS Online)</li>
            <li><b>พื้นผิวลูกโลก 3 มิติ:</b> NASA Visible Earth "Blue Marble" & แบบจำลองภูมิประเทศ</li>
          </ul>
        </div>

        <div className="coordinate-brief-footer" style={{ padding: '1.2rem', textAlign: 'center', background: '#efe4c7', borderTop: '1px solid #ddd0a6', display: 'flex', justifyContent: 'center', gap: 12 }}>
          <button
            type="button"
            onClick={() => setPage('start')}
            className="coordinate-secondary-action"
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              border: '1px solid #0b2036',
              background: 'transparent',
              color: '#0b2036',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={16} /> ย้อนกลับ
          </button>
          <button
            type="button"
            onClick={beginMission}
            className="coordinate-primary-action"
            style={{
              padding: '10px 24px',
              borderRadius: 8,
              border: '1px solid #8a6a1f',
              background: 'linear-gradient(180deg, #e0b657, #c9972e)',
              color: '#0b2036',
              fontWeight: 700,
              fontSize: 14.5,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(138,106,31,0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
              <span>เริ่มเล่นเกม</span>
              <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // 3. Game Page
  return (
    <div className="coordinate-page coordinate-game-page"
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 0%, #f5f7f9 0%, #e9edf1 60%, #e2e7eb 100%)',
        color: '#1c2b3a',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Sarabun', sans-serif",
      }}
    >
      <CoordinateHeader onBackToHub={onBackToHub} />

      <main className="coordinate-game-main" style={{ maxWidth: 1180, width: '100%', margin: '0 auto', padding: '16px 14px 60px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {phase === 'A' && <UTMGridStage />}
        {phase === 'B' && <Globe3DStage />}
        <CoordinateResultModal onBackToHub={onBackToHub} onSelectMission={onSelectMission} />
      </main>
    </div>
  );
};
