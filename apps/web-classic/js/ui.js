const $ = id => document.getElementById(id);
const boardEl = $('board');
let settings = Settings.load();
Sound.enabled = settings.sound;
let progress = Progress.load();
let game, levelIndex = 0, tip = null;
let cellEls = [], roo = null, face = { dir: 'down', left: false };
let falling = false; // mid fall-and-restart animation (settings.fall), ignore input until it settles

function loadLevel(n) {
  levelIndex = Math.max(0, Math.min(LEVELS.length - 1, n));
  progress.level = levelIndex;
  Progress.save(progress);
  game = new Game(LEVELS[levelIndex], settings);
  tip = null;
  face = { dir: 'down', left: false };
  build();
}

// Position of a cell, as percentages of its own size (used for translate).
const cellPos = (x, y) => ({ x: x * 100, y: y * 100 });

function build() {
  document.body.dataset.theme = settings.theme;
  boardEl.style.setProperty('--w', game.w);
  boardEl.style.setProperty('--h', game.h);
  boardEl.classList.toggle('no-anim', !settings.anim);
  boardEl.innerHTML = '';
  cellEls = [];
  for (let i = 0; i < game.max.length; i++) {
    if (!game.max[i]) { cellEls.push(null); continue; }
    const x = i % game.w, y = (i / game.w) | 0;
    const el = document.createElement('div');
    el.className = 'cell';
    el.dataset.x = x; el.dataset.y = y;
    el.style.left = x * 100 / game.w + '%';
    el.style.top = y * 100 / game.h + '%';
    el.innerHTML = '<div class="tile"></div>';
    boardEl.appendChild(el);
    cellEls.push(el);
  }
  roo = document.createElement('div');
  roo.id = 'roo';
  const sprite = name => ROO[name].replace('<svg', `<svg class="${name}"`);
  roo.innerHTML = '<span class="shadow"></span><span class="hopper"><span class="flip">' +
    sprite('side') + sprite('front') + sprite('back') + '</span></span>';
  boardEl.appendChild(roo);
  render(false);
}

function render(hop = true) {
  document.body.dataset.theme = settings.theme;
  boardEl.classList.toggle('no-anim', !settings.anim);
  const moves = game.legalMoves();
  const targets = new Map(moves.map(m => [m.y * game.w + m.x, m]));
  const tipI = tip ? tip.y * game.w + tip.x : -1;
  cellEls.forEach((el, i) => {
    if (!el) return;
    const left = game.cells[i], two = game.max[i] === 2;
    const tile = el.firstChild;
    tile.className = 'tile' + (two ? ' two' : '') +
      (two && left === 1 ? ' cracked' : '') +
      (left === 0 && i === game.pos ? ' worn' : '') +
      (left === 0 && i !== game.pos ? ' gone' : '');
    const t = targets.get(i);
    el.className = 'cell' + (t && settings.hints ? ' hint' + (t.jump ? ' jump' : '') : '') + (i === tipI ? ' tip' : '');
  });
  const p = cellPos(game.x, game.y);
  roo.style.transform = `translate(${p.x}%, ${p.y}%)`;
  roo.dataset.face = face.dir === 'up' ? 'back' : face.dir === 'down' ? 'front' : 'side';
  roo.querySelector('.flip').classList.toggle('left', face.left);
  if (hop && settings.anim && roo.animate) {
    roo.querySelector('.hopper').animate(
      [{ transform: 'translateY(0)' }, { transform: 'translateY(-40%)' }, { transform: 'translateY(0)' }],
      { duration: 240, easing: 'ease-out' });
  }

  const left = game.remaining();
  $('prev').disabled = levelIndex === 0;
  $('next').disabled = levelIndex >= LEVELS.length - 1 || !progress.done.includes(levelIndex);
  $('undo').disabled = !game.history.length;
  const head = `Nível ${levelIndex + 1}/${LEVELS.length} · Jogadas ${game.moves} · Faltam ${left}`;
  if (game.won) {
    $('status').innerHTML = `<strong>Nível completo!</strong> <span class="muted">em ${game.moves} jogadas</span>` +
      (levelIndex < LEVELS.length - 1 ? ' <button id="go-next" class="primary">Próximo nível</button>' : ' · Acabaste o jogo!');
    const b = $('go-next'); if (b) b.onclick = () => loadLevel(levelIndex + 1);
  } else if (game.stuck) {
    $('status').innerHTML = `${head} · <strong>Sem jogadas.</strong> <span class="muted">Desfaz ou reinicia.</span>`;
  } else {
    $('status').textContent = head;
  }
  renderLevels();
}

function renderLevels() {
  const grid = $('level-grid');
  if (grid.children.length !== LEVELS.length) {
    grid.innerHTML = '';
    LEVELS.forEach((_, i) => {
      const b = document.createElement('button');
      b.textContent = i + 1;
      b.onclick = () => loadLevel(i);
      grid.appendChild(b);
    });
  }
  [...grid.children].forEach((b, i) => {
    b.className = (progress.done.includes(i) ? 'done' : '') + (i === levelIndex ? ' current' : '');
    // A level is open once the one before it is cleared.
    b.disabled = i > 0 && !progress.done.includes(i - 1) && !progress.done.includes(i);
  });
}

// Shared by move() and fall(): a mostly-horizontal step/jump faces sideways
// (mirrored when heading left); anything else faces up (back) or down (front).
function faceFor(dx, dy) {
  return Math.abs(dx) >= Math.abs(dy) && dx ? { dir: 'side', left: dx < 0 } : { dir: dy < 0 ? 'up' : 'down', left: false };
}

function move(m) {
  if (game.won || !m) return;
  tip = null;
  face = faceFor(m.x - game.x, m.y - game.y);
  game.play(m);
  Sound.jump();
  if (game.won) {
    Sound.win();
    if (!progress.done.includes(levelIndex)) {
      progress.done.push(levelIndex);
      Progress.save(progress);
    }
  }
  render();
}

boardEl.addEventListener('click', e => {
  if (falling) return;
  const cell = e.target.closest('.cell');
  const dest = cell && game.legalMoves().find(mv => mv.x === +cell.dataset.x && mv.y === +cell.dataset.y);
  if (dest) { move(dest); return; }
  // No `.cell` at all (board background between tiles) or a cell with no
  // legal move both count as "empty space" here — tapping either one only
  // does something once falling is turned on. A cell gives fall() a target
  // to jump toward (CANGUPA-64); true background has none.
  if (settings.fall) fall(cell && { x: +cell.dataset.x, y: +cell.dataset.y });
});

// Arrow / WASD: a step if one is possible that way, else a jump. Shift forces a jump.
const KEYDIR = { ArrowRight: [1, 0], d: [1, 0], ArrowLeft: [-1, 0], a: [-1, 0], ArrowDown: [0, 1], s: [0, 1], ArrowUp: [0, -1], w: [0, -1] };
function undo() { if (game.undo()) { tip = null; render(false); } }
function reset() { game.reset(); tip = null; render(false); }

// Falling (opt-in, settings.fall): nowhere to land, so the level restarts
// instead of the move being a no-op. A target cell (CANGUPA-64) gets the
// same jump a real move plays — translate transition plus hop bounce —
// before the sink starts, so it reads as "there was nothing there to land
// on" instead of stumbling in place; a target-less fall (true background,
// no cell to jump to) sinks right where the kangaroo already stands, as
// it always has. No render() here: it would reset #roo's transform back
// to game.x/y, undoing the jump just set below — the final position is
// restored by reset()'s own render() once the fall completes.
function fall(target) {
  if (game.won || falling) return;
  falling = true;
  if (target) {
    face = faceFor(target.x - game.x, target.y - game.y);
    const p = cellPos(target.x, target.y);
    roo.style.transform = `translate(${p.x}%, ${p.y}%)`;
    roo.dataset.face = face.dir === 'up' ? 'back' : face.dir === 'down' ? 'front' : 'side';
    roo.querySelector('.flip').classList.toggle('left', face.left);
    Sound.jump();
    if (settings.anim && roo.animate) {
      roo.querySelector('.hopper').animate(
        [{ transform: 'translateY(0)' }, { transform: 'translateY(-40%)' }, { transform: 'translateY(0)' }],
        { duration: 240, easing: 'ease-out' });
    }
  }
  const jumpMs = target && settings.anim ? 240 : 0;
  setTimeout(() => {
    boardEl.classList.add('falling');
    Sound.fall();
    setTimeout(() => {
      boardEl.classList.remove('falling');
      falling = false;
      reset();
    }, 500);
  }, jumpMs);
}
function hint() {
  if (game.won) return;
  const path = game.solve();
  if (!path) { $('status').innerHTML = '<strong>Beco sem saída.</strong> <span class="muted">Desfaz algumas jogadas.</span>'; return; }
  tip = path[0];
  render(false);
}
function next() { if (!$('next').disabled) loadLevel(levelIndex + 1); }

document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey || /^(SELECT|INPUT)$/.test(e.target.tagName)) return;
  if (falling) return;
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  const d = KEYDIR[k];
  if (d) {
    e.preventDefault();
    const moves = game.legalMoves();
    const at = n => moves.find(m => m.x === game.x + d[0] * n && m.y === game.y + d[1] * n);
    const m = e.shiftKey ? at(2) : at(1) || at(2);
    if (m) move(m);
    else if (settings.fall) {
      // The cell one step in the pressed direction, if it's inside the
      // board's bounding box — a target for fall() to jump toward, same as
      // a tapped cell. Past the edge, there's nothing there to jump to.
      const tx = game.x + d[0], ty = game.y + d[1];
      fall(tx >= 0 && tx < game.w && ty >= 0 && ty < game.h ? { x: tx, y: ty } : undefined);
    }
  } else if (k === 'z' || k === 'Backspace') undo();
  else if (k === 'r') reset();
  else if (k === 'h') hint();
  else if (k === 'n') next();
});

$('undo').onclick = undo;
$('reset').onclick = reset;
$('hint').onclick = hint;
$('prev').onclick = () => loadLevel(levelIndex - 1);
$('next').onclick = next;
for (const [btn, panel] of [['toggle-levels', 'levels'], ['toggle-help', 'help'], ['toggle-settings', 'settings']]) {
  $(btn).onclick = () => { $(panel).hidden = !$(panel).hidden; };
}
$('clear-progress').onclick = () => {
  if (!confirm('Apagar todo o progresso?')) return;
  progress = { done: [], level: 0 };
  Progress.save(progress);
  loadLevel(0);
};

// Settings wiring
const fields = { theme: 's-theme', jumps: 's-jumps', hints: 's-hints', anim: 's-anim', fall: 's-fall', sound: 's-sound' };
for (const [key, id] of Object.entries(fields)) {
  const el = $(id), isCheck = el.type === 'checkbox';
  isCheck ? (el.checked = settings[key]) : (el.value = settings[key]);
  el.onchange = () => {
    settings[key] = isCheck ? el.checked : el.value;
    Settings.save(settings);
    if (key === 'sound') Sound.enabled = settings.sound;
    // A rule change can invalidate the current position, so restart the level.
    key === 'jumps' ? reset() : render(false);
  };
}

loadLevel(progress.level);
