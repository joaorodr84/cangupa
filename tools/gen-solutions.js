#!/usr/bin/env node
// Writes tools/solutions.json: one solution for every level in tools/packs.json, in the same
// pack and level order (CANGUPA-163). gen-packs.js calls writeSolutions() itself at the end of
// every run, so the two files never drift apart; run this file directly only to rebuild the
// solutions from an already-written tools/packs.json without redoing gen-packs.js's (slow)
// measuring pass — the levels themselves are not touched.
//
//   node tools/gen-solutions.js
//
// Why a separate file and not a field on each level in packs.json: packs.json is inlined whole
// into the two visualizer pages and its levels are what apps/app's packs.ts is generated from,
// and neither wants a level's answer riding along with it.
//
// Why the solver's solution and not the generator's own walk, which is also one: only levels
// that came out of randomWalk have a walk, and it is gone by the time a pool is cached. The
// designed layouts (pack-designs.js) and every pack already in packs.json never had one to keep.
// search() runs on all of them alike and is deterministic, so the same level always gets the
// same solution.
const fs = require('fs');
const path = require('path');
const { Game } = require('../apps/web-classic/js/game.js');
const { search } = require('./difficulty.js');

const OUT = path.join(__dirname, 'solutions.json');

// A solution is a string with one letter per move: r l d u for a step right, left, down or up,
// and R L D U for the same four as a two-tile jump. A direction and a distance, not the square
// landed on, for three reasons: it is one character a move (500 levels of up to 56 landings);
// turning a level for a portrait screen (orient.ts) turns its solution by swapping letters; and
// it stays true for a tile that sends the player somewhere other than where the move lands
// (CANGUPA-161's Tunnel), where a list of squares would have to say which of the two it meant.
const LETTERS = 'rldu'; // the same order as game.js's DIRS: right, left, down, up
const VECS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

// The moves search() found, as a string, for `game` (a fresh Game for the same level). Takes
// the Game itself, not just its start cell and width, because each move's *own* x/y (what
// search() recorded, i.e. the mouth the player tapped) is not necessarily where the next
// move's direction has to be measured from: a Tunnel mouth (CANGUPA-161) warps the player to
// its twin, so the position this function tracks has to follow game.tunnel the same way
// land() does, or every move after the first tunnel use would be encoded from the wrong cell.
function encode(game, moves) {
  const { start, w: width } = game;
  let x = start % width, y = (start / width) | 0, out = '';
  for (const m of moves) {
    const dx = Math.sign(m.x - x), dy = Math.sign(m.y - y);
    const k = VECS.findIndex(([vx, vy]) => vx === dx && vy === dy);
    out += m.jump ? LETTERS[k].toUpperCase() : LETTERS[k];
    const landed = m.y * width + m.x;
    const dest = game.tunnel[landed] >= 0 ? game.tunnel[landed] : landed;
    x = dest % width; y = (dest / width) | 0;
  }
  return out;
}

// Plays a solution string on a fresh Game for `rows`. Returns true if every move was legal when
// it was made and the level is cleared at the end. test.js uses this on every stored solution.
function replay(rows, solution) {
  const game = new Game(rows);
  for (const c of solution) {
    const k = LETTERS.indexOf(c.toLowerCase());
    if (k < 0) return false;
    const dist = c === c.toLowerCase() ? 1 : 2;
    const x = game.x + VECS[k][0] * dist, y = game.y + VECS[k][1] * dist;
    const move = game.legalMoves().find(m => m.x === x && m.y === y);
    if (!move) return false;
    game.play(move);
  }
  return game.won;
}

// The same cap pack-generator.js scores a candidate with (buildPool, score): a level only got
// into packs.json because this exact search cracked it under this cap, so it cracks it here too.
const CAP = 150000;

function solutionsFor(packs) {
  return packs.map((pack, i) => ({
    name: pack.name,
    solutions: pack.levels.map((lv, j) => {
      const found = search(lv.rows, { cap: CAP });
      if (!found) throw new Error(`pack ${i + 1} ${pack.name} level ${j + 1}: no solution found`);
      return encode(new Game(lv.rows), found.moves);
    }),
  }));
}

function writeSolutions(packs) {
  const out = solutionsFor(packs);
  // one pack per block and one solution per line, so a regenerated pack is a readable diff
  const text = '{\n "packs": [\n' + out.map(p =>
    `  {\n   "name": ${JSON.stringify(p.name)},\n   "solutions": [\n`
    + p.solutions.map(s => `    ${JSON.stringify(s)}`).join(',\n') + '\n   ]\n  }').join(',\n') + '\n ]\n}\n';
  fs.writeFileSync(OUT, text);
  console.log(`wrote tools/solutions.json (${out.reduce((n, p) => n + p.solutions.length, 0)} solutions)`);
}

if (require.main === module) {
  const { packs } = JSON.parse(fs.readFileSync(path.join(__dirname, 'packs.json'), 'utf8'));
  writeSolutions(packs);
}

module.exports = { writeSolutions, solutionsFor, encode, replay };
