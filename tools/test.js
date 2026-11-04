// node tools/test.js: every level must be solvable, and the rules must behave.
const assert = require('assert');
const { Game } = require('../apps/web-classic/js/game.js');
const { LEVELS } = require('../apps/web-classic/js/levels.js');
const { measure, search, randomPlay } = require('./difficulty.js');

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

// fall()'s shape check (CANGUPA-65): only a step or jump in one of the four
// cardinal directions counts, tile or no tile there.
g = new Game([
  'S....',
  '.....',
  '.....',
  '.....',
  '.....',
]);
assert.ok(g.inMoveShape(1, 0));                     // step right
assert.ok(g.inMoveShape(0, 1));                      // step down
assert.ok(g.inMoveShape(2, 0));                      // jump right
assert.ok(g.inMoveShape(0, 2));                      // jump down
assert.ok(!g.inMoveShape(2, 2));                     // diagonal: not a straight line
assert.ok(!g.inMoveShape(3, 0));                     // in line, but past jump range
assert.ok(!g.inMoveShape(0, 0));                     // standing still
g = new Game(['S....', '.....'], { jumps: false });
assert.ok(!g.inMoveShape(2, 0));                     // jump-shaped distance, but jumps are off

// levels
LEVELS.forEach((rows, i) => {
  const g = new Game(rows);
  const path = g.solve();
  assert.ok(path, `level ${i + 1} has no solution`);
  path.forEach(m => g.play(m));
  assert.ok(g.won, `level ${i + 1} solution does not clear`);
});
// difficulty metrics
let d = measure(['S1', '.1']);                      // one forced path: no luck needed
assert.strictEqual(d.bits, 0);
assert.strictEqual(d.solutions, 1);
d = measure(['S11']);                               // step-step or jump-step: both win
assert.strictEqual(d.solutions, 2);
assert.strictEqual(d.bits, 0);
d = measure(LEVELS[0]);                             // level 1: one solution, 2 bits of luck
assert.strictEqual(d.solutions, 1);
assert.ok(Math.abs(d.bits - 2) < 0.05, `level 1 bits ${d.bits}`);
assert.strictEqual(measure(['S1.', '.2.']).bits, Infinity); // unwinnable: no chance at all
assert.strictEqual(search(['S1', '.1']).decisions, 0);      // every move forced
assert.strictEqual(randomPlay(['S1', '.1']).randomWins, 1);

console.log(`ok: rules and ${LEVELS.length} levels solvable`);
