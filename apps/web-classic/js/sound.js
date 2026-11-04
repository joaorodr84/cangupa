// Small sound effects, synthesized with the Web Audio API — no audio files,
// keeping the game dependency-free. `enabled` is set from settings.sound by
// ui.js; this module has no idea what settings are, only whether it's on.
const Sound = {
  ctx: null,
  enabled: true,

  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
    }
    // Browsers start an AudioContext suspended until a user gesture; every
    // call here already follows a click/keypress, so resuming is safe.
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },

  // A short tone, pitch optionally sliding from `freq` to `glideTo`, starting
  // `delay` seconds from now — lets `melody()` schedule several in sequence
  // without each one waiting on a `setTimeout`.
  tone(freq, duration, { type = 'sine', gain = 0.18, glideTo = null, delay = 0 } = {}) {
    if (!this.enabled) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const osc = ctx.createOscillator(), amp = ctx.createGain();
    osc.type = type;
    const t0 = ctx.currentTime + delay;
    osc.frequency.setValueAtTime(freq, t0);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t0 + duration);
    amp.gain.setValueAtTime(gain, t0);
    amp.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
    osc.connect(amp).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration);
  },

  // A short run of notes (Hz), each `step` seconds after the last.
  melody(freqs, { step = 0.09, duration = 0.14, type = 'triangle', gain = 0.18 } = {}) {
    freqs.forEach((freq, i) => this.tone(freq, duration, { type, gain, delay: i * step }));
  },

  jump() { this.tone(440, 0.12, { type: 'triangle', glideTo: 660 }); },

  // A cheerful ascending arpeggio (C5, E5, G5, C6) for clearing a level.
  win() { this.melody([523.25, 659.25, 783.99, 1046.5], { gain: 0.16 }); },

  // A descending glide, timed to the `.falling` CSS animation (ui.js's fall()).
  fall() { this.tone(300, 0.45, { type: 'sawtooth', gain: 0.14, glideTo: 70 }); },
};
