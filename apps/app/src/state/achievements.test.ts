import {
  ACHIEVEMENTS,
  ACHIEVEMENTS_KEY,
  earnedAchievementIds,
  loadAchievementRecord,
  NO_ACHIEVEMENTS,
  parseAchievementRecord,
  saveAchievementRecord,
  withEarned,
} from './achievements';
import { LEVELS, PACK_SIZES } from '../game/levels';
import { NO_PROGRESS, type Progress } from './progress';
import { CORRUPT_RECORDS, memoryStorage } from './storage.testUtil';

function progress(overrides: Partial<Progress>): Progress {
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

function find(id: string) {
  const achievement = ACHIEVEMENTS.find((a) => a.id === id);
  if (!achievement) throw new Error(`no achievement named ${id}`);
  return achievement;
}

describe('milestone achievements', () => {
  it('first-level is unearned with nothing cleared', () => {
    expect(find('first-level').isEarned(NO_PROGRESS, LEVELS.length)).toBe(false);
  });

  it('first-level is earned once any level is cleared', () => {
    expect(find('first-level').isEarned(progress({ done: [0] }), LEVELS.length)).toBe(true);
  });

  it("first-pack is unearned until one whole pack's levels are all done", () => {
    const partialPack = progress({ done: Array.from({ length: PACK_SIZES[0] - 1 }, (_, i) => i) });
    expect(find('first-pack').isEarned(partialPack, LEVELS.length)).toBe(false);
  });

  it('first-pack is earned once one pack is entirely cleared, regardless of the others', () => {
    const wholePack = progress({ done: Array.from({ length: PACK_SIZES[0] }, (_, i) => i) });
    expect(find('first-pack').isEarned(wholePack, LEVELS.length)).toBe(true);
  });

  it('all-packs is earned only once every level is done', () => {
    const everything = progress({ done: Array.from({ length: LEVELS.length }, (_, i) => i) });
    expect(find('all-packs').isEarned(everything, LEVELS.length)).toBe(true);
    expect(find('all-packs').isEarned(progress({ done: [0] }), LEVELS.length)).toBe(false);
  });
});

describe('perfect-clear achievements', () => {
  it('perfect-1/10/50 track the lifetime perfectClears count', () => {
    expect(find('perfect-1').isEarned(progress({ perfectClears: 1 }), LEVELS.length)).toBe(true);
    expect(find('perfect-1').isEarned(progress({ perfectClears: 0 }), LEVELS.length)).toBe(false);
    expect(find('perfect-10').isEarned(progress({ perfectClears: 10 }), LEVELS.length)).toBe(true);
    expect(find('perfect-10').isEarned(progress({ perfectClears: 9 }), LEVELS.length)).toBe(false);
    expect(find('perfect-50').isEarned(progress({ perfectClears: 50 }), LEVELS.length)).toBe(true);
    expect(find('perfect-50').isEarned(progress({ perfectClears: 49 }), LEVELS.length)).toBe(false);
  });
});

describe('streak achievements', () => {
  it('streak-5/10/25 track the high-water bestPerfectStreak, not the live perfectStreak', () => {
    // A broken streak (perfectStreak back to 0) must not un-earn an
    // achievement already reached — the whole reason bestPerfectStreak
    // exists as its own field.
    const brokenAfterFive = progress({ perfectStreak: 0, bestPerfectStreak: 5 });
    expect(find('streak-5').isEarned(brokenAfterFive, LEVELS.length)).toBe(true);
    expect(find('streak-10').isEarned(brokenAfterFive, LEVELS.length)).toBe(false);
  });
});

describe('lifetime-moves achievements', () => {
  it('moves-500/2000/10000 track totalBestMoves', () => {
    const cleared = progress({ done: [0, 1], bestMoves: { 0: 300, 1: 200 } });
    expect(find('moves-500').isEarned(cleared, LEVELS.length)).toBe(true);
    expect(find('moves-2000').isEarned(cleared, LEVELS.length)).toBe(false);
  });
});

describe('earnedAchievementIds', () => {
  it('is empty with no progress at all', () => {
    expect(earnedAchievementIds(NO_PROGRESS, LEVELS.length)).toEqual([]);
  });

  it('lists exactly the ids whose own isEarned is true', () => {
    const oneLevelDone = progress({ done: [0] });
    const expected = ACHIEVEMENTS.filter((a) => a.isEarned(oneLevelDone, LEVELS.length)).map((a) => a.id);
    expect(earnedAchievementIds(oneLevelDone, LEVELS.length)).toEqual(expected);
  });
});

// CANGUPA-90: the earned-date record, ported from DigiSpin's own
// AchievementRecord — the one piece of achievement state that isn't a pure
// derivation of Progress, since a first-earned date can't be recovered
// from Progress after the fact.
describe('withEarned', () => {
  it('adds fresh ids, dated with the given day', () => {
    const next = withEarned(NO_ACHIEVEMENTS, ['first-level'], '2026-03-05');
    expect(next.earned).toEqual(['first-level']);
    expect(next.earnedDates).toEqual({ 'first-level': '2026-03-05' });
  });

  it('returns the same record when every id is already earned, so the caller can skip saving', () => {
    const record = withEarned(NO_ACHIEVEMENTS, ['first-level'], '2026-03-05');
    expect(withEarned(record, ['first-level'], '2026-03-06')).toBe(record);
  });

  it('keeps an id already earned at its original date even if it is passed again', () => {
    const record = withEarned(NO_ACHIEVEMENTS, ['first-level', 'first-pack'], '2026-03-05');
    const next = withEarned(record, ['first-level', 'all-packs'], '2026-03-06');
    expect(next.earnedDates).toEqual({
      'first-level': '2026-03-05',
      'first-pack': '2026-03-05',
      'all-packs': '2026-03-06',
    });
  });

  it('de-duplicates and sorts the earned ids', () => {
    const next = withEarned(NO_ACHIEVEMENTS, ['first-pack', 'first-level', 'first-level'], '2026-03-05');
    expect(next.earned).toEqual(['first-level', 'first-pack']);
  });
});

describe('parseAchievementRecord', () => {
  it('uses no achievements when nothing is saved', () => {
    expect(parseAchievementRecord(null)).toEqual(NO_ACHIEVEMENTS);
  });

  it('reads earned ids and their dates', () => {
    expect(
      parseAchievementRecord('{"earned":["first-level","first-pack"],"earnedDates":{"first-level":"2026-03-05"}}'),
    ).toEqual({
      earned: ['first-level', 'first-pack'],
      earnedDates: { 'first-level': '2026-03-05' },
    });
  });

  it('de-duplicates and sorts earned ids, and drops non-string entries', () => {
    expect(parseAchievementRecord('{"earned":["first-pack","first-level","first-pack",3,null]}').earned).toEqual([
      'first-level',
      'first-pack',
    ]);
  });

  it('drops a date entry for an id not in earned, or not in the "YYYY-MM-DD" shape', () => {
    expect(
      parseAchievementRecord(
        '{"earned":["first-level"],"earnedDates":{"first-level":"05-03-2026","first-pack":"2026-03-05"}}',
      ).earnedDates,
    ).toEqual({});
  });

  it.each(CORRUPT_RECORDS)('reads %s as no achievements', (_name, raw) => {
    expect(parseAchievementRecord(raw)).toEqual(NO_ACHIEVEMENTS);
  });
});

describe('saving and loading', () => {
  it('round-trips a record through the store', async () => {
    const storage = memoryStorage();
    const record = withEarned(NO_ACHIEVEMENTS, ['first-level'], '2026-03-05');

    await saveAchievementRecord(storage, record);

    expect(await loadAchievementRecord(storage)).toEqual(record);
  });

  it('writes under the expected key', async () => {
    const storage = memoryStorage();

    await saveAchievementRecord(storage, withEarned(NO_ACHIEVEMENTS, ['first-level'], '2026-03-05'));

    expect(await storage.getItem(ACHIEVEMENTS_KEY)).toBe(
      '{"earned":["first-level"],"earnedDates":{"first-level":"2026-03-05"}}',
    );
  });

  it('starts from no achievements when nothing was saved', async () => {
    expect(await loadAchievementRecord(memoryStorage())).toEqual(NO_ACHIEVEMENTS);
  });
});
