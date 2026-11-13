import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

// The pure clock-and-accumulate logic behind useSessionTimer (CANGUPA-143),
// factored out of the hook so it can be unit-tested directly — as plain
// state-machine logic, not through React's render/effect machinery, which
// multiple renderHook mounts in one spec file turned out not to play well
// with (effects from an earlier test's unmount intermittently failed to
// flush before the next test's mount, dropping that mount's own listener
// registration). `now` defaults to Date.now, overridable for a test's own
// controlled clock.
export function createSessionTimer(onElapsed: (ms: number) => void, now: () => number = Date.now) {
  let activeSince: number | null = now();

  function flush(): void {
    if (activeSince === null) {
      return;
    }
    const elapsed = now() - activeSince;
    activeSince = null;
    if (elapsed > 0) {
      onElapsed(elapsed);
    }
  }

  function handleAppStateChange(status: AppStateStatus): void {
    if (status === 'active') {
      activeSince = now();
    } else {
      flush();
    }
  }

  return { handleAppStateChange, flush };
}

// Accumulates wall-clock time spent with the app foregrounded (CANGUPA-143),
// reporting each session's length via onElapsed once it ends — on
// backgrounding, not polled continuously, since this stat doesn't need
// finer resolution than that. The component mounting is treated as the
// start of an active session outright, rather than first checking
// AppState.currentState: by the time anything using this hook can render at
// all, the app is already in the foreground in every real case that
// matters here. A session cut short by the app being killed outright (not
// backgrounded first) loses that last stretch — the same best-effort
// tradeoff CANGUPA-139 already accepted for save writes, not worth a more
// elaborate scheme for a stat nobody is relying on to the second.
export function useSessionTimer(onElapsed: (ms: number) => void, now: () => number = Date.now): void {
  const onElapsedRef = useRef(onElapsed);
  onElapsedRef.current = onElapsed;

  useEffect(() => {
    const timer = createSessionTimer((ms) => onElapsedRef.current(ms), now);
    const subscription = AppState.addEventListener('change', timer.handleAppStateChange);

    return () => {
      timer.flush();
      subscription.remove();
    };
  }, [now]);
}
