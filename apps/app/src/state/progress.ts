// Ported from apps/web-classic/js/config.js's `Progress`: which levels have
// been cleared, and the level to resume. `bestMoves` was added for the stats
// screen (CANGUPA-30) — a save written before that field existed has none,
// and parseProgress below treats that the same as every level having no
// recorded best yet, so it is not a breaking change to the saved shape.
import { type Storage } from './storage';

// The hint balance a save starts with, and what a save written before
// CANGUPA-54 (no `hints` field at all) is treated as having — the same
// starting point a brand-new player gets, not zero, since nothing has
// actually been spent yet by a player who simply predates this field.
export const STARTING_HINTS = 3;

export interface Progress {
  // Indices (0-based) of cleared levels.
  readonly done: readonly number[];
  // The level to resume into.
  readonly level: number;
  // The fewest moves a cleared level has ever been solved in, by level
  // index. A level only gets an entry once it's been cleared at least once.
  readonly bestMoves: Readonly<Record<number, number>>;
  // Hints left to spend (CANGUPA-54), replenished one at a time by markDone
  // on each level's first clear (CANGUPA-124, uncapped) and in bulk by
  // addHints below (CANGUPA-79's in-app purchase). CANGUPA-78 (reward video)
  // would add a third path here; apps/web-classic gets its own equivalent
  // system as CANGUPA-125.
  readonly hints: number;
  // Lifetime count of hints actually spent (CANGUPA-142), for the stats
  // screen — unlike `hints`, this only ever grows, so it stays meaningful
  // after `hints` itself is replenished.
  readonly hintsUsed: number;
  // Lifetime count of undos actually taken (CANGUPA-145), for the stats
  // screen.
  readonly undosUsed: number;
  // Lifetime count of "perfect" clears (CANGUPA-90) — a level won without
  // spending a hint or taking an undo since the attempt's last reset.
  // Counts every such clear, not just first-time ones, the same lifetime
  // shape as hintsUsed/undosUsed above.
  readonly perfectClears: number;
  // How many perfect clears in a row the player is on right now (CANGUPA-90)
  // — incremented by a perfect clear, reset to 0 by anything else. Needs its
  // own field, separate from bestPerfectStreak below: an achievement derived
  // straight from "current streak" would un-earn itself the moment a streak
  // breaks, so the achievement checks the high-water mark instead and this
  // is only here to know whether the next clear continues or breaks it.
  readonly perfectStreak: number;
  // The longest perfectStreak ever reached (CANGUPA-90) — only ever grows,
  // the same "best ever" shape bestMoves already uses per level, so a
  // streak-length achievement stays earned once reached even after the
  // current streak later resets.
  readonly bestPerfectStreak: number;
  // Lifetime milliseconds spent with the app foregrounded (CANGUPA-143),
  // accumulated by useSessionTimer rather than derived from anything else
  // here — only ever grows, the same shape as hintsUsed/undosUsed.
  readonly timePlayedMs: number;
}

export const NO_PROGRESS: Progress = {
  done: [],
  level: 0,
  bestMoves: {},
  hints: STARTING_HINTS,
  hintsUsed: 0,
  undosUsed: 0,
  perfectClears: 0,
  perfectStreak: 0,
  bestPerfectStreak: 0,
  timePlayedMs: 0,
};

// A level's index is its place in the packs' play order (CANGUPA-56), which is
// not where it was in the old flat list of 50 levels: a record saved under the
// old key would mark the wrong levels cleared and open the wrong ones. So the
// key changed, and an old record is simply not read; the player starts the new
// levels fresh. The old entry stays in storage, unused. The owner confirmed
// replacing the levels outright, without carrying progress across.
export const PROGRESS_KEY = 'cangupa.progress.packs';

export function isDone(progress: Progress, levelIndex: number): boolean {
  return progress.done.includes(levelIndex);
}

// A level is open once the one before it, within the same pack, is cleared
// (apps/web-classic/js/ui.js's renderLevels has no packs to keep this inside
// of), it is the first level of its own pack, or it is already done itself.
// packStart is where that pack begins in the play-order list (levels.ts) —
// before CANGUPA-77, this checked levelIndex - 1 against the single index
// running across every pack concatenated, so a pack's first level stayed
// locked until the pack before it was entirely cleared; passing each pack's
// own start drops that cross-pack dependency so any pack can be started at
// any time, while a level's order within its own pack is still enforced.
export function isUnlocked(progress: Progress, levelIndex: number, packStart: number): boolean {
  return levelIndex === packStart || isDone(progress, levelIndex - 1) || isDone(progress, levelIndex);
}

// Marks a level cleared, with how many moves it took, and keeps the fewest
// moves it's ever been cleared in. A first-time clear also earns one hint,
// uncapped (CANGUPA-124) — a replay of an already-done level earns nothing,
// win or not, since the player already banked that level's hint. `perfect`
// (CANGUPA-90) is whether this clear used no hint and no undo since its
// last reset — tracked regardless of whether the level was already done,
// since a clean replay still extends or starts a streak and still counts
// toward the lifetime perfectClears total. Returns the same record when
// nothing at all changes — the level was already done, this clear didn't
// beat its best, it wasn't perfect, and there was no streak to break —
// so a replay that improves nothing never fires a save.
export function markDone(progress: Progress, levelIndex: number, moves: number, perfect: boolean): Progress {
  const alreadyDone = isDone(progress, levelIndex);
  const best = progress.bestMoves[levelIndex];
  const improves = best === undefined || moves < best;
  const perfectStreak = perfect ? progress.perfectStreak + 1 : 0;
  if (alreadyDone && !improves && !perfect && progress.perfectStreak === 0) {
    return progress;
  }
  return {
    ...progress,
    done: alreadyDone ? progress.done : [...progress.done, levelIndex].sort((a, b) => a - b),
    bestMoves: improves ? { ...progress.bestMoves, [levelIndex]: moves } : progress.bestMoves,
    hints: alreadyDone ? progress.hints : progress.hints + 1,
    perfectClears: perfect ? progress.perfectClears + 1 : progress.perfectClears,
    perfectStreak,
    bestPerfectStreak: Math.max(progress.bestPerfectStreak, perfectStreak),
  };
}

// Spends one hint. Floored at 0 rather than going negative, and returns the
// same record once already there — the same "no-op when nothing changes"
// shape as markDone/withLevel, so a press that can't actually spend anything
// never fires a save. hintsUsed only grows here, never floored or reset, so
// it stays a lifetime count rather than mirroring the balance.
export function spendHint(progress: Progress): Progress {
  return progress.hints <= 0
    ? progress
    : { ...progress, hints: progress.hints - 1, hintsUsed: progress.hintsUsed + 1 };
}

// Counts one undo for the stats screen (CANGUPA-145). Called only when
// useBoard's undo actually took back a move — unlike spendHint, there is no
// balance to floor against, so every call here is a real change.
export function recordUndo(progress: Progress): Progress {
  return { ...progress, undosUsed: progress.undosUsed + 1 };
}

// Adds hints bought from the in-app store (CANGUPA-79), uncapped — the same
// no-ceiling balance CANGUPA-124's per-clear reward already keeps growing.
// amount is always one of HINT_PRODUCTS' own counts in practice, but this
// still guards <= 0 the same defensive way spendHint guards running negative,
// so a malformed or duplicate purchase callback can't silently subtract.
export function addHints(progress: Progress, amount: number): Progress {
  return amount <= 0 ? progress : { ...progress, hints: progress.hints + amount };
}

// Adds a session's foregrounded time to the lifetime total (CANGUPA-143),
// the same guarded-positive shape addHints uses above for an amount that
// comes from outside pure game logic — here, useSessionTimer, rather than
// a store purchase.
export function addTimePlayed(progress: Progress, ms: number): Progress {
  return ms <= 0 ? progress : { ...progress, timePlayedMs: progress.timePlayedMs + ms };
}

// Breaks a lifetime ms total into whole hours and the remaining minutes,
// for the stats screen's "Time played" row (CANGUPA-143). Floors rather
// than rounds, so the row never claims a minute that hasn't fully elapsed
// yet.
export function playTimeParts(ms: number): { hours: number; minutes: number } {
  const totalMinutes = Math.floor(ms / 60000);
  return { hours: Math.floor(totalMinutes / 60), minutes: totalMinutes % 60 };
}

// Where the home screen's Play button should go: the first level, in play
// order across every pack, not yet in done — considering every pack rather
// than just `progress.level` (the last level played), which CANGUPA-77 found
// could point at an already-cleared level, or one in a pack the player
// hasn't touched, if they'd jumped ahead to a later pack and back. Falls
// back to the last level once every one of them is done, the same clamp
// `progress.level` itself already gets against LEVELS.length elsewhere.
export function firstUnsolvedLevel(progress: Progress, totalLevels: number): number {
  for (let levelIndex = 0; levelIndex < totalLevels; levelIndex++) {
    if (!isDone(progress, levelIndex)) {
      return levelIndex;
    }
  }
  return totalLevels - 1;
}

export function withLevel(progress: Progress, levelIndex: number): Progress {
  return progress.level === levelIndex ? progress : { ...progress, level: levelIndex };
}

// The sum of every cleared level's best move count, for the stats screen's
// "Jogadas totais" line.
export function totalBestMoves(progress: Progress): number {
  return Object.values(progress.bestMoves).reduce((sum, moves) => sum + moves, 0);
}

export interface PackStats {
  readonly cleared: number;
  readonly total: number;
  readonly moves: number;
}

// Each pack's cleared count and summed best-move total (CANGUPA-141), for
// the stats screen's per-pack breakdown. Needs no new saved field: done and
// bestMoves, walked against packSizes the same way LevelPacksScreen.tsx
// already walks it to find where each pack starts, already carry
// everything this needs.
export function perPackStats(progress: Progress, packSizes: readonly number[]): readonly PackStats[] {
  let start = 0;
  return packSizes.map((size) => {
    const levelIndices = Array.from({ length: size }, (_, i) => start + i);
    start += size;
    const cleared = levelIndices.filter((levelIndex) => isDone(progress, levelIndex)).length;
    const moves = levelIndices.reduce((sum, levelIndex) => sum + (progress.bestMoves[levelIndex] ?? 0), 0);
    return { cleared, total: size, moves };
  });
}

// Shared by hints/hintsUsed/undosUsed, each a plain non-negative integer
// counter with its own fallback for a missing or corrupt value.
function nonNegativeIntegerOr(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 ? value : fallback;
}

function uniqueLevelIndices(items: readonly unknown[]): number[] {
  const indices = items.filter(
    (item): item is number => typeof item === 'number' && Number.isInteger(item) && item >= 0,
  );
  return [...new Set(indices)].sort((a, b) => a - b);
}

// Keeps only entries keyed by a non-negative integer level index with a
// positive integer move count — the same defensiveness uniqueLevelIndices
// gives `done`, so a corrupt or hand-edited record can't produce a negative
// or fractional "best".
function sanitizeBestMoves(value: unknown): Record<number, number> {
  if (typeof value !== 'object' || value === null) {
    return {};
  }
  const best: Record<number, number> = {};
  for (const [key, moves] of Object.entries(value as Record<string, unknown>)) {
    const levelIndex = Number(key);
    if (
      Number.isInteger(levelIndex) &&
      levelIndex >= 0 &&
      typeof moves === 'number' &&
      Number.isInteger(moves) &&
      moves > 0
    ) {
      best[levelIndex] = moves;
    }
  }
  return best;
}

// Reads a saved record. Anything that is not a JSON object is treated as no
// progress, and each field falls back on its own when it is missing or the
// wrong type, so a corrupt value can never stop the app from opening.
export function parseProgress(raw: string | null): Progress {
  if (raw === null) {
    return NO_PROGRESS;
  }
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== 'object' || value === null) {
      return NO_PROGRESS;
    }
    const record = value as Record<string, unknown>;
    const done = Array.isArray(record.done) ? uniqueLevelIndices(record.done) : [];
    const level =
      typeof record.level === 'number' && Number.isInteger(record.level) && record.level >= 0 ? record.level : 0;
    const bestMoves = sanitizeBestMoves(record.bestMoves);
    const hints = nonNegativeIntegerOr(record.hints, STARTING_HINTS);
    // A save from before CANGUPA-142/CANGUPA-145 has neither field at all —
    // treated as zero spent, the same "nothing banked yet" fallback bestMoves
    // got when it was added, not a breaking change to the saved shape.
    const hintsUsed = nonNegativeIntegerOr(record.hintsUsed, 0);
    const undosUsed = nonNegativeIntegerOr(record.undosUsed, 0);
    // A save from before CANGUPA-90 has none of these either — same "nothing
    // banked yet" fallback, so a save written before achievements existed
    // starts every achievement that depends on them from zero rather than
    // failing to load.
    const perfectClears = nonNegativeIntegerOr(record.perfectClears, 0);
    const perfectStreak = nonNegativeIntegerOr(record.perfectStreak, 0);
    const bestPerfectStreak = nonNegativeIntegerOr(record.bestPerfectStreak, 0);
    // A save from before CANGUPA-143 has none either — same "nothing banked
    // yet" fallback as hintsUsed/undosUsed above.
    const timePlayedMs = nonNegativeIntegerOr(record.timePlayedMs, 0);
    return {
      done,
      level,
      bestMoves,
      hints,
      hintsUsed,
      undosUsed,
      perfectClears,
      perfectStreak,
      bestPerfectStreak,
      timePlayedMs,
    };
  } catch {
    return NO_PROGRESS;
  }
}

export async function loadProgress(storage: Storage): Promise<Progress> {
  return parseProgress(await storage.getItem(PROGRESS_KEY));
}

export async function saveProgress(storage: Storage, progress: Progress): Promise<void> {
  await storage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}
