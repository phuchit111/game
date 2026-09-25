import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { Trophy, X, RefreshCw } from 'lucide-react';
import { LeaderboardPodium } from '../LeaderboardPodium';

export const LeaderboardModal: React.FC = () => {
  const activeModal = useGameStore((s) => s.activeModal);
  const leaderboard = useGameStore((s) => s.leaderboard);
  const isLoadingLeaderboard = useGameStore((s) => s.isLoadingLeaderboard);
  const finalScore = useGameStore((s) => s.finalScore);
  const loadScores = useGameStore((s) => s.loadScores);
  const closeModal = useGameStore((s) => s.closeModal);

  if (activeModal !== 'leaderboard' || finalScore === null) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-box" style={{ maxWidth: 580 }}>
        <div className="modal-eyebrow">
          <Trophy size={14} color="#f59e0b" /> HALL OF FAME
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, marginBottom: 12 }}>
          <h2 className="modal-title" style={{ margin: 0 }}>กระดานอันดับคะแนน</h2>
          <button
            className="btn"
            style={{ padding: '6px 10px', fontSize: 11.5 }}
            onClick={() => loadScores()}
            disabled={isLoadingLeaderboard}
          >
            <RefreshCw size={12} className={isLoadingLeaderboard ? 'spin' : ''} />
            <span>รีเฟรช</span>
          </button>
        </div>

        <LeaderboardPodium entries={leaderboard.slice(0, 5)} />

        <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', overflow: 'auto', maxHeight: '50vh', marginBottom: 16 }}>
          <table className="attribute-table" style={{ minWidth: 0 }}>
            <thead>
              <tr>
                <th style={{ width: 65 }}>อันดับ</th>
                <th>ชื่อผู้เล่น</th>
                <th style={{ width: 90 }}>คะแนน</th>
                <th style={{ width: 120 }}>โหมด</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: 20, color: 'var(--muted)' }}>
                    {isLoadingLeaderboard ? 'กำลังโหลดข้อมูล...' : 'ยังไม่มีผู้เล่นบันทึกคะแนน เป็นคนแรกเลย!'}
                  </td>
                </tr>
              ) : (
                leaderboard.map((row, index) => {
                  const rank = index + 1;
                  return (
                    <tr
                      key={row.id ?? index}
                      style={{
                        backgroundColor: rank === 1 ? 'rgba(254, 240, 138, 0.2)' : 'inherit',
                      }}
                    >
                      <td
                        className="mono-cell"
                        style={{
                          fontWeight: 700,
                          color: rank === 1 ? '#d97706' : rank === 2 ? '#64748b' : rank === 3 ? '#b45309' : 'inherit',
                        }}
                      >
                        #{rank}
                      </td>
                      <td style={{ fontWeight: 600 }}>{row.name}</td>
                      <td className="mono-cell" style={{ fontWeight: 700, color: 'var(--brand)' }}>
                        {row.score}
                      </td>
                      <td style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                        {row.mode === 'time' ? 'โบนัสเวลา' : row.mode === 'table' ? 'ตรวจครบถ้วน' : row.mode}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={closeModal}>
            <X size={14} />
            <span>ปิด</span>
          </button>
        </div>
      </div>
    </div>
  );
};
