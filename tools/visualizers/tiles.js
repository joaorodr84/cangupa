// Draws a level the way the game does: same tile colours, same marks, on the dark board.
// Shared by level-packs.html and level-difficulty.html. Colours are the game's
// (apps/app/src/theme/palette.ts); they are the same in its light and dark themes, so
// only the board is themed, and this report is dark only.
const TILES = {
  '1': { face: '#4cc9f0', lip: '#1f7a99', visits: 1 },
  '2': { face: '#ffc857', lip: '#a8741a', mark: '#3b2a06', visits: 2 },
  '3': { face: '#587790', lip: '#3c5162', mark: '#ffffff', visits: 3 },
};
const START_OF = { S: '1', s: '2', T: '3' };
// Signpost was raspberry until CANGUPA-87 recoloured it green and freed raspberry for the new
// Gate tile (CANGUPA-88) — see apps/app/src/theme/palette.ts.
const SIGNPOST = { face: '#2f9e44', lip: '#7cd48f', mark: '#ffffff' };
const GATE = { face: '#9d1057', lip: '#ba5889', mark: '#ffffff' };
// The doorway-bracket mark (CANGUPA-107), ported verbatim from apps/app/src/components/Board.tsx's
// AXIS/pt/bracketGeometry/ArrowMark — the plain triangle this file drew before CANGUPA-110 was
// already stale the day it shipped, since CANGUPA-107 had replaced that triangle in the real app.
// Coordinates are in the app's 64x57 face space; sketch() below converts them to pixels the
// same way the old EDGE triangles were.
const SIGNPOST_DIR = { '>': 'right', '<': 'left', v: 'down', '^': 'up' };
const GATE_DIR = { R: 'right', L: 'left', D: 'down', U: 'up' };
const AXIS = {
  right: { axis: 'x', sign: 1, edgeAt: 64, acrossCenter: 28.5 },
  left: { axis: 'x', sign: -1, edgeAt: 0, acrossCenter: 28.5 },
  up: { axis: 'y', sign: -1, edgeAt: 0, acrossCenter: 32 },
  down: { axis: 'y', sign: 1, edgeAt: 57, acrossCenter: 32 },
};
function arrowPt(direction, k, c) {
  const a = AXIS[direction];
  const depth = a.edgeAt - a.sign * k;
  return a.axis === 'x' ? [depth, a.acrossCenter + c] : [a.acrossCenter + c, depth];
}
const BRACKET_SCALE = 2, BRACKET_BASE_K = 12, BRACKET_PADDING = 10, BRACKET_OPEN_K = 6,
  BRACKET_SHALLOW_K = 4, BRACKET_ARROW_GAP = 8;
function bracketGeometry(direction) {
  const a = AXIS[direction];
  const ext = a.axis === 'x' ? { depth: 64, across: 57 } : { depth: 57, across: 64 };
  const capK = BRACKET_BASE_K + (ext.depth / 2 - BRACKET_PADDING) / BRACKET_SCALE;
  const w = (ext.across / 2 - BRACKET_PADDING) / BRACKET_SCALE;
  return { capK, w, openK: BRACKET_OPEN_K, deepK: capK - BRACKET_ARROW_GAP, shallowK: BRACKET_SHALLOW_K };
}
// isEnter: Gate's arrow threads inward, tip at the bracket's back wall (it enters this way);
// Signpost's threads outward, tip past the edge (it leaves this way) — same as Board.tsx.
function bracketMark(direction, isEnter) {
  const g = bracketGeometry(direction);
  const cap = [arrowPt(direction, g.capK, -g.w), arrowPt(direction, g.capK, g.w)];
  const railA = [arrowPt(direction, g.capK, -g.w), arrowPt(direction, g.openK, -g.w)];
  const railB = [arrowPt(direction, g.capK, g.w), arrowPt(direction, g.openK, g.w)];
  const outward = !isEnter;
  const headLen = 6;
  const tailK = outward ? g.deepK : g.shallowK;
  const headK = outward ? g.shallowK : g.deepK;
  const baseK = outward ? headK + headLen : headK - headLen;
  const tail = arrowPt(direction, tailK, 0);
  const base = arrowPt(direction, baseK, 0);
  const baseA = arrowPt(direction, baseK, -5);
  const baseB = arrowPt(direction, baseK, 5);
  const tip = arrowPt(direction, headK, 0);
  const localCenter = arrowPt(direction, BRACKET_BASE_K, 0);
  const xf = ([px, py]) => [32 + BRACKET_SCALE * (px - localCenter[0]), 28.5 + BRACKET_SCALE * (py - localCenter[1])];
  return {
    lines: [cap, railA, railB].map((seg) => seg.map(xf)),
    shaft: [tail, base].map(xf),
    head: [baseA, tip, baseB].map(xf),
  };
}
const BOARD = { page: '#0c0d10', pit: '#1c1f26' };
// The kangaroo's own colours (apps/app/src/components/Kangaroo.tsx): body fur for the fill,
// its outline brown for the rim, so the start mark reads as "the kangaroo stood here".
const KANGAROO = { fill: '#d9954f', rim: '#5a3515' };

function sketch(rows, width, label, box = 120) {
  const NS = 'http://www.w3.org/2000/svg';
  const h = rows.length, w = width || rows[0].length;
  const pad = 4, cell = Math.floor((box - 2 * pad) / Math.max(w, h)), gap = Math.max(1, Math.round(cell / 8));
  const lip = Math.max(1, Math.round(cell * 5 / 64));
  const W = w * cell + 2 * pad, H = h * cell + 2 * pad;
  const svg = document.createElementNS(NS, 'svg');
  const add = (parent, tag, attrs) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    parent.appendChild(e); return e;
  };
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('class', 'sketch');
  svg.setAttribute('width', W);
  svg.setAttribute('role', 'img');
  if (label) svg.setAttribute('aria-label', label);
  add(svg, 'rect', { width: W, height: H, rx: 6, fill: BOARD.pit });
  rows.forEach((row, y) => {
    for (let x = 0; x < w; x++) {
      const c = row[x] || '.';
      if (c === '.') continue;
      const kind = START_OF[c] || c;
      const t = ARROW_KEYS.includes(c) ? SIGNPOST : GATE_KEYS.includes(c) ? GATE : TILES[kind];
      if (!t) continue;
      const fx = pad + x * cell + gap / 2, fy = pad + y * cell + gap / 2;
      const fw = cell - gap, fh = cell - gap - lip, rx = Math.max(1, cell / 6);
      add(svg, 'rect', { x: fx, y: fy + lip, width: fw, height: fh, rx, fill: t.lip });
      add(svg, 'rect', { x: fx, y: fy, width: fw, height: fh, rx, fill: t.face });
      const direction = SIGNPOST_DIR[c] || GATE_DIR[c];
      if (direction) {
        const conv = ([px, py]) => [fx + px / 64 * fw, fy + py / 57 * fh];
        const fmt = (p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`;
        const m = bracketMark(direction, GATE_KEYS.includes(c));
        const thin = Math.max(0.75, 1.5 * fw / 64), thick = Math.max(1.2, 3 * fw / 64);
        for (const [p1, p2] of m.lines) {
          const [x1, y1] = conv(p1), [x2, y2] = conv(p2);
          add(svg, 'line', { x1, y1, x2, y2, stroke: t.mark, 'stroke-width': thin, 'stroke-linecap': 'round' });
        }
        const [x1, y1] = conv(m.shaft[0]), [x2, y2] = conv(m.shaft[1]);
        add(svg, 'line', { x1, y1, x2, y2, stroke: t.mark, 'stroke-width': thick, 'stroke-linecap': 'round' });
        add(svg, 'polygon', { fill: t.mark, points: m.head.map((p) => fmt(conv(p))).join(' ') });
        continue;
      }
      // strokes left to visit; the start is already visited once
      const n = TILES[kind].visits - (START_OF[c] ? 1 : 0);
      if (t.mark && n > 0) {
        for (let i = 0; i < n; i++) {
          const cx = fx + fw * (.5 + (i - (n - 1) / 2) * .22), cy = fy + fh / 2;
          add(svg, 'line', { x1: cx, x2: cx, y1: cy - fh * .25, y2: cy + fh * .25, stroke: t.mark,
            'stroke-width': Math.max(1, fw * .075), 'stroke-linecap': 'round', transform: `rotate(24 ${cx} ${cy})` });
        }
      }
      // the start: a kangaroo-brown dot with its own dark outline, centred on the tile
      if (START_OF[c]) {
        add(svg, 'circle', { cx: fx + fw / 2, cy: fy + fh / 2, r: Math.max(2.2, cell * .2), fill: KANGAROO.fill, stroke: KANGAROO.rim, 'stroke-width': Math.max(1, cell / 20) });
      }
    }
  });
  return svg;
}
const ARROW_KEYS = ['>', '<', '^', 'v'];
const GATE_KEYS = ['R', 'L', 'D', 'U'];
