import { useContext } from 'react';

import { LanguageContext } from './LanguageContext';
import { type DeviceLocale, resolveLocale } from './locale';

// What the device reports as its locale. No native module
// (expo-localization) needed: Hermes' Intl carries the device's real
// language tag, and that is all `resolveLocale` reads.
function deviceLocale(): DeviceLocale {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale;
  } catch {
    return null;
  }
}

// The locale actually shown, for the player's setting and the device's own,
// re-read on every render.
export function useLocale() {
  return resolveLocale(useContext(LanguageContext), deviceLocale());
}
