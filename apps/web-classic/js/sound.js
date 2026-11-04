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

  // A short tone, pitch optionally sliding from `freq` to `glideTo`.
  tone(freq, duration, { type = 'sine', gain = 0.18, glideTo = null } = {}) {
    if (!this.enabled) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const osc = ctx.createOscillator(), amp = ctx.createGain();
    osc.type = type;
    const t0 = ctx.currentTime;
    osc.frequency.setValueAtTime(freq, t0);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t0 + duration);
    amp.gain.setValueAtTime(gain, t0);
    amp.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
    osc.connect(amp).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration);
  },

  jump() { this.tone(440, 0.12, { type: 'triangle', glideTo: 660 }); },
};
