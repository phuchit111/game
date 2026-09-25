/**
 * Web Audio API Sound Effects for Remote Sensing and GIS Platform
 * Zero external audio assets required
 */
class SoundFXManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  constructor() {
    const saved = localStorage.getItem('rs_sound_enabled');
    this.enabled = saved !== '0';
  }

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    localStorage.setItem('rs_sound_enabled', this.enabled ? '1' : '0');
    if (this.enabled) this.click();
    return this.enabled;
  }

  public playTone(freq: number, type: OscillatorType, duration: number, delay = 0, gain = 0.15) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      const startTime = this.ctx.currentTime + delay;
      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);
      g.gain.setValueAtTime(gain, startTime);
      g.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
      osc.connect(g);
      g.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    } catch {
      // AudioContext playback error ignored
    }
  }

  public click() {
    this.playTone(600, 'sine', 0.05, 0, 0.08);
  }

  public pick() {
    this.playTone(520, 'triangle', 0.08, 0, 0.12);
  }

  public undo() {
    this.playTone(380, 'sine', 0.08, 0, 0.1);
  }

  public correct() {
    // Happy major chord arpeggio
    this.playTone(523.25, 'sine', 0.2, 0, 0.15); // C5
    this.playTone(659.25, 'sine', 0.2, 0.07, 0.15); // E5
    this.playTone(783.99, 'sine', 0.25, 0.14, 0.18); // G5
    this.playTone(1046.5, 'sine', 0.35, 0.21, 0.2); // C6
  }

  public wrong() {
    // Low double buzz
    this.playTone(280, 'sawtooth', 0.14, 0, 0.12);
    this.playTone(220, 'sawtooth', 0.22, 0.1, 0.12);
  }

  public victory() {
    // Fanfare
    const notes = [
      { f: 523.25, d: 0.12, t: 0 },
      { f: 659.25, d: 0.12, t: 0.12 },
      { f: 783.99, d: 0.12, t: 0.24 },
      { f: 1046.5, d: 0.35, t: 0.36 },
      { f: 880.0, d: 0.14, t: 0.52 },
      { f: 1046.5, d: 0.55, t: 0.66 },
    ];
    notes.forEach((n) => this.playTone(n.f, 'triangle', n.d, n.t, 0.2));
  }
}

export const SoundFX = new SoundFXManager();
