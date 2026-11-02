import { fitBoardWidth } from './boardLayout';

test('uses the full width when the height available is generous (portrait)', () => {
  expect(fitBoardWidth(5, 4, 300, 1000)).toBe(300);
});

test('shrinks to fit the height when it is the tighter constraint (landscape)', () => {
  // A 5x4 board 128px tall fits in 160px of width (128 * 5/4).
  expect(fitBoardWidth(5, 4, 300, 128)).toBe(160);
});

test('a square board is capped by whichever side is smaller', () => {
  expect(fitBoardWidth(3, 3, 150, 90)).toBe(90);
});

test('never returns a negative width for a height of zero', () => {
  expect(fitBoardWidth(5, 4, 300, 0)).toBe(0);
});
