// The pack names and blurbs live in the strings tables, one entry per pack in play
// order. These keep them in step with src/game/packs.ts (CANGUPA-56).
import { en } from '../i18n/strings/en';
import { pt } from '../i18n/strings/pt';
import { PACKS } from './packs';

describe('pack text', () => {
  it.each([
    ['English', en],
    ['Portuguese', pt],
  ])('%s has a name and a blurb for every pack', (_label, strings) => {
    expect(strings.packs).toHaveLength(PACKS.length);
    strings.packs.forEach((pack) => {
      expect(pack.name.trim()).not.toBe('');
      expect(pack.blurb.trim()).not.toBe('');
    });
  });

  it("English matches the names and blurbs packs.ts was generated with", () => {
    expect(en.packs.map((p) => p.name)).toEqual(PACKS.map((p) => p.name));
    expect(en.packs.map((p) => p.blurb)).toEqual(PACKS.map((p) => p.blurb));
  });
});
