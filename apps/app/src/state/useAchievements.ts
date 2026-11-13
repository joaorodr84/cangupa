import { useEffect, useRef, useState } from 'react';

import {
  type AchievementRecord,
  earnedAchievementIds,
  loadAchievementRecord,
  NO_ACHIEVEMENTS,
  saveAchievementRecord,
  withEarned,
} from './achievements';
import { type Progress } from './progress';
import { deviceStorage } from './deviceStorage';
import { type Storage } from './storage';

// The saved achievement record (CANGUPA-90, ported from DigiSpin's own
// useAchievements.ts), brought up to date with the current progress
// whenever it changes, and saved if anything new is earned. `achievements`
// is null until the saved record has been read, the same shape
// useProgress's own `progress` already has.
export function useAchievements(progress: Progress | null, totalLevels: number, storage: Storage = deviceStorage) {
  const [record, setRecord] = useState<AchievementRecord | null>(null);
  const latest = useRef<AchievementRecord | null>(null);
  // Set once the initial read succeeds, as useProgress's readOk: a rejected
  // read falls back to NO_ACHIEVEMENTS below so the app still opens, but an
  // achievement earned on top of that fallback must not be saved over the
  // real record.
  const readOk = useRef(false);

  useEffect(() => {
    let cancelled = false;
    loadAchievementRecord(storage)
      .then((loaded) => {
        if (!cancelled) {
          readOk.current = true;
          latest.current = loaded;
          setRecord(loaded);
        }
      })
      .catch(() => {
        if (!cancelled) {
          latest.current = NO_ACHIEVEMENTS;
          setRecord(NO_ACHIEVEMENTS);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [storage]);

  // Brings the record up to date with progress, once both are read.
  useEffect(() => {
    const current = latest.current;
    if (current === null || progress === null) {
      return;
    }
    const next = withEarned(current, earnedAchievementIds(progress, totalLevels));
    if (next === current) {
      return;
    }
    latest.current = next;
    setRecord(next);
    if (readOk.current) {
      saveAchievementRecord(storage, next).catch(() => undefined);
    }
    // `record` isn't read directly in this body (`latest.current` is used
    // instead so a stale closure can't race a concurrent update), but it
    // has to stay a dependency: it's what re-runs this effect once the
    // record's own async load resolves and sets `latest.current` for the
    // first time, the same reason DigiSpin's own useAchievements.ts keeps
    // it in its effect's dependency list.
  }, [progress, totalLevels, storage, record]);

  return record;
}
