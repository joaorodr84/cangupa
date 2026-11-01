import { CORRUPT_RECORDS, memoryStorage } from './storage.testUtil';
import { DEFAULT_SETTINGS, loadSettings, parseSettings, saveSettings, SETTINGS_KEY, THEMES } from './settings';

describe('parseSettings', () => {
  it('uses the defaults when nothing is saved', () => {
    expect(parseSettings(null)).toEqual(DEFAULT_SETTINGS);
  });

  it('reads a saved theme', () => {
    expect(parseSettings('{"theme":"ice"}')).toEqual({ ...DEFAULT_SETTINGS, theme: 'ice' });
  });

  it('falls back to the default theme for one it does not know, e.g. a renamed theme', () => {
    expect(parseSettings('{"theme":"retro"}')).toEqual(DEFAULT_SETTINGS);
  });

  it.each(['jumps', 'hints', 'anim'] as const)('reads a saved %s toggle', (key) => {
    expect(parseSettings(`{"${key}":false}`)[key]).toBe(false);
  });

  it.each(['jumps', 'hints', 'anim'] as const)('keeps the default %s when it was not saved as a boolean', (key) => {
    expect(parseSettings(`{"${key}":"false"}`)[key]).toBe(DEFAULT_SETTINGS[key]);
  });

  it('ignores fields it does not know, so a record from a later version still reads', () => {
    expect(parseSettings('{"theme":"sand","sound":false}')).toEqual({ ...DEFAULT_SETTINGS, theme: 'sand' });
  });

  it.each(CORRUPT_RECORDS)('reads %s as the defaults', (_name, raw) => {
    expect(parseSettings(raw)).toEqual(DEFAULT_SETTINGS);
  });
});

describe('saving and loading', () => {
  it('round-trips every setting through the store', async () => {
    const storage = memoryStorage();
    const settings = { theme: 'space' as const, jumps: false, hints: false, anim: false };

    await saveSettings(storage, settings);

    expect(await loadSettings(storage)).toEqual(settings);
  });

  it('writes under the expected key', async () => {
    const storage = memoryStorage();

    await saveSettings(storage, DEFAULT_SETTINGS);

    expect(await storage.getItem(SETTINGS_KEY)).toBe(
      '{"theme":"cosmos","jumps":true,"hints":true,"anim":true}',
    );
  });

  it('starts from the defaults when nothing was saved', async () => {
    expect(await loadSettings(memoryStorage())).toEqual(DEFAULT_SETTINGS);
  });

  it.each(THEMES)('keeps the %s theme', async (theme) => {
    const storage = memoryStorage();
    await saveSettings(storage, { ...DEFAULT_SETTINGS, theme });

    expect((await loadSettings(storage)).theme).toBe(theme);
  });
});
