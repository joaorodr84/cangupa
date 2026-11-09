// Palette's shape is this game's own — a gradient-background, tile-based
// board, not DigiSpin's well-and-tray one — so it stays local rather than
// importing @joaorodr84/themes's own Palette/paletteFor outright. ThemeMode
// and SystemScheme (CANGUPA-40) do come from that package, the same
// mode-resolution types DigiSpin uses (DIGISPIN-194), so both apps agree on
// what 'system'/'light'/'dark' and a device's reported scheme mean. DARK and
// LIGHT below (CANGUPA-43) read their surface/text fields live from the
// package's own DARK/LIGHT, so this app's two appearances track DigiSpin's
// exactly as that package evolves, instead of holding a hex snapshot of it.
import { type ImageSourcePropType } from 'react-native';
import { DARK as THEMES_DARK, LIGHT as THEMES_LIGHT, type SystemScheme, type ThemeMode } from '@joaorodr84/themes';

export type { SystemScheme, ThemeMode };

// cangupa-logo-{light,dark}-vertical from assets/png at the repo root
// (TILE-JUMPER-7), re-exported here cropped tight to its content — the
// source canvas carries ~38% of empty transparent margin below the
// wordmark that would otherwise show up as dead space in the stack
// HomeScreen.tsx puts below it. "light"/"dark" name the text colour,
// matching apps/app/assets/icon-light.png's convention, so a theme with
// dark ink (a light background) takes the dark-text "light" logo and vice
// versa.
const LOGO_LIGHT = require('../../assets/logo-light.png') as ImageSourcePropType;
const LOGO_DARK = require('../../assets/logo-dark.png') as ImageSourcePropType;

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
  // The Steel tile (three visits) and the Departure tile (CANGUPA-68, CANGUPA-69's arrow tile, renamed and
  // recoloured green by CANGUPA-87 — raspberry is reserved for the future Arrival tile instead, see
  // docs/tile-ideas.md). Like tile/tile2 they are this game's own and stay the same in both themes. The
  // Departure tile's lip is lighter than its face: a dark face's darker lip would vanish on the dark board.
  readonly tile3: string;
  readonly edge3: string;
  readonly tileDeparture: string;
  readonly edgeDeparture: string;
  // The Arrival tile (CANGUPA-104, shipped from CANGUPA-88): raspberry red, the Departure tile's own
  // colour before CANGUPA-87 moved it to green and freed this one up.
  readonly tileArrival: string;
  readonly edgeArrival: string;
  // The marks drawn on a tile, each the colour that reads best on its face: dark on gold, white on
  // steel, and on the green Departure and raspberry Arrival tiles.
  readonly mark2: string;
  readonly mark3: string;
  readonly markDeparture: string;
  readonly markArrival: string;
  readonly ink: string;
  readonly muted: string;
  readonly panel: string;
  readonly panelBorder: string;
  // The home screen's Play button background — DigiSpin's own control
  // colour for the same button (HomeScreen.tsx), read live from the package.
  readonly control: string;
  // The home screen's logo (CANGUPA-34), picked for contrast against bg1/bg2.
  readonly logo: ImageSourcePropType;
}

// DARK and LIGHT's surface/text fields (CANGUPA-43) read live from
// @joaorodr84/themes's own DARK/LIGHT — bg1/bg2 both take its flat
// `background` (this app paints bg2 only, nothing here renders an actual
// gradient yet), frame takes `surface`, pit takes `wellBody`, panel takes
// `panel`, panelBorder takes `panelBorder`, ink takes `text`, muted takes
// `textMuted` — so a version bump of
// that package carries its colour changes straight into this app, rather
// than this file holding a hex snapshot that drifts out of sync with it.
// tile/tile2/edge/edge2 are this game's own accent colours and, per that
// package's design comment, belong to the consuming app and stay fixed
// across both modes rather than being themed.
export const DARK: Palette = {
  bg1: THEMES_DARK.background,
  bg2: THEMES_DARK.background,
  frame: THEMES_DARK.surface,
  pit: THEMES_DARK.wellBody,
  tile: '#4cc9f0',
  tile2: '#ffc857',
  edge: '#1f7a99',
  edge2: '#a8741a',
  tile3: '#587790',
  edge3: '#3c5162',
  tileDeparture: '#2f9e44',
  edgeDeparture: '#7cd48f',
  tileArrival: '#9d1057',
  edgeArrival: '#ba5889',
  mark2: '#3b2a06',
  mark3: '#ffffff',
  markDeparture: '#ffffff',
  markArrival: '#ffffff',
  ink: THEMES_DARK.text,
  muted: THEMES_DARK.textMuted,
  panel: THEMES_DARK.panel,
  panelBorder: THEMES_DARK.panelBorder,
  control: THEMES_DARK.control,
  logo: LOGO_DARK,
};

export const LIGHT: Palette = {
  bg1: THEMES_LIGHT.background,
  bg2: THEMES_LIGHT.background,
  frame: THEMES_LIGHT.surface,
  pit: THEMES_LIGHT.wellBody,
  tile: '#4cc9f0',
  tile2: '#ffc857',
  edge: '#1f7a99',
  edge2: '#a8741a',
  tile3: '#587790',
  edge3: '#3c5162',
  tileDeparture: '#2f9e44',
  edgeDeparture: '#7cd48f',
  tileArrival: '#9d1057',
  edgeArrival: '#ba5889',
  mark2: '#3b2a06',
  mark3: '#ffffff',
  markDeparture: '#ffffff',
  markArrival: '#ffffff',
  ink: THEMES_LIGHT.text,
  muted: THEMES_LIGHT.textMuted,
  panel: THEMES_LIGHT.panel,
  panelBorder: THEMES_LIGHT.panelBorder,
  control: THEMES_LIGHT.control,
  logo: LOGO_LIGHT,
};

// The palette for a mode, resolved against the device's own appearance when
// the mode is 'system' — the same resolution DigiSpin's shared package
// implements for its own palette. An unknown or unreported device scheme
// (`'unspecified'`/`null`/`undefined`) gets DARK: a dark default cannot be
// worse than a light one on a device that won't say.
export function paletteFor(mode: ThemeMode, system: SystemScheme): Palette {
  const resolved = mode === 'system' ? system : mode;
  return resolved === 'light' ? LIGHT : DARK;
}
