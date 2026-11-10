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
  // Hints left to spend (CANGUPA-54). Replenishment beyond the starting
  // balance is out of this field's scope — see CANGUPA-124 (apps/app) and
  // CANGUPA-125 (apps/web-classic).
  readonly hints: number;
}

export const NO_PROGRESS: Progress = { done: [], level: 0, bestMoves: {}, hints: STARTING_HINTS };

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
// moves it's ever been cleared in. Returns the same record when neither
// changes anything — the level was already done and this clear didn't beat
// its best — so a replay that doesn't improve on the record never fires a
// save.
export function markDone(progress: Progress, levelIndex: number, moves: number): Progress {
  const alreadyDone = isDone(progress, levelIndex);
  const best = progress.bestMoves[levelIndex];
  const improves = best === undefined || moves < best;
  if (alreadyDone && !improves) {
    return progress;
  }
  return {
    ...progress,
    done: alreadyDone ? progress.done : [...progress.done, levelIndex].sort((a, b) => a - b),
    bestMoves: improves ? { ...progress.bestMoves, [levelIndex]: moves } : progress.bestMoves,
  };
}

// Spends one hint. Floored at 0 rather than going negative, and returns the
// same record once already there — the same "no-op when nothing changes"
// shape as markDone/withLevel, so a press that can't actually spend anything
// never fires a save.
export function spendHint(progress: Progress): Progress {
  return progress.hints <= 0 ? progress : { ...progress, hints: progress.hints - 1 };
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
    const hints =
      typeof record.hints === 'number' && Number.isInteger(record.hints) && record.hints >= 0
        ? record.hints
        : STARTING_HINTS;
    return { done, level, bestMoves, hints };
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
