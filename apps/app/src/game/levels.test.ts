// Ported from apps/web-classic/tools/test.js's "levels" section: every level
// must have a solution, and playing it out must actually clear the board.
// Now over the packs' levels in play order (CANGUPA-56).
import { Game } from './board';
import { collectionLevelCount, COLLECTIONS, FIRST_COLLECTION_LEVEL_COUNT, LEVELS, PACK_SIZES } from './levels';
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

describe('collections (CANGUPA-162)', () => {
  test('today there is exactly one, Lay of the Land, covering every pack', () => {
    expect(COLLECTIONS).toEqual([{ name: 'Lay of the Land', packCount: 10 }]);
    expect(COLLECTIONS.reduce((n, c) => n + c.packCount, 0)).toBe(PACKS.length);
  });

  test('FIRST_COLLECTION_LEVEL_COUNT is every level today, since there is only one collection', () => {
    expect(FIRST_COLLECTION_LEVEL_COUNT).toBe(LEVELS.length);
  });

  test('collectionLevelCount sums only the first packCount pack sizes, not every pack — proven on a made-up collection, so this holds the moment Down Under\'s own pack sizes exist, not just by coincidence on today\'s one real collection', () => {
    const packSizes = [10, 20, 5, 8, 2];
    expect(collectionLevelCount(packSizes, 0)).toBe(0);
    expect(collectionLevelCount(packSizes, 2)).toBe(30); // 10 + 20, not the 5/8/2 after it
    expect(collectionLevelCount(packSizes, packSizes.length)).toBe(45); // every pack
  });
});
