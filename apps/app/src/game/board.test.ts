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

describe('pillars (CANGUPA-159)', () => {
  const to = (g: Game) => g.legalMoves().map((m) => [m.x, m.y]);

  test('a pillar is not a tile: no visit, never a destination, and it does not count towards clearing', () => {
    const g = new Game(['S#1', '1..']);
    expect(g.max[1]).toBe(0);
    expect(g.pillar[1]).toBe(1);
    expect(g.remaining()).toBe(2);
    expect(g.start).toBe(0);
  });

  test('a jump cannot pass over a pillar, where the same jump over a gap can', () => {
    expect(to(new Game(['S#1', '1..']))).toEqual([[0, 1]]); // only the step down
    expect(to(new Game(['S.1', '1..']))).toEqual([[2, 0], [0, 1]]);
  });

  test('a step beside a pillar is unaffected', () => {
    const g = new Game(['S1', '#1']);
    expect(to(g)).toEqual([[1, 0]]);
    expect(g.solve()).not.toBeNull();
  });

  test('moveKind refuses the pillar itself and a jump over one, live tile beyond it or not', () => {
    const g = new Game(['S#1', '1..']);
    expect(g.moveKind(1, 0)).toBe('blocked-pillar'); // a step onto the pillar: refused, not a fall
    expect(g.moveKind(2, 0)).toBe('blocked-pillar'); // the jump over it onto a live tile
    expect(new Game(['S#.']).moveKind(2, 0)).toBe('blocked-pillar'); // over it onto nothing: still not a fall
    expect(g.moveKind(0, 1)).toBe('legal'); // the step down is untouched
  });

  test('a Departure violation is still reported as that when a pillar is also involved', () => {
    const g = new Game(['>#1', 'S..']);
    g.play({ x: 0, y: 0 });
    expect(g.moveKind(0, 1)).toBe('blocked-departure');
    expect(g.moveKind(2, 0)).toBe('blocked-pillar'); // the way it points, but over the pillar
  });

  test('the solver sees a pillar: it can make a level unwinnable', () => {
    expect(new Game(['S#1']).solve()).toBeNull();
    expect(new Game(['S.1']).solve()).not.toBeNull();
    expect(new Game(['S#1', '111']).countSolutions(10)).toBe(1); // down, right, right, up
    expect(new Game(['S.1', '111']).countSolutions(10)).toBe(3); // the jump across opens two more
  });
});

describe('mud tiles (CANGUPA-160)', () => {
  const to = (g: Game) => g.legalMoves().map((m) => [m.x, m.y]);

  test('mud is an ordinary one-visit tile for clearing the level, and never the start', () => {
    const g = new Game(['Sm1', '.1.', '.1.']);
    expect(g.max[1]).toBe(1);
    expect(g.mud[1]).toBe(1);
    expect(g.remaining()).toBe(4);
    expect(g.start).toBe(0);
  });

  test('standing on mud, only steps are legal, where a plain tile also offers the jump', () => {
    const g = new Game(['Sm1', '.1.', '.1.']);
    g.play({ x: 1, y: 0 });
    expect(to(g)).toEqual([[2, 0], [1, 1]]);
    const dry = new Game(['S11', '.1.', '.1.']);
    dry.play({ x: 1, y: 0 });
    expect(to(dry)).toEqual([[2, 0], [1, 1], [1, 2]]);
  });

  test('jumping onto mud is unrestricted', () => {
    expect(to(new Game(['S.m']))).toEqual([[2, 0]]);
  });

  test('moveKind refuses a jump off mud whatever is at the target, and leaves steps alone', () => {
    const g = new Game(['Sm1', '.1.', '.1.']);
    g.play({ x: 1, y: 0 });
    expect(g.moveKind(1, 2)).toBe('blocked-mud'); // onto a live tile
    expect(g.moveKind(1, 1)).toBe('legal');
    expect(g.moveKind(0, 0)).toBe('empty'); // a step onto the used-up start: nothing there, as ever
    const bare = new Game(['Sm.', '...', '...']);
    bare.play({ x: 1, y: 0 });
    expect(bare.moveKind(1, 2)).toBe('blocked-mud'); // onto nothing: refused, not a fall
  });

  test('the solver sees mud: it can make a level unwinnable', () => {
    expect(new Game(['Sm.1']).solve()).toBeNull();
    expect(new Game(['S1.1']).solve()).not.toBeNull();
  });
});

describe('tunnels (CANGUPA-161)', () => {
  const to = (g: Game) => g.legalMoves().map((m) => [m.x, m.y]);

  test('a mouth is an ordinary one-visit tile, twinned to the other cell sharing its letter', () => {
    const g = new Game(['S.a', '1.a']);
    expect(g.max[2]).toBe(1);
    expect(g.max[5]).toBe(1);
    expect(g.tunnel[2]).toBe(5);
    expect(g.tunnel[5]).toBe(2);
    expect(g.remaining()).toBe(3);
    expect(g.start).toBe(0); // never the start
  });

  test('landing on either mouth moves the player to its twin and uses both up at once', () => {
    const g = new Game(['S.a', '1.a']);
    g.play({ x: 2, y: 0 }); // jump onto the mouth at (2,0)
    expect(g.pos).toBe(5); // standing on the twin, not where the tap landed
    expect(g.at(2, 0)).toBe(0);
    expect(g.at(2, 1)).toBe(0);
    expect(g.remaining()).toBe(1);
  });

  test('undo restores both mouths and the position in one step, from the pre-move snapshot', () => {
    const g = new Game(['S.a', '1.a']);
    g.play({ x: 2, y: 0 });
    expect(g.undo()).toBe(true);
    expect(g.pos).toBe(0);
    expect(g.remaining()).toBe(3);
  });

  test('solve()/countSolutions() warp through a mouth too, not just play()', () => {
    const g = new Game(['S.a', '1.a']);
    const path = g.solve()!;
    expect(path).toHaveLength(2);
    path.forEach((m) => g.play(m));
    expect(g.won).toBe(true);
    // 2, not 1: either mouth may be entered first (warping to the other), and both clear it
    expect(new Game(['S.a', '1.a']).countSolutions(10)).toBe(2);
  });

  test('a jump passes freely over a live mouth without entering it, unlike a Pillar', () => {
    // 'Sa1.a': the mouth at (1,0) sits in the middle of the jump to (2,0); its twin at (4,0) is
    // unrelated to that jump.
    expect(to(new Game(['Sa1.a']))).toEqual([[1, 0], [2, 0]]);
  });

  test('a mismatched pair throws when the level is built', () => {
    expect(() => new Game(['Sa1'])).toThrow("tunnel pair 'a' has 1 mouths, needs exactly 2");
    expect(() => new Game(['Sa1', 'aa.'])).toThrow("tunnel pair 'a' has 3 mouths, needs exactly 2");
  });
});
