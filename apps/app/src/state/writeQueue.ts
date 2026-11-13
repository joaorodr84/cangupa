// A chain of pending saves (CANGUPA-139), shared by useProgress.ts and
// useSettings.ts, which otherwise each fired every write as an independent,
// unawaited AsyncStorage.setItem call. Two rapid changes to the same key
// started two promises concurrently with nothing to enforce which one's
// write actually lands last; AsyncStorage calls on the same key are
// typically processed in call order in practice, but that is not a
// documented guarantee, and a fire-and-forget call has no way to enforce it
// itself if that assumption ever breaks. Routing every write through one of
// these instead guarantees it: each write only starts once every earlier
// one on the same queue has settled, so the save that was requested last is
// also the one that lands last, regardless of how the underlying storage
// schedules its own promises.
export function createWriteQueue(): (write: () => Promise<unknown>) => void {
  // Always resolved, never rejected — every write chained on here catches
  // its own failure below before it's stored back, so the next write is
  // never blocked by (or has to handle) a rejected `pending`.
  let pending: Promise<unknown> = Promise.resolve();
  return (write: () => Promise<unknown>) => {
    // The same best-effort "a failed save doesn't stop the app" tolerance
    // each call already had on its own via its own `.catch(() => undefined)`
    // before this queue existed — just chained, not fired independently.
    pending = pending.then(write).catch(() => undefined);
  };
}
