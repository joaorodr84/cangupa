#!/usr/bin/env node
// Writes tools/levels-difficulty.json: every level in apps/web-classic/js/levels.js with its
// difficulty metrics (see difficulty.js). No visualizer page reads this file — apps/app's
// packs have one (tools/visualizers/, fed from tools/packs.json); this is apps/web-classic's
// original 50, kept as data for scripting/analysis.
//
//   node tools/export-difficulty.js [--out FILE]
//
// `bits` is null for levels whose state space is over the budget; the other
// metrics are filled in for every level.
const fs = require('fs');
const path = require('path');
const { Game } = require('../apps/web-classic/js/game.js');
const { LEVELS } = require('../apps/web-classic/js/levels.js');
const { measure, search, randomPlay } = require('./difficulty.js');

const outFlag = process.argv.indexOf('--out');
const out = outFlag > 0 ? process.argv[outFlag + 1] : path.join(__dirname, 'levels-difficulty.json');
const round = (v, d) => v == null || !Number.isFinite(v) ? null : Number(v.toFixed(d));

const levels = LEVELS.map((rows, i) => {
  const g = new Game(rows);
  const exact = measure(rows, { budget: 300000 }), s = search(rows), p = randomPlay(rows);
  return {
    level: i + 1,
    rows,
    width: g.w, height: g.h,
    tiles: g.max.filter(Boolean).length,
    visits: g.max.reduce((a, b) => a + b, 0),
    doubles: g.max.filter(v => v === 2).length,
    pathBits: round(s && s.pathBits, 1),
    decisions: s ? s.decisions : null,
    effort: s ? s.effort : null,
    survival: round(p.survival, 3),
    bits: round(exact && exact.bits, 1),
    solutions: exact ? exact.solutions : null,
    trapRatio: round(exact && exact.trapRatio, 3),
  };
});

fs.writeFileSync(out, JSON.stringify({ generated: new Date().toISOString().slice(0, 10), levels }, null, 1) + '\n');
console.log(`wrote ${levels.length} levels to ${path.relative(process.cwd(), out)}`);
