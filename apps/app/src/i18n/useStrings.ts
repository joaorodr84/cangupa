import { STRINGS, type Strings } from './strings';
import { useLocale } from './useLocale';

// The strings table for the locale actually shown (player's setting plus
// the device's own), re-read on every render.
export function useStrings(): Strings {
  return STRINGS[useLocale()];
}
