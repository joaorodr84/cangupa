// Renders apps/app's sound effects to assets/sounds/*.wav. React Native has
// no Web Audio API to synthesize tones live the way
// apps/web-classic/js/sound.js does, so the same tones are rendered once,
// here, to small WAV files that src/audio/sound.ts bundles and plays through
// expo-audio instead. Run with `node tools/gen-sounds.js` whenever a tone's
// parameters change; the output is committed alongside this script, the same
// pattern tools/gen-levels.js (web-classic) uses for its own
// generated-then-committed output. Only jump() ships here (CANGUPA-57) —
// win()/fall() (CANGUPA-59/CANGUPA-60) add their own tones to this same file
// rather than starting a second script.
const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const OUT_DIR = path.join(__dirname, '..', 'assets', 'sounds');

// A single oscillator note: `type` is a Web Audio oscillator type (only the
// ones sound.js actually uses), `freq`/`glideTo` give an exponential pitch
// slide (glideTo omitted: constant pitch), and `gain` decays exponentially
// to silence over `duration` seconds, mirroring sound.js's `tone()`.
function renderTone(samples, startSample, { freq, glideTo = null, duration, type, gain }) {
  const n = Math.round(duration * SAMPLE_RATE);
  let phase = 0;
  for (let i = 0; i < n && startSample + i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    const f = glideTo ? freq * (glideTo / freq) ** (t / duration) : freq;
    phase += (2 * Math.PI * f) / SAMPLE_RATE;
    const wave = waveform(type, phase);
    // Exponential decay to near-silence, same shape as the Web Audio
    // GainNode.exponentialRampToValueAtTime(0.001, ...) call it mirrors.
    const g = gain * (0.001 / gain) ** (t / duration);
    samples[startSample + i] += wave * g;
  }
}

function waveform(type, phase) {
  const x = phase % (2 * Math.PI);
  switch (type) {
    case 'sine':
      return Math.sin(x);
    case 'triangle':
      return (2 / Math.PI) * Math.asin(Math.sin(x));
    case 'sawtooth':
      return x / Math.PI - 1;
    default:
      throw new Error(`unknown waveform type: ${type}`);
  }
}

// A single tone, optionally gliding in pitch — mirrors sound.js's `tone()`.
function renderSingle(duration, opts) {
  const samples = new Float64Array(Math.round(duration * SAMPLE_RATE));
  renderTone(samples, 0, { duration, ...opts });
  return samples;
}

function writeWav(file, samples) {
  const pcm = Buffer.alloc(samples.length * 2);
  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    pcm.writeInt16LE(Math.round(clamped * 32767), i * 2);
  }
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // fmt chunk size
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(SAMPLE_RATE * 2, 28); // byte rate
  header.writeUInt16LE(2, 32); // block align
  header.writeUInt16LE(16, 34); // bits per sample
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, file), Buffer.concat([header, pcm]));
}

// Parameters match apps/web-classic/js/sound.js's jump() exactly.
writeWav('jump.wav', renderSingle(0.12, { freq: 440, glideTo: 660, type: 'triangle', gain: 0.18 }));

console.log(`wrote ${OUT_DIR}\\jump.wav`);
