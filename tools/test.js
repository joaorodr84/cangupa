// node tools/test.js: every level must be solvable, and the rules must behave.
const assert = require('assert');
const { Game } = require('../apps/web-classic/js/game.js');
const { LEVELS } = require('../apps/web-classic/js/levels.js');
const { measure, search, randomPlay } = require('./difficulty.js');
const fs = require('fs');
const path = require('path');
const { canonical, fillsBox } = require('./pack-generator.js');
const { PACKS, LEVELS_PER_PACK } = require('./pack-plan.js');

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

// level packs (tools/packs.json, built by tools/gen-packs.js)
const packsFile = path.join(__dirname, 'packs.json');
let packCount = 0;
if (fs.existsSync(packsFile)) {
  const { packs } = JSON.parse(fs.readFileSync(packsFile, 'utf8'));
  assert.strictEqual(packs.length, PACKS.length, 'pack count matches the plan');
  let prevArea = 0, prevMax = 0, prevMean = 0;
  packs.forEach((pack, i) => {
    const label = `pack ${i + 1} ${pack.name}`;
    assert.strictEqual(pack.levels.length, LEVELS_PER_PACK, `${label}: level count`);
    const area = pack.width * pack.height;
    assert.ok(area > prevArea, `${label}: board area must grow (${area} after ${prevArea})`);
    prevArea = area;
    const seen = new Set();
    let last = -Infinity, sum = 0;
    pack.levels.forEach((lv, j) => {
      const id = `${label} level ${j + 1}`;
      assert.strictEqual(lv.rows.length, pack.height, `${id}: height`);
      assert.ok(lv.rows.every(r => r.length === pack.width), `${id}: width`);
      assert.ok(fillsBox(lv.rows), `${id}: has an empty row or column`);
      const key = canonical(lv.rows);
      assert.ok(!seen.has(key), `${id}: repeats an earlier level (or a rotation of it)`);
      seen.add(key);
      const g = new Game(lv.rows), path = g.solve();
      assert.ok(path, `${id}: no solution`);
      path.forEach(m => g.play(m));
      assert.ok(g.won, `${id}: solution does not clear`);
      assert.ok(lv.pathBits >= last, `${id}: pathBits ${lv.pathBits} drops below ${last}`);
      last = lv.pathBits; sum += lv.pathBits; packCount++;
    });
    const mean = sum / LEVELS_PER_PACK, min = pack.levels[0].pathBits, max = last;
    assert.ok(mean > prevMean, `${label}: mean difficulty ${mean.toFixed(1)} must exceed ${prevMean.toFixed(1)}`);
    assert.ok(min >= prevMax * .8, `${label}: easiest level (${min}) is far below the last pack's hardest (${prevMax})`);
    prevMax = max; prevMean = mean;
  });
}

console.log(`ok: rules and ${LEVELS.length} levels solvable` + (packCount ? `, ${packCount} pack levels` : ''));
