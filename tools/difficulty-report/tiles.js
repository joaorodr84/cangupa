// Draws a level the way the game does: same tile colours, same marks, on the dark board.
// Shared by index.html and packs.html. Colours are the game's (apps/app/src/theme/palette.ts);
// they are the same in its light and dark themes, so only the board is themed, and this
// report is dark only. The old teal scheme knew two tile colours; Steel and the arrow tiles
// came in with CANGUPA-68 and CANGUPA-69 and drew as plain Common tiles until now.
const TILES = {
  '1': { face: '#4cc9f0', lip: '#1f7a99', visits: 1 },
  '2': { face: '#ffc857', lip: '#a8741a', mark: '#3b2a06', visits: 2 },
  '3': { face: '#587790', lip: '#3c5162', mark: '#ffffff', visits: 3 },
};
const START_OF = { S: '1', s: '2', T: '3' };
const ARROW = { face: '#9d1057', lip: '#ba5889', mark: '#ffffff' };
// Edge triangles in the app's 64x57 face coordinates, one per direction the tile can be left.
const EDGE = {
  '>': [[45, 14.5], [59.5, 28.5], [45, 42.5]], '<': [[19, 14.5], [4.5, 28.5], [19, 42.5]],
  '^': [[18, 19], [32, 4.5], [46, 19]], 'v': [[18, 38], [32, 52.5], [46, 38]],
};
const BOARD = { page: '#0c0d10', pit: '#1c1f26', start: '#e6e8ec' };

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
      const t = ARROW_KEYS.includes(c) ? ARROW : TILES[kind];
      if (!t) continue;
      const fx = pad + x * cell + gap / 2, fy = pad + y * cell + gap / 2;
      const fw = cell - gap, fh = cell - gap - lip, rx = Math.max(1, cell / 6);
      add(svg, 'rect', { x: fx, y: fy + lip, width: fw, height: fh, rx, fill: t.lip });
      add(svg, 'rect', { x: fx, y: fy, width: fw, height: fh, rx, fill: t.face });
      if (EDGE[c]) {
        add(svg, 'polygon', { fill: t.mark, points: EDGE[c].map(([px, py]) => `${(fx + px / 64 * fw).toFixed(2)},${(fy + py / 57 * fh).toFixed(2)}`).join(' ') });
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
      // the start: a white dot with a dark rim in the corner, readable on all three tile colours
      if (START_OF[c]) {
        add(svg, 'circle', { cx: fx + fw * .2, cy: fy + fh * .24, r: Math.max(1.5, cell * .13), fill: BOARD.start, stroke: BOARD.page, 'stroke-width': Math.max(.8, cell / 24) });
      }
    }
  });
  return svg;
}
const ARROW_KEYS = ['>', '<', '^', 'v'];
