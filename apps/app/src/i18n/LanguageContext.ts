import { createContext } from 'react';

import { type LanguageSetting } from './locale';

// The player's language setting ('system' or a pinned Locale). useLocale.ts
// resolves this against the device's own locale into the Locale actually
// shown.
export const LanguageContext = createContext<LanguageSetting>('system');
