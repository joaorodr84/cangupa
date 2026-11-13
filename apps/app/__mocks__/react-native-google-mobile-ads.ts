// react-native-google-mobile-ads needs a native build (no Expo Go support —
// see useRewardedHint.ts's own comment), so Jest can never load its real
// native module. This manual mock (Jest's own convention: a file here,
// adjacent to node_modules, is used automatically for every test, no
// jest.mock() call needed) stands in with an always-unloaded, inert hook so
// every test that merely imports something importing this package (most of
// App.test.tsx's tree) doesn't crash — the same role
// __mocks__/react-native-iap.ts already plays for the purchase side of the
// same popup. Tests that exercise the reward-video hook itself override this
// per-file with their own jest.mock('react-native-google-mobile-ads').
export function useRewardedAd() {
  return {
    isLoaded: false,
    isOpened: false,
    isClicked: false,
    isClosed: false,
    isShowing: false,
    isEarnedReward: false,
    error: undefined,
    reward: undefined,
    revenue: undefined,
    load: () => undefined,
    show: () => undefined,
  };
}

export const TestIds = {
  REWARDED: 'test-rewarded-ad-unit-id',
};

export default function mobileAds() {
  return {
    initialize: async () => [],
  };
}
