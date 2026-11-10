import { useCallback, useEffect, useRef, useState } from 'react';

import { deviceStorage } from './deviceStorage';
import { loadProgress, markDone, NO_PROGRESS, type Progress, saveProgress, spendHint, withLevel } from './progress';
import { type Storage } from './storage';

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
        saveProgress(storage, next).catch(() => undefined);
      }
    },
    [storage],
  );

  const recordDone = useCallback(
    (levelIndex: number, moves: number) => persist(markDone(latest.current, levelIndex, moves)),
    [persist],
  );
  const recordLevel = useCallback((levelIndex: number) => persist(withLevel(latest.current, levelIndex)), [persist]);
  const recordHintUsed = useCallback(() => persist(spendHint(latest.current)), [persist]);
  const clearProgress = useCallback(() => persist(NO_PROGRESS), [persist]);

  return { progress, recordDone, recordLevel, recordHintUsed, clearProgress };
}
