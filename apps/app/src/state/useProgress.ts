import { useCallback, useEffect, useRef, useState } from 'react';

import { deviceStorage } from './deviceStorage';
import {
  addHints,
  addTimePlayed,
  loadProgress,
  markDone,
  NO_PROGRESS,
  type Progress,
  recordUndo,
  saveProgress,
  spendHint,
  withLevel,
} from './progress';
import { type Storage } from './storage';
import { createWriteQueue } from './writeQueue';

// The saved progress, loaded once and saved on each change. `progress` is
// null until the saved record has been read, so the app never resumes into
// level 0 for a player who was actually further along.
export function useProgress(storage: Storage = deviceStorage) {
  const [progress, setProgress] = useState<Progress | null>(null);
  const latest = useRef<Progress>(NO_PROGRESS);
  // Set once the initial read succeeds. A rejected read leaves `latest` at
  // NO_PROGRESS so the app still opens, but a change made on top of that
  // fallback must not be saved over whatever was actually on disk.
  const readOk = useRef(false);
  // Lazily created once and kept for the component's lifetime (CANGUPA-139)
  // — every save goes through this one queue, so two rapid changes can
  // never have their writes land out of order.
  const enqueueWrite = useRef<ReturnType<typeof createWriteQueue> | null>(null);
  if (enqueueWrite.current === null) {
    enqueueWrite.current = createWriteQueue();
  }

  useEffect(() => {
    let cancelled = false;
    loadProgress(storage)
      .then((loaded) => {
        if (!cancelled) {
          readOk.current = true;
          latest.current = loaded;
          setProgress(loaded);
        }
      })
      .catch(() => {
        if (!cancelled) {
          latest.current = NO_PROGRESS;
          setProgress(NO_PROGRESS);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [storage]);

  const persist = useCallback(
    (next: Progress) => {
      latest.current = next;
      setProgress(next);
      // A failed save keeps the change for this session, as the web
      // version's try/catch around localStorage does.
      if (readOk.current) {
        enqueueWrite.current?.(() => saveProgress(storage, next));
      }
    },
    [storage],
  );

  const recordDone = useCallback(
    (levelIndex: number, moves: number, perfect: boolean) =>
      persist(markDone(latest.current, levelIndex, moves, perfect)),
    [persist],
  );
  const recordLevel = useCallback((levelIndex: number) => persist(withLevel(latest.current, levelIndex)), [persist]);
  const recordHintUsed = useCallback(() => persist(spendHint(latest.current)), [persist]);
  const recordUndoUsed = useCallback(() => persist(recordUndo(latest.current)), [persist]);
  const recordHintsPurchased = useCallback(
    (amount: number) => persist(addHints(latest.current, amount)),
    [persist],
  );
  const recordTimePlayed = useCallback((ms: number) => persist(addTimePlayed(latest.current, ms)), [persist]);
  const clearProgress = useCallback(() => persist(NO_PROGRESS), [persist]);

  return {
    progress,
    recordDone,
    recordLevel,
    recordHintUsed,
    recordUndoUsed,
    recordHintsPurchased,
    recordTimePlayed,
    clearProgress,
  };
}
