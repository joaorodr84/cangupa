// Achievements (CANGUPA-90): scoped to apps/app only, in-app only — no
// Game Center/Google Play Games wiring. That's a materially bigger lift
// (platform sign-in, a mapping to each store's own achievement IDs) better
// left as its own follow-up once this in-app version has shipped.
//
// Displayed the same way DigiSpin's own achievements are (the owner's own
// call): a card grid on the Stats screen (StatsScreen.tsx,
// achievementGrid.ts), one Ionicons glyph per card, and an "Earned on
// dd/mm/yyyy" line once earned — ported from DigiSpin's
// src/game/achievements.ts/src/state/useAchievements.ts, adapted to
// Cangupa's own Progress shape. Unlike DigiSpin, every achievement here is
// still a pure predicate over Progress (isEarned below) rather than a mix of
// derived and imperative "note*" grants — Cangupa has no single-moment
// achievement (a replay, a midnight solve) that Progress can't already
// answer, so there was nothing here that needed the imperative half of
// DigiSpin's design. Only the earned-date bookkeeping needed its own record
// (AchievementRecord below): a first-earned date isn't recoverable from
// Progress after the fact, so, same as DigiSpin, it is the one thing kept
// outside pure derivation, in its own small persisted file.
//
// A fourth category, "move-count records", was considered and dropped
// during CANGUPA-90's own scoping: board.ts's Game decrements `remaining`
// by exactly 1 on every move (step or jump alike) and only wins at
// remaining === 0, so clearing a given level always takes exactly the same
// number of moves — there is no "better" or "worse" clear to ever set a
// record against. `moves` below (lifetime moves across every cleared
// level) and `streak` (consecutive perfect clears) fill that category's
// intended spot instead, per the owner's call.
import { FIRST_COLLECTION_LEVEL_COUNT, PACK_SIZES } from '../game/levels';
import { type Progress, totalBestMoves } from './progress';
import { type Storage } from './storage';

export type AchievementCategory = 'milestone' | 'perfect' | 'streak' | 'moves';

export interface Achievement {
  readonly id: string;
  readonly category: AchievementCategory;
  // An Ionicons glyph name (matching DigiSpin's own Achievement.icon),
  // shown on its card on the Stats screen, greyed out like the rest of the
  // card until earned.
  readonly isEarned: (progress: Progress, totalLevels: number) => boolean;
  readonly icon: string;
}

// Where each pack starts in the play-order level list (levels.ts), the same
// running-sum LevelsScreen.tsx computes locally for its own one pack.
function packStarts(packSizes: readonly number[]): readonly number[] {
  const starts: number[] = [];
  let start = 0;
  for (const size of packSizes) {
    starts.push(start);
    start += size;
  }
  return starts;
}

function isPackDone(progress: Progress, start: number, size: number): boolean {
  for (let levelIndex = start; levelIndex < start + size; levelIndex++) {
    if (!progress.done.includes(levelIndex)) {
      return false;
    }
  }
  return true;
}

const PACK_STARTS = packStarts(PACK_SIZES);

// In display order — strings/achievements.ts's en/pt entries line up with
// this array positionally, the same convention en.ts/pt.ts's `packs` arrays
// already follow for packs.ts (packText.test.ts keeps those two in step; an
// achievements test below does the same for this one).
export const ACHIEVEMENTS: readonly Achievement[] = [
  { id: 'first-level', category: 'milestone', icon: 'footsteps-outline', isEarned: (progress) => progress.done.length >= 1 },
  {
    id: 'first-pack',
    category: 'milestone',
    icon: 'layers-outline',
    isEarned: (progress) => PACK_SIZES.some((size, i) => isPackDone(progress, PACK_STARTS[i], size)),
  },
  {
    id: 'all-packs',
    category: 'milestone',
    icon: 'trophy-outline',
    // "Clear every pack in your first collection" (en.ts) — FIRST_COLLECTION_LEVEL_COUNT, not
    // the `totalLevels` this predicate is called with (CANGUPA-162): totalLevels is every level
    // across every collection, and would silently make this harder to earn, or stop being
    // earnable by an existing save at all, the moment a second collection's levels are added.
    isEarned: (progress) => progress.done.length >= FIRST_COLLECTION_LEVEL_COUNT,
  },
  { id: 'perfect-1', category: 'perfect', icon: 'leaf-outline', isEarned: (progress) => progress.perfectClears >= 1 },
  {
    id: 'perfect-10',
    category: 'perfect',
    icon: 'shield-checkmark-outline',
    isEarned: (progress) => progress.perfectClears >= 10,
  },
  { id: 'perfect-50', category: 'perfect', icon: 'diamond-outline', isEarned: (progress) => progress.perfectClears >= 50 },
  { id: 'streak-5', category: 'streak', icon: 'flame-outline', isEarned: (progress) => progress.bestPerfectStreak >= 5 },
  { id: 'streak-10', category: 'streak', icon: 'flash-outline', isEarned: (progress) => progress.bestPerfectStreak >= 10 },
  { id: 'streak-25', category: 'streak', icon: 'rocket-outline', isEarned: (progress) => progress.bestPerfectStreak >= 25 },
  { id: 'moves-500', category: 'moves', icon: 'walk-outline', isEarned: (progress) => totalBestMoves(progress) >= 500 },
  { id: 'moves-2000', category: 'moves', icon: 'bicycle-outline', isEarned: (progress) => totalBestMoves(progress) >= 2000 },
  {
    id: 'moves-10000',
    category: 'moves',
    icon: 'airplane-outline',
    isEarned: (progress) => totalBestMoves(progress) >= 10000,
  },
];

// The ids earned by the current progress — ported from DigiSpin's own
// earnedFromProgress, minus the half of it that read `stats` for a
// single-moment achievement: nothing here needs that, every id is a pure
// predicate over Progress alone (see this file's own header comment).
export function earnedAchievementIds(progress: Progress, totalLevels: number): string[] {
  return ACHIEVEMENTS.filter((achievement) => achievement.isEarned(progress, totalLevels)).map(
    (achievement) => achievement.id,
  );
}

// Which ids are earned, and when each was first earned (CANGUPA-90, ported
// from DigiSpin's own AchievementRecord) — the one piece of achievement
// state Progress itself can't answer after the fact, so it gets its own
// small persisted record rather than living on Progress.
export interface AchievementRecord {
  readonly earned: readonly string[];
  // "YYYY-MM-DD", local time, the same shape DigiSpin's own earnedDates
  // uses — an achievement's earned date never shows a time, so it never
  // needed one. An id earned before this record existed has no entry here;
  // its card shows no date rather than a made-up one.
  readonly earnedDates: Readonly<Record<string, string>>;
}

export const NO_ACHIEVEMENTS: AchievementRecord = { earned: [], earnedDates: {} };

export const ACHIEVEMENTS_KEY = 'cangupa.achievements';

function todayLocal(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// Adds the ids to the record, dated with the given day (today's local date
// by default; tests pass their own, for a fixed result). Returns the same
// record when every id is already earned, so the caller can tell whether
// anything needs saving. An id already earned keeps its original date even
// if it is passed again.
export function withEarned(
  record: AchievementRecord,
  ids: readonly string[],
  earnedOn: string = todayLocal(),
): AchievementRecord {
  const fresh = [...new Set(ids)].filter((id) => !record.earned.includes(id));
  if (fresh.length === 0) {
    return record;
  }
  const earnedDates = { ...record.earnedDates };
  for (const id of fresh) {
    earnedDates[id] = earnedOn;
  }
  return { earned: [...record.earned, ...fresh].sort(), earnedDates };
}

const EARNED_DATE_SHAPE = /^\d{4}-\d{2}-\d{2}$/;

// Keeps only the entries that are an earned id mapped to that shape.
// Anything else in a corrupt or hand-edited save is dropped rather than
// shown as a date, the same leniency progress.ts's own sanitizing gives
// every other field.
function parseEarnedDates(value: unknown, earned: readonly string[]): Readonly<Record<string, string>> {
  if (typeof value !== 'object' || value === null) {
    return {};
  }
  const dates: Record<string, string> = {};
  for (const [id, date] of Object.entries(value as Record<string, unknown>)) {
    if (earned.includes(id) && typeof date === 'string' && EARNED_DATE_SHAPE.test(date)) {
      dates[id] = date;
    }
  }
  return dates;
}

// Reads a saved record. Anything that is not a JSON object with a list of
// strings is treated as none earned, so a corrupt value can never stop the
// app from opening.
export function parseAchievementRecord(raw: string | null): AchievementRecord {
  if (raw === null) {
    return NO_ACHIEVEMENTS;
  }
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== 'object' || value === null || !('earned' in value) || !Array.isArray(value.earned)) {
      return NO_ACHIEVEMENTS;
    }
    const ids = value.earned.filter((item): item is string => typeof item === 'string' && item.length > 0);
    const earned = [...new Set(ids)].sort();
    const dates = 'earnedDates' in value ? (value as Record<string, unknown>).earnedDates : null;
    return { earned, earnedDates: parseEarnedDates(dates, earned) };
  } catch {
    return NO_ACHIEVEMENTS;
  }
}

export async function loadAchievementRecord(storage: Storage): Promise<AchievementRecord> {
  return parseAchievementRecord(await storage.getItem(ACHIEVEMENTS_KEY));
}

export async function saveAchievementRecord(storage: Storage, record: AchievementRecord): Promise<void> {
  await storage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(record));
}
