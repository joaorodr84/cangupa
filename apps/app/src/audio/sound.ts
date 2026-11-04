// Small sound effects, ported from apps/web-classic/js/sound.js. That
// version synthesizes tones live with the Web Audio API; React Native has
// no equivalent, so the same tones are pre-rendered to WAV files instead
// (tools/gen-sounds.js) and played back here through expo-audio. `setEnabled`
// is driven from Settings.sound by whichever screen owns it; this module has
// no idea what settings are, only whether it's on — same split as the web
// version's `Sound.enabled`.
import { createAudioPlayer } from 'expo-audio';

const jumpSource = require('../../assets/sounds/jump.wav');
const winSource = require('../../assets/sounds/win.wav');
const fallSource = require('../../assets/sounds/fall.wav');

let enabled = true;

export function setEnabled(value: boolean): void {
  enabled = value;
}

// Created once and replayed from the start each time, rather than a fresh
// player per call — cheap enough for a short one-shot effect, and avoids
// piling up players never torn down while the move it's tied to finishes.
const jumpPlayer = createAudioPlayer(jumpSource);
const winPlayer = createAudioPlayer(winSource);
const fallPlayer = createAudioPlayer(fallSource);

function replay(player: ReturnType<typeof createAudioPlayer>): void {
  if (!enabled) return;
  player.seekTo(0);
  player.play();
}

export function jump(): void {
  replay(jumpPlayer);
}

export function win(): void {
  replay(winPlayer);
}

export function fall(): void {
  replay(fallPlayer);
}
