// Ported from apps/web-classic/js/config.js's `Progress`: which levels have
// been cleared, and the level to resume.
import { type Storage } from './storage';

export interface Progress {
  // Indices (0-based) of cleared levels.
  readonly done: readonly number[];
  // The level to resume into.
  readonly level: number;
}

export const NO_PROGRESS: Progress = { done: [], level: 0 };

export const PROGRESS_KEY = 'cangupa.progress';

export function isDone(progress: Progress, levelIndex: number): boolean {
  return progress.done.includes(levelIndex);
}

// A level is open once the one before it is cleared (apps/web-classic/js/ui.js's
// renderLevels), or it is the first level, or it is already done itself.
export function isUnlocked(progress: Progress, levelIndex: number): boolean {
  return levelIndex === 0 || isDone(progress, levelIndex - 1) || isDone(progress, levelIndex);
}

// Marks a level cleared. Returns the same record when it already was, so an
// unchanged save never fires for a level cleared twice (e.g. replayed).
export function markDone(progress: Progress, levelIndex: number): Progress {
  if (isDone(progress, levelIndex)) {
    return progress;
  }
  return { ...progress, done: [...progress.done, levelIndex].sort((a, b) => a - b) };
}

export function withLevel(progress: Progress, levelIndex: number): Progress {
  return progress.level === levelIndex ? progress : { ...progress, level: levelIndex };
}

function uniqueLevelIndices(items: readonly unknown[]): number[] {
  const indices = items.filter(
    (item): item is number => typeof item === 'number' && Number.isInteger(item) && item >= 0,
  );
  return [...new Set(indices)].sort((a, b) => a - b);
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
    return { done, level };
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
