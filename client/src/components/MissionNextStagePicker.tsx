import React from 'react';
import { ArrowRight, Home } from 'lucide-react';
import type { MissionId } from '../types/player';

const MISSION_OPTIONS: Array<{ id: MissionId; number: string; title: string }> = [
  { id: 'vector', number: '01', title: 'ข้อมูลเวกเตอร์' },
  { id: 'attribute', number: '02', title: 'ตารางฐานข้อมูล' },
  { id: 'raster', number: '03', title: 'ข้อมูลราสเตอร์' },
  { id: 'rs', number: '04', title: 'การรับรู้ระยะไกล' },
  { id: 'coordinate', number: '05', title: 'ระบบพิกัดทางภูมิศาสตร์' },
];

interface MissionNextStagePickerProps {
  currentMission: MissionId;
  completedMissions: Record<MissionId, boolean>;
  scoreSaved: boolean;
  onSelectMission: (missionId: MissionId) => void;
  onBackToHub: () => void;
}

export const MissionNextStagePicker: React.FC<MissionNextStagePickerProps> = ({
  currentMission,
  completedMissions,
  scoreSaved,
  onSelectMission,
  onBackToHub,
}) => {
  const nextMissions = MISSION_OPTIONS.filter(
    (mission) => mission.id !== currentMission && !completedMissions[mission.id],
  );

  return (
    <div
      style={{
        marginTop: 20,
        paddingTop: 16,
        borderTop: '1px solid var(--line)',
      }}
    >
      <div style={{ marginBottom: 10 }}>
        <strong style={{ display: 'block', color: '#0f172a', fontSize: 14 }}>
          เลือกหัวข้อที่จะเรียนรู้ต่อไป
        </strong>
        <span style={{ color: '#64748b', fontSize: 12.5 }}>
          {scoreSaved ? 'เลือกหัวข้อถัดไปจากรายการด้านล่างได้เลย' : 'กรุณาบันทึกคะแนนก่อนเลือกหัวข้อถัดไป'}
        </span>
      </div>

      {nextMissions.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 10 }}>
          {nextMissions.map((mission) => (
            <button
              key={mission.id}
              className="btn btn-primary"
              type="button"
              onClick={() => onSelectMission(mission.id)}
              disabled={!scoreSaved}
              style={{ justifyContent: 'space-between', textAlign: 'left', padding: '11px 13px' }}
            >
              <span><b>หัวข้อ {mission.number}</b> · {mission.title}</span>
              <ArrowRight size={15} />
            </button>
          ))}
        </div>
      ) : (
        <div style={{ padding: '12px 14px', borderRadius: 9, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', fontSize: 13.5 }}>
          คุณเรียนรู้ครบทุกหัวข้อแล้ว สามารถกลับไปดูสรุปความคืบหน้าใน Hub ได้
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
        <button className="btn mission-return-hub-button" type="button" onClick={onBackToHub}>
          <Home size={14} />
          <span>กลับ Hub</span>
        </button>
      </div>
    </div>
  );
};
