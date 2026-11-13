import {
  addHints,
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

function progress(overrides: Partial<Progress> = {}): Progress {
  return {
    done: [],
    level: 0,
    bestMoves: {},
    hints: 3,
    hintsUsed: 0,
    undosUsed: 0,
    perfectClears: 0,
    perfectStreak: 0,
    bestPerfectStreak: 0,
    ...overrides,
  };
}

describe('isDone', () => {
  it('is false for a level not in done', () => {
    expect(isDone(NO_PROGRESS, 0)).toBe(false);
  });

  it('is true for a level in done', () => {
    expect(isDone(progress({ done: [2] }), 2)).toBe(true);
  });
});

describe('isUnlocked', () => {
  const unlockedProgress = progress({ done: [0, 1], level: 2 });

  it('the first level of a pack is always unlocked', () => {
    expect(isUnlocked(NO_PROGRESS, 0, 0)).toBe(true);
  });

  it('a level is locked until the one before it, in the same pack, is cleared', () => {
    expect(isUnlocked(NO_PROGRESS, 1, 0)).toBe(false);
  });

  it('a level unlocks once the one before it is cleared', () => {
    expect(isUnlocked(unlockedProgress, 2, 0)).toBe(true);
  });

  it('a level already cleared stays unlocked', () => {
    expect(isUnlocked(unlockedProgress, 0, 0)).toBe(true);
  });

  it("a pack's first level is unlocked regardless of any other pack's progress", () => {
    expect(isUnlocked(NO_PROGRESS, 50, 50)).toBe(true);
  });

  it('a later level in a pack stays locked by that pack alone, not by an earlier pack', () => {
    const otherPackDone = progress({ done: [0, 1, 2], level: 2 });
    expect(isUnlocked(otherPackDone, 51, 50)).toBe(false);
  });
});

describe('firstUnsolvedLevel', () => {
  it('is the first level when nothing is done', () => {
    expect(firstUnsolvedLevel(NO_PROGRESS, 100)).toBe(0);
  });

  it('is the first level not in done, regardless of which pack it falls in', () => {
    expect(firstUnsolvedLevel(progress({ done: [0, 1, 50, 51], level: 51 }), 100)).toBe(2);
  });

  it('skips past an already-done level even mid-sequence', () => {
    expect(firstUnsolvedLevel(progress({ done: [0, 2], level: 2 }), 100)).toBe(1);
  });

  it('falls back to the last level once every level is done', () => {
    expect(firstUnsolvedLevel(progress({ done: [0, 1, 2], level: 2 }), 3)).toBe(2);
  });
});

describe('markDone', () => {
  it('adds a newly cleared level', () => {
    expect(markDone(NO_PROGRESS, 3, 5, false).done).toEqual([3]);
  });

  it("records the clear's move count as the level's best", () => {
    expect(markDone(NO_PROGRESS, 3, 5, false).bestMoves).toEqual({ 3: 5 });
  });

  it('keeps done sorted regardless of clear order', () => {
    const next = markDone(markDone(NO_PROGRESS, 3, 5, false), 1, 2, false);
    expect(next.done).toEqual([1, 3]);
  });

  it('returns the same record for a non-perfect replay of an already-done level with no better move count', () => {
    const done = progress({ done: [1], bestMoves: { 1: 4 } });
    expect(markDone(done, 1, 4, false)).toBe(done);
    expect(markDone(done, 1, 6, false)).toBe(done);
  });

  it('updates the best when a replay beats it, without duplicating done', () => {
    const done = progress({ done: [1], bestMoves: { 1: 4 } });
    const next = markDone(done, 1, 2, false);
    expect(next.done).toEqual([1]);
    expect(next.bestMoves).toEqual({ 1: 2 });
  });

  it('earns one hint on a first-time clear', () => {
    expect(markDone(progress(), 3, 5, false).hints).toBe(4);
  });

  it('earns a hint uncapped, past the starting balance', () => {
    expect(markDone(progress({ hints: 20 }), 3, 5, false).hints).toBe(21);
  });

  it('earns no hint on a replay that beats the best of an already-done level', () => {
    const done = progress({ done: [1], bestMoves: { 1: 4 } });
    expect(markDone(done, 1, 2, false).hints).toBe(3);
  });

  // CANGUPA-90: a perfect clear is one with no hint and no undo since the
  // attempt's last reset — tracked here rather than passed in already
  // aggregated, so markDone is the single place that keeps perfectClears/
  // perfectStreak/bestPerfectStreak consistent with each other.
  it('counts a perfect clear in the lifetime perfectClears total', () => {
    expect(markDone(progress(), 3, 5, true).perfectClears).toBe(1);
  });

  it('counts a perfect clear even on a replay of an already-done level', () => {
    const done = progress({ done: [1], bestMoves: { 1: 4 }, perfectClears: 2 });
    expect(markDone(done, 1, 4, true).perfectClears).toBe(3);
  });

  it('leaves perfectClears unchanged on a non-perfect clear', () => {
    expect(markDone(progress({ perfectClears: 2 }), 3, 5, false).perfectClears).toBe(2);
  });

  it('extends the current streak on a perfect clear', () => {
    const streaking = progress({ perfectStreak: 2 });
    expect(markDone(streaking, 3, 5, true).perfectStreak).toBe(3);
  });

  it('resets the current streak to 0 on a non-perfect clear', () => {
    const streaking = progress({ perfectStreak: 4 });
    expect(markDone(streaking, 3, 5, false).perfectStreak).toBe(0);
  });

  it('raises bestPerfectStreak when the current streak passes it', () => {
    const streaking = progress({ perfectStreak: 4, bestPerfectStreak: 4 });
    expect(markDone(streaking, 3, 5, true).bestPerfectStreak).toBe(5);
  });

  it('keeps bestPerfectStreak once the current streak later breaks', () => {
    const peaked = progress({ perfectStreak: 5, bestPerfectStreak: 5 });
    expect(markDone(peaked, 3, 5, false).bestPerfectStreak).toBe(5);
  });

  it('returns the same record when a non-perfect replay breaks nothing — the streak was already 0', () => {
    const done = progress({ done: [1], bestMoves: { 1: 4 } });
    expect(markDone(done, 1, 4, false)).toBe(done);
  });

  it('does not return the same record when a non-perfect clear breaks a live streak, even with no better move count', () => {
    const done = progress({ done: [1], bestMoves: { 1: 4 }, perfectStreak: 3, bestPerfectStreak: 3 });
    expect(markDone(done, 1, 4, false)).not.toBe(done);
  });
});

describe('withLevel', () => {
  it('sets the level to resume into', () => {
    expect(withLevel(NO_PROGRESS, 5).level).toBe(5);
  });

  it('returns the same record when the level is unchanged', () => {
    const atLevel = progress({ level: 5 });
    expect(withLevel(atLevel, 5)).toBe(atLevel);
  });
});

describe('spendHint', () => {
  it('takes one off the balance', () => {
    expect(spendHint(progress()).hints).toBe(2);
  });

  it('floors at 0 rather than going negative', () => {
    expect(spendHint(progress({ hints: 0 })).hints).toBe(0);
  });

  it('returns the same record once already at 0, so a spend that changes nothing never fires a save', () => {
    const empty = progress({ hints: 0 });
    expect(spendHint(empty)).toBe(empty);
  });

  it('counts a spend in the lifetime hintsUsed total (CANGUPA-142)', () => {
    expect(spendHint(progress({ hintsUsed: 2 })).hintsUsed).toBe(3);
  });

  it('leaves hintsUsed unchanged once the balance is already 0', () => {
    expect(spendHint(progress({ hints: 0, hintsUsed: 2 })).hintsUsed).toBe(2);
  });
});

describe('recordUndo', () => {
  it('adds one to the lifetime undosUsed total (CANGUPA-145)', () => {
    expect(recordUndo(progress({ undosUsed: 2 })).undosUsed).toBe(3);
  });

  it('leaves every other field untouched', () => {
    const played = progress({ done: [1], level: 1, bestMoves: { 1: 4 }, hints: 2, hintsUsed: 1 });
    expect(recordUndo(played)).toEqual({ ...played, undosUsed: 1 });
  });
});

describe('addHints', () => {
  it('adds the bought amount to the balance', () => {
    expect(addHints(progress(), 10).hints).toBe(13);
  });

  it("is uncapped, the same as markDone's per-clear hint", () => {
    expect(addHints(progress({ hints: 0 }), 100).hints).toBe(100);
  });

  it('returns the same record for a zero or negative amount, so a malformed purchase never fires a save', () => {
    const base = progress();
    expect(addHints(base, 0)).toBe(base);
    expect(addHints(base, -5)).toBe(base);
  });
});

describe('totalBestMoves', () => {
  it('is zero with no cleared levels', () => {
    expect(totalBestMoves(NO_PROGRESS)).toBe(0);
  });

  it("sums every level's best move count", () => {
    const cleared = progress({ done: [0, 1, 2], level: 2, bestMoves: { 0: 3, 1: 5, 2: 2 } });
    expect(totalBestMoves(cleared)).toBe(10);
  });
});

describe('parseProgress', () => {
  it('uses no progress when nothing is saved', () => {
    expect(parseProgress(null)).toEqual(NO_PROGRESS);
  });

  it('reads saved done levels, the resume level, best moves, hint balance and every lifetime counter', () => {
    expect(
      parseProgress(
        '{"done":[0,2],"level":3,"bestMoves":{"0":4,"2":1},"hints":1,"hintsUsed":5,"undosUsed":2,"perfectClears":7,"perfectStreak":1,"bestPerfectStreak":4}',
      ),
    ).toEqual({
      done: [0, 2],
      level: 3,
      bestMoves: { 0: 4, 2: 1 },
      hints: 1,
      hintsUsed: 5,
      undosUsed: 2,
      perfectClears: 7,
      perfectStreak: 1,
      bestPerfectStreak: 4,
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

  it('falls back to 0 when perfectClears, perfectStreak or bestPerfectStreak is missing — a save from before CANGUPA-90 has none of them', () => {
    expect(parseProgress('{"done":[0],"level":0}').perfectClears).toBe(0);
    expect(parseProgress('{"done":[0],"level":0}').perfectStreak).toBe(0);
    expect(parseProgress('{"done":[0],"level":0}').bestPerfectStreak).toBe(0);
  });

  it('falls back to 0 when perfectClears, perfectStreak or bestPerfectStreak is not a non-negative integer', () => {
    expect(parseProgress('{"perfectClears":-1}').perfectClears).toBe(0);
    expect(parseProgress('{"perfectClears":1.5}').perfectClears).toBe(0);
    expect(parseProgress('{"perfectStreak":"2"}').perfectStreak).toBe(0);
    expect(parseProgress('{"bestPerfectStreak":-1}').bestPerfectStreak).toBe(0);
  });

  it.each(CORRUPT_RECORDS)('reads %s as no progress', (_name, raw) => {
    expect(parseProgress(raw)).toEqual(NO_PROGRESS);
  });
});

describe('saving and loading', () => {
  it('round-trips progress through the store', async () => {
    const storage = memoryStorage();
    const played = progress({
      done: [0, 1, 4],
      level: 4,
      bestMoves: { 0: 3, 1: 6, 4: 2 },
      hints: 2,
      hintsUsed: 1,
      undosUsed: 3,
      perfectClears: 2,
      perfectStreak: 1,
      bestPerfectStreak: 2,
    });

    await saveProgress(storage, played);

    expect(await loadProgress(storage)).toEqual(played);
  });

  it('writes under the expected key', async () => {
    const storage = memoryStorage();

    await saveProgress(
      storage,
      progress({
        done: [0],
        level: 1,
        bestMoves: { 0: 5 },
        hints: 2,
        hintsUsed: 1,
      }),
    );

    expect(await storage.getItem(PROGRESS_KEY)).toBe(
      '{"done":[0],"level":1,"bestMoves":{"0":5},"hints":2,"hintsUsed":1,"undosUsed":0,"perfectClears":0,"perfectStreak":0,"bestPerfectStreak":0}',
    );
  });

  it('starts from no progress when nothing was saved', async () => {
    expect(await loadProgress(memoryStorage())).toEqual(NO_PROGRESS);
  });
});
