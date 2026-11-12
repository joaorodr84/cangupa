import {
  firstUnsolvedLevel,
  isDone,
  isUnlocked,
  markDone,
  NO_PROGRESS,
  parseProgress,
  loadProgress,
  recordUndo,
  spendHint,
  STARTING_HINTS,
  type Progress,
  saveProgress,
  PROGRESS_KEY,
  totalBestMoves,
  withLevel,
} from './progress';
import { CORRUPT_RECORDS, memoryStorage } from './storage.testUtil';

describe('isDone', () => {
  it('is false for a level not in done', () => {
    expect(isDone(NO_PROGRESS, 0)).toBe(false);
  });

  it('is true for a level in done', () => {
    expect(isDone({ done: [2], level: 0, bestMoves: {}, hints: 3, hintsUsed: 0, undosUsed: 0 }, 2)).toBe(true);
  });
});

describe('isUnlocked', () => {
  const progress: Progress = { done: [0, 1], level: 2, bestMoves: {}, hints: 3, hintsUsed: 0, undosUsed: 0 };

  it('the first level of a pack is always unlocked', () => {
    expect(isUnlocked(NO_PROGRESS, 0, 0)).toBe(true);
  });

  it('a level is locked until the one before it, in the same pack, is cleared', () => {
    expect(isUnlocked(NO_PROGRESS, 1, 0)).toBe(false);
  });

  it('a level unlocks once the one before it is cleared', () => {
    expect(isUnlocked(progress, 2, 0)).toBe(true);
  });

  it('a level already cleared stays unlocked', () => {
    expect(isUnlocked(progress, 0, 0)).toBe(true);
  });

  it("a pack's first level is unlocked regardless of any other pack's progress", () => {
    expect(isUnlocked(NO_PROGRESS, 50, 50)).toBe(true);
  });

  it('a later level in a pack stays locked by that pack alone, not by an earlier pack', () => {
    const otherPackDone: Progress = { done: [0, 1, 2], level: 2, bestMoves: {}, hints: 3, hintsUsed: 0, undosUsed: 0 };
    expect(isUnlocked(otherPackDone, 51, 50)).toBe(false);
  });
});

describe('firstUnsolvedLevel', () => {
  it('is the first level when nothing is done', () => {
    expect(firstUnsolvedLevel(NO_PROGRESS, 100)).toBe(0);
  });

  it('is the first level not in done, regardless of which pack it falls in', () => {
    const progress: Progress = {
      done: [0, 1, 50, 51],
      level: 51,
      bestMoves: {},
      hints: 3,
      hintsUsed: 0,
      undosUsed: 0,
    };
    expect(firstUnsolvedLevel(progress, 100)).toBe(2);
  });

  it('skips past an already-done level even mid-sequence', () => {
    const progress: Progress = { done: [0, 2], level: 2, bestMoves: {}, hints: 3, hintsUsed: 0, undosUsed: 0 };
    expect(firstUnsolvedLevel(progress, 100)).toBe(1);
  });

  it('falls back to the last level once every level is done', () => {
    const progress: Progress = { done: [0, 1, 2], level: 2, bestMoves: {}, hints: 3, hintsUsed: 0, undosUsed: 0 };
    expect(firstUnsolvedLevel(progress, 3)).toBe(2);
  });
});

describe('markDone', () => {
  it('adds a newly cleared level', () => {
    expect(markDone(NO_PROGRESS, 3, 5).done).toEqual([3]);
  });

  it('records the clear\'s move count as the level\'s best', () => {
    expect(markDone(NO_PROGRESS, 3, 5).bestMoves).toEqual({ 3: 5 });
  });

  it('keeps done sorted regardless of clear order', () => {
    const progress = markDone(markDone(NO_PROGRESS, 3, 5), 1, 2);
    expect(progress.done).toEqual([1, 3]);
  });

  it('returns the same record for a level already done with no better move count', () => {
    const progress: Progress = { done: [1], level: 0, bestMoves: { 1: 4 }, hints: 3, hintsUsed: 0, undosUsed: 0 };
    expect(markDone(progress, 1, 4)).toBe(progress);
    expect(markDone(progress, 1, 6)).toBe(progress);
  });

  it('updates the best when a replay beats it, without duplicating done', () => {
    const progress: Progress = { done: [1], level: 0, bestMoves: { 1: 4 }, hints: 3, hintsUsed: 0, undosUsed: 0 };
    const next = markDone(progress, 1, 2);
    expect(next.done).toEqual([1]);
    expect(next.bestMoves).toEqual({ 1: 2 });
  });

  it('earns one hint on a first-time clear', () => {
    const progress: Progress = { done: [], level: 0, bestMoves: {}, hints: 3, hintsUsed: 0, undosUsed: 0 };
    expect(markDone(progress, 3, 5).hints).toBe(4);
  });

  it('earns a hint uncapped, past the starting balance', () => {
    const progress: Progress = { done: [], level: 0, bestMoves: {}, hints: 20, hintsUsed: 0, undosUsed: 0 };
    expect(markDone(progress, 3, 5).hints).toBe(21);
  });

  it('earns no hint on a replay that beats the best of an already-done level', () => {
    const progress: Progress = { done: [1], level: 0, bestMoves: { 1: 4 }, hints: 3, hintsUsed: 0, undosUsed: 0 };
    expect(markDone(progress, 1, 2).hints).toBe(3);
  });
});

describe('withLevel', () => {
  it('sets the level to resume into', () => {
    expect(withLevel(NO_PROGRESS, 5).level).toBe(5);
  });

  it('returns the same record when the level is unchanged', () => {
    const progress: Progress = { done: [], level: 5, bestMoves: {}, hints: 3, hintsUsed: 0, undosUsed: 0 };
    expect(withLevel(progress, 5)).toBe(progress);
  });
});

describe('spendHint', () => {
  it('takes one off the balance', () => {
    const progress: Progress = { done: [], level: 0, bestMoves: {}, hints: 3, hintsUsed: 0, undosUsed: 0 };
    expect(spendHint(progress).hints).toBe(2);
  });

  it('floors at 0 rather than going negative', () => {
    const progress: Progress = { done: [], level: 0, bestMoves: {}, hints: 0, hintsUsed: 0, undosUsed: 0 };
    expect(spendHint(progress).hints).toBe(0);
  });

  it('returns the same record once already at 0, so a spend that changes nothing never fires a save', () => {
    const progress: Progress = { done: [], level: 0, bestMoves: {}, hints: 0, hintsUsed: 0, undosUsed: 0 };
    expect(spendHint(progress)).toBe(progress);
  });

  it('counts a spend in the lifetime hintsUsed total (CANGUPA-142)', () => {
    const progress: Progress = { done: [], level: 0, bestMoves: {}, hints: 3, hintsUsed: 2, undosUsed: 0 };
    expect(spendHint(progress).hintsUsed).toBe(3);
  });

  it('leaves hintsUsed unchanged once the balance is already 0', () => {
    const progress: Progress = { done: [], level: 0, bestMoves: {}, hints: 0, hintsUsed: 2, undosUsed: 0 };
    expect(spendHint(progress).hintsUsed).toBe(2);
  });
});

describe('recordUndo', () => {
  it('adds one to the lifetime undosUsed total (CANGUPA-145)', () => {
    const progress: Progress = { done: [], level: 0, bestMoves: {}, hints: 3, hintsUsed: 0, undosUsed: 2 };
    expect(recordUndo(progress).undosUsed).toBe(3);
  });

  it('leaves every other field untouched', () => {
    const progress: Progress = { done: [1], level: 1, bestMoves: { 1: 4 }, hints: 2, hintsUsed: 1, undosUsed: 0 };
    expect(recordUndo(progress)).toEqual({ ...progress, undosUsed: 1 });
  });
});

describe('totalBestMoves', () => {
  it('is zero with no cleared levels', () => {
    expect(totalBestMoves(NO_PROGRESS)).toBe(0);
  });

  it('sums every level\'s best move count', () => {
    const progress: Progress = {
      done: [0, 1, 2],
      level: 2,
      bestMoves: { 0: 3, 1: 5, 2: 2 },
      hints: 3,
      hintsUsed: 0,
      undosUsed: 0,
    };
    expect(totalBestMoves(progress)).toBe(10);
  });
});

describe('parseProgress', () => {
  it('uses no progress when nothing is saved', () => {
    expect(parseProgress(null)).toEqual(NO_PROGRESS);
  });

  it('reads saved done levels, the resume level, best moves, hint balance and the hints/undos used counters', () => {
    expect(
      parseProgress('{"done":[0,2],"level":3,"bestMoves":{"0":4,"2":1},"hints":1,"hintsUsed":5,"undosUsed":2}'),
    ).toEqual({
      done: [0, 2],
      level: 3,
      bestMoves: { 0: 4, 2: 1 },
      hints: 1,
      hintsUsed: 5,
      undosUsed: 2,
    });
  });

  it('de-duplicates and sorts done levels', () => {
    expect(parseProgress('{"done":[2,0,2,1]}').done).toEqual([0, 1, 2]);
  });

  it('drops entries in done that are not non-negative integers', () => {
    expect(parseProgress('{"done":[0,-1,1.5,"2",null]}').done).toEqual([0]);
  });

  it('falls back to level 0 when level is missing or not a non-negative integer', () => {
    expect(parseProgress('{"done":[]}').level).toBe(0);
    expect(parseProgress('{"done":[],"level":-1}').level).toBe(0);
    expect(parseProgress('{"done":[],"level":"3"}').level).toBe(0);
  });

  it('falls back to no done levels when done is missing or not an array', () => {
    expect(parseProgress('{"level":2}').done).toEqual([]);
    expect(parseProgress('{"done":"nope","level":2}').done).toEqual([]);
  });

  it('falls back to no best moves when the field is missing or not an object', () => {
    expect(parseProgress('{"done":[0],"level":0}').bestMoves).toEqual({});
    expect(parseProgress('{"done":[0],"level":0,"bestMoves":"nope"}').bestMoves).toEqual({});
  });

  it('drops best-move entries with a non-integer level or a non-positive move count', () => {
    expect(parseProgress('{"bestMoves":{"0":3,"-1":2,"1.5":2,"2":0,"3":-1,"4":"x"}}').bestMoves).toEqual({ 0: 3 });
  });

  it('falls back to the starting balance when hints is missing — a save from before CANGUPA-54 has not spent any', () => {
    expect(parseProgress('{"done":[0],"level":0}').hints).toBe(STARTING_HINTS);
  });

  it('falls back to the starting balance when hints is not a non-negative integer', () => {
    expect(parseProgress('{"hints":-1}').hints).toBe(STARTING_HINTS);
    expect(parseProgress('{"hints":1.5}').hints).toBe(STARTING_HINTS);
    expect(parseProgress('{"hints":"2"}').hints).toBe(STARTING_HINTS);
  });

  it('reads a hint balance of 0 as-is, not as missing', () => {
    expect(parseProgress('{"hints":0}').hints).toBe(0);
  });

  it('falls back to 0 when hintsUsed or undosUsed is missing — a save from before CANGUPA-142/CANGUPA-145 has not counted either', () => {
    expect(parseProgress('{"done":[0],"level":0}').hintsUsed).toBe(0);
    expect(parseProgress('{"done":[0],"level":0}').undosUsed).toBe(0);
  });

  it('falls back to 0 when hintsUsed or undosUsed is not a non-negative integer', () => {
    expect(parseProgress('{"hintsUsed":-1}').hintsUsed).toBe(0);
    expect(parseProgress('{"hintsUsed":1.5}').hintsUsed).toBe(0);
    expect(parseProgress('{"hintsUsed":"2"}').hintsUsed).toBe(0);
    expect(parseProgress('{"undosUsed":-1}').undosUsed).toBe(0);
    expect(parseProgress('{"undosUsed":1.5}').undosUsed).toBe(0);
    expect(parseProgress('{"undosUsed":"2"}').undosUsed).toBe(0);
  });

  it('reads an hintsUsed/undosUsed of 0 as-is, not as missing', () => {
    expect(parseProgress('{"hintsUsed":0,"undosUsed":0}').hintsUsed).toBe(0);
    expect(parseProgress('{"hintsUsed":0,"undosUsed":0}').undosUsed).toBe(0);
  });

  it.each(CORRUPT_RECORDS)('reads %s as no progress', (_name, raw) => {
    expect(parseProgress(raw)).toEqual(NO_PROGRESS);
  });
});

describe('saving and loading', () => {
  it('round-trips progress through the store', async () => {
    const storage = memoryStorage();
    const progress: Progress = {
      done: [0, 1, 4],
      level: 4,
      bestMoves: { 0: 3, 1: 6, 4: 2 },
      hints: 2,
      hintsUsed: 1,
      undosUsed: 3,
    };

    await saveProgress(storage, progress);

    expect(await loadProgress(storage)).toEqual(progress);
  });

  it('writes under the expected key', async () => {
    const storage = memoryStorage();

    await saveProgress(storage, {
      done: [0],
      level: 1,
      bestMoves: { 0: 5 },
      hints: 2,
      hintsUsed: 1,
      undosUsed: 0,
    });

    expect(await storage.getItem(PROGRESS_KEY)).toBe(
      '{"done":[0],"level":1,"bestMoves":{"0":5},"hints":2,"hintsUsed":1,"undosUsed":0}',
    );
  });

  it('starts from no progress when nothing was saved', async () => {
    expect(await loadProgress(memoryStorage())).toEqual(NO_PROGRESS);
  });
});
