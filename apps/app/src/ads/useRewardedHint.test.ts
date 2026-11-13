import { act, renderHook } from '@testing-library/react-native';

import { useRewardedHint } from './useRewardedHint';

type RewardedAdState = {
  isLoaded: boolean;
  isEarnedReward: boolean;
  isClosed: boolean;
  error: Error | undefined;
};

// A single object, rather than separate module-level lets, so jest.mock's
// factory — hoisted above every other statement in this file — can close
// over it: babel-plugin-jest-hoist only allows referencing identifiers
// prefixed `mock` from inside the factory. Mirrors
// useHintStore.test.ts's own mockState shape for the purchase side.
const mockState: RewardedAdState & { load: jest.Mock; show: jest.Mock } = {
  isLoaded: false,
  isEarnedReward: false,
  isClosed: false,
  error: undefined,
  load: jest.fn(),
  show: jest.fn(),
};

jest.mock('react-native-google-mobile-ads', () => ({
  useRewardedAd: () => ({
    isLoaded: mockState.isLoaded,
    isEarnedReward: mockState.isEarnedReward,
    isClosed: mockState.isClosed,
    error: mockState.error,
    load: mockState.load,
    show: mockState.show,
  }),
  TestIds: { REWARDED: 'test-rewarded-ad-unit-id' },
}));

beforeEach(() => {
  mockState.isLoaded = false;
  mockState.isEarnedReward = false;
  mockState.isClosed = false;
  mockState.error = undefined;
  mockState.load.mockClear();
  mockState.show.mockClear();
});

test('loads an ad on mount', async () => {
  await renderHook(() => useRewardedHint(jest.fn()));

  expect(mockState.load).toHaveBeenCalledTimes(1);
});

test('reports loaded once the hook does, and watch shows it while pending', async () => {
  mockState.isLoaded = true;
  const { result, rerender } = await renderHook(() => useRewardedHint(jest.fn()));
  expect(result.current.loaded).toBe(true);

  await act(async () => {
    result.current.watch();
  });
  await rerender(undefined);

  expect(mockState.show).toHaveBeenCalledTimes(1);
  expect(result.current.status).toEqual({ kind: 'pending' });
});

test('watch is a no-op while the ad has not loaded yet', async () => {
  const { result } = await renderHook(() => useRewardedHint(jest.fn()));

  await act(async () => {
    result.current.watch();
  });

  expect(mockState.show).not.toHaveBeenCalled();
});

test('credits exactly one hint once the reward is earned', async () => {
  const onEarned = jest.fn();
  mockState.isEarnedReward = true;
  await renderHook(() => useRewardedHint(onEarned));

  expect(onEarned).toHaveBeenCalledWith(1);
});

test('drops back to idle and loads the next ad once the current one closes', async () => {
  mockState.isLoaded = true;
  const { result, rerender } = await renderHook(() => useRewardedHint(jest.fn()));
  await act(async () => {
    result.current.watch();
  });
  mockState.load.mockClear();

  mockState.isClosed = true;
  await rerender(undefined);

  expect(result.current.status).toEqual({ kind: 'idle' });
  expect(mockState.load).toHaveBeenCalledTimes(1);
});

test('surfaces the SDK error message', async () => {
  mockState.error = new Error('Ad failed to load');
  const { result } = await renderHook(() => useRewardedHint(jest.fn()));

  expect(result.current.status).toEqual({ kind: 'error', message: 'Ad failed to load' });
});
