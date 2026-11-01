// Ported from apps/web-classic/style.css's `[data-theme="..."]` custom
// property blocks. Colour values are copied as-is; CSS custom properties
// with no React Native equivalent (gradients, box-shadows) are approximated
// in the board screen that consumes this palette, not here.
import { type Theme } from '../state/settings';

export interface Star {
  readonly xPct: number;
  readonly yPct: number;
  // Diameter in px, at the tile size the starfield was designed at
  // (STARFIELD_TILE_SIZE) — twice style.css's radial-gradient radius.
  readonly size: number;
  readonly color: string;
}

export interface Palette {
  // The two ends of the page's background gradient.
  readonly bg1: string;
  readonly bg2: string;
  // The board's outer frame.
  readonly frame: string;
  // The board's background, behind the tiles.
  readonly pit: string;
  readonly tile: string;
  readonly tile2: string;
  // The "drop shadow" a tile sits on, one shade per tile kind.
  readonly edge: string;
  readonly edge2: string;
  readonly ink: string;
  readonly muted: string;
  readonly panel: string;
  // The starfield dots drawn over the page background (space only).
  readonly stars: readonly Star[];
}

// The period, in px, the starfield tiles at — style.css's `--stars-size`.
export const STARFIELD_TILE_SIZE = 260;

const STARFIELD: readonly Star[] = [
  { xPct: 12, yPct: 18, size: 2.4, color: '#fff' },
  { xPct: 33, yPct: 72, size: 2, color: '#cfe4ff' },
  { xPct: 58, yPct: 34, size: 3, color: '#fff' },
  { xPct: 81, yPct: 12, size: 2, color: '#fff6cf' },
  { xPct: 90, yPct: 66, size: 2.4, color: '#fff' },
  { xPct: 47, yPct: 90, size: 2, color: '#cfe4ff' },
  { xPct: 70, yPct: 55, size: 1.6, color: '#fff' },
  { xPct: 22, yPct: 44, size: 1.6, color: '#fff' },
];

// style.css's `:root` defaults, used by any theme that does not override them.
const DEFAULT_INK = '#f4ecdf';
const DEFAULT_MUTED = '#b9a98f';
const DEFAULT_PANEL = 'rgba(255,255,255,.06)';

export const PALETTES: Readonly<Record<Theme, Palette>> = {
  cosmos: {
    bg1: '#1b1546',
    bg2: '#07051a',
    frame: '#120e33',
    pit: '#0a0722',
    tile: '#4cc9f0',
    tile2: '#ffc857',
    edge: '#1f7a99',
    edge2: '#a8741a',
    ink: DEFAULT_INK,
    muted: DEFAULT_MUTED,
    panel: DEFAULT_PANEL,
    stars: [],
  },
  space: {
    bg1: '#0b0b2a',
    bg2: '#02020c',
    frame: 'rgba(8,8,32,.55)',
    pit: 'transparent',
    tile: '#2fbf5a',
    tile2: '#b9e63a',
    edge: '#13702f',
    edge2: '#6f8f12',
    ink: DEFAULT_INK,
    muted: DEFAULT_MUTED,
    panel: DEFAULT_PANEL,
    stars: STARFIELD,
  },
  sand: {
    bg1: '#e9d8b4',
    bg2: '#c9a96e',
    frame: '#8a6a3b',
    pit: '#6d522d',
    tile: '#e07a5f',
    tile2: '#f2cc8f',
    edge: '#a2503a',
    edge2: '#b98a3e',
    ink: '#2b2013',
    muted: '#6a5638',
    panel: 'rgba(0,0,0,.07)',
    stars: [],
  },
  ice: {
    bg1: '#e8f1f8',
    bg2: '#b8cfe3',
    frame: '#7d9bb8',
    pit: '#587592',
    tile: '#ffffff',
    tile2: '#9ad1f5',
    edge: '#9db4c9',
    edge2: '#4f8fbd',
    ink: '#1c2a3a',
    muted: '#52667c',
    panel: 'rgba(0,0,0,.06)',
    stars: [],
  },
  classic: {
    bg1: '#1d4d36',
    bg2: '#0e2a1c',
    frame: '#3b2a1a',
    pit: '#1a110a',
    tile: '#8fce6a',
    tile2: '#f0c24a',
    edge: '#4c8a34',
    edge2: '#a37d17',
    ink: DEFAULT_INK,
    muted: DEFAULT_MUTED,
    panel: DEFAULT_PANEL,
    stars: [],
  },
};

export function paletteFor(theme: Theme): Palette {
  return PALETTES[theme];
}
