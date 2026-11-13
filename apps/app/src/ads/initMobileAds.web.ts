// react-native-google-mobile-ads ships no web implementation (see
// useRewardedHint.web.ts) — one of its spec files statically imports
// react-native's codegenNativeComponent, a native-only utility, so Metro
// fails to even bundle the package for web, not just to run it. A runtime
// Platform.OS check inside App.tsx isn't enough to dodge this: Metro
// resolves every require() it can see regardless of what guards it at
// runtime. Only keeping the import out of this file (Metro's own .web.ts
// resolution) keeps it out of the web bundle's module graph entirely.
export function initMobileAds() {
  // no-op
}
