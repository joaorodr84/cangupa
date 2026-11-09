#!/usr/bin/env node
// Builds tools/packs.json (and apps/app/src/game/packs.ts) from tools/pack-plan.js, then
// regenerates tools/visualizers/{level-packs,level-difficulty}.html so they never go stale.
//
//   node tools/gen-packs.js                 build every pack, measuring pools in parallel
//   node tools/gen-packs.js --reselect      reuse cached pools, redo only the picking
//   node tools/gen-packs.js --seed N        base random seed        (default 1000)
//   node tools/gen-packs.js --scale X       multiply every pool size (default 1; 0.1 for a quick look)
//   node tools/gen-packs.js --jobs N        packs measured at once  (default CPU count)
//
// Measuring is the slow part (minutes for the big boards), so the pools are cached in
// tools/.cache/ and --reselect skips them. Pool n uses seed + n, so a run is reproducible.
const fs = require('fs');
const crypto = require('crypto');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const { PACKS, LEVELS_PER_PACK, OVERLAP } = require('./pack-plan.js');
const { buildPool, pick, pickAlternating, quantile, canonical, fillsBox, score, hasGold, hasSteel, hasArrow, hasArrival } = require('./pack-generator.js');
const { designs } = require('./pack-designs.js');
const { writeVisualizers } = require('./gen-visualizers.js');

// How many designed layouts (pack-designs.js) each pack takes, when enough are valid.
const DESIGNED_PER_PACK = 6;
// A pack that introduces a tile (its plan entry's `intro`) opens with this many levels that do not
// have it, so the pack starts gently. Every level after them is at least as hard as the last of those.
const INTRO_PLAIN = 4;
const INTRO_KIND = { gold: hasGold, steel: hasSteel, arrow: hasArrow, arrival: hasArrival };
const CACHE = path.join(__dirname, '.cache');
const OUT_JSON = path.join(__dirname, 'packs.json');
const OUT_TS = path.join(__dirname, '../apps/app/src/game/packs.ts');

const args = process.argv.slice(2);
const opt = (name, d) => { const i = args.indexOf('--' + name); return i < 0 ? d : args[i + 1]; };
const seed = Number(opt('seed', 1000)), scale = Number(opt('scale', 1));
// The cache name includes a hash of the pack's plan entry, so changing a pack's size or
// ranges in pack-plan.js never reuses a pool measured for the old plan.
const planHash = i => crypto.createHash('md5').update(JSON.stringify(PACKS[i])).digest('hex').slice(0, 8);
const poolFile = i => path.join(CACHE, `pool-${i}-${planHash(i)}-s${seed}-x${scale}.json`);

// worker: measure one pack's pool and write it to the cache
if (args.includes('--worker')) {
  const i = Number(opt('worker'));
  const count = Math.max(LEVELS_PER_PACK * 3, Math.round(PACKS[i].pool * scale));
  const pool = buildPool(PACKS[i], { seed: seed + i, count });
  fs.mkdirSync(CACHE, { recursive: true });
  fs.writeFileSync(poolFile(i), JSON.stringify(pool));
  console.log(`pack ${i + 1} ${PACKS[i].name}: ${pool.length} candidates`);
  process.exit(0);
}

function measureAll() {
  const jobs = Number(opt('jobs', os.cpus().length));
  // biggest boards first: they take longest, so they should not start last
  const queue = PACKS.map((_, i) => i).filter(i => !PACKS[i].frozen && !fs.existsSync(poolFile(i))).reverse();
  return new Promise((resolve, reject) => {
    let running = 0;
    const next = () => {
      if (!queue.length) return running === 0 && resolve();
      while (running < jobs && queue.length) {
        const i = queue.shift();
        running++;
        const child = spawn(process.execPath, [__filename, '--worker', String(i), '--seed', String(seed), '--scale', String(scale)], { stdio: 'inherit' });
        child.on('exit', code => { running--; code ? reject(new Error(`pack ${i + 1} failed`)) : next(); });
      }
    };
    next();
  });
}

// Each pack climbs from `lo` to `hi`. hi is the pool's 97th percentile score (the top 3%
// are outliers that would stretch the ramp). lo starts at the pool's 3rd percentile but
// never below OVERLAP (pack-plan.js) of the previous pack's hi, so each pack starts where
// the last one was getting hard and the whole game only goes up. A frozen pack is taken as
// it is from `frozen` (the packs.json being replaced), and the pack before one is held so it
// cannot outgrow it: its hi stays under the frozen pack's easiest level divided by OVERLAP.
function select(pools, frozen) {
  let prevHi = 0;
  return PACKS.map((spec, i) => {
    if (spec.frozen) {
      const kept = frozen[i];
      if (!kept || kept.name !== spec.name) throw new Error(`pack ${i + 1} ${spec.name} is frozen but not in the current packs.json`);
      prevHi = kept.levels[kept.levels.length - 1].pathBits;
      return kept;
    }
    const scores = pools[i].map(p => p.pathBits).sort((a, b) => a - b);
    let hi = quantile(scores, .97);
    const next = PACKS[i + 1] && PACKS[i + 1].frozen ? frozen[i + 1].levels[0].pathBits : null;
    if (next !== null) hi = Math.min(hi, next / OVERLAP);
    const lo = Math.min(Math.max(quantile(scores, .03), prevHi * OVERLAP), hi * .9);

    // Designed layouts first: they are kept as long as the solver and the pack rules
    // accept them, spread across the pack's range, and the generated levels fill the rest.
    const seen = new Set();
    const made = designs(spec.width, spec.height, { jumps: spec.jump[1] > 0 })
      .filter(d => fillsBox(d.rows) && !seen.has(canonical(d.rows)) && seen.add(canonical(d.rows)))
      .map(d => { const m = score(d.rows); return m && { ...m, designed: d.label }; })
      .filter(Boolean)
      .filter(d => d.pathBits >= lo - 1e-9 && d.pathBits <= hi + 1e-9)
      .sort((a, b) => a.pathBits - b.pathBits);
    // (a pack with `designed: false` takes none: its levels must each have the tiles the pack lists)
    const designedCount = spec.designed === false ? 0 : Math.min(DESIGNED_PER_PACK, made.length);
    const kept = [];
    for (let k = 0; k < designedCount; k++) {
      kept.push(made[Math.round(k * (made.length - 1) / Math.max(1, designedCount - 1))]);
    }
    const keptKeys = new Set(kept.map(d => canonical(d.rows)));
    const rest = pools[i].filter(p => !keptKeys.has(canonical(p.rows)));

    // Levels the pack teaches with have every kind it lists (`full`); a pack that introduces a tile
    // opens with INTRO_PLAIN levels that lack it.
    const introKind = spec.intro && INTRO_KIND[spec.intro];
    const hasNew = p => (introKind ? introKind(p.rows) : true);
    let intro = [], pool = rest.filter(p => p.full);
    if (introKind) {
      intro = pick(rest.filter(p => !hasNew(p)), INTRO_PLAIN, lo, lo + (hi - lo) * .15) || [];
      const introMax = Math.max(...intro.map(p => p.pathBits));
      const introKeys = new Set(intro.map(p => canonical(p.rows)));
      pool = pool.filter(p => !introKeys.has(canonical(p.rows)) && p.pathBits >= introMax);
    }
    const need = LEVELS_PER_PACK - kept.length - intro.length;
    const from = intro.length ? Math.max(lo, Math.max(...intro.map(p => p.pathBits))) : lo;
    // a pack with `mixes` alternates its variants and keeps that order; otherwise levels are sorted easiest first
    if (spec.mixes) {
      const ordered = pickAlternating(spec.mixes.map((_, v) => pool.filter(p => p.mix === v)), need, from, hi);
      if (!ordered) throw new Error(`pack ${i + 1} ${spec.name}: the variants ran out of candidates before ${need} levels`);
      prevHi = hi;
      return { name: spec.name, blurb: spec.blurb, width: spec.width, height: spec.height, levels: ordered };
    }
    const generated = pick(pool, need, from, hi);
    if (!generated) throw new Error(`pack ${i + 1} ${spec.name}: only ${pool.length} candidates, need ${need}`);
    const levels = [...intro, ...generated, ...kept].sort((a, b) => a.pathBits - b.pathBits || (introKind ? hasNew(a) - hasNew(b) : 0) || a.decisions - b.decisions || a.visits - b.visits);
    prevHi = hi;
    return { name: spec.name, blurb: spec.blurb, width: spec.width, height: spec.height, levels };
  });
}

function writeTs(packs) {
  const lines = [
    '// Generated by tools/gen-packs.js from tools/packs.json. Do not edit by hand.',
    "import { type Level } from './board';",
    '',
    'export type Pack = { name: string; blurb: string; width: number; height: number; levels: readonly Level[] };',
    '',
    'export const PACKS: readonly Pack[] = [',
  ];
  for (const p of packs) {
    lines.push('  {', `    name: ${JSON.stringify(p.name)},`, `    blurb: ${JSON.stringify(p.blurb)},`,
      `    width: ${p.width},`, `    height: ${p.height},`, '    levels: [');
    for (const l of p.levels) lines.push(`      ${JSON.stringify(l.rows).replace(/"/g, "'").replace(/,/g, ', ')},`);
    lines.push('    ],', '  },');
  }
  lines.push('];', '');
  fs.writeFileSync(OUT_TS, lines.join('\n'));
}

(async () => {
  if (!args.includes('--reselect')) await measureAll();
  const pools = PACKS.map((spec, i) => spec.frozen ? null : JSON.parse(fs.readFileSync(poolFile(i), 'utf8')));
  // the packs.json being replaced: where the frozen packs come from
  const frozen = fs.existsSync(OUT_JSON) ? JSON.parse(fs.readFileSync(OUT_JSON, 'utf8')).packs : [];
  const packs = select(pools, frozen);
  fs.writeFileSync(OUT_JSON, JSON.stringify({ seed, packs }, null, 1) + '\n');
  writeTs(packs);
  writeVisualizers(packs);
  packs.forEach((p, i) => {
    const s = p.levels.map(l => l.pathBits);
    console.log(`${String(i + 1).padStart(2)} ${p.name.padEnd(10)} ${p.width}x${p.height} pool ${pools[i] ? String(pools[i].length).padStart(4) : 'kept'}  pathBits ${s[0]} .. ${s[s.length - 1]}`);
  });
})().catch(e => { console.error(e.message); process.exit(1); });
