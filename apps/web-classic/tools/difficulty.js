// Level difficulty, measured from the level's full state space. Plain Node.
//
//   node tools/difficulty.js            table for every level in js/levels.js
//   node tools/difficulty.js 12         one level (1-based) in detail
//
// A position is (tile counts, player cell). The search below visits every
// position reachable from the start once, and from that single pass reads off:
//
//   bits        -log2 of the chance that a player picking a legal move uniformly
//               at random clears the level. THE difficulty score: "how many
//               fair coin flips of luck does a blind player need". Each bit
//               doubles how often random play fails, and it falls out of the
//               rules with no tuned weights.
//   solutions   how many distinct move sequences clear it (exact, not capped).
//               Few means narrow; this is what the generator minimises today.
//   trapRatio   share of reachable positions from which the level can no
//               longer be won. High means mistakes are made early and only
//               show up late, which is what makes a level feel unfair-hard.
//   states      reachable positions: the size of the thinking a solver does.
//
// Why bits and not solutions: solutions counts winning paths but ignores how
// many losing ones surround them. A level with 4 solutions among 40 moves
// of branching is far harder than 4 among 6. bits sees both.
// Why exact DP and not Monte Carlo sampling: the state space of every shipped
// level fits in memory, and exact numbers make the score reproducible and
// testable. Levels too big for `budget` positions return null rather than a guess.
const { Game } = require('../js/game.js');
const { makeRng } = require('./level-generator.js');

function measure(rows, { budget = 2000000, rules } = {}) {
  const game = new Game(rows, rules);
  const memo = new Map(); // key -> { p: random win chance, n: solutions, win: can still be won }
  let aborted = false;

  const rec = (cells, pos) => {
    if (game.remaining(cells) === 0) return { p: 1, n: 1, win: true };
    const k = pos + ':' + cells.join('');
    const hit = memo.get(k);
    if (hit) return hit;
    if (memo.size >= budget) { aborted = true; return { p: 0, n: 0, win: false }; }
    const moves = game.legalMoves(cells, pos);
    let p = 0, n = 0, win = false;
    for (const m of moves) {
      const next = Uint8Array.from(cells), i = m.y * game.w + m.x;
      next[i] -= 1;
      const r = rec(next, i);
      p += r.p; n += r.n; win = win || r.win;
    }
    const out = { p: moves.length ? p / moves.length : 0, n, win };
    memo.set(k, out);
    return out;
  };

  const first = Uint8Array.from(game.max);
  first[game.start] -= 1;
  const root = rec(first, game.start);
  if (aborted) return null;

  let trapped = 0;
  for (const v of memo.values()) if (!v.win) trapped++;
  return {
    bits: root.p > 0 ? 0 - Math.log2(root.p) : Infinity, // 0 - x, so a certain win is 0 not -0
    solutions: root.n,
    trapRatio: memo.size ? trapped / memo.size : 0,
    states: memo.size,
    tiles: game.max.filter(Boolean).length,
    visits: game.max.reduce((a, b) => a + b, 0),
  };
}

// ---- Estimators that scale to every level -------------------------------
// measure() is exact but its cost is the whole state space, which is millions of
// positions by level ~22. These three read the same difficulty off cheap runs.

// Depth-first search for the first solution, counting positions expanded.
// `effort` is that count: how much a systematic solver has to think. Also reads
// the branching along the solution it found: `pathBits` sums log2(legal moves)
// at each step, an upper bound on the luck needed to retrace that one path.
function search(rows, { cap = 3000000, rules } = {}) {
  const game = new Game(rows, rules);
  const dead = new Set();
  let nodes = 0, capped = false, bits = 0, forced = 0;
  const path = [];
  const rec = (cells, pos) => {
    if (game.remaining(cells) === 0) return true;
    const k = pos + ':' + cells.join('');
    if (dead.has(k)) return false;
    if (++nodes > cap) { capped = true; return false; }
    const moves = game.legalMoves(cells, pos);
    for (const m of moves) {
      const next = Uint8Array.from(cells), i = m.y * game.w + m.x;
      next[i] -= 1;
      path.push(moves.length);
      if (rec(next, i)) return true;
      path.pop();
      if (capped) return false;
    }
    dead.add(k);
    return false;
  };
  const first = Uint8Array.from(game.max);
  first[game.start] -= 1;
  const ok = rec(first, game.start);
  if (!ok) return null;
  for (const n of path) { bits += Math.log2(n); if (n === 1) forced++; }
  return { effort: nodes, pathBits: bits, decisions: path.length - forced, steps: path.length };
}

// Random play: `runs` seeded playouts picking a legal move uniformly. `survival`
// is the mean share of the level's visits done before getting stuck (1 = every
// run cleared it). Cheap at any size, and it stays informative where measure()'s
// win chance is too small to ever sample.
function randomPlay(rows, { runs = 2000, seed = 1, rules } = {}) {
  const game = new Game(rows, rules);
  const total = game.max.reduce((a, b) => a + b, 0);
  const rand = makeRng(seed);
  let done = 0, wins = 0;
  for (let r = 0; r < runs; r++) {
    game.reset();
    for (;;) {
      if (game.won) { wins++; break; }
      const moves = game.legalMoves();
      if (!moves.length) break;
      game.play(moves[(rand() * moves.length) | 0]);
    }
    done += (total - game.remaining()) / total;
  }
  return { survival: done / runs, randomWins: wins / runs };
}

module.exports = { measure, search, randomPlay };

if (require.main === module) {
  const { LEVELS } = require('../js/levels.js');
  const only = Number(process.argv[2]);
  const f = (v, d = 1) => Number.isFinite(v) ? v.toFixed(d) : String(v);
  const pad = (v, n) => String(v).padStart(n);
  console.log('lvl  bits  trap%  log2(eff)  pathBits  decide  survival  tiles  visits');
  LEVELS.forEach((rows, i) => {
    if (only && only !== i + 1) return;
    const m = measure(rows, { budget: 300000 }), s = search(rows), p = randomPlay(rows);
    const g = new Game(rows);
    console.log([
      pad(i + 1, 3), pad(m ? f(m.bits) : '-', 5), pad(m ? f(m.trapRatio * 100, 0) : '-', 5),
      pad(s ? f(Math.log2(Math.max(1, s.effort))) : '-', 9), pad(s ? f(s.pathBits) : '-', 8),
      pad(s ? s.decisions : '-', 6), pad(f(p.survival, 3), 8),
      pad(g.max.filter(Boolean).length, 5), pad(g.max.reduce((a, b) => a + b, 0), 6),
    ].join('  '));
  });
}
