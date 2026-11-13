// Wraps react-native-google-mobile-ads' useRewardedAd hook down to exactly
// what HintStorePopup needs to offer "watch an ad, earn a hint" (CANGUPA-78,
// building on CANGUPA-54's hint balance) — a loaded flag, a status the popup
// can render inline, and a watch() call — the same shape useHintStore.ts
// already gives the popup for its purchase rows, so the popup treats both
// reward paths alike. Like react-native-iap, this SDK has no Expo Go
// support — it needs a native build (EAS dev client or a store build, per
// eas.json's developmentClient profile) — so `isLoaded` simply never turns
// true there, same "never connects" fallback useHintStore.ts's own comment
// describes for the purchase side.
import { useCallback, useEffect, useState } from 'react';
import { TestIds, useRewardedAd } from 'react-native-google-mobile-ads';

// Google's own test ad unit id, resolved per-platform by the SDK itself —
// always safe to ship. CANGUPA-78 has no real AdMob account yet (see
// TASKS.md's own follow-up for it), so this is the one line to change for a
// real rewarded ad unit id once one exists, the same seam hintProducts.ts's
// skus mark for IAP's App Store Connect/Play Console side.
export const REWARDED_HINT_AD_UNIT_ID = TestIds.REWARDED;

export type RewardedHintStatus =
  | { readonly kind: 'idle' }
  | { readonly kind: 'pending' }
  | { readonly kind: 'error'; readonly message: string };

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

// onEarned is called with exactly 1 — the same addHints(progress, amount)
// path CANGUPA-79's purchases already use (via HintStorePopup's own
// onPurchased), so a reward video is just another amount of 1 rather than a
// progress.ts function of its own.
export function useRewardedHint(onEarned: (hints: number) => void) {
  const [status, setStatus] = useState<RewardedHintStatus>({ kind: 'idle' });
  const { isLoaded, isEarnedReward, isClosed, error, load, show } = useRewardedAd(REWARDED_HINT_AD_UNIT_ID, {
    // Sidesteps App Tracking Transparency and personalized-ads consent
    // entirely — CANGUPA-78's own note left "app-store review requirements"
    // undecided, and a non-personalized request is the one choice here that
    // doesn't open that question. Full EEA/UK consent (Google's UMP, for
    // personalized ads later) is its own follow-up, not this task's.
    requestNonPersonalizedAdsOnly: true,
  });

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (isEarnedReward) {
      onEarned(1);
    }
  }, [isEarnedReward, onEarned]);

  // A closed ad (watched fully or dismissed early) has nothing left to show
  // — load the next one and drop back to idle either way; isEarnedReward
  // above already credited the hint if the player watched it through.
  useEffect(() => {
    if (isClosed) {
      setStatus({ kind: 'idle' });
      load();
    }
  }, [isClosed, load]);

  useEffect(() => {
    if (error) {
      setStatus({ kind: 'error', message: messageOf(error) });
    }
  }, [error]);

  // Guards the same way spendHint/addHints do against a press that can't
  // actually do anything — the button is already disabled while !isLoaded,
  // this is just the same no-op belt-and-suspenders.
  const watch = useCallback(() => {
    if (!isLoaded) return;
    setStatus({ kind: 'pending' });
    show();
  }, [isLoaded, show]);

  return { loaded: isLoaded, status, watch };
}
