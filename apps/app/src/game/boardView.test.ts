import { Game } from './board';
import { DEFAULT_FACING, directionalMove, facingFor, statusFor, tileAccessibilityLabel, tilesOf } from './boardView';
import { en } from '../i18n/strings/en';

const t = en.board;

describe('tilesOf', () => {
  it('skips empty cells', () => {
    const g = new Game(['S1.']);
    expect(tilesOf(g, { hints: true })).toHaveLength(2);
  });

  it('marks the legal destinations as hints when hints is on', () => {
    const g = new Game(['S1.']);
    const tiles = tilesOf(g, { hints: true });
    const target = tiles.find((t) => t.x === 1 && t.y === 0);
    expect(target?.hint).toBe(true);
  });

  it('marks nothing as a hint when hints is off', () => {
    const g = new Game(['S1.']);
    const tiles = tilesOf(g, { hints: false });
    expect(tiles.every((t) => !t.hint)).toBe(true);
  });

  it('marks a jump destination as a jump hint', () => {
    const g = new Game(['S.1']);
    const tiles = tilesOf(g, { hints: true });
    const target = tiles.find((t) => t.x === 2 && t.y === 0);
    expect(target).toMatchObject({ hint: true, jump: true });
  });

  it('marks a double tile, cracked after its first visit', () => {
    const g = new Game(['S2']);
    let tiles = tilesOf(g, { hints: true });
    expect(tiles.find((t) => t.x === 1)).toMatchObject({ double: true, cracked: false });

    g.play({ x: 1, y: 0 });
    tiles = tilesOf(g, { hints: true });
    expect(tiles.find((t) => t.x === 1)).toMatchObject({ double: true, cracked: true });
  });

  it('gives each tile its kind and the visits it has left', () => {
    const g = new Game(['S2', '3.']);
    let tiles = tilesOf(g, { hints: true });
    expect(tiles.find((t) => t.x === 0 && t.y === 0)).toMatchObject({ kind: 1, left: 0 }); // the start counts as visited
    expect(tiles.find((t) => t.x === 1 && t.y === 0)).toMatchObject({ kind: 2, left: 2 });
    expect(tiles.find((t) => t.x === 0 && t.y === 1)).toMatchObject({ kind: 3, left: 3 });

    g.play({ x: 1, y: 0 });
    tiles = tilesOf(g, { hints: true });
    expect(tiles.find((t) => t.x === 1 && t.y === 0)).toMatchObject({ kind: 2, left: 1 });
  });

  it('a Steel start tile counts one visit already', () => {
    const tiles = tilesOf(new Game(['T1']), { hints: true });
    expect(tiles.find((t) => t.x === 0)).toMatchObject({ kind: 3, left: 2 });
  });

  it('names the way an arrow tile points, and nothing for other tiles', () => {
    const g = new Game(['S>v', '^<1']);
    const at = (x: number, y: number) => tilesOf(g, { hints: true }).find((t) => t.x === x && t.y === y);
    expect(at(1, 0)?.arrow).toBe('right');
    expect(at(2, 0)?.arrow).toBe('down');
    expect(at(0, 1)?.arrow).toBe('up');
    expect(at(1, 1)?.arrow).toBe('left');
    expect(at(2, 1)?.arrow).toBeNull();
    expect(at(0, 0)?.arrow).toBeNull();
  });

  it('names the one open side of an Arrival tile (CANGUPA-104), and nothing for other tiles', () => {
    // 'R' (entered moving right) opens on the left, the side moving right comes from — the
    // mirror of an arrow's own direction, which names where it points rather than where it opens.
    const g = new Game(['SRD', 'UL1']);
    const at = (x: number, y: number) => tilesOf(g, { hints: true }).find((t) => t.x === x && t.y === y);
    expect(at(1, 0)?.arrival).toBe('left');
    expect(at(2, 0)?.arrival).toBe('up');
    expect(at(0, 1)?.arrival).toBe('down');
    expect(at(1, 1)?.arrival).toBe('right');
    expect(at(2, 1)?.arrival).toBeNull();
    expect(at(0, 0)?.arrival).toBeNull();
  });

  it('marks the kangaroo\'s current tile worn once used up, and a used tile left behind as gone', () => {
    const g = new Game(['S1']);
    g.play({ x: 1, y: 0 });
    const tiles = tilesOf(g, { hints: true });
    expect(tiles.find((t) => t.x === 1)).toMatchObject({ worn: true, gone: false });
    expect(tiles.find((t) => t.x === 0)).toMatchObject({ worn: false, gone: true });
  });

  it('marks only the solver tip tile', () => {
    const g = new Game(['S11']);
    const tiles = tilesOf(g, { hints: true, tip: { x: 1, y: 0, jump: false } });
    expect(tiles.find((t) => t.x === 1)?.tip).toBe(true);
    expect(tiles.find((t) => t.x === 2)?.tip).toBe(false);
  });
});

describe('tileAccessibilityLabel', () => {
  // A bare fixture rather than a real Game: tileAccessibilityLabel is a pure function of a
  // TileView, and building one by hand (rather than driving a real board to a particular visits-
  // left count) is the only way to exercise both the singular and plural wording directly.
  const base = {
    x: 1,
    y: 0,
    double: false,
    cracked: false,
    arrow: null,
    arrival: null,
    worn: false,
    gone: false,
    hint: false,
    jump: false,
    tip: false,
  } as const;

  it('names a Gold tile with its visits left, pluralised', () => {
    expect(tileAccessibilityLabel({ ...base, kind: 2, left: 2 }, t)).toBe('Row 1, column 2, Gold tile, 2 visits left.');
  });

  it('names a Steel tile with one visit left, singular', () => {
    expect(tileAccessibilityLabel({ ...base, kind: 3, left: 1 }, t)).toBe('Row 1, column 2, Steel tile, 1 visit left.');
  });

  it('names the Arrival edge rather than the kind, mirroring the direction it is entered from', () => {
    const g = new Game(['SR1']);
    const tiles = tilesOf(g, { hints: true });
    const tile = tiles.find((tv) => tv.x === 1)!;
    expect(tileAccessibilityLabel(tile, t)).toBe('Row 1, column 2, Arrival tile, opens to the left edge.');
  });
});

describe('directionalMove', () => {
  it('finds the step one tile away in the pressed direction', () => {
    const g = new Game(['S1', '1.']);
    expect(directionalMove(g, 'right')).toMatchObject({ x: 1, y: 0, jump: false });
    expect(directionalMove(g, 'down')).toMatchObject({ x: 0, y: 1, jump: false });
  });

  it('returns null when there is no legal move that way', () => {
    const g = new Game(['S1.']);
    expect(directionalMove(g, 'left')).toBeNull();
    expect(directionalMove(g, 'down')).toBeNull();
  });

  it('prefers the step over the jump when legalMoves() offers both in the same direction', () => {
    // A gap after the step, then one more tile: stepping onto (1,0) and jumping over it to (2,0)
    // are both legal moves to the right from (0,0).
    const g = new Game(['S11']);
    expect(directionalMove(g, 'right')).toMatchObject({ x: 1, y: 0, jump: false });
  });

  it('falls back to the jump when only a jump is legal that way', () => {
    // A one-tile gap: (1,0) does not exist, so the only legal move to the right is the jump to
    // (2,0).
    const g = new Game(['S.1']);
    expect(directionalMove(g, 'right')).toMatchObject({ x: 2, y: 0, jump: true });
  });

  it("respects a Departure tile's own direction restriction", () => {
    // '>' (1,0) only leaves to the right. Step the kangaroo onto it first — a Departure tile is
    // never the start tile — then check down comes back null even though (1,1) is a real,
    // reachable tile directly below it, while right (the one way out) still works.
    const g = new Game(['S>1', '.1.']);
    g.play({ x: 1, y: 0 });
    expect(directionalMove(g, 'down')).toBeNull();
    expect(directionalMove(g, 'right')).toMatchObject({ x: 2, y: 0 });
  });
});

describe('facingFor', () => {
  it('faces right without flipping when moving right', () => {
    expect(facingFor(1, 0)).toEqual({ face: 'side', flip: false });
  });

  it('faces left, flipped, when moving left', () => {
    expect(facingFor(-1, 0)).toEqual({ face: 'side', flip: true });
  });

  it('faces back when moving up', () => {
    expect(facingFor(0, -1)).toEqual({ face: 'back', flip: false });
  });

  it('faces front when moving down', () => {
    expect(facingFor(0, 1)).toEqual({ face: 'front', flip: false });
  });

  it('prefers the sideways face on a diagonal-weighted jump', () => {
    expect(facingFor(2, 1)).toEqual({ face: 'side', flip: false });
  });

  it('defaults to facing front, unflipped', () => {
    expect(DEFAULT_FACING).toEqual({ face: 'front', flip: false });
  });
});

describe('statusFor', () => {
  const progress = { levelNumber: 3, totalLevels: 50, moves: 4, remaining: 2 };
  const none = { won: false, hintFailed: false, hasNext: true } as const;

  it('reports playing by default', () => {
    expect(statusFor(progress, none)).toEqual({
      kind: 'playing',
      ...progress,
    });
  });

  it('reports won over playing, with whether there is a next level', () => {
    expect(statusFor(progress, { ...none, won: true })).toEqual({
      kind: 'won',
      moves: progress.moves,
      hasNext: true,
    });
    expect(statusFor(progress, { ...none, won: true, hasNext: false })).toEqual({
      kind: 'won',
      moves: progress.moves,
      hasNext: false,
    });
  });

  it('reports a dead-end hint over won, still carrying the progress', () => {
    expect(statusFor(progress, { ...none, won: true, hintFailed: true })).toEqual({
      kind: 'hintFailed',
      ...progress,
    });
  });
});
