// The pack names and blurbs live in the strings tables, one entry per pack in play
// order. These keep them in step with src/game/packs.ts (CANGUPA-56), and `collections`
// (CANGUPA-162) with packs.ts's own COLLECTIONS the same way.
import { en } from '../i18n/strings/en';
import { pt } from '../i18n/strings/pt';
import { COLLECTIONS, PACKS } from './packs';

describe('pack text', () => {
  it.each([
    ['English', en],
    ['Portuguese', pt],
  ])('%s has a name for every collection and a name and a blurb for every pack', (_label, strings) => {
    expect(strings.collections).toHaveLength(COLLECTIONS.length);
    strings.collections.forEach((name) => expect(name.trim()).not.toBe(''));
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
