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

// fall()'s shape check (CANGUPA-65): only a step or jump in one of the four
// cardinal directions counts, tile or no tile there.
test('inMoveShape accepts only a straight step or jump within range', () => {
  const g = new Game(['S....', '.....', '.....', '.....', '.....']);
  expect(g.inMoveShape(1, 0)).toBe(true); // step right
  expect(g.inMoveShape(0, 1)).toBe(true); // step down
  expect(g.inMoveShape(2, 0)).toBe(true); // jump right
  expect(g.inMoveShape(0, 2)).toBe(true); // jump down
  expect(g.inMoveShape(2, 2)).toBe(false); // diagonal: not a straight line
  expect(g.inMoveShape(3, 0)).toBe(false); // in line, but past jump range
  expect(g.inMoveShape(0, 0)).toBe(false); // standing still
});

test('inMoveShape rejects a jump-shaped distance when the jumps rule is off', () => {
  const g = new Game(['S....', '.....'], { jumps: false });
  expect(g.inMoveShape(2, 0)).toBe(false);
});

test('a Steel tile needs three visits, and T starts on one', () => {
  const g = new Game(['1T1']);
  expect(g.max[1]).toBe(3);
  expect(g.at(1, 0)).toBe(2); // the start tile counts as one visit already
  expect(g.remaining()).toBe(4);
  const path = g.solve()!;
  expect(path).toHaveLength(4); // out, back, out the other way, back
  path.forEach((m) => g.play(m));
  expect(g.won).toBe(true);
});
