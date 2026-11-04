#!/usr/bin/env node
// Serves tools/visualizers/ over plain HTTP, for anyone who'd rather open a localhost URL
// than the file:// page directly — both work, since CANGUPA-81 gave the pages their own
// inlined data and no server dependency. Zero third-party packages, on purpose, matching
// every other tools/ script.
//
//   node tools/serve-visualizer.js <port> <file> [--watch]
//
// <file> is just which page the printed URL points at; the whole tools/visualizers/
// directory is served regardless, since both pages load tiles.js as a sibling file.
//
// --watch regenerates level-packs.html/level-difficulty.html (via gen-visualizers.js)
// whenever tools/packs.json or a *.template.html changes, and live-reloads any open tab
// over SSE whenever that happens or tiles.js changes. The reload script is only spliced
// into the HTTP response, never written to the files on disk, so the served files stay
// exactly what gen-visualizers.js wrote (and exactly what file:// opens without a server).
const http = require('http');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const watch = args.includes('--watch');
const [portArg, fileArg] = args.filter((a) => a !== '--watch');
const port = Number(portArg);
const file = fileArg || 'level-packs.html';
if (!port) {
  console.error('usage: node tools/serve-visualizer.js <port> <file> [--watch]');
  process.exit(1);
}

const ROOT = path.join(__dirname, 'visualizers');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };
const RELOAD_SCRIPT = '<script>new EventSource("/__events").onmessage = () => location.reload();</script>';

const clients = new Set();
const broadcast = () => clients.forEach((res) => res.write('data: reload\n\n'));

const server = http.createServer((req, res) => {
  if (watch && req.url === '/__events') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    res.write('\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }
  const reqPath = decodeURIComponent(req.url.split('?')[0]);
  const target = path.join(ROOT, reqPath === '/' ? file : reqPath);
  if (!target.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end();
  }
  fs.readFile(target, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end('not found');
    }
    const isHtml = path.extname(target) === '.html';
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(target)] || 'application/octet-stream' });
    res.end(watch && isHtml ? data + RELOAD_SCRIPT : data);
  });
});

server.listen(port, () => console.log(`${file}: http://localhost:${port}/${watch ? ' (watching)' : ''}`));

if (watch) {
  const { writeVisualizers } = require('./gen-visualizers.js');
  const PACKS_JSON = path.join(__dirname, 'packs.json');
  const regenerate = () => {
    try {
      const { packs } = JSON.parse(fs.readFileSync(PACKS_JSON, 'utf8'));
      writeVisualizers(packs);
    } catch (e) {
      console.error('watch: regeneration failed, left the last good pages in place:', e.message);
    }
  };

  // Editors often fire several change events per save; wait for them to settle.
  const debounced = new Map();
  const onChange = (watched, regenerateFirst) => (eventType, filename) => {
    clearTimeout(debounced.get(watched));
    debounced.set(watched, setTimeout(() => {
      console.log(`watch: ${filename || watched} changed`);
      if (regenerateFirst) regenerate();
      broadcast();
    }, 150));
  };
  fs.watch(PACKS_JSON, onChange('packs.json', true));
  fs.watch(path.join(ROOT, 'level-packs.template.html'), onChange('level-packs.template.html', true));
  fs.watch(path.join(ROOT, 'level-difficulty.template.html'), onChange('level-difficulty.template.html', true));
  fs.watch(path.join(ROOT, 'tiles.js'), onChange('tiles.js', false));
}
