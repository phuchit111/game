import React from 'react';
import { useVectorStore } from '../../store/vectorStore';
import { SCORE_CONFIG } from '../../constants/vectorData';
import { Info, MousePointer, MapPin, Play, Ruler, Square, Clock } from 'lucide-react';

interface VectorPanelProps {
  onPlay: () => void;
}

export const VectorPanel: React.FC<VectorPanelProps> = ({ onPlay }) => {
  const stage = useVectorStore((s) => s.stage);
  const lineRoundIndex = useVectorStore((s) => s.lineRoundIndex);
  const currentTarget = useVectorStore((s) => s.currentTarget);
  const currentLineTargets = useVectorStore((s) => s.currentLineTargets);
  const timer = useVectorStore((s) => s.timer);
  const timerRunning = useVectorStore((s) => s.timerRunning);
  const openModal = useVectorStore((s) => s.openModal);

  let title = '';
  let desc = '';
  let progressText = '';

  if (stage === 1) {
    title = `ปักหมุดหา: ${currentTarget?.name || 'กำลังสุ่ม...'}`;
    desc = 'เมื่อพร้อมแล้วกดปุ่ม “เล่น” เพื่อเริ่มจับเวลา 60 วินาที จากนั้นคลิกปักหมุดและบันทึกข้อมูล Attribute Data ใน Pop-up';
  } else if (stage === 2) {
    const route = currentLineTargets.map((t) => t.name).join(' ➔ ');
    title = 'วาดเส้นเชื่อมต่อ 3 สถานที่';
    desc = `ลากเส้นตามลำดับ: ${route}`;
    progressText = `รอบ ${lineRoundIndex + 1}/${SCORE_CONFIG.line.rounds} — เส้นต้องผ่านรัศมี ~150 เมตรของทั้ง 3 จุดตามลำดับ`;
  } else if (stage === 3) {
    title = 'วาดขอบเขต "สระพลาสติก"';
    desc = 'คลิกมุมต่างๆ รอบสระพลาสติกให้ครอบคลุมพื้นที่ทั้งหมด แล้วดับเบิลคลิกหรือคลิกกลับจุดแรกเพื่อปิดรูป Polygon';
  }

  return (
    <div className="ui-panel vector-task-panel">
      <div className="ui-title-row">
        <div>
          <div className="vector-task-label">โจทย์ที่ต้องทำ</div>
          <h3 className="ui-title">{stage === 1 ? <MapPin size={19} /> : stage === 2 ? <Ruler size={19} /> : <Square size={19} />}{title}</h3>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {(stage === 2 || stage === 3) && (
            <button
              className="info-btn"
              onClick={() => openModal('howto')}
              title="วิธีใช้เครื่องมือวาด"
            >
              <MousePointer size={14} />
            </button>
          )}
          <button
            className="info-btn"
            onClick={() => openModal('info')}
            title="อธิบายเพิ่มเติมเกี่ยวกับเวกเตอร์นี้"
          >
            <Info size={15} />
          </button>
        </div>
      </div>

      <div className={`vector-timer vector-task-timer ${timerRunning && timer <= 15 ? 'urgent' : ''}`}>
        <Clock size={16} />
        <span><small>{!timerRunning ? 'กด “เล่น” เพื่อเริ่ม' : 'เวลาคงเหลือ'}</small><strong>{timer}s</strong></span>
      </div>

      {progressText && <div className="ui-progress">{progressText}</div>}
      <div className="vector-howto-box">
        <span className="vector-howto-label">วิธีเล่น</span>
        {stage === 2 ? (
          <>
            <p className="ui-desc">ลากเส้นตามลำดับสถานที่ที่โจทย์กำหนด:</p>
            <div className="line-target-sequence" aria-label="ลำดับสถานที่ที่ต้องลากเส้นผ่าน">
              {currentLineTargets.map((target, index) => (
                <React.Fragment key={`${target.name}-${index}`}>
                  <span className="line-target-chip">
                    <span className="line-target-number">{index + 1}</span>
                    <strong>{target.name}</strong>
                  </span>
                  {index < currentLineTargets.length - 1 && <span className="line-target-arrow" aria-hidden="true">➔</span>}
                </React.Fragment>
              ))}
            </div>
            <p className="line-target-instruction">คลิกจุด 1 → จุด 2 → จุด 3 แล้วดับเบิลคลิกที่จุดสุดท้ายเพื่อจบเส้น</p>
            <p className="vector-play-guide">เมื่อพร้อมแล้วกดปุ่ม “เล่น” เพื่อเริ่มจับเวลา {SCORE_CONFIG.line.time} วินาที</p>
            <div className="line-example-box">
              <span className="line-example-label">ตัวอย่างการเล่น</span>
              <p>เริ่มคลิกสถานที่หมายเลข <b>1</b> ต่อไปหมายเลข <b>2</b> และ <b>3</b> ตามลำดับ จากนั้นดับเบิลคลิกที่หมายเลข <b>3</b></p>
            </div>
          </>
        ) : (
          <>
            <p className="ui-desc">{desc}</p>
            {stage === 3 && <p className="vector-play-guide">เมื่อพร้อมแล้วกดปุ่ม “เล่น” เพื่อเริ่มจับเวลา {SCORE_CONFIG.polygon.time} วินาที</p>}
          </>
        )}
      </div>

      <div className="action-row">
        <button className="btn btn-primary action-btn" onClick={onPlay} disabled={timerRunning}>
          <Play size={16} fill="currentColor" />
          <span>{timerRunning ? 'กำลังเล่น' : 'เล่น'}</span>
        </button>
      </div>
    </div>
  );
};
