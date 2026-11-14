import { CORRUPT_RECORDS, memoryStorage } from './storage.testUtil';
import { DEFAULT_SETTINGS, loadSettings, parseSettings, saveSettings, SETTINGS_KEY } from './settings';

const THEME_MODES = ['system', 'light', 'dark'] as const;

describe('parseSettings', () => {
  it('uses the defaults when nothing is saved', () => {
    expect(parseSettings(null)).toEqual(DEFAULT_SETTINGS);
  });

  it.each(THEME_MODES)('reads a saved %s theme mode', (themeMode) => {
    expect(parseSettings(`{"themeMode":"${themeMode}"}`)).toEqual({ ...DEFAULT_SETTINGS, themeMode });
  });

  it('falls back to the default theme mode for one it does not know, e.g. a later mode this build predates', () => {
    expect(parseSettings('{"themeMode":"retro"}')).toEqual(DEFAULT_SETTINGS);
  });

  // CANGUPA-40 replaced the five decorative skins with themeMode. A record
  // saved before that change has `theme`, not `themeMode`, so it falls into
  // the same missing-field case as any other upgrade and resolves to the new
  // default ('system') rather than needing an explicit migration.
  it('falls back to the default theme mode for a pre-CANGUPA-40 record, which has `theme` instead', () => {
    expect(parseSettings('{"theme":"ice"}')).toEqual(DEFAULT_SETTINGS);
  });

  it.each(['hints', 'anim', 'sound'] as const)('reads a saved %s toggle', (key) => {
    expect(parseSettings(`{"${key}":false}`)[key]).toBe(false);
  });

  // `fall` and `directionalPad` default to false (unlike the other toggles,
  // which default true), so reading either back has to check `true` to
  // actually prove a saved value was read rather than just the default
  // coming through unchanged.
  it.each(['fall', 'directionalPad'] as const)('reads a saved %s toggle', (key) => {
    expect(parseSettings(`{"${key}":true}`)[key]).toBe(true);
  });

  it.each(['hints', 'anim', 'sound', 'fall', 'directionalPad'] as const)(
    'keeps the default %s when it was not saved as a boolean',
    (key) => {
      expect(parseSettings(`{"${key}":"false"}`)[key]).toBe(DEFAULT_SETTINGS[key]);
    },
  );

  it('ignores fields it does not know, so a record from a later version still reads', () => {
    expect(parseSettings('{"themeMode":"light","turbo":true}')).toEqual({ ...DEFAULT_SETTINGS, themeMode: 'light' });
  });

  it.each(CORRUPT_RECORDS)('reads %s as the defaults', (_name, raw) => {
    expect(parseSettings(raw)).toEqual(DEFAULT_SETTINGS);
  });

  it.each(['en', 'pt', 'system'] as const)('reads a saved %s language', (language) => {
    expect(parseSettings(`{"language":"${language}"}`).language).toBe(language);
  });

  it('falls back to the default language for one it does not know, e.g. a later locale this build predates', () => {
    expect(parseSettings('{"language":"fr"}')).toEqual(DEFAULT_SETTINGS);
  });
});

describe('saving and loading', () => {
  it('round-trips every setting through the store', async () => {
    const storage = memoryStorage();
    const settings = {
      themeMode: 'dark' as const,
      hints: false,
      anim: false,
      sound: false,
      fall: true,
      directionalPad: true,
      language: 'pt' as const,
    };

    await saveSettings(storage, settings);

    expect(await loadSettings(storage)).toEqual(settings);
  });

  it('writes under the expected key', async () => {
    const storage = memoryStorage();

    await saveSettings(storage, DEFAULT_SETTINGS);

    expect(await storage.getItem(SETTINGS_KEY)).toBe(
      '{"themeMode":"system","hints":true,"anim":true,"sound":true,"fall":false,"directionalPad":false,"language":"system"}',
    );
  });

  it('starts from the defaults when nothing was saved', async () => {
    expect(await loadSettings(memoryStorage())).toEqual(DEFAULT_SETTINGS);
  });

  it.each(THEME_MODES)('keeps the %s theme mode', async (themeMode) => {
    const storage = memoryStorage();
    await saveSettings(storage, { ...DEFAULT_SETTINGS, themeMode });

    expect((await loadSettings(storage)).themeMode).toBe(themeMode);
  });
});
