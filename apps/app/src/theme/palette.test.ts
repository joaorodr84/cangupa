import { contrastRatio } from '@joaorodr84/themes';

import { PALETTES, paletteFor, STARFIELD_TILE_SIZE } from './palette';
import { THEMES } from '../state/settings';

test('every theme has a palette', () => {
  for (const theme of THEMES) {
    expect(paletteFor(theme)).toBe(PALETTES[theme]);
  }
});

test('only the space theme has a starfield', () => {
  for (const theme of THEMES) {
    const hasStars = paletteFor(theme).stars.length > 0;
    expect(hasStars).toBe(theme === 'space');
  }
});

test('the starfield has 8 dots, each inside the board', () => {
  const { stars } = paletteFor('space');
  expect(stars).toHaveLength(8);
  for (const star of stars) {
    expect(star.xPct).toBeGreaterThanOrEqual(0);
    expect(star.xPct).toBeLessThanOrEqual(100);
    expect(star.yPct).toBeGreaterThanOrEqual(0);
    expect(star.yPct).toBeLessThanOrEqual(100);
    expect(star.size).toBeGreaterThan(0);
  }
});

test('the starfield tiles at 260px, matching style.css', () => {
  expect(STARFIELD_TILE_SIZE).toBe(260);
});

test("the sand and ice themes use a dark ink on their light backgrounds", () => {
  expect(paletteFor('sand').ink).toBe('#2b2013');
  expect(paletteFor('ice').ink).toBe('#1c2a3a');
});

test('the space theme has a transparent pit, so the starfield behind it shows through', () => {
  expect(paletteFor('space').pit).toBe('transparent');
});

// ink is the primary text colour everywhere it appears, so it is held to
// WCAG AA's normal-text bar (4.5:1). muted is explicitly the lower-contrast
// secondary colour (FooterNav labels, screen subtitles), so it only has to
// clear the large-text bar (3:1) against either end of the page background
// gradient it sits on. contrastRatio itself comes from the shared
// @joaorodr84/themes package (CANGUPA-39), which also covers its own tests.
describe('text colours stay readable against the background gradient', () => {
  for (const theme of THEMES) {
    describe(theme, () => {
      const { bg1, bg2, ink, muted } = paletteFor(theme);

      it('ink clears 4.5:1 against both ends of the gradient', () => {
        expect(contrastRatio(ink, bg1)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(ink, bg2)).toBeGreaterThanOrEqual(4.5);
      });

      it('muted clears 3:1 against both ends of the gradient', () => {
        expect(contrastRatio(muted, bg1)).toBeGreaterThanOrEqual(3);
        expect(contrastRatio(muted, bg2)).toBeGreaterThanOrEqual(3);
      });
    });
  }
});
