import { isDone, isUnlocked, markDone, NO_PROGRESS, parseProgress, loadProgress, type Progress, saveProgress, PROGRESS_KEY, withLevel } from './progress';
import { CORRUPT_RECORDS, memoryStorage } from './storage.testUtil';

describe('isDone', () => {
  it('is false for a level not in done', () => {
    expect(isDone(NO_PROGRESS, 0)).toBe(false);
  });

  it('is true for a level in done', () => {
    expect(isDone({ done: [2], level: 0 }, 2)).toBe(true);
  });
});

describe('isUnlocked', () => {
  const progress: Progress = { done: [0, 1], level: 2 };

  it('the first level is always unlocked', () => {
    expect(isUnlocked(NO_PROGRESS, 0)).toBe(true);
  });

  it('a level is locked until the one before it is cleared', () => {
    expect(isUnlocked(NO_PROGRESS, 1)).toBe(false);
  });

  it('a level unlocks once the one before it is cleared', () => {
    expect(isUnlocked(progress, 2)).toBe(true);
  });

  it('a level already cleared stays unlocked', () => {
    expect(isUnlocked(progress, 0)).toBe(true);
  });
});

describe('markDone', () => {
  it('adds a newly cleared level', () => {
    expect(markDone(NO_PROGRESS, 3).done).toEqual([3]);
  });

  it('keeps done sorted regardless of clear order', () => {
    const progress = markDone(markDone(NO_PROGRESS, 3), 1);
    expect(progress.done).toEqual([1, 3]);
  });

  it('returns the same record for a level already done', () => {
    const progress: Progress = { done: [1], level: 0 };
    expect(markDone(progress, 1)).toBe(progress);
  });
});

describe('withLevel', () => {
  it('sets the level to resume into', () => {
    expect(withLevel(NO_PROGRESS, 5).level).toBe(5);
  });

  it('returns the same record when the level is unchanged', () => {
    const progress: Progress = { done: [], level: 5 };
    expect(withLevel(progress, 5)).toBe(progress);
  });
});

describe('parseProgress', () => {
  it('uses no progress when nothing is saved', () => {
    expect(parseProgress(null)).toEqual(NO_PROGRESS);
  });

  it('reads saved done levels and the resume level', () => {
    expect(parseProgress('{"done":[0,2],"level":3}')).toEqual({ done: [0, 2], level: 3 });
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

  it.each(CORRUPT_RECORDS)('reads %s as no progress', (_name, raw) => {
    expect(parseProgress(raw)).toEqual(NO_PROGRESS);
  });
});

describe('saving and loading', () => {
  it('round-trips progress through the store', async () => {
    const storage = memoryStorage();
    const progress: Progress = { done: [0, 1, 4], level: 4 };

    await saveProgress(storage, progress);

    expect(await loadProgress(storage)).toEqual(progress);
  });

  it('writes under the expected key', async () => {
    const storage = memoryStorage();

    await saveProgress(storage, { done: [0], level: 1 });

    expect(await storage.getItem(PROGRESS_KEY)).toBe('{"done":[0],"level":1}');
  });

  it('starts from no progress when nothing was saved', async () => {
    expect(await loadProgress(memoryStorage())).toEqual(NO_PROGRESS);
  });
});
