// Level generation, with no file or process handling (see gen-levels.js for that).
//
// How it works: a level is the trail of a random walk of legal moves (steps and
// jumps) over a grid. Every tile the walk lands on becomes a tile of the level,
// needing as many visits as the walk made. So the walk itself is a solution and
// every level is solvable by construction. Many walks are tried, and the one with
// the fewest solutions is kept: fewer solutions means a narrower, harder puzzle.
const { Game } = require('../apps/web-classic/js/game.js');

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
//   maxVisits  most visits any tile may need: 1, 2 or 3 (default 2, as the web game's levels have)
//   noTwo      no tile may end on exactly two visits (a pack with Steel tiles but no Gold ones);
//              a tile that has been visited twice is nudged towards its third
//   arrows     how many one-visit tiles (not the start, not the last) become arrow tiles. An arrow
//              takes the direction the walk leaves its tile by, so the walk stays a valid solution
//   arrivals   how many one-visit tiles (not the start, not already an arrow) become Arrival tiles
//              (CANGUPA-104). An Arrival takes the direction the walk enters its tile by, so the
//              walk stays a valid solution — the mirror of how an arrow takes its exit direction.
//   pillars    at most this many empty squares become Pillars (CANGUPA-159). A pillar only goes
//              where the walk never jumped across, so the walk stays a valid solution, and only
//              between two tiles facing each other across it, so it always removes a jump some
//              other route could have used. A square that blocks nothing is left empty: a pillar
//              there would be decoration the player has to rule out. So a level may get fewer
//              than asked for, or none.
function randomWalk({ width, height, steps, doubles, jump, maxVisits = 2, noTwo = false, arrows = 0, arrivals = 0, pillars = 0 }, rand) {
  const visits = new Map(); // cell index -> times landed on
  const exits = new Map();  // cell index -> the direction (index into MOVES) the walk first left it by
  const entries = new Map(); // cell index -> the direction (index into MOVES) the walk first entered it by
  const jumped = new Set();  // cell index of every middle square a jump of the walk passed over
  let x = (rand() * width) | 0, y = (rand() * height) | 0;
  const start = y * width + x;
  visits.set(start, 1);
  let doubleCount = 0;

  for (let n = 1; n < steps; n++) {
    const options = [];
    for (let k = 0; k < MOVES.length; k++) {
      const [dx, dy] = MOVES[k];
      for (const dist of [1, 2]) {
        const nx = x + dx * dist, ny = y + dy * dist, i = ny * width + nx;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const seen = visits.get(i) || 0;
        // a tile needs at most `maxVisits` visits, and only `doubles` tiles may need more than one.
        // The start is never one of those: reset() in board.js/board.ts spends one of its visits
        // just for standing there, so a start revisited into a Gold or Steel tile would begin
        // already one visit short of full strength (CANGUPA-82) -- it always stays a 1-visit tile.
        if (seen >= maxVisits || (seen === 1 && doubleCount >= doubles) || (i === start && seen >= 1)) continue;
        // jumps are rarer than steps; revisiting a tile is rarer than a fresh one, except a
        // tile stuck on two visits when two is not allowed: that one is wanted again
        const weight = (dist === 2 ? jump : 1 - jump) * (seen ? .35 : 1) * (noTwo && seen === 2 ? 3 : 1);
        options.push({ nx, ny, i, weight, k, over: dist === 2 ? (y + dy) * width + x + dx : -1 });
      }
    }
    if (!options.length) return null;

    let roll = rand() * options.reduce((sum, o) => sum + o.weight, 0), pick = options[0];
    for (const o of options) { if ((roll -= o.weight) <= 0) { pick = o; break; } }

    if (!exits.has(y * width + x)) exits.set(y * width + x, pick.k);
    if (!entries.has(pick.i)) entries.set(pick.i, pick.k);
    if (pick.over >= 0) jumped.add(pick.over);
    if (visits.get(pick.i) === 1) doubleCount++;
    visits.set(pick.i, (visits.get(pick.i) || 0) + 1);
    x = pick.nx; y = pick.ny;
  }

  if (noTwo && [...visits.values()].includes(2)) return null; // a tile left on two visits would be a Gold tile

  // arrow tiles: some of the tiles visited once and left by a move, in a random order
  const arrowAt = new Map();
  if (arrows > 0) {
    const candidates = [...exits.keys()].filter(i => i !== start && visits.get(i) === 1);
    for (let n = candidates.length - 1; n > 0; n--) { const j = (rand() * (n + 1)) | 0; [candidates[n], candidates[j]] = [candidates[j], candidates[n]]; }
    for (const i of candidates.slice(0, arrows)) arrowAt.set(i, '><v^'[exits.get(i)]); // MOVES is in the order right, left, down, up
  }

  // Arrival tiles (CANGUPA-104): some of the tiles visited once and entered by a move, excluding
  // any already an arrow (a tile cannot be both), in a random order.
  const arrivalAt = new Map();
  if (arrivals > 0) {
    const candidates = [...entries.keys()].filter(i => i !== start && visits.get(i) === 1 && !arrowAt.has(i));
    for (let n = candidates.length - 1; n > 0; n--) { const j = (rand() * (n + 1)) | 0; [candidates[n], candidates[j]] = [candidates[j], candidates[n]]; }
    for (const i of candidates.slice(0, arrivals)) arrivalAt.set(i, 'RLDU'[entries.get(i)]); // MOVES is in the order right, left, down, up
  }

  // Pillars (CANGUPA-159): empty squares the walk never jumped over, with a tile on both sides
  // along a row or a column, in a random order.
  const pillarAt = new Set();
  if (pillars > 0) {
    const tile = (c, r) => c >= 0 && r >= 0 && c < width && r < height && visits.has(r * width + c);
    const candidates = [];
    for (let i = 0; i < width * height; i++) {
      if (visits.has(i) || jumped.has(i)) continue;
      const c = i % width, r = (i / width) | 0;
      if ((tile(c - 1, r) && tile(c + 1, r)) || (tile(c, r - 1) && tile(c, r + 1))) candidates.push(i);
    }
    for (let n = candidates.length - 1; n > 0; n--) { const j = (rand() * (n + 1)) | 0; [candidates[n], candidates[j]] = [candidates[j], candidates[n]]; }
    for (const i of candidates.slice(0, pillars)) pillarAt.add(i);
  }

  const rows = [];
  for (let r = 0; r < height; r++) {
    let row = '';
    for (let c = 0; c < width; c++) {
      const i = r * width + c, count = visits.get(i) || 0;
      row += pillarAt.has(i) ? '#' : !count ? '.' : arrowAt.has(i) ? arrowAt.get(i) : arrivalAt.has(i) ? arrivalAt.get(i)
        : i === start ? (count === 3 ? 'T' : count === 2 ? 's' : 'S') : String(count);
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
