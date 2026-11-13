// The achievement grid's own sizing (CANGUPA-90), ported from DigiSpin's
// own screens/achievementGrid.ts — the same width-driven approach as the
// Levels grid (levelGrid.ts), but for cards rather than squares.
export const GUTTER_PT = 16;
export const GAP_PT = 12;

// The narrowest a card can get before its title and description crowd each
// other, found by eye rather than a fixed touch-target rule (cards are not
// tapped, unlike the level squares).
export const MIN_CARD_PT = 140;

// Two is the fewest that still reads as a grid rather than a list; four is
// as many as a card can shrink to before MIN_CARD_PT is broken.
export const MIN_PER_ROW = 2;
export const MAX_PER_ROW = 4;

// How many cards fit in one row of the given width, clamped to the minimum
// and maximum.
export function achievementsPerRow(screenWidth: number): number {
  const fit = Math.floor((screenWidth - 2 * GUTTER_PT + GAP_PT) / (MIN_CARD_PT + GAP_PT));
  return Math.min(MAX_PER_ROW, Math.max(MIN_PER_ROW, fit));
}

// The pixel width of one card, given how many sit in a row. Cards are drawn
// at this fixed width rather than flexing to fill their row, so a short
// last row's cards stay the same size as the rest instead of stretching
// wider to fill the leftover space.
export function cardWidth(screenWidth: number, perRow: number): number {
  return (screenWidth - 2 * GUTTER_PT - (perRow - 1) * GAP_PT) / perRow;
}

// Splits the items into rows of `perRow`, keeping their order. The last row
// may be short; its cards are still drawn at the same fixed width as the
// rest (cardWidth above), so a short row does not need padding to match
// their width.
export function achievementRows<T>(items: readonly T[], perRow: number): T[][] {
  const rows: T[][] = [];
  for (let start = 0; start < items.length; start += perRow) {
    rows.push(items.slice(start, start + perRow));
  }
  return rows;
}
