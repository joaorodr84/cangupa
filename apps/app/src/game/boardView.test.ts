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
    const g = new Game(['S.1'], { jumps: true });
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

  it('reports playing by default', () => {
    expect(statusFor(progress, { won: false, stuck: false, hintFailed: false, hasNext: true })).toEqual({
      kind: 'playing',
      ...progress,
    });
  });

  it('reports stuck over playing', () => {
    expect(statusFor(progress, { won: false, stuck: true, hintFailed: false, hasNext: true })).toEqual({
      kind: 'stuck',
      ...progress,
    });
  });

  it('reports won over stuck, with whether there is a next level', () => {
    expect(statusFor(progress, { won: true, stuck: false, hintFailed: false, hasNext: true })).toEqual({
      kind: 'won',
      moves: progress.moves,
      hasNext: true,
    });
    expect(statusFor(progress, { won: true, stuck: false, hintFailed: false, hasNext: false })).toEqual({
      kind: 'won',
      moves: progress.moves,
      hasNext: false,
    });
  });

  it('reports a dead-end hint over everything else, still carrying the progress', () => {
    expect(statusFor(progress, { won: true, stuck: true, hintFailed: true, hasNext: true })).toEqual({
      kind: 'hintFailed',
      ...progress,
    });
  });
});
