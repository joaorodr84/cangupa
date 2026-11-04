import { Game } from './board';
import { orientLevel } from './orient';

const wide = ['S1.1', '.11.', '11..']; // 4 wide, 3 tall

test('leaves a level alone when its shape already matches the screen', () => {
  expect(orientLevel(wide, true)).toBe(wide);
  const tall = ['S1.', '11.', '.11', '1..'];
  expect(orientLevel(tall, false)).toBe(tall);
});

test('turns a wide level tall on a portrait screen', () => {
  expect(orientLevel(wide, false)).toEqual(['S.1', '111', '.1.', '1..']);
});

test('turns a tall level wide on a landscape screen', () => {
  expect(orientLevel(['S.1', '111', '.1.', '1..'], true)).toEqual(wide);
});

test('never turns a square level', () => {
  const square = ['S1.', '.11', '..1'];
  expect(orientLevel(square, true)).toBe(square);
  expect(orientLevel(square, false)).toBe(square);
});

test('keeps the start tile and the tile counts', () => {
  const turned = orientLevel(['S2.1', '.11.', '11..'], false);
  expect(turned.join('').split('').sort()).toEqual(['S2.1', '.11.', '11..'].join('').split('').sort());
  expect(turned.join('')).toContain('S');
});

test('the turned level has a solution whenever the original does', () => {
  const original = ['S1.1', '.11.', '11..'];
  for (const landscape of [true, false]) {
    const turned = orientLevel(original, landscape);
    const game = new Game(turned);
    const path = game.solve();
    expect(Boolean(path)).toBe(Boolean(new Game(original).solve()));
  }
});

test('pads a ragged row instead of dropping a cell', () => {
  expect(orientLevel(['S1.1', '1'], false)).toEqual(['S1', '1.', '..', '1.']);
});
