// Ported from apps/web-classic/tools/test.js's rules assertions.
import { Game } from './board';

test('tracks remaining tiles and legal moves', () => {
  const g = new Game(['S1.', '.2.']);
  expect(g.remaining()).toBe(3);
  expect(g.legalMoves().map((m) => [m.x, m.y, m.jump])).toEqual([[1, 0, false]]);
});

test('the start tile is used up and cannot be revisited', () => {
  const g = new Game(['S1.', '.2.']);
  g.play(g.legalMoves()[0]);
  expect(g.at(0, 0)).toBe(0);
  expect(g.legalMoves().some((m) => m.x === 0)).toBe(false);
});

test('a double tile cracks on its first visit and needs one more', () => {
  const g = new Game(['S1.', '.2.']);
  g.play(g.legalMoves()[0]);
  g.play({ x: 1, y: 1 });
  expect(g.at(1, 1)).toBe(1);
  expect(g.stuck).toBe(true);
});

test('undo restores both position and tile state', () => {
  const g = new Game(['S1.', '.2.']);
  g.play(g.legalMoves()[0]);
  g.play({ x: 1, y: 1 });
  expect(g.undo() && g.undo() && g.pos === 0).toBe(true);
});

test('jumping clears a gap or another tile when the jumps rule is on', () => {
  const g = new Game(['S.1'], { jumps: true });
  expect(g.legalMoves().map((m) => [m.x, m.jump])).toEqual([[2, true]]);
});

test('jumping is unavailable when the jumps rule is off', () => {
  const g = new Game(['S.1'], { jumps: false });
  expect(g.legalMoves()).toHaveLength(0);
});
