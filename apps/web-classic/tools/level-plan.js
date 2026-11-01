// The difficulty curve: one row per level, in order. Edit this to reshape the game.
//
//   width, height   size of the grid the walk happens in
//   steps           how many landings the solution makes (the start tile counts as one);
//                   this is the total number of visits, so it is the main difficulty knob
//   doubles         most tiles that may need two visits
//   jump            chance (0..1) that a move of the walk is a two-tile jump
//   attempts        random candidates tried; the one with the fewest solutions wins
//
// Changing a row changes that level when it is regenerated. Levels already in
// js/levels.js are kept unless you pass --regenerate.
const rows = [
  // width, height, steps, doubles, jump
  [3, 3, 6, 0, 0], [4, 3, 7, 0, 0], [4, 4, 9, 0, .2], [4, 4, 10, 0, .3], [5, 4, 11, 0, .3],
  [5, 4, 12, 1, .3], [5, 5, 13, 1, .3], [5, 5, 14, 2, .3], [6, 5, 15, 2, .3], [6, 5, 16, 2, .3],
  [6, 6, 17, 3, .3], [6, 6, 18, 3, .3], [7, 6, 19, 3, .3], [7, 6, 20, 4, .3], [7, 7, 21, 4, .3],
  [7, 7, 22, 4, .3], [8, 7, 23, 5, .3], [8, 7, 24, 5, .3], [8, 8, 25, 5, .3], [8, 8, 26, 6, .3],
  [8, 8, 27, 6, .3], [9, 8, 28, 6, .3], [9, 8, 29, 7, .3], [9, 8, 30, 7, .3], [9, 9, 31, 7, .3],
  [9, 9, 32, 7, .3], [9, 9, 33, 8, .3], [9, 9, 34, 8, .3], [10, 9, 35, 8, .3], [10, 9, 36, 8, .3],
  [10, 9, 37, 9, .3], [10, 9, 38, 9, .3], [10, 10, 39, 9, .3], [10, 10, 40, 9, .3], [10, 10, 41, 10, .3],
  [10, 10, 42, 10, .3], [10, 10, 43, 10, .3], [10, 10, 44, 10, .3], [10, 10, 45, 11, .3], [10, 10, 46, 11, .3],
  [10, 10, 47, 11, .3], [10, 10, 48, 12, .3], [10, 10, 49, 12, .3], [10, 10, 50, 12, .3], [10, 10, 52, 13, .3],
  [10, 10, 54, 13, .3], [10, 10, 55, 14, .3], [10, 10, 56, 14, .3], [10, 10, 58, 14, .3], [10, 10, 60, 15, .3],
];

const PLAN = rows.map(([width, height, steps, doubles, jump], i) =>
  ({ width, height, steps, doubles, jump, attempts: i < 20 ? 400 : 150 }));

module.exports = { PLAN };
