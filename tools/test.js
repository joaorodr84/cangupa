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
const { encode, replay } = require('./gen-solutions.js');

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

// moveKind (CANGUPA-129): fall() used to ask only inMoveShape(), which can't tell "nothing to
// land on" apart from "an arrow forbids this" — so stepping a Departure the wrong way onto a
// live tile sank the level exactly like stepping onto a missing one. 'S>1' / '.1.': the
// Departure sits at (1,0), pointing right; stepping onto a Departure is unrestricted, only
// leaving it is, so play onto it first.
g = new Game(['S>1', '.1.']);
g.play({ x: 1, y: 0 });
assert.strictEqual(g.moveKind(2, 1), 'none');        // diagonal from (1,0): never a move attempt
assert.ok(g.at(1, 1) > 0);                           // a perfectly live tile sits below
assert.strictEqual(g.moveKind(1, 1), 'blocked-departure'); // down is forbidden anyway — the reported bug
assert.strictEqual(g.moveKind(2, 0), 'legal');       // right, the way it points, onto a live tile
assert.strictEqual(new Game(['S..']).moveKind(2, 0), 'empty'); // in shape, no arrow, but no tile

// moveKind on an Arrival: blocked while live regardless of direction mismatch, but once a tile
// is used up the rule has nothing left to forbid — moveKind's explicit `pos` checks a used-up
// tile's classification without needing an actual legal way back to it.
g = new Game(['SL1']);
assert.strictEqual(g.moveKind(1, 0), 'blocked-arrival'); // moving right onto a live, left-only Arrival
g.play({ x: 2, y: 0 });                              // jump past it
g.play({ x: 1, y: 0 });                              // enter moving left: legal, uses it up
assert.strictEqual(g.at(1, 0), 0);                   // used up
assert.strictEqual(g.moveKind(1, 0, 2), 'empty');    // correct direction, but nothing there now
assert.strictEqual(g.moveKind(1, 0, 0), 'empty');    // wrong direction too — still just empty

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

// an Arrival tile (`R L D U`, CANGUPA-104): one visit, and it can only be ENTERED by moving the
// way it names — the mirror of an arrow's exit restriction, checked on arrival instead of departure.
// 'SL1': (1,0) is an Arrival only enterable moving left (from the right); stepping onto it from
// the start (moving right) must fail, but jumping past it to (2,0) and then stepping back (moving
// left) must succeed.
g = new Game(['SL1']);
assert.strictEqual(g.max[1], 1);
assert.strictEqual(g.arrival[1], 1);                 // 1 is left
assert.deepStrictEqual(to(g), [[2, 0]]);             // only the jump past it, not the step onto it
g.play({ x: 2, y: 0 });                              // jump over the arrival tile
assert.deepStrictEqual(to(g), [[1, 0]]);             // now moving left: entering it is legal
const arrivalPath = g.solve();
assert.ok(arrivalPath);                              // clearing still works once past it
arrivalPath.forEach(m => g.play(m));
assert.ok(g.won);
assert.strictEqual(new Game(['SL1']).start, 0);      // an Arrival is never the start

// a Pillar (`#`, CANGUPA-159): a solid block that is not a tile, and a jump cannot pass over it
g = new Game(['S#1', '1..']);
assert.strictEqual(g.max[1], 0);                     // not a tile: needs no visit
assert.strictEqual(g.pillar[1], 1);
assert.strictEqual(g.remaining(), 2);                // and does not count towards clearing the level
assert.deepStrictEqual(to(g), [[0, 1]]);             // the jump right over it is gone; the step down is not
assert.deepStrictEqual(to(new Game(['S.1', '1..'])), [[2, 0], [0, 1]]); // the same level with a gap: the jump is open
assert.strictEqual(g.moveKind(2, 0), 'blocked-pillar'); // the jump over it
assert.strictEqual(g.moveKind(1, 0), 'blocked-pillar'); // a step onto the pillar itself: refused, not a fall
assert.strictEqual(new Game(['S#.']).moveKind(2, 0), 'blocked-pillar'); // over a pillar onto nothing: still refused
g = new Game(['S1', '#1']);                           // steps beside a pillar are unaffected
assert.deepStrictEqual(to(g), [[1, 0]]);
assert.ok(g.solve());
g = new Game(['>#1', 'S..']);                         // a Departure violation is reported as that, pillar or not
g.play({ x: 0, y: 0 });
assert.strictEqual(g.moveKind(0, 1), 'blocked-departure');
assert.strictEqual(g.moveKind(2, 0), 'blocked-pillar'); // the way it points, but over the pillar
assert.strictEqual(new Game(['S#1']).solve(), null);  // a pillar can make a level unwinnable: the solver sees it
assert.strictEqual(new Game(['S#1']).start, 0);       // a pillar is never the start
assert.strictEqual(measure(['S#1', '111']).solutions, 1); // the top row is walled off: down, right, right, up is the only way
assert.strictEqual(measure(['S.1', '111']).solutions, 3); // with a gap there instead, the jump across opens two more
assert.ok(fillsBox(['S1', '11']) && !fillsBox(['S1#', '11.'])); // a column holding only a pillar is still empty

// the generator's own Pillar support (CANGUPA-159): the walk must stay a solution with its pillars in
// place (verifyLevel), every pillar must sit on a square the level leaves empty, and each must stand
// between two tiles, where it removes a jump.
{
  const rand = makeRng(7);
  let sawPillar = 0, made = 0;
  for (let n = 0; n < 300; n++) {
    const rows = randomWalk({ width: 6, height: 5, steps: 16, doubles: 2, jump: .35, pillars: 3 }, rand);
    if (!rows) continue;
    made++;
    verifyLevel(rows);
    const tileAt = (x, y) => y >= 0 && y < rows.length && x >= 0 && x < 6 && !'.#'.includes(rows[y][x]);
    let count = 0;
    rows.forEach((row, y) => [...row].forEach((c, x) => {
      if (c !== '#') return;
      count++;
      assert.ok((tileAt(x - 1, y) && tileAt(x + 1, y)) || (tileAt(x, y - 1) && tileAt(x, y + 1)),
        `pillar at ${x},${y} blocks no jump in ${rows.join('/')}`);
    }));
    assert.ok(count <= 3, `asked for at most 3 pillars, got ${count}`);
    if (count) sawPillar++;
  }
  // about 60% at these settings (172 of 288): the rest have no empty square between two tiles that the
  // walk did not itself jump across, and get none rather than a pillar that blocks nothing
  assert.ok(sawPillar > made * .5, `expected more than half of ${made} walks to place a pillar, saw ${sawPillar}`);
  // a pillar turns with the board like any undirected square: the 8 variants of a level stay the same puzzle
  assert.strictEqual(canonical(['S#1', '1..']), canonical(['1S', '.#', '.1']));
}

// the generator's own Arrival support (CANGUPA-104): a walk that places Arrival tiles must still
// produce a solvable level, the same guarantee arrows already have. Not shipped in any pack yet
// (CANGUPA-88) -- this only proves the walk-marking logic itself is self-consistent.
{
  const rand = makeRng(42);
  let sawArrival = 0;
  for (let n = 0; n < 200; n++) {
    const rows = randomWalk({ width: 5, height: 5, steps: 14, doubles: 0, jump: .3, arrivals: 2 }, rand);
    if (!rows) continue;
    if (/[RLDU]/.test(rows.join(''))) sawArrival++;
    verifyLevel(rows); // throws if the walk's own path does not clear the level
  }
  assert.ok(sawArrival > 150, `expected most of 200 walks to place an Arrival tile, saw ${sawArrival}`);
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
    // the tile mix of each pack (CANGUPA-68, CANGUPA-69, CANGUPA-88, CANGUPA-112): Common only in
    // pack 1, Gold added in pack 2, Steel without Gold in pack 3, both in pack 4, Departures in
    // pack 5, Departures with Gold then Steel alternately in pack 6, Arrivals in pack 7, Arrivals
    // with Gold then Steel alternately in pack 8, both metals and Arrival together in pack 9, and
    // every kind in the game together in pack 10. Packs 1-8 still cap at three tile kinds per
    // level, Common included; packs 9 and 10 intentionally exceed it (CANGUPA-112 dropped that as
    // an enforced rule — see pack-plan.js)
    const MIX = [
      { gold: false, steel: false, arrow: false, arrival: false }, { gold: true, steel: false, arrow: false, arrival: false },
      { gold: false, steel: true, arrow: false, arrival: false }, { gold: true, steel: true, arrow: false, arrival: false },
      { gold: false, steel: false, arrow: true, arrival: false }, { gold: true, steel: true, arrow: true, arrival: false },
      { gold: false, steel: false, arrow: false, arrival: true }, { gold: true, steel: true, arrow: false, arrival: true },
      { gold: true, steel: true, arrow: false, arrival: true }, { gold: true, steel: true, arrow: true, arrival: true },
    ];
    // Gold and Steel alternate (never together) in packs 6 and 8, so "nearly every level" below
    // would be wrong for them -- each dedicated alternation check further down covers those instead.
    const ALTERNATES = { 5: ['gold', 'steel'], 7: ['gold', 'steel'] };
    const mix = MIX[i];
    const has = { gold: /[2s]/, steel: /[3T]/, arrow: /[><v^]/, arrival: /[RLDU]/ };
    const count = { gold: 0, steel: 0, arrow: 0, arrival: 0 };
    pack.levels.forEach((lv, j) => {
      const text = lv.rows.join('');
      for (const kind of Object.keys(has)) if (has[kind].test(text)) {
        count[kind]++;
        assert.ok(mix[kind], `${label} level ${j + 1} has a ${kind} tile, which this pack does not allow`);
      }
      if (i === 5 || i === 7) {  // packs 6 and 8: a special tile and one metal, Gold on level 1, Steel on level 2, and so on
        const special = i === 5 ? 'arrow' : 'arrival';
        assert.ok(has[special].test(text), `${label} level ${j + 1} has no ${special} tile`);
        assert.ok(j % 2 === 0 ? has.gold.test(text) && !has.steel.test(text) : has.steel.test(text) && !has.gold.test(text),
          `${label} level ${j + 1} should have ${j % 2 === 0 ? 'Gold' : 'Steel'} and not the other`);
      }
    });
    // a pack that teaches a tile has it in nearly every level (it opens with a few levels without it,
    // and designed layouts have none) -- except a kind that alternates with another in this pack,
    // which by definition only ever reaches about half
    for (const kind of Object.keys(has)) if (mix[kind] && !(ALTERNATES[i] || []).includes(kind)) {
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

// stored solutions (tools/solutions.json, built by tools/gen-solutions.js, CANGUPA-163)
// the format first: a lowercase letter is a step, an uppercase one a jump
assert.strictEqual(encode(search(['S.1', '..1']).moves, 0, 3), 'Rd');   // jump the gap, step down
assert.ok(replay(['S.1', '..1'], 'Rd'));
assert.ok(!replay(['S.1', '..1'], 'rd'));                              // a step onto the gap is not a move
assert.ok(!replay(['S.1', '..1'], 'R'));                               // legal, but stops short of clearing
assert.ok(!replay(['S.1', '..1'], 'Rx'));                              // not a move letter
assert.ok(!replay(['S>1', '.1.'], 'rdR'));                             // leaving a Departure the wrong way
let solutionCount = 0;
if (fs.existsSync(packsFile)) {
  const { packs } = JSON.parse(fs.readFileSync(packsFile, 'utf8'));
  const solutionsFile = path.join(__dirname, 'solutions.json');
  assert.ok(fs.existsSync(solutionsFile), 'tools/solutions.json is missing: run node tools/gen-solutions.js');
  const solved = JSON.parse(fs.readFileSync(solutionsFile, 'utf8')).packs;
  assert.strictEqual(solved.length, packs.length, 'solutions.json: pack count matches packs.json');
  packs.forEach((pack, i) => {
    const label = `solutions.json pack ${i + 1} ${pack.name}`;
    assert.strictEqual(solved[i].name, pack.name, `${label}: is for pack "${solved[i].name}" instead`);
    assert.strictEqual(solved[i].solutions.length, pack.levels.length, `${label}: solution count`);
    // replaying on the level in packs.json is also what catches the two files drifting apart:
    // a solution left over from a level that has since been regenerated will not clear the new one
    pack.levels.forEach((lv, j) => {
      assert.ok(replay(lv.rows, solved[i].solutions[j]), `${label} level ${j + 1}: stored solution does not clear the level`);
      solutionCount++;
    });
  });
}

console.log(`ok: rules and ${LEVELS.length} levels solvable` + (packCount ? `, ${packCount} pack levels` : '')
  + (solutionCount ? `, ${solutionCount} stored solutions replayed` : ''));
