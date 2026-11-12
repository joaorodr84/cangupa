import { Game } from './board';
import { DEFAULT_FACING, facingFor, statusFor, tilesOf } from './boardView';

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
  const none = { won: false, stuck: false, hintFailed: false, hasNext: true, blockedReason: null } as const;

  it('reports playing by default', () => {
    expect(statusFor(progress, none)).toEqual({
      kind: 'playing',
      ...progress,
    });
  });

  it('reports stuck over playing', () => {
    expect(statusFor(progress, { ...none, stuck: true })).toEqual({
      kind: 'stuck',
      ...progress,
    });
  });

  it('reports won over stuck, with whether there is a next level', () => {
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

  it('reports a dead-end hint over everything else but a blocked tap, still carrying the progress', () => {
    expect(statusFor(progress, { ...none, won: true, stuck: true, hintFailed: true })).toEqual({
      kind: 'hintFailed',
      ...progress,
    });
  });

  // CANGUPA-131: a blocked tap doesn't bump `tick` the way a move/undo/reset/hint does, so a
  // stale hintFailed can still be true underneath it (BoardScreen.tsx's own blockedReason clears
  // only on `tick`) — ranking blocked first keeps the freshest action's message on screen.
  it('reports a blocked tap over a stale dead-end hint too, carrying which rule tripped', () => {
    expect(statusFor(progress, { ...none, hintFailed: true, blockedReason: 'blocked-departure' })).toEqual({
      kind: 'blocked',
      reason: 'blocked-departure',
      ...progress,
    });
  });

  it('reports a blocked tap over won/stuck as well', () => {
    expect(statusFor(progress, { ...none, won: true, stuck: true, blockedReason: 'blocked-arrival' })).toEqual({
      kind: 'blocked',
      reason: 'blocked-arrival',
      ...progress,
    });
  });
});
