import { contrastRatio } from '@joaorodr84/themes';

import { DARK, LIGHT, paletteFor, STARFIELD_TILE_SIZE } from './palette';

// Generic mode-resolution behaviour (ThemeMode/SystemScheme's meaning) is
// shared with DigiSpin via the @joaorodr84/themes package (CANGUPA-40); this
// only checks this app's own resolution against its own two palettes.
describe('paletteFor', () => {
  it('resolves an explicit light or dark mode regardless of the device', () => {
    expect(paletteFor('light', 'dark')).toBe(LIGHT);
    expect(paletteFor('dark', 'light')).toBe(DARK);
  });

  it("follows the device's scheme when the mode is 'system'", () => {
    expect(paletteFor('system', 'light')).toBe(LIGHT);
    expect(paletteFor('system', 'dark')).toBe(DARK);
  });

  it('defaults to dark for system mode on a device that reports no scheme', () => {
    expect(paletteFor('system', 'unspecified')).toBe(DARK);
    expect(paletteFor('system', null)).toBe(DARK);
    expect(paletteFor('system', undefined)).toBe(DARK);
  });
});

test('only dark has a starfield', () => {
  expect(DARK.stars.length).toBeGreaterThan(0);
  expect(LIGHT.stars).toHaveLength(0);
});

test('the starfield has 8 dots, each inside the board', () => {
  const { stars } = DARK;
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

test('light uses a dark ink on its light background', () => {
  expect(LIGHT.ink).toBe('#1d1d1f');
});

// ink is the primary text colour everywhere it appears, so it is held to
// WCAG AA's normal-text bar (4.5:1). muted is explicitly the lower-contrast
// secondary colour (FooterNav labels, screen subtitles), so it only has to
// clear the large-text bar (3:1) against either end of the page background
// gradient it sits on. contrastRatio itself comes from the shared
// @joaorodr84/themes package (CANGUPA-39), which also covers its own tests.
describe('text colours stay readable against the background gradient', () => {
  for (const [name, palette] of Object.entries({ dark: DARK, light: LIGHT })) {
    describe(name, () => {
      const { bg1, bg2, ink, muted } = palette;

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
