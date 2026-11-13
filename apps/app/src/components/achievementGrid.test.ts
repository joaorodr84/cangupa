import {
  achievementRows,
  achievementsPerRow,
  cardWidth,
  GAP_PT,
  GUTTER_PT,
  MAX_PER_ROW,
  MIN_CARD_PT,
  MIN_PER_ROW,
} from './achievementGrid';

describe('achievementRows', () => {
  it('splits the items into full rows and keeps their order', () => {
    expect(achievementRows([1, 2, 3, 4, 5, 6], 2)).toEqual([
      [1, 2],
      [3, 4],
      [5, 6],
    ]);
  });

  it('leaves the last row short rather than dropping or padding items', () => {
    expect(achievementRows([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('returns no rows for an empty list', () => {
    expect(achievementRows([], 2)).toEqual([]);
  });
});

describe('achievementsPerRow', () => {
  it('fits two cards on a 375 pt phone', () => {
    expect(achievementsPerRow(375)).toBe(2);
  });

  it('fits four cards on a 768 pt tablet', () => {
    expect(achievementsPerRow(768)).toBe(4);
  });

  it('never goes above the maximum, however wide the screen', () => {
    expect(achievementsPerRow(2000)).toBe(MAX_PER_ROW);
  });

  it('never goes below the minimum, even when the cards would be smaller', () => {
    expect(achievementsPerRow(100)).toBe(MIN_PER_ROW);
  });

  it('keeps every card at or above the minimum width for widths in range', () => {
    for (let width = 320; width <= 1024; width += 1) {
      const n = achievementsPerRow(width);
      const card = (width - 2 * GUTTER_PT - (n - 1) * GAP_PT) / n;
      if (n > MIN_PER_ROW) {
        expect(card).toBeGreaterThanOrEqual(MIN_CARD_PT);
      }
    }
  });
});

// Cards are drawn at this fixed width rather than flexing to fill their
// row, so a short last row's cards do not stretch wider than the rest.
describe('cardWidth', () => {
  it('splits the row evenly across the cards that fit', () => {
    expect(cardWidth(375, 2)).toBeCloseTo((375 - 2 * GUTTER_PT - GAP_PT) / 2);
  });

  it('does not depend on how many cards are actually in the row, only on perRow', () => {
    // A short last row still passes the grid's perRow, not its own shorter
    // count, so its cards come out the same width as a full row's.
    expect(cardWidth(768, 4)).toBe((768 - 2 * GUTTER_PT - 3 * GAP_PT) / 4);
  });
});
