// Ported from apps/web-classic/tools/test.js's "levels" section: every level
// must have a solution, and playing it out must actually clear the board.
// Now over the packs' levels in play order (CANGUPA-56).
import { Game } from './board';
import { LEVELS, PACK_SIZES } from './levels';
import { PACKS } from './packs';

test.each(LEVELS.map((rows, i) => [i + 1, rows] as const))('level %i is solvable', (_number, rows) => {
  const g = new Game(rows);
  const path = g.solve();
  expect(path).not.toBeNull();
  path!.forEach((m) => g.play(m));
  expect(g.won).toBe(true);
});

test('there are ten packs of 50 levels, 500 in all', () => {
  expect(PACKS).toHaveLength(10);
  expect(PACK_SIZES).toEqual(Array(10).fill(50));
  expect(LEVELS).toHaveLength(500);
});

test('the levels run pack by pack, in order', () => {
  expect(LEVELS[0]).toBe(PACKS[0].levels[0]);
  expect(LEVELS[49]).toBe(PACKS[0].levels[49]);
  expect(LEVELS[50]).toBe(PACKS[1].levels[0]);
  expect(LEVELS[499]).toBe(PACKS[9].levels[49]);
});
