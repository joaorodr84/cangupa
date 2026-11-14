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
// An arrow (Departure) tile points a way, so it turns with the board: when a level is mirrored or
// rotated, its direction goes through the same turn. An Arrival tile (CANGUPA-104) turns the same
// way, just with its own character set. `m` is the 2x2 matrix the 8 turns apply to a direction
// (dx, dy) -> (m[0]*dx + m[1]*dy, m[2]*dx + m[3]*dy), in the order the variants below are built.
const ARROW_VEC = { '>': [1, 0], '<': [-1, 0], 'v': [0, 1], '^': [0, -1] };
const VEC_ARROW = { '1,0': '>', '-1,0': '<', '0,1': 'v', '0,-1': '^' };
const turnArrow = (c, m) => {
  const v = ARROW_VEC[c];
  if (!v) return c;
  return VEC_ARROW[`${m[0] * v[0] + m[1] * v[1] || 0},${m[2] * v[0] + m[3] * v[1] || 0}`];
};
const ARRIVAL_VEC = { R: [1, 0], L: [-1, 0], D: [0, 1], U: [0, -1] };
const VEC_ARRIVAL = { '1,0': 'R', '-1,0': 'L', '0,1': 'D', '0,-1': 'U' };
const turnArrival = (c, m) => {
  const v = ARRIVAL_VEC[c];
  if (!v) return c;
  return VEC_ARRIVAL[`${m[0] * v[0] + m[1] * v[1] || 0},${m[2] * v[0] + m[3] * v[1] || 0}`];
};
function variants(rows) {
  const h = rows.length, w = rows[0].length;
  const at = (x, y) => rows[y][x];
  const make = (nw, nh, f, m) => {
    const out = [];
    for (let y = 0; y < nh; y++) {
      let r = '';
      for (let x = 0; x < nw; x++) r += turnArrival(turnArrow(f(x, y), m), m);
      out.push(r);
    }
    return out.join('/');
  };
  return [
    make(w, h, (x, y) => at(x, y), [1, 0, 0, 1]),
    make(w, h, (x, y) => at(w - 1 - x, y), [-1, 0, 0, 1]),
    make(w, h, (x, y) => at(x, h - 1 - y), [1, 0, 0, -1]),
    make(w, h, (x, y) => at(w - 1 - x, h - 1 - y), [-1, 0, 0, -1]),
    make(h, w, (x, y) => at(y, x), [0, 1, 1, 0]),
    make(h, w, (x, y) => at(y, h - 1 - x), [0, -1, 1, 0]),
    make(h, w, (x, y) => at(w - 1 - y, x), [0, 1, -1, 0]),
    make(h, w, (x, y) => at(w - 1 - y, h - 1 - x), [0, -1, -1, 0]),
  ];
}
const canonical = rows => variants(rows).sort()[0];

// Which tile kinds a level uses: 1 Normal, 2 Gold (two visits), 3 Steel (three visits).
const hasGold = rows => /[2s]/.test(rows.join(''));
const hasSteel = rows => /[3T]/.test(rows.join(''));
const hasArrow = rows => /[><v^]/.test(rows.join(''));
const hasArrival = rows => /[RLDU]/.test(rows.join(''));
const hasPillar = rows => rows.join('').includes('#');
const hasMud = rows => rows.join('').includes('m');
const hasTunnel = rows => /[ab]/.test(rows.join(''));
// Whether a level has every kind the plan entry lists (Common is always there).
function hasKinds(spec, rows) {
  const kinds = kindsOf(spec);
  return (!kinds.includes(2) || hasGold(rows)) && (!kinds.includes(3) || hasSteel(rows))
    && (!spec.arrows || hasArrow(rows)) && (!spec.arrivals || hasArrival(rows))
    && (!spec.pillars || hasPillar(rows)) && (!spec.mud || hasMud(rows)) && (!spec.tunnels || hasTunnel(rows));
}
// The kinds a pack's plan entry allows (default: Normal and Gold, as before CANGUPA-68).
const kindsOf = spec => spec.tiles || [1, 2];

// A Pillar (CANGUPA-159) is not a tile, so a row or column holding only pillars is still empty:
// the rule is about ground to stand on, and a board edged by a lone pillar would read as a
// level drawn off-centre.
function fillsBox(rows) {
  const w = rows[0].length;
  if (rows.some(r => !/[^.#]/.test(r))) return false;
  for (let x = 0; x < w; x++) if (rows.every(r => r[x] === '.' || r[x] === '#')) return false;
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
    // A pack with `mixes` (pack 6) alternates between variants level by level: each candidate is made for one
    // of them, in turn, and carries its number so the pack can ask for the variants alternately.
    const mixIndex = spec.mixes ? tries % spec.mixes.length : 0;
    const m = spec.mixes ? { ...spec, ...spec.mixes[mixIndex] } : spec;
    const steps = Math.max(4, Math.round(area * lerp(spec.steps, rand())));
    const doubles = Math.floor(steps * lerp(m.doubles || [0, 0], rand()));
    const jump = lerp(spec.jump, rand());
    const kinds = kindsOf(m);
    // a share of candidates get no arrows/arrivals at all, so a pack that introduces them can open with levels that lack them
    const arrows = m.arrows && (spec.mixes || rand() >= .12) ? Math.floor(steps * lerp(m.arrows, rand())) : 0;
    const arrivals = m.arrivals && (spec.mixes || rand() >= .12) ? Math.floor(steps * lerp(m.arrivals, rand())) : 0;
    const mud = m.mud && (spec.mixes || rand() >= .12) ? Math.floor(steps * lerp(m.mud, rand())) : 0;
    // pillars are a count, not a share of the landings: they sit on empty squares, which a
    // long walk has fewer of, so scaling them with the walk would ask for most where fewest fit
    const pillars = m.pillars && (spec.mixes || rand() >= .12) ? Math.round(lerp(m.pillars, rand())) : 0;
    // tunnels are a count of pairs too, for the same reason pillars is one, and capped the same
    // way randomWalk caps them (at most 2, 'a' and 'b')
    const tunnels = m.tunnels && (spec.mixes || rand() >= .12) ? Math.round(lerp(m.tunnels, rand())) : 0;
    const rows = randomWalk({ width: spec.width, height: spec.height, steps, doubles, jump,
      maxVisits: Math.max(...kinds), noTwo: kinds.includes(3) && !kinds.includes(2), arrows, arrivals, pillars, mud, tunnels }, rand);
    if (!rows || !fillsBox(rows)) continue;
    const key = canonical(rows);
    if (seen.has(key)) continue;
    seen.add(key);
    const s = search(rows, { cap });
    if (!s) continue; // the solver could not crack it in time
    const exact = measure(rows, { budget: exactBudget });
    pool.push({
      rows,
      // the kinds a level has, so the pack can ask for them (and for none, in its first few levels)
      full: hasKinds(m, rows),
      mix: mixIndex,
      pathBits: Number(s.pathBits.toFixed(2)),
      decisions: s.decisions,
      effort: s.effort,
      bits: exact ? Number(exact.bits.toFixed(2)) : null,
      solutions: exact ? exact.solutions : null,
      visits: rows.join('').split('').reduce((a, c) => a + (c === '.' || c === '#' ? 0 : c === '2' || c === 's' ? 2 : 1), 0),
    });
  }
  return pool;
}

// Pick `n` levels that alternate between the pools (pack 6: Gold, Steel, Gold, ...) and climb: slot k takes,
// from pool k % pools.length, the candidate nearest its target score that is not easier than the one before.
// Both the alternation and the never-dropping difficulty hold by construction. Null if a pool runs out.
function pickAlternating(pools, n, from, to) {
  const used = pools.map(() => new Set()), out = [];
  let floor = -Infinity;
  for (let k = 0; k < n; k++) {
    const which = k % pools.length, pool = pools[which];
    const target = from + (to - from) * (k / (n - 1));
    let best = -1, gap = Infinity;
    pool.forEach((p, i) => {
      if (used[which].has(i) || p.pathBits < floor) return;
      const g = Math.abs(p.pathBits - target);
      if (g < gap) { gap = g; best = i; }
    });
    if (best < 0) return null;
    used[which].add(best);
    out.push(pool[best]);
    floor = pool[best].pathBits;
  }
  return out;
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
    visits: rows.join('').split('').reduce((a, c) => a + (c === '.' || c === '#' ? 0 : c === '2' || c === 's' ? 2 : 1), 0),
  };
}

const quantile = (sorted, q) => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];

module.exports = { buildPool, pick, pickAlternating, quantile, canonical, fillsBox, variants, score, hasGold, hasSteel, hasArrow, hasArrival, hasPillar, hasMud, hasTunnel, hasKinds, kindsOf };
