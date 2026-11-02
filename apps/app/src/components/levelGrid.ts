// Ported from DigiSpin's own levelGrid.ts (CANGUPA-46): a level is a square
// sized to fit as many per row as the screen allows, rather than a fixed
// 52 pt cell left to flexbox's wrap behaviour. GUTTER_PT mirrors App.tsx's
// own 16 pt content padding rather than padding this grid adds itself — kept
// here, not folded into GAP_PT, so levelsPerRow/squareSize's math matches
// DigiSpin's formula exactly for anyone porting a future change back and
// forth between the two.
export const GUTTER_PT = 16;
export const GAP_PT = 8;

// The smallest square ever drawn — a level is never drawn smaller than this,
// so the row count is the largest that keeps every square at or above it.
export const MIN_SQUARE_PT = 48;

// The upper bound on a square's own size: without it, a narrow
// MIN_LEVELS_PER_ROW count on a wide window (this runs on web too) would let
// each square grow without limit, since nothing else caps its pixel size.
export const MAX_SQUARE_PT = 64;

// The fewest squares in a row, so the grid never becomes a few large tiles on
// a wide screen; below this, the minimum wins over the square size.
export const MIN_LEVELS_PER_ROW = 4;

// How many squares fit in one row of the given width, floored at the minimum.
export function levelsPerRow(screenWidth: number): number {
  const fit = Math.floor((screenWidth - 2 * GUTTER_PT + GAP_PT) / (MIN_SQUARE_PT + GAP_PT));
  return Math.max(MIN_LEVELS_PER_ROW, fit);
}

// The pixel size of one square, given how many sit in a row. Below the
// maximum, a square fills its even share of the row; at or above it, every
// square is drawn at the maximum instead of stretching to fill the row.
export function squareSize(screenWidth: number, perRow: number): number {
  const evenShare = (screenWidth - 2 * GUTTER_PT - (perRow - 1) * GAP_PT) / perRow;
  return Math.min(MAX_SQUARE_PT, Math.max(MIN_SQUARE_PT, evenShare));
}

// Splits the levels into rows of `perRow`, keeping their order. The last row
// may be short; its squares are still drawn at the same fixed size as the
// rest (squareSize above), so a short row does not need padding to match
// their width.
export function levelRows<T>(items: readonly T[], perRow: number): T[][] {
  const rows: T[][] = [];
  for (let start = 0; start < items.length; start += perRow) {
    rows.push(items.slice(start, start + perRow));
  }
  return rows;
}
