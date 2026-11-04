// Ten colours, one per level pack, in pack order (CANGUPA-73) — the same
// idea as DigiSpin's own DIGIT_COLORS (src/game/digits.ts): a fixed,
// hand-picked hue progression rather than anything derived from the theme
// palette, since a pack carries no equivalent of DigiSpin's "digit" to key
// a colour off. Used as the background of each pack's own row on
// LevelPacksScreen, same across light and dark mode — CANGUPA-42 made the
// same call for this app's tile/edge accent colours, for the same reason:
// an accent belongs to the app, not to the palette it's shown against.
import { contrastRatio } from '@joaorodr84/themes';

export const PACK_COLORS: readonly string[] = [
  '#4a8c3f', // Meadow
  '#2c92c8', // Creek
  '#8a6d3b', // Gully
  '#cc8a31', // Outcrop
  '#1f8a82', // Billabong
  '#a0522d', // Ridge
  '#cc6f1f', // Mesa
  '#5b4b8a', // Gorge
  '#7b277a', // Plateau
  '#a8323f', // Outback
];

// The label colour for a pack's own colour: whichever of white and black
// gives the higher contrast against it, computed rather than hand-listed —
// DigiSpin's own labelColorFor (digits.ts) exists because a hand-listed set
// got two colours wrong.
export function packLabelColorFor(packIndex: number): string {
  const color = PACK_COLORS[packIndex % PACK_COLORS.length];
  return contrastRatio(color, '#ffffff') > contrastRatio(color, '#000000') ? '#ffffff' : '#000000';
}
