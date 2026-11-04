// Designed levels: regular layouts a person can read at a glance, mixed into each pack
// among the generated ones. A generated level is a random walk's trail and looks like
// noise; these have a shape (a snake, a spiral) and a reason (a jump over a gap).
//
// Each layout is a walk: a list of cells in the order the solution visits them. That
// makes it solvable by construction, the same guarantee randomWalk gives. gen-packs.js
// still checks every one with the solver and the pack rules before keeping it.
//
// Shapes:
//   snake    left-to-right, then right-to-left, row by row (or the same by column)
//   spiral   around the edge, then the next ring in, to the centre
// Variants of each shape:
//   whole    every tile is there
//   gapped   tiles are removed from straight runs so the walk must jump: the walk is
//            unchanged, it just skips cells. Only from pack 2 on, where jumps are taught.
//   reversed the walk run backwards, so the start is at the other end
const key = (x, y) => y * 1000 + x;

function snake(w, h, byColumn) {
  const out = [];
  const [a, b] = byColumn ? [w, h] : [h, w];
  for (let i = 0; i < a; i++) {
    for (let j = 0; j < b; j++) {
      const k = i % 2 ? b - 1 - j : j;
      out.push(byColumn ? [i, k] : [k, i]);
    }
  }
  return out;
}

function spiral(w, h) {
  const out = [];
  let x0 = 0, y0 = 0, x1 = w - 1, y1 = h - 1;
  while (x0 <= x1 && y0 <= y1) {
    for (let x = x0; x <= x1; x++) out.push([x, y0]);
    for (let y = y0 + 1; y <= y1; y++) out.push([x1, y]);
    if (y0 < y1) for (let x = x1 - 1; x >= x0; x--) out.push([x, y1]);
    if (x0 < x1) for (let y = y1 - 1; y > y0; y--) out.push([x0, y]);
    x0++; y0++; x1--; y1--;
  }
  return out;
}

// Rows of text for a walk, or null if it leaves a row or column empty or revisits a tile.
// gap > 0 drops every gap-th tile that has a straight run through it, which makes the
// walk jump over it (the walk lands on the tiles either side).
function render(walk, w, h, { gap = 0 } = {}) {
  const seen = new Set();
  for (const [x, y] of walk) { if (seen.has(key(x, y))) return null; seen.add(key(x, y)); }
  const drop = new Set();
  if (gap > 0) {
    let n = 0;
    for (let i = 1; i < walk.length - 1; i++) {
      const [px, py] = walk[i - 1], [x, y] = walk[i], [nx, ny] = walk[i + 1];
      const straight = (px === x && x === nx) || (py === y && y === ny);
      // never drop two in a row: the walk could not then reach the next landing
      if (straight && !drop.has(key(px, py)) && ++n % gap === 0) drop.add(key(x, y));
    }
  }
  const [sx, sy] = walk[0];
  const rows = [];
  for (let y = 0; y < h; y++) {
    let r = '';
    for (let x = 0; x < w; x++) {
      const here = seen.has(key(x, y)) && !drop.has(key(x, y));
      r += !here ? '.' : (x === sx && y === sy) ? 'S' : '1';
    }
    rows.push(r);
  }
  return rows;
}

// All designed candidates for one board. `jumps` is false for the pack that teaches steps.
function designs(w, h, { jumps }) {
  const shapes = {
    'snake': snake(w, h, false),
    'snake-columns': snake(w, h, true),
    'spiral': spiral(w, h),
  };
  const out = [];
  for (const [shape, walk] of Object.entries(shapes)) {
    for (const reversed of [false, true]) {
      const path = reversed ? [...walk].reverse() : walk;
      for (const gap of jumps ? [0, 3, 2] : [0]) {
        const rows = render(path, w, h, { gap });
        if (rows) out.push({ rows, label: `${shape}${gap ? ` gapped/${gap}` : ''}${reversed ? ' reversed' : ''}` });
      }
    }
  }
  return out;
}

module.exports = { designs, snake, spiral, render };
