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

test('jumping clears a gap or another tile', () => {
  const g = new Game(['S.1']);
  expect(g.legalMoves().map((m) => [m.x, m.jump])).toEqual([[2, true]]);
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

// CANGUPA-129: before this, the fall setting (CANGUPA-58) only asked
// inMoveShape(), which can't tell "nothing to land on" apart from "an arrow
// forbids this" — so stepping a Departure the wrong way onto a live tile
// sank the level exactly like stepping onto a missing one.
test('moveKind tells a geometry-invalid tap, an arrow-blocked one, an empty one, and a legal one apart', () => {
  // S>1 / .1.: the Departure sits at (1,0), pointing right. Step onto it first — entering a
  // Departure is unrestricted, only leaving it is — so pos becomes (1,0) for the checks below.
  const g = new Game(['S>1', '.1.']);
  g.play({ x: 1, y: 0 });
  expect(g.moveKind(2, 1)).toBe('none'); // diagonal from (1,0): never a move attempt at all
  // Down (1,1) is forbidden — the Departure only opens right — even though a perfectly live
  // tile sits there: this is the reported bug (a blocked move used to fall through it instead).
  expect(g.at(1, 1)).toBeGreaterThan(0);
  expect(g.moveKind(1, 1)).toBe('blocked-departure');
  expect(g.moveKind(2, 0)).toBe('legal'); // right, the way it points, onto a live tile
  const empty = new Game(['S..']);
  expect(empty.moveKind(2, 0)).toBe('empty'); // in shape, no arrow, but no tile there
});

test('moveKind blocks entering a live Arrival the wrong way, by rule, from the correct direction too once it is used up', () => {
  // SL1: (1,0) is an Arrival only enterable moving left (approached from (2,0)).
  const g = new Game(['SL1']);
  // From the start (0,0), moving right onto it (k=0, "right") mismatches the Arrival's own
  // required direction (k=1, "left") — blocked, live tile or not.
  expect(g.moveKind(1, 0)).toBe('blocked-arrival');
  g.play({ x: 2, y: 0 }); // jump past it
  g.play({ x: 1, y: 0 }); // now approaching moving left: a legal entry, uses it up
  expect(g.at(1, 0)).toBe(0); // used up
  // moveKind takes an explicit `pos` so a used-up tile's classification can be checked without
  // actually having a legal way back to it. From (2,0), the correct direction (left) onto the
  // now-empty tile is just 'empty', not 'legal' — nothing is there to land on any more.
  expect(g.moveKind(1, 0, 2)).toBe('empty');
  // From (0,0), the *wrong* direction (right) onto that same used-up tile is also 'empty', not
  // 'blocked-arrival' — once a tile is gone, the arrow rule has nothing left to forbid.
  expect(g.moveKind(1, 0, 0)).toBe('empty');
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

describe('arrow tiles', () => {
  const to = (g: Game) => g.legalMoves().map((m) => [m.x, m.y]);

  test('an arrow tile can only be left the way it points', () => {
    const g = new Game(['S>1', '.1.']);
    expect(g.max[1]).toBe(1);
    expect(g.dir[1]).toBe(0); // right
    g.play({ x: 1, y: 0 });
    expect(to(g)).toEqual([[2, 0]]); // the tile below is out of reach

    const plain = new Game(['S11', '.1.']); // the same level with a plain tile
    plain.play({ x: 1, y: 0 });
    expect(to(plain)).toEqual([
      [2, 0],
      [1, 1],
    ]);
  });

  test('an arrow limits jumps too', () => {
    const g = new Game(['S>.1', '....', '.1..']);
    g.play({ x: 1, y: 0 });
    expect(to(g)).toEqual([[3, 0]]); // the jump right, not the jump down
  });

  test('every arrow character points its own way, and an arrow is never the start', () => {
    expect(new Game(['S.', '1v']).dir[3]).toBe(2);
    expect(new Game(['S<', '..']).dir[1]).toBe(1);
    expect(new Game(['^S']).dir[0]).toBe(3);
    expect(new Game(['S>1']).start).toBe(0);
  });

  test('a level with an arrow can still be cleared', () => {
    const g = new Game(['S>1']);
    const path = g.solve()!;
    path.forEach((m) => g.play(m));
    expect(g.won).toBe(true);
  });
});

describe('Arrival tiles (CANGUPA-104)', () => {
  const to = (g: Game) => g.legalMoves().map((m) => [m.x, m.y]);

  test('an Arrival tile can only be entered by moving the way it names', () => {
    // 'SL1': (1,0) is an Arrival only enterable moving left (from the right, (2,0)) — stepping
    // onto it from the start (moving right) must fail, so only the jump past it is legal.
    const g = new Game(['SL1']);
    expect(g.max[1]).toBe(1);
    expect(g.arrival[1]).toBe(1); // 1 is left
    expect(to(g)).toEqual([[2, 0]]);

    g.play({ x: 2, y: 0 }); // jump over the arrival tile
    expect(to(g)).toEqual([[1, 0]]); // now moving left: entering it is legal
  });

  test('every Arrival character names its own direction, and an Arrival is never the start', () => {
    expect(new Game(['SR1']).arrival[1]).toBe(0);
    expect(new Game(['SL1']).arrival[1]).toBe(1);
    expect(new Game(['S.', '1D']).arrival[3]).toBe(2);
    expect(new Game(['S.', '1U']).arrival[3]).toBe(3);
    expect(new Game(['SL1']).start).toBe(0);
  });

  test('a level with an Arrival tile can still be cleared', () => {
    const g = new Game(['SL1']);
    g.play({ x: 2, y: 0 });
    const path = g.solve()!;
    path.forEach((m) => g.play(m));
    expect(g.won).toBe(true);
  });
});
