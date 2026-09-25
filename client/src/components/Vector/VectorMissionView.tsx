import React, { useState, useEffect, useCallback } from 'react';
import { useVectorStore } from '../../store/vectorStore';
import { VectorBriefing } from './VectorBriefing';
import { VectorHeader } from './VectorHeader';
import { VectorMap } from './VectorMap';
import { VectorPanel } from './VectorPanel';
import { VectorModals } from './VectorModals';
import type { MissionId } from '../../types/player';

interface VectorMissionViewProps {
  onBackToHub: () => void;
  onSelectMission: (missionId: MissionId) => void;
}

export const VectorMissionView: React.FC<VectorMissionViewProps> = ({ onBackToHub, onSelectMission }) => {
  const page = useVectorStore((s) => s.page);
  const tickTimer = useVectorStore((s) => s.tickTimer);
  const timerRunning = useVectorStore((s) => s.timerRunning);
  const startTimer = useVectorStore((s) => s.startTimer);
  const validateSubmission = useVectorStore((s) => s.validateSubmission);
  const feedbackMsg = useVectorStore((s) => s.feedbackMsg);

  const [userLayer, setUserLayer] = useState<any>(null);
  const [clearTrigger, setClearTrigger] = useState<number>(0);
  const [localFeedback, setLocalFeedback] = useState('');

  // Timer loop
  useEffect(() => {
    if (page !== 'game' || !timerRunning) return;
    const interval = setInterval(() => {
      tickTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [page, timerRunning, tickTimer]);

  const handleCheck = useCallback((layer = userLayer) => {
    const res = validateSubmission(layer);
    if (!res.success && res.message) {
      setLocalFeedback(res.message);
      window.setTimeout(() => setLocalFeedback(''), 4200);
    }
  }, [userLayer, validateSubmission]);

  const handleClear = () => {
    setUserLayer(null);
    setClearTrigger((prev) => prev + 1);
  };

  if (page === 'brief' || page === 'start') {
    return <VectorBriefing onBackToHub={onBackToHub} />;
  }

  return (
    <div className="app-container vector-mission-shell">
      <VectorHeader onBackToHub={onBackToHub} />

      <main className="main-view vector-main-view">
        <VectorMap onUserLayerChange={setUserLayer} onCheck={handleCheck} onClear={handleClear} clearTrigger={clearTrigger} />
        <VectorPanel onPlay={startTimer} />
        {(localFeedback || feedbackMsg) && (
          <div className="vector-feedback-toast" role="status">{localFeedback || feedbackMsg}</div>
        )}
      </main>

      <VectorModals onBackToHub={onBackToHub} onSelectMission={onSelectMission} />
    </div>
  );
};
