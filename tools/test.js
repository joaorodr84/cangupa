// node tools/test.js: every level must be solvable, and the rules must behave.
const assert = require('assert');
const { Game } = require('../apps/web-classic/js/game.js');
const { LEVELS } = require('../apps/web-classic/js/levels.js');
const { measure, search, randomPlay } = require('./difficulty.js');
const fs = require('fs');
const path = require('path');
const { canonical, fillsBox } = require('./pack-generator.js');
const { PACKS, LEVELS_PER_PACK, OVERLAP } = require('./pack-plan.js');
const { makeRng, randomWalk, verifyLevel } = require('./level-generator.js');

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
g = new Game(['S.1']);
assert.deepStrictEqual(g.legalMoves().map(m => [m.x, m.jump]), [[2, true]]); // jump over a gap

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

// a tile needing three visits (a Steel tile): `T` starts on one, `3` is one in the level
g = new Game(['1T1']);
assert.strictEqual(g.max[1], 3);
assert.strictEqual(g.at(1, 0), 2);                 // the start tile counts as one visit already
assert.strictEqual(g.remaining(), 4);
const steelPath = g.solve();                       // step out, back, out the other way, back: 4 landings
assert.strictEqual(steelPath.length, 4);
steelPath.forEach(m => g.play(m));
assert.ok(g.won);
g = new Game(['S3']);
assert.strictEqual(g.max[1], 3);                   // `3` alone is a 3-visit tile that is not the start
assert.throws(() => new Game(['13']), /no start/);

// an arrow tile (`>` `<` `v` `^`): one visit, and it can only be left the way it points
const to = g => g.legalMoves().map(m => [m.x, m.y]);
g = new Game(['S>1', '.1.']);
assert.strictEqual(g.max[1], 1);
assert.strictEqual(g.dir[1], 0);                     // 0 is right
g.play({ x: 1, y: 0 });                              // step onto the arrow
assert.deepStrictEqual(to(g), [[2, 0]]);             // right only: the tile below it is out of reach
const plain = new Game(['S11', '.1.']);              // the same level with a plain tile: both ways are open
plain.play({ x: 1, y: 0 });
assert.deepStrictEqual(to(plain), [[2, 0], [1, 1]]);
g = new Game(['S>.1', '....', '.1..']);               // jumps follow the arrow too
g.play({ x: 1, y: 0 });
assert.deepStrictEqual(to(g), [[3, 0]]);             // the jump right, not the jump down
g = new Game(['S.', '1v', '.1']);
assert.strictEqual(g.dir[3], 2);                     // v points down
g = new Game(['S<', '..']);
assert.strictEqual(g.dir[1], 1);                     // < points left
g = new Game(['^S']);
assert.strictEqual(g.dir[0], 3);                     // ^ points up
assert.ok(new Game(['S>1']).solve());                // a level with an arrow can still be cleared
assert.strictEqual(new Game(['S>1']).start, 0);      // an arrow is never the start

// a Gate tile (`R L D U`, CANGUPA-104): one visit, and it can only be ENTERED by moving the way
// it names — the mirror of an arrow's exit restriction, checked on arrival instead of departure.
// 'SL1': (1,0) is a Gate only enterable moving left (from the right); stepping onto it from the
// start (moving right) must fail, but jumping past it to (2,0) and then stepping back (moving
// left) must succeed.
g = new Game(['SL1']);
assert.strictEqual(g.max[1], 1);
assert.strictEqual(g.gate[1], 1);                    // 1 is left
assert.deepStrictEqual(to(g), [[2, 0]]);             // only the jump past the gate, not the step onto it
g.play({ x: 2, y: 0 });                              // jump over the gate
assert.deepStrictEqual(to(g), [[1, 0]]);             // now moving left: entering the gate is legal
const gatePath = g.solve();
assert.ok(gatePath);                                 // clearing still works once past the gate
gatePath.forEach(m => g.play(m));
assert.ok(g.won);
assert.strictEqual(new Game(['SL1']).start, 0);      // a Gate is never the start

// the generator's own Gate support (CANGUPA-104): a walk that places Gate tiles must still
// produce a solvable level, the same guarantee arrows already have. Not shipped in any pack yet
// (CANGUPA-88) -- this only proves the walk-marking logic itself is self-consistent.
{
  const rand = makeRng(42);
  let sawGate = 0;
  for (let n = 0; n < 200; n++) {
    const rows = randomWalk({ width: 5, height: 5, steps: 14, doubles: 0, jump: .3, gates: 2 }, rand);
    if (!rows) continue;
    if (/[RLDU]/.test(rows.join(''))) sawGate++;
    verifyLevel(rows); // throws if the walk's own path does not clear the level
  }
  assert.ok(sawGate > 150, `expected most of 200 walks to place a Gate tile, saw ${sawGate}`);
}

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
    // the tile mix of each pack (CANGUPA-68, CANGUPA-69): Common only in pack 1, Gold added in pack 2, Steel
    // without Gold in pack 3, both in pack 4, arrows in pack 5, arrows with Gold then Steel alternately in pack 6;
    // packs 7 to 10 are frozen with Gold only. No level in packs 1 to 10 has more than three tile kinds, Common included
    const MIX = [
      { gold: false, steel: false, arrow: false }, { gold: true, steel: false, arrow: false },
      { gold: false, steel: true, arrow: false }, { gold: true, steel: true, arrow: false },
      { gold: false, steel: false, arrow: true }, { gold: true, steel: true, arrow: true },
    ];
    const mix = MIX[i] || { gold: true, steel: false, arrow: false };
    const has = { gold: /[2s]/, steel: /[3T]/, arrow: /[><v^]/ };
    const count = { gold: 0, steel: 0, arrow: 0 };
    pack.levels.forEach((lv, j) => {
      const text = lv.rows.join('');
      for (const kind of Object.keys(has)) if (has[kind].test(text)) {
        count[kind]++;
        assert.ok(mix[kind], `${label} level ${j + 1} has a ${kind} tile, which this pack does not allow`);
      }
      const special = Object.keys(has).filter(kind => has[kind].test(text)).length;
      assert.ok(1 + special <= 3, `${label} level ${j + 1} has ${1 + special} tile kinds, more than three`);
      if (i === 5) {  // pack 6: arrows and one metal, Gold on level 1, Steel on level 2, and so on
        assert.ok(has.arrow.test(text), `${label} level ${j + 1} has no arrow tile`);
        assert.ok(j % 2 === 0 ? has.gold.test(text) && !has.steel.test(text) : has.steel.test(text) && !has.gold.test(text),
          `${label} level ${j + 1} should have ${j % 2 === 0 ? 'Gold' : 'Steel'} and not the other`);
      }
    });
    // a pack that teaches a tile has it in nearly every level (it opens with a few levels without it,
    // and designed layouts have none)
    for (const kind of Object.keys(has)) if (i < 5 && mix[kind]) {
      assert.ok(count[kind] >= LEVELS_PER_PACK - 11, `${label}: only ${count[kind]} levels have a ${kind} tile`);
    }
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
    assert.ok(min >= prevMax * (OVERLAP - .05), `${label}: easiest level (${min}) is far below the last pack's hardest (${prevMax})`);
    prevMax = max; prevMean = mean;
  });
}

console.log(`ok: rules and ${LEVELS.length} levels solvable` + (packCount ? `, ${packCount} pack levels` : ''));
