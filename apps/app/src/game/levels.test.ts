// Ported from apps/web-classic/tools/test.js's "levels" section: every level
// must have a solution, and playing it out must actually clear the board.
import { Game } from './board';
import { LEVELS } from './levels';

test.each(LEVELS.map((rows, i) => [i + 1, rows] as const))('level %i is solvable', (_number, rows) => {
  const g = new Game(rows);
  const path = g.solve();
  expect(path).not.toBeNull();
  path!.forEach((m) => g.play(m));
  expect(g.won).toBe(true);
});

test('there are 50 levels', () => {
  expect(LEVELS).toHaveLength(50);
});
