import { en } from './en';
import { pt } from './pt';
import { type Strings } from './types';
import { type Locale } from '../locale';

export const STRINGS: Readonly<Record<Locale, Strings>> = { en, pt };

export { type Strings } from './types';
