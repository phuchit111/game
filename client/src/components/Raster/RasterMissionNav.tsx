import React from 'react';
import { useRasterStore } from '../../store/rasterStore';
import { BookOpen, CheckCircle2, Grid3X3, ListChecks, Map, Trophy, Waves } from 'lucide-react';
import { isRasterMissionComplete } from '../../utils/rasterMission';

const NAV_ITEMS = [
  { id: 'raster-explorer', number: '01', label: 'สำรวจ Grid', icon: Grid3X3 },
  { id: 'raster-flood', number: '02', label: 'หนีน้ำท่วม', icon: Waves },
  { id: 'raster-reclassify', number: '03', label: 'Reclassify', icon: Map },
  { id: 'raster-resolution', number: '04', label: 'Resolution', icon: BookOpen },
  { id: 'raster-quiz', number: '05', label: 'ควิซ', icon: ListChecks },
  { id: 'raster-leaderboard', number: '06', label: 'อันดับ', icon: Trophy },
] as const;

export const RasterMissionNav: React.FC = () => {
  const escapeStatus = useRasterStore((s) => s.escapeStatus);
  const classifyStatus = useRasterStore((s) => s.classifyStatus);
  const resStatus = useRasterStore((s) => s.resStatus);
  const quizAnswered = useRasterStore((s) => s.quizAnswered);
  const missionComplete = isRasterMissionComplete(escapeStatus, classifyStatus, resStatus, quizAnswered);
  const statuses = [
    true,
    escapeStatus !== 'idle',
    classifyStatus !== 'idle',
    resStatus !== 'idle',
    quizAnswered.every(Boolean),
    missionComplete,
  ];

  return (
    <nav className="raster-mission-nav" aria-label="ทางลัดในด่าน Raster">
      <div className="raster-nav-label">สารบัญด่าน</div>
      <div className="raster-nav-items">
        {NAV_ITEMS.map((item, index) => {
          const Icon = item.icon;
          return (
          <button key={item.id} className={`raster-nav-item ${statuses[index] ? 'done' : ''}`} disabled={item.id === 'raster-leaderboard' && !missionComplete} onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
            <span>{statuses[index] ? <CheckCircle2 size={13} /> : item.number}</span><Icon size={14} />{item.label}
          </button>
          );
        })}
      </div>
    </nav>
  );
};
