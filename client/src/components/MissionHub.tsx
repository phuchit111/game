import React, { useEffect, useState } from 'react';
import {
  Activity,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Clock3,
  Database,
  Gamepad2,
  Globe2,
  Grid3X3,
  Layers3,
  Map,
  MapPin,
  MousePointerClick,
  RadioTower,
  RefreshCw,
  Target,
  Trophy,
  X,
  Users,
} from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { fetchOverallLeaderboard } from '../services/leaderboardService';
import type { MissionId } from '../types/player';
import type { OverallLeaderboardEntry } from '../types/mission';

interface MissionCard {
  id: MissionId;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  objective: string;
  learning: string;
  format: string;
  meta: string;
  time: string;
  accent: 'teal' | 'blue' | 'amber' | 'violet' | 'gold';
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
}

const MISSIONS: MissionCard[] = [
  {
    id: 'vector',
    number: '01',
    title: 'ข้อมูลเวกเตอร์',
    subtitle: 'Vector',
    description: 'ฝึกสร้างข้อมูล Point, Line และ Polygon บนแผนที่',
    objective: 'ทำภารกิจรูปทรงทั้ง 3 แบบให้ถูกต้อง',
    learning: 'Geometry ความยาว และพื้นที่',
    format: 'ปักหมุด + วาดเส้น/พื้นที่',
    meta: '3 รูปทรง',
    time: 'ตามโจทย์',
    accent: 'blue',
    icon: Map,
  },
  {
    id: 'attribute',
    number: '02',
    title: 'ตารางฐานข้อมูล',
    subtitle: 'Attribute Table',
    description: 'ปักหมุดข้อมูลบนแผนที่ แล้วกรอกประเภทข้อมูลในหน้าต่างเดียว',
    objective: 'สร้างจุดข้อมูลให้ครบตามโจทย์',
    learning: 'Attribute Table และข้อมูลคุณลักษณะ',
    format: 'คลิกแผนที่ + เลือกข้อมูล',
    meta: '10 จุด',
    time: '10 นาที',
    accent: 'teal',
    icon: Database,
  },
  {
    id: 'raster',
    number: '03',
    title: 'ข้อมูลราสเตอร์',
    subtitle: 'Raster',
    description: 'อ่านค่าจากเซลล์กริด เรียนรู้ DEM และการเปรียบเทียบความละเอียด',
    objective: 'ผ่านเกมย่อยและตอบคำถามท้ายหัวข้อ',
    learning: 'Grid Cell, DEM และ Resolution',
    format: 'คลิกเซลล์ + ตอบคำถาม',
    meta: '4 เกมย่อย',
    time: 'หลายภารกิจ',
    accent: 'amber',
    icon: Grid3X3,
  },
  {
    id: 'rs',
    number: '04',
    title: 'การรับรู้ระยะไกล',
    subtitle: 'Remote Sensing',
    description: 'เรียนรู้ช่วงคลื่นและการผสมภาพเพื่อวิเคราะห์พื้นผิวโลก',
    objective: 'เรียงลำดับและตอบคำถามให้ครบ',
    learning: 'Spectral bands, NIR และ False Color',
    format: 'เรียงลำดับ + ผสมแถบคลื่น',
    meta: '2 ภารกิจ',
    time: 'หลายภารกิจ',
    accent: 'violet',
    icon: RadioTower,
  },
  {
    id: 'coordinate',
    number: '05',
    title: 'ระบบพิกัดทางภูมิศาสตร์',
    subtitle: 'Geographic Coordinate System',
    description: 'ฝึกอ่าน Easting, Northing และระบุตำแหน่งบนแผนที่',
    objective: 'ทำโจทย์ระบบพิกัดให้ครบทุกข้อ',
    learning: 'UTM, WGS84, Latitude และ Longitude',
    format: 'คลิกกริด + ระบุตำแหน่ง',
    meta: '10 รอบ',
    time: 'ตามโจทย์',
    accent: 'gold',
    icon: Globe2,
  },
];

interface MissionHubProps {
  onSelectMission: (missionId: MissionId) => void;
}

export const MissionHub: React.FC<MissionHubProps> = ({ onSelectMission }) => {
  const [selectedMissionId, setSelectedMissionId] = useState<MissionId | ''>('');
  const [selectionError, setSelectionError] = useState('');
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [overallLeaderboard, setOverallLeaderboard] = useState<OverallLeaderboardEntry[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const completedMissions = usePlayerStore((state) => state.completedMissions);
  const bestScores = usePlayerStore((state) => state.bestScores);
  const playerName = usePlayerStore((state) => state.playerName);

  const completedCount = MISSIONS.filter((mission) => completedMissions[mission.id]).length;
  const totalScore = MISSIONS.reduce((total, mission) => total + (bestScores[mission.id] ?? 0), 0);
  const selectedMission = MISSIONS.find((mission) => mission.id === selectedMissionId);
  const selectedBestScore = selectedMission ? bestScores[selectedMission.id] : undefined;
  const SelectedMissionIcon = selectedMission?.icon ?? Layers3;

  const loadOverallLeaderboard = async () => {
    setIsLoadingLeaderboard(true);
    const result = await fetchOverallLeaderboard();
    setOverallLeaderboard(result.list);
    setIsLoadingLeaderboard(false);
  };

  const handleOpenLeaderboard = () => {
    setIsLeaderboardOpen(true);
    void loadOverallLeaderboard();
  };

  useEffect(() => {
    if (!isLeaderboardOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsLeaderboardOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLeaderboardOpen]);

  const handleSelectMission = (missionId: MissionId) => {
    setSelectedMissionId(missionId);
    setSelectionError('');
  };

  const handleStartMission = () => {
    if (!selectedMission) {
      setSelectionError('กรุณาเลือกการ์ดหัวข้อก่อนเริ่มเรียน');
      return;
    }

    onSelectMission(selectedMission.id);
  };

  return (
    <div className="mission-dashboard-screen">
      <div className="mission-dashboard-background" aria-hidden="true" />
      <div className="mission-dashboard-overlay" aria-hidden="true" />

      <main className="mission-dashboard" aria-labelledby="mission-dashboard-title">
        <header className="mission-dashboard-header">
          <div className="mission-dashboard-brand">
            <div className="mission-dashboard-brand-icon">
              <img src="/images/index/gis.png" alt="GIS Journey" />
            </div>
            <div>
              <strong>GIS JOURNEY</strong>
              <span>MAP-BASED LEARNING GAME</span>
            </div>
          </div>

          <button
            className="mission-dashboard-player"
            type="button"
            onClick={handleOpenLeaderboard}
            aria-haspopup="dialog"
            aria-expanded={isLeaderboardOpen}
            title="ดูกระดานอันดับผู้เล่น"
          >
            <Users size={17} />
            <span>ผู้เล่น</span>
            <strong>{playerName || 'ผู้เล่นใหม่'}</strong>
          </button>
        </header>

        <section className="mission-dashboard-hero">
          <div className="mission-dashboard-hero-copy">
            <span className="mission-dashboard-kicker"><Gamepad2 size={15} /> MISSION CONTROL</span>
            <h1 id="mission-dashboard-title">เลือกหัวข้อสำหรับการเรียนรู้ของคุณ</h1>
            <p>สำรวจพื้นฐาน GIS ผ่านหัวข้อสำหรับการเรียนรู้ทั้งหมด 5 หัวข้อ เลือกเรียนตามความสนใจและกลับมาทำคะแนนให้ดีที่สุดได้ทุกเมื่อ</p>
          </div>

          <div className="mission-dashboard-summary" aria-label="สรุปความคืบหน้า">
            <div className="mission-dashboard-summary-card">
              <div className="mission-dashboard-summary-icon"><CheckCircle2 size={17} /></div>
              <div><span>หัวข้อที่เรียนรู้ไปแล้ว</span><strong>{completedCount}<small>/ 5</small></strong></div>
            </div>
            <div className="mission-dashboard-summary-card">
              <div className="mission-dashboard-summary-icon"><Trophy size={17} /></div>
              <div><span>คะแนนดีที่สุดรวม</span><strong>{totalScore.toLocaleString('th-TH')}</strong></div>
            </div>
            <div className="mission-dashboard-summary-card">
              <div className="mission-dashboard-summary-icon"><Activity size={17} /></div>
              <div><span>ความคืบหน้า</span><strong>{Math.round((completedCount / MISSIONS.length) * 100)}<small>%</small></strong></div>
            </div>
          </div>
        </section>

        <div className="mission-dashboard-progress" aria-label={`เรียนรู้แล้ว ${completedCount} จาก 5 หัวข้อ`}>
          <div className="mission-dashboard-progress-label">
            <span>ความคืบหน้าการเดินทาง</span>
            <strong>{completedCount} / {MISSIONS.length} หัวข้อ</strong>
          </div>
          <div className="mission-dashboard-progress-track">
            <span style={{ width: `${(completedCount / MISSIONS.length) * 100}%` }} />
          </div>
        </div>

        <section className="mission-dashboard-workspace">
          <div className="mission-dashboard-list-panel">
            <div className="mission-dashboard-section-heading">
              <div>
                <span>MISSION LIST</span>
                <h2>หัวข้อสำหรับการเรียนรู้ทั้งหมด</h2>
              </div>
              <p>เลือกการ์ดเพื่อดูรายละเอียด</p>
            </div>

            <div className="mission-dashboard-list">
              {MISSIONS.map((mission) => {
                const MissionIcon = mission.icon;
                const isSelected = selectedMissionId === mission.id;
                const isCompleted = completedMissions[mission.id];
                const score = bestScores[mission.id];

                return (
                  <button
                    key={mission.id}
                    type="button"
                    className={`mission-dashboard-card accent-${mission.accent} ${isSelected ? 'selected' : ''} ${isCompleted ? 'completed' : ''}`}
                    onClick={() => handleSelectMission(mission.id)}
                    aria-pressed={isSelected}
                  >
                    <div className="mission-dashboard-card-top">
                      <span className="mission-dashboard-number">{mission.number}</span>
                      <span className={`mission-dashboard-status ${isCompleted ? 'done' : ''}`}>
                        {isCompleted ? <CheckCircle2 size={13} /> : <span className="mission-dashboard-status-dot" />}
                        {isCompleted ? 'เรียนรู้แล้ว' : 'พร้อมเรียนรู้'}
                      </span>
                    </div>
                    <div className="mission-dashboard-card-icon"><MissionIcon size={25} /></div>
                    <h3>{mission.title}</h3>
                    <span className="mission-dashboard-card-subtitle">{mission.subtitle}</span>
                    <p>{mission.description}</p>
                    <div className="mission-dashboard-card-footer">
                      <span><Trophy size={13} /> {score === undefined ? 'ยังไม่มีคะแนน' : `${score.toLocaleString('th-TH')} คะแนน`}</span>
                      <ArrowRight size={16} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <aside className={`mission-dashboard-detail-panel ${selectedMission ? 'has-selection' : ''}`} aria-live="polite">
            {selectedMission ? (
              <>
                <div className="mission-dashboard-detail-topline">
                  <span>หัวข้อที่ {selectedMission.number}</span>
                  {completedMissions[selectedMission.id] && <span className="mission-dashboard-detail-complete"><CheckCircle2 size={14} /> เรียนรู้แล้ว</span>}
                </div>
                <div className="mission-dashboard-detail-title">
                  <div className="mission-dashboard-detail-icon"><SelectedMissionIcon size={31} /></div>
                  <div>
                    <h2>{selectedMission.title}</h2>
                    <p>{selectedMission.subtitle}</p>
                  </div>
                </div>
                <p className="mission-dashboard-detail-description">{selectedMission.description}</p>

                <div className="mission-dashboard-detail-grid">
                  <div><Target size={17} /><span>เป้าหมาย</span><strong>{selectedMission.objective}</strong></div>
                  <div><BookOpen size={17} /><span>เรียนรู้</span><strong>{selectedMission.learning}</strong></div>
                  <div><MousePointerClick size={17} /><span>วิธีเรียนรู้</span><strong>{selectedMission.format}</strong></div>
                  <div><MapPin size={17} /><span>กิจกรรม</span><strong>{selectedMission.meta}</strong></div>
                  <div><Clock3 size={17} /><span>เวลา</span><strong>{selectedMission.time}</strong></div>
                  <div><Award size={17} /><span>คะแนนดีที่สุด</span><strong>{selectedBestScore === undefined ? 'ยังไม่มีคะแนน' : `${selectedBestScore.toLocaleString('th-TH')} คะแนน`}</strong></div>
                </div>

                <div className="mission-dashboard-detail-action">
                  {selectionError && <p className="mission-dashboard-error" role="alert">{selectionError}</p>}
                  <button className="mission-dashboard-start-button" type="button" onClick={handleStartMission}>
                    {completedMissions[selectedMission.id] ? 'เรียนรู้หัวข้อนี้ซ้ำ' : 'เริ่มหัวข้อนี้'}
                    <ArrowRight size={18} />
                  </button>
                </div>
              </>
            ) : (
              <div className="mission-dashboard-empty-detail">
                <div className="mission-dashboard-empty-icon"><Layers3 size={31} /></div>
                <h2>รายละเอียดของแต่ละหัวข้อ</h2>
                <p>เลือกการ์ดด้านซ้ายเพื่อดูเป้าหมาย วิธีเรียนรู้ และคะแนนของหัวข้อนั้น</p>
                <span><MousePointerClick size={15} /> เลือกหัวข้อเพื่อเริ่มต้น</span>
              </div>
            )}
          </aside>
        </section>
      </main>

      {isLeaderboardOpen && (
        <div
          className="mission-dashboard-leaderboard-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsLeaderboardOpen(false);
          }}
        >
          <section
            className="mission-dashboard-leaderboard-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mission-dashboard-leaderboard-title"
          >
            <div className="mission-dashboard-leaderboard-header">
              <div>
                <span className="mission-dashboard-leaderboard-eyebrow"><Trophy size={14} /> OVERALL LEADERBOARD</span>
                <h2 id="mission-dashboard-leaderboard-title">กระดานอันดับผู้เล่น</h2>
                <p>คะแนนรวมจากหัวข้อที่เรียนรู้แล้ว และจำนวนหัวข้อที่เล่น</p>
              </div>
              <button
                className="mission-dashboard-leaderboard-icon-button"
                type="button"
                onClick={() => setIsLeaderboardOpen(false)}
                aria-label="ปิดกระดานอันดับผู้เล่น"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mission-dashboard-leaderboard-toolbar">
              <button type="button" onClick={() => void loadOverallLeaderboard()} disabled={isLoadingLeaderboard}>
                <RefreshCw size={13} className={isLoadingLeaderboard ? 'spin' : ''} /> รีเฟรช
              </button>
            </div>

            <div className="mission-dashboard-leaderboard-table-wrap">
              <table className="mission-dashboard-leaderboard-table">
                <thead>
                  <tr>
                    <th>อันดับ</th>
                    <th>ผู้เล่น</th>
                    <th>คะแนน</th>
                    <th>หัวข้อที่เล่น</th>
                  </tr>
                </thead>
                <tbody>
                  {overallLeaderboard.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="mission-dashboard-leaderboard-empty">
                        {isLoadingLeaderboard ? 'กำลังโหลดข้อมูล...' : 'ยังไม่มีผู้เล่นบันทึกคะแนน'}
                      </td>
                    </tr>
                  ) : (
                    overallLeaderboard.map((entry, index) => {
                      const isCurrentPlayer = entry.name === playerName;
                      return (
                        <tr key={`${entry.name}-${index}`} className={isCurrentPlayer ? 'current-player' : ''}>
                          <td className="mission-dashboard-leaderboard-rank">#{index + 1}</td>
                          <td>
                            <strong>{entry.name}</strong>
                            {isCurrentPlayer && <small>ผู้เล่นปัจจุบัน</small>}
                          </td>
                          <td>
                            <strong>{entry.score.toLocaleString('th-TH')} คะแนน</strong>
                            <small>{entry.isComplete ? 'คะแนนรวมหัวข้อทั้งหมด' : 'คะแนนปัจจุบัน'}</small>
                          </td>
                          <td>{entry.playedTopics} / {MISSIONS.length} หัวข้อ</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="mission-dashboard-leaderboard-footer">
              <span>ครบทั้ง 5 หัวข้อจะแสดงคะแนนรวมหัวข้อทั้งหมด</span>
              <button className="mission-dashboard-start-button" type="button" onClick={() => setIsLeaderboardOpen(false)}>
                <X size={15} /> ปิด
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
