import { Game } from './board';
import { orientLevel } from './orient';
import { PACKS } from './packs';

const wide = ['S1.1', '.11.', '11..']; // 4 wide, 3 tall

test('leaves a level alone when its shape already matches the screen', () => {
  expect(orientLevel(wide, true)).toBe(wide);
  const tall = ['S1.', '11.', '.11', '1..'];
  expect(orientLevel(tall, false)).toBe(tall);
});

test('turns a wide level tall on a portrait screen', () => {
  expect(orientLevel(wide, false)).toEqual(['S.1', '111', '.1.', '1..']);
});

test('turns a tall level wide on a landscape screen', () => {
  expect(orientLevel(['S.1', '111', '.1.', '1..'], true)).toEqual(wide);
});

test('never turns a square level', () => {
  const square = ['S1.', '.11', '..1'];
  expect(orientLevel(square, true)).toBe(square);
  expect(orientLevel(square, false)).toBe(square);
});

test('keeps the start tile and the tile counts', () => {
  const turned = orientLevel(['S2.1', '.11.', '11..'], false);
  expect(turned.join('').split('').sort()).toEqual(['S2.1', '.11.', '11..'].join('').split('').sort());
  expect(turned.join('')).toContain('S');
});

test('the turned level has a solution whenever the original does', () => {
  const original = ['S1.1', '.11.', '11..'];
  for (const landscape of [true, false]) {
    const turned = orientLevel(original, landscape);
    const game = new Game(turned);
    const path = game.solve();
    expect(Boolean(path)).toBe(Boolean(new Game(original).solve()));
  }
});

test('pads a ragged row instead of dropping a cell', () => {
  expect(orientLevel(['S1.1', '1'], false)).toEqual(['S1', '1.', '..', '1.']);
});

test('an arrow tile turns with its level: swapping rows for columns swaps its axis', () => {
  // right becomes down and down becomes right; left becomes up and up becomes left
  expect(orientLevel(['S>1', '.v.'], false)).toEqual(['S.', 'v>', '1.']);
  expect(orientLevel(['S<1', '.^.'], false)).toEqual(['S.', '^<', '1.']);
});

test('a turned level with arrows is the same puzzle', () => {
  const original = ['S>.1', '.1v.', '.1.1']; // 4 wide, 3 tall
  const turned = orientLevel(original, false);
  expect(turned).toHaveLength(4);
  const a = new Game(original);
  const b = new Game(turned);
  expect(Boolean(b.solve())).toBe(Boolean(a.solve()));
  expect(b.legalMoves().length).toBe(a.legalMoves().length);
});

test('every level with arrows is still solvable when turned for a portrait or a landscape screen', () => {
  // arrows turn with the board, so a wrong turn would strand a level: this turns every arrow level both ways,
  // except Outback's. Game.solve() here is uncapped (unlike the generator's own solver), and CANGUPA-72 already
  // found Outback's biggest/most complex turned levels can run the solver long enough to exhaust its own `dead`
  // Set rather than return -- previously true only of its Gold/Steel levels, but CANGUPA-112 gave Outback arrows
  // too, so excluding it here by pack rather than by "has no arrows" (which stopped being true for it). That
  // solver-performance question is CANGUPA-72's, not this test's.
  const withArrows = PACKS.filter((pack) => pack.name !== 'Outback')
    .flatMap((pack) => pack.levels)
    .filter((level) => /[><v^]/.test(level.join('')));
  expect(withArrows.length).toBeGreaterThan(80);
  for (const level of withArrows) {
    for (const landscape of [true, false]) {
      expect(new Game(orientLevel(level, landscape)).solve()).not.toBeNull();
    }
  }
}, 120000);

test('a Gate tile turns with its level: swapping rows for columns swaps its axis', () => {
  // R (entered moving right) becomes D (entered moving down) and D becomes R; L becomes U and U becomes L
  expect(orientLevel(['SR1', '.D.'], false)).toEqual(['S.', 'DR', '1.']);
  expect(orientLevel(['SL1', '.U.'], false)).toEqual(['S.', 'UL', '1.']);
});

test('a turned level with a Gate is the same puzzle', () => {
  const original = ['SR.1', '.1D.', '.1.1']; // 4 wide, 3 tall
  const turned = orientLevel(original, false);
  expect(turned).toHaveLength(4);
  const a = new Game(original);
  const b = new Game(turned);
  expect(Boolean(b.solve())).toBe(Boolean(a.solve()));
  expect(b.legalMoves().length).toBe(a.legalMoves().length);
});

// No exhaustive "every level with a Gate, both orientations" test here, unlike the arrow one
// above: pack 7 (Mesa) is square, so orientLevel never turns it at all, but pack 8 (Gorge, 7x6)
// hits CANGUPA-72's pre-existing hint-solver limitation for real — turning roughly 15 of its 50
// levels to portrait makes the plain solve() blow past 400,000 positions (confirmed with
// tools/difficulty.js's capped `search()` while building this pack, not a Gate-specific bug: the
// same board size was already flagged in CANGUPA-72 before Gate existed). Fixing that is
// CANGUPA-72's own job (a better search, solving off the UI thread, or storing each level's
// solution), not this task's.
