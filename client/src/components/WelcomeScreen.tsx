import React, { useRef, useState } from 'react';
import { usePlayerStore } from '../store/playerStore';

interface WelcomeScreenProps {
  onContinue: () => void;
}

type WelcomeStep = 'start' | 'name';

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onContinue }) => {
  const playerName = usePlayerStore((state) => state.playerName);
  const setPlayerName = usePlayerStore((state) => state.setPlayerName);
  const [step, setStep] = useState<WelcomeStep>('start');
  const [error, setError] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleNext = () => {
    if (!playerName.trim()) {
      setError('กรุณากรอกชื่อผู้เล่นก่อนดำเนินการต่อ');
      nameInputRef.current?.focus();
      return;
    }

    setError('');
    onContinue();
  };

  const handleStart = () => {
    setStep('name');
    window.requestAnimationFrame(() => nameInputRef.current?.focus());
  };

  return (
    <div className={`welcome-screen welcome-screen-${step}`}>
      <div className="welcome-background" aria-hidden="true" />
      <div className="welcome-overlay" aria-hidden="true" />

      <main className="welcome-content">
        <div className="welcome-brand">
          <img
            className="welcome-logo-image"
            src="/images/index/game-gis-journey-transparent.png"
            alt="GIS Journey"
          />
        </div>

        {step === 'name' && (
          <section className="welcome-interaction" aria-live="polite">
            <div className="welcome-name-block">
              <label className="sr-only" htmlFor="welcome-player-name">ชื่อผู้เล่น</label>
              <div className="welcome-name-input-wrap">
                <input
                  ref={nameInputRef}
                  id="welcome-player-name"
                  type="text"
                  value={playerName}
                  onChange={(event) => {
                    setPlayerName(event.target.value);
                    if (error) setError('');
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') handleNext();
                  }}
                  placeholder="กรอกชื่อผู้เล่น"
                  maxLength={30}
                  autoComplete="nickname"
                  autoFocus
                />
              </div>
              {error && <p className="welcome-error" role="alert">{error}</p>}
            </div>
          </section>
        )}

        <div className="welcome-actions">
          <button
            className={`welcome-main-button ${step === 'start' ? 'is-start' : 'is-next'}`}
            type="button"
            onClick={step === 'start' ? handleStart : handleNext}
          >
            {step === 'start' ? 'START' : 'NEXT'}
          </button>
        </div>
      </main>
    </div>
  );
};

