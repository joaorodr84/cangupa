import { contrastRatio } from '@joaorodr84/themes';

import { PACK_COLORS, packLabelColorFor } from './packColors';

test('every pack has its own distinct colour', () => {
  expect(new Set(PACK_COLORS).size).toBe(PACK_COLORS.length);
});

test("each pack's label colour clears WCAG AA against its own colour", () => {
  PACK_COLORS.forEach((_, packIndex) => {
    expect(contrastRatio(PACK_COLORS[packIndex], packLabelColorFor(packIndex))).toBeGreaterThanOrEqual(4.5);
  });
});
