// Level generation, with no file or process handling (see gen-levels.js for that).
//
// How it works: a level is the trail of a random walk of legal moves (steps and
// jumps) over a grid. Every tile the walk lands on becomes a tile of the level,
// needing as many visits as the walk made. So the walk itself is a solution and
// every level is solvable by construction. Many walks are tried, and the one with
// the fewest solutions is kept: fewer solutions means a narrower, harder puzzle.
const { Game } = require('../js/game.js');

// Small seedable random number generator (mulberry32), so levels are reproducible.
function makeRng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MOVES = [[1, 0], [-1, 0], [0, 1], [0, -1]];

// One random walk. Returns the level as rows of text, or null if it got boxed in.
function randomWalk({ width, height, steps, doubles, jump }, rand) {
  const visits = new Map(); // cell index -> times landed on
  let x = (rand() * width) | 0, y = (rand() * height) | 0;
  const start = y * width + x;
  visits.set(start, 1);
  let doubleCount = 0;

  for (let n = 1; n < steps; n++) {
    const options = [];
    for (const [dx, dy] of MOVES) {
      for (const dist of [1, 2]) {
        const nx = x + dx * dist, ny = y + dy * dist, i = ny * width + nx;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const seen = visits.get(i) || 0;
        // a tile needs at most two visits, and only `doubles` tiles may need two
        if (seen >= 2 || (seen === 1 && doubleCount >= doubles)) continue;
        // jumps are rarer than steps; revisiting a tile is rarer than a fresh one
        const weight = (dist === 2 ? jump : 1 - jump) * (seen ? .35 : 1);
        options.push({ nx, ny, i, weight });
      }
    }
    if (!options.length) return null;

    let roll = rand() * options.reduce((sum, o) => sum + o.weight, 0), pick = options[0];
    for (const o of options) { if ((roll -= o.weight) <= 0) { pick = o; break; } }

    if (visits.get(pick.i) === 1) doubleCount++;
    visits.set(pick.i, (visits.get(pick.i) || 0) + 1);
    x = pick.nx; y = pick.ny;
  }

  const rows = [];
  for (let r = 0; r < height; r++) {
    let row = '';
    for (let c = 0; c < width; c++) {
      const i = r * width + c, count = visits.get(i) || 0;
      row += !count ? '.' : i === start ? (count === 2 ? 's' : 'S') : String(count);
    }
    rows.push(row);
  }
  return rows;
}

// Best of `attempts` walks for one plan entry, or null if none was usable.
// options: { seed, attempts, solutionCap, budget }
//   solutionCap  stop counting solutions at this many (a higher cap tells hard levels apart better)
//   budget       give up on a candidate that needs more than this many positions to analyse
function generateLevel(spec, { seed, attempts = spec.attempts, solutionCap = 30, budget = 300000 }) {
  const rand = makeRng(seed);
  let best = null;
  for (let t = 0; t < attempts; t++) {
    const rows = randomWalk(spec, rand);
    if (!rows) continue;
    const game = new Game(rows);
    const solutions = game.countSolutions(solutionCap, budget);
    if (solutions < 1) continue; // too big to judge
    const score = solutions * 100 - game.max.filter(Boolean).length; // few solutions first, then more tiles
    if (!best || score < best.score) best = { rows, solutions, score };
  }
  return best && { rows: best.rows, solutions: best.solutions };
}

// Throws unless the level can be cleared by following solve()'s moves.
function verifyLevel(rows) {
  const game = new Game(rows);
  const path = game.solve();
  if (!path) throw new Error('no solution');
  path.forEach(m => game.play(m));
  if (!game.won) throw new Error('solution does not clear the level');
}

module.exports = { makeRng, randomWalk, generateLevel, verifyLevel };
