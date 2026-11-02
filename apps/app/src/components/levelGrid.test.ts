import { GAP_PT, GUTTER_PT, levelRows, levelsPerRow, MAX_SQUARE_PT, MIN_LEVELS_PER_ROW, MIN_SQUARE_PT, squareSize } from './levelGrid';

describe('levelRows', () => {
  test('splits the items into full rows and keeps their order', () => {
    expect(levelRows([1, 2, 3, 4, 5, 6, 7, 8], 4)).toEqual([
      [1, 2, 3, 4],
      [5, 6, 7, 8],
    ]);
  });

  test('leaves the last row short rather than dropping or padding items', () => {
    expect(levelRows([1, 2, 3, 4, 5, 6, 7], 4)).toEqual([
      [1, 2, 3, 4],
      [5, 6, 7],
    ]);
  });

  test('returns no rows for an empty list', () => {
    expect(levelRows([], 4)).toEqual([]);
  });

  test('takes any row size', () => {
    expect(levelRows([1, 2, 3], 2)).toEqual([[1, 2], [3]]);
  });
});

describe('levelsPerRow', () => {
  // Phone widths in points: the 360 pt Android baseline, the 390 pt and
  // 430 pt iPhone sizes, and a tablet wide enough to need many more.
  test('fits six squares on a 360 pt phone', () => {
    expect(levelsPerRow(360)).toBe(6);
  });

  test('fits six squares on a 390 pt phone', () => {
    expect(levelsPerRow(390)).toBe(6);
  });

  test('fits seven squares on a 430 pt phone', () => {
    expect(levelsPerRow(430)).toBe(7);
  });

  test('keeps growing on a wide screen, with no upper cap', () => {
    expect(levelsPerRow(1024)).toBe(17);
  });

  test('never goes below the minimum, even when the squares would be smaller', () => {
    expect(levelsPerRow(150)).toBe(MIN_LEVELS_PER_ROW);
  });

  test('keeps every square at or above the minimum size for widths in range', () => {
    // A square is (width - 2 gutters - (n - 1) gaps) / n. Check every width
    // from 320 pt to 1024 pt that the count does not break the minimum.
    for (let width = 320; width <= 1024; width += 1) {
      const n = levelsPerRow(width);
      const square = (width - 2 * GUTTER_PT - (n - 1) * GAP_PT) / n;
      if (n > MIN_LEVELS_PER_ROW) {
        expect(square).toBeGreaterThanOrEqual(MIN_SQUARE_PT);
      }
    }
  });
});

describe('squareSize', () => {
  test('splits the row evenly when that stays at or below the maximum', () => {
    expect(squareSize(430, 7)).toBeCloseTo((430 - 2 * GUTTER_PT - 6 * GAP_PT) / 7);
  });

  test('caps the square at the maximum on a wide screen, however few per row', () => {
    expect(squareSize(1024, MIN_LEVELS_PER_ROW)).toBe(MAX_SQUARE_PT);
  });

  test('floors the square at the minimum when an even split would go under it', () => {
    // 320 pt packed into 8 would be under the minimum; the floor wins instead.
    expect(squareSize(320, 8)).toBe(MIN_SQUARE_PT);
  });
});
