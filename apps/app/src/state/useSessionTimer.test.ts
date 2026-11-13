import { renderHook } from '@testing-library/react-native';
import { AppState } from 'react-native';

import { createSessionTimer, useSessionTimer } from './useSessionTimer';

describe('createSessionTimer', () => {
  let now = 0;
  const clock = () => now;

  beforeEach(() => {
    now = 1_000_000;
  });

  test('reports the elapsed time once the app leaves the foreground', () => {
    const onElapsed = jest.fn();
    const timer = createSessionTimer(onElapsed, clock);

    now += 5000;
    timer.handleAppStateChange('background');

    expect(onElapsed).toHaveBeenCalledWith(5000);
  });

  test('starts a fresh session once the app returns to the foreground, not counting the backgrounded gap', () => {
    const onElapsed = jest.fn();
    const timer = createSessionTimer(onElapsed, clock);

    now += 5000;
    timer.handleAppStateChange('background');
    onElapsed.mockClear();

    now += 60_000; // time spent backgrounded — must not be counted
    timer.handleAppStateChange('active');
    now += 3000;
    timer.handleAppStateChange('background');

    expect(onElapsed).toHaveBeenCalledTimes(1);
    expect(onElapsed).toHaveBeenCalledWith(3000);
  });

  test('flush reports the current session directly, the same way unmounting does', () => {
    const onElapsed = jest.fn();
    const timer = createSessionTimer(onElapsed, clock);

    now += 2000;
    timer.flush();

    expect(onElapsed).toHaveBeenCalledWith(2000);
  });

  test('never double-reports the same session on two consecutive background events', () => {
    const onElapsed = jest.fn();
    const timer = createSessionTimer(onElapsed, clock);

    now += 5000;
    timer.handleAppStateChange('background');
    timer.handleAppStateChange('background');

    expect(onElapsed).toHaveBeenCalledTimes(1);
  });

  test('reports nothing when no time has actually elapsed', () => {
    const onElapsed = jest.fn();
    const timer = createSessionTimer(onElapsed, clock);

    timer.handleAppStateChange('background');

    expect(onElapsed).not.toHaveBeenCalled();
  });

  test('a session starts the moment the timer is created, not at the first change event', () => {
    const onElapsed = jest.fn();
    createSessionTimer(onElapsed, clock);

    now += 1000;
    // No app-state change needed — the fixture above already covers that
    // this constructor-time start is what later gets measured.
    expect(onElapsed).not.toHaveBeenCalled();
  });
});

// A single lightweight mount, just for the wiring: that the hook registers
// a 'change' listener and flushes through to onElapsed on unmount. The
// actual accumulate/reset logic is createSessionTimer's own, covered above
// without any React rendering involved.
test('useSessionTimer registers an AppState listener and flushes its session on unmount', async () => {
  const addEventListener = jest.spyOn(AppState, 'addEventListener');
  const onElapsed = jest.fn();
  let now = 1_000_000;

  const { unmount } = await renderHook(() => useSessionTimer(onElapsed, () => now));

  expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function));

  now += 4000;
  await unmount();

  expect(onElapsed).toHaveBeenCalledWith(4000);

  addEventListener.mockRestore();
});
