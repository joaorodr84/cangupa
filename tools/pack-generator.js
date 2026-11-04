// Builds one pack's levels from a plan entry (see pack-plan.js). No file or process handling.
//
// How: draw many random walks on the pack's board (level-generator.js's randomWalk, so
// every level is solvable by construction), keep the ones that meet the rules below, score
// each with difficulty.js, then pick the 30 that climb evenly from the pack's easiest
// to its hardest. Picking from a measured pool is what makes the ramp gradual; a walk
// on its own says nothing about how hard the level is.
//
// Rules every kept level meets:
//  - it fills its bounding box: no row or column without a tile (CANGUPA-56);
//  - it is not a rotation or mirror of another level in the same pack;
//  - a solver finds a solution (the search cap rejects boards it cannot crack in time).
const { makeRng, randomWalk } = require('./level-generator.js');
const { search, measure } = require('./difficulty.js');

// The 8 ways to turn or mirror a board. Moves are symmetric in all four directions, so
// two boards related by any of them are the same puzzle.
function variants(rows) {
  const h = rows.length, w = rows[0].length;
  const at = (x, y) => rows[y][x];
  const make = (nw, nh, f) => {
    const out = [];
    for (let y = 0; y < nh; y++) {
      let r = '';
      for (let x = 0; x < nw; x++) r += f(x, y);
      out.push(r);
    }
    return out.join('/');
  };
  return [
    make(w, h, (x, y) => at(x, y)),
    make(w, h, (x, y) => at(w - 1 - x, y)),
    make(w, h, (x, y) => at(x, h - 1 - y)),
    make(w, h, (x, y) => at(w - 1 - x, h - 1 - y)),
    make(h, w, (x, y) => at(y, x)),
    make(h, w, (x, y) => at(y, h - 1 - x)),
    make(h, w, (x, y) => at(w - 1 - y, x)),
    make(h, w, (x, y) => at(w - 1 - y, h - 1 - x)),
  ];
}
const canonical = rows => variants(rows).sort()[0];

function fillsBox(rows) {
  const w = rows[0].length;
  if (rows.some(r => !/[^.]/.test(r))) return false;
  for (let x = 0; x < w; x++) if (rows.every(r => r[x] === '.')) return false;
  return true;
}

const lerp = ([lo, hi], t) => lo + (hi - lo) * t;

// `count` scored candidates for one pack, from a seed. Each candidate draws its own
// parameters inside the pack's ranges so the pool spans easy to hard.
function buildPool(spec, { seed, count, cap = 150000, exactBudget = 40000 }) {
  const rand = makeRng(seed);
  const area = spec.width * spec.height;
  const seen = new Set(), pool = [];
  let tries = 0;
  while (pool.length < count && tries < count * 40) {
    tries++;
    const steps = Math.max(4, Math.round(area * lerp(spec.steps, rand())));
    const doubles = Math.floor(steps * lerp(spec.doubles, rand()));
    const jump = lerp(spec.jump, rand());
    const rows = randomWalk({ width: spec.width, height: spec.height, steps, doubles, jump }, rand);
    if (!rows || !fillsBox(rows)) continue;
    const key = canonical(rows);
    if (seen.has(key)) continue;
    seen.add(key);
    const s = search(rows, { cap });
    if (!s) continue; // the solver could not crack it in time
    const exact = measure(rows, { budget: exactBudget });
    pool.push({
      rows,
      pathBits: Number(s.pathBits.toFixed(2)),
      decisions: s.decisions,
      effort: s.effort,
      bits: exact ? Number(exact.bits.toFixed(2)) : null,
      solutions: exact ? exact.solutions : null,
      visits: rows.join('').split('').reduce((a, c) => a + (c === '.' ? 0 : c === '2' || c === 's' ? 2 : 1), 0),
    });
  }
  return pool;
}

// Pick `n` levels from the pool whose scores step evenly from `from` up to `to`.
// Each target takes the closest unused candidate, then the result is sorted so the
// pack reads easy to hard. Returns null if the pool is too small.
function pick(pool, n, from, to) {
  if (pool.length < n) return null;
  const used = new Set(), out = [];
  const byScore = pool.map((p, i) => [p, i]).sort((a, b) => a[0].pathBits - b[0].pathBits || a[0].decisions - b[0].decisions);
  for (let k = 0; k < n; k++) {
    const target = from + (to - from) * (k / (n - 1));
    let best = -1, gap = Infinity;
    byScore.forEach(([p, i]) => {
      if (used.has(i)) return;
      const g = Math.abs(p.pathBits - target);
      if (g < gap) { gap = g; best = i; }
    });
    used.add(best);
    out.push(pool[best]);
  }
  return out.sort((a, b) => a.pathBits - b.pathBits || a.decisions - b.decisions || a.visits - b.visits);
}

// Metrics for one given level (designed levels come from outside the random pool).
// Null if the solver cannot crack it.
function score(rows, { cap = 150000, exactBudget = 40000 } = {}) {
  const s = search(rows, { cap });
  if (!s) return null;
  const exact = measure(rows, { budget: exactBudget });
  return {
    rows,
    pathBits: Number(s.pathBits.toFixed(2)),
    decisions: s.decisions,
    effort: s.effort,
    bits: exact ? Number(exact.bits.toFixed(2)) : null,
    solutions: exact ? exact.solutions : null,
    visits: rows.join('').split('').reduce((a, c) => a + (c === '.' ? 0 : c === '2' || c === 's' ? 2 : 1), 0),
  };
}

const quantile = (sorted, q) => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];

module.exports = { buildPool, pick, quantile, canonical, fillsBox, variants, score };
