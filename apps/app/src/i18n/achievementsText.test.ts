// The achievement titles and descriptions live in the strings tables, one
// entry per src/state/achievements.ts's ACHIEVEMENTS array, in the same
// order (CANGUPA-90) — mirrors game/packText.test.ts's own check that en/pt
// stay in step with packs.ts.
import { en } from './strings/en';
import { pt } from './strings/pt';
import { ACHIEVEMENTS } from '../state/achievements';

describe('achievement text', () => {
  it.each([
    ['English', en],
    ['Portuguese', pt],
  ])('%s has a title and a description for every achievement', (_label, strings) => {
    expect(strings.achievements.heading.trim()).not.toBe('');
    expect(strings.achievements.items).toHaveLength(ACHIEVEMENTS.length);
    strings.achievements.items.forEach((item) => {
      expect(item.title.trim()).not.toBe('');
      expect(item.description.trim()).not.toBe('');
    });
  });
});
