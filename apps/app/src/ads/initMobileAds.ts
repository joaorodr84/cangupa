import mobileAds from 'react-native-google-mobile-ads';

// Called once at launch (App.tsx), same as react-native-google-mobile-ads'
// own docs recommend — useRewardedHint's own ad request only needs this to
// have settled before `show()`, not before `load()`, so a slow or failed
// initialize (no native build, no network) never blocks the rest of the app
// from opening. See initMobileAds.web.ts for why App.tsx itself never
// imports react-native-google-mobile-ads directly.
export function initMobileAds() {
  mobileAds()
    .initialize()
    .catch(() => undefined);
}
