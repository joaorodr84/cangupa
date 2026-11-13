// react-native-google-mobile-ads ships no web implementation at all (no
// .web.ts entry, no browser field) — importing it crashes immediately on
// require(), the same TurboModuleRegistry failure CANGUPA-78 hit on an
// unbuilt native binary. Metro resolves this file instead of
// useRewardedHint.ts for web builds, so that import never happens there;
// ads simply never load, the same "never connects" fallback useHintStore.ts
// gets for free from react-native-iap's own web tolerance.
import type { RewardedHintStatus } from './useRewardedHint';

export function useRewardedHint(_onEarned: (hints: number) => void) {
  const status: RewardedHintStatus = { kind: 'idle' };
  return { loaded: false, status, watch: () => undefined };
}
