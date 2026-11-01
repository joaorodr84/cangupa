// node tools/test.js: every level must be solvable, and the rules must behave.
const assert = require('assert');
const { Game } = require('../js/game.js');
const { LEVELS } = require('../js/levels.js');

// rules
let g = new Game(['S1.', '.2.']);
assert.strictEqual(g.remaining(), 3);
assert.deepStrictEqual(g.legalMoves().map(m => [m.x, m.y, m.jump]), [[1, 0, false]]);
g.play(g.legalMoves()[0]);
assert.strictEqual(g.at(0, 0), 0);                 // start tile used up
assert.ok(!g.legalMoves().some(m => m.x === 0));   // cannot go back
g.play({ x: 1, y: 1 });                            // 2-tile: first visit
assert.strictEqual(g.at(1, 1), 1);                 // cracked, still needs one more
assert.ok(g.stuck);                                // nowhere to go
assert.ok(g.undo() && g.undo() && g.pos === 0);
g = new Game(['S.1'], { jumps: true });
assert.deepStrictEqual(g.legalMoves().map(m => [m.x, m.jump]), [[2, true]]); // jump over a gap
g = new Game(['S.1'], { jumps: false });
assert.strictEqual(g.legalMoves().length, 0);

// levels
LEVELS.forEach((rows, i) => {
  const g = new Game(rows);
  const path = g.solve();
  assert.ok(path, `level ${i + 1} has no solution`);
  path.forEach(m => g.play(m));
  assert.ok(g.won, `level ${i + 1} solution does not clear`);
});
console.log(`ok: rules and ${LEVELS.length} levels solvable`);
