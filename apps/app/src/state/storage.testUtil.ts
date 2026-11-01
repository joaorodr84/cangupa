import { type Storage } from './storage';

// An in-memory stand-in for AsyncStorage: the same two calls, no device.
export function memoryStorage(initial: Record<string, string> = {}): Storage & {
  readonly values: Map<string, string>;
} {
  const values = new Map(Object.entries(initial));
  return {
    values,
    getItem: async (key) => values.get(key) ?? null,
    setItem: async (key, value) => {
      values.set(key, value);
    },
  };
}

// Saved values that are not a record of any kind: each is one way a value on
// the device could be damaged (a write cut off half-way, a hand edit, another
// app's data under our key, a future format). Every parser must read each of
// them as "nothing saved", so a damaged value can never stop the app opening.
export const CORRUPT_RECORDS: readonly (readonly [string, string])[] = [
  ['an empty string', ''],
  ['whitespace', '   '],
  ['the JSON null', 'null'],
  ['a number', '42'],
  ['a string', '"hello"'],
  ['true', 'true'],
  ['an array', '[]'],
  ['a write cut off half-way', '{"theme":"cosmos"'],
  ['trailing garbage after a record', '{"theme":"cosmos"} x'],
  ['single-quoted keys', "{'theme':'cosmos'}"],
  ['an unquoted key', '{theme:"cosmos"}'],
  ['not JSON at all', 'not json'],
];
