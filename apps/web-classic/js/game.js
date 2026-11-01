// Pure game state and rules: no DOM here.
// A level is an array of strings:
//   .  empty     1  tile needing one visit     2  tile needing two visits
//   S  start on a 1-tile                        s  start on a 2-tile
// Coordinates: x is the column, y the row, both counted from the top-left.
//
// cells[i] is how many visits a tile still needs. The start tile counts as
// visited. Landing needs cells[i] > 0 and takes one off. A tile that reaches 0
// is used up: it stays under the player and drops away when they leave.
// The level is cleared when every cell is 0.

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

class Game {
  // `rules` is read live: { jumps }
  constructor(rows, rules = { jumps: true }) {
    this.rules = rules;
    this.h = rows.length;
    this.w = Math.max(...rows.map(r => r.length));
    this.max = new Uint8Array(this.w * this.h);
    this.start = -1;
    rows.forEach((row, y) => {
      for (let x = 0; x < this.w; x++) {
        const c = row[x] || '.', i = y * this.w + x;
        if (c === '1' || c === 'S') this.max[i] = 1;
        else if (c === '2' || c === 's') this.max[i] = 2;
        if (c === 'S' || c === 's') this.start = i;
      }
    });
    if (this.start < 0) throw new Error('level has no start');
    this.reset();
  }

  reset() {
    this.cells = Uint8Array.from(this.max);
    this.cells[this.start] -= 1;
    this.pos = this.start;
    this.history = [];
  }

  get x() { return this.pos % this.w; }
  get y() { return (this.pos / this.w) | 0; }
  get moves() { return this.history.length; }
  at(x, y) { return this.cells[y * this.w + x]; }

  remaining(cells = this.cells) {
    let n = 0;
    for (const v of cells) n += v;
    return n;
  }
  get won() { return this.remaining() === 0; }
  get stuck() { return !this.won && this.legalMoves().length === 0; }

  // Steps of one tile, plus jumps of two when the rule is on.
  legalMoves(cells = this.cells, pos = this.pos) {
    const px = pos % this.w, py = (pos / this.w) | 0;
    const out = [];
    for (const [dx, dy] of DIRS) {
      for (let d = 1; d <= (this.rules.jumps ? 2 : 1); d++) {
        const x = px + dx * d, y = py + dy * d;
        if (x < 0 || y < 0 || x >= this.w || y >= this.h) continue;
        if (cells[y * this.w + x] > 0) out.push({ x, y, jump: d === 2 });
      }
    }
    return out;
  }

  // Play a move from legalMoves().
  play(move) {
    this.history.push({ pos: this.pos, cells: Uint8Array.from(this.cells) });
    this.pos = move.y * this.w + move.x;
    this.cells[this.pos] -= 1;
  }

  undo() {
    const s = this.history.pop();
    if (!s) return false;
    this.pos = s.pos;
    this.cells = s.cells;
    return true;
  }

  // Moves that clear the level from here, or null. Dead positions are remembered.
  solve() {
    const dead = new Set(), path = [];
    const rec = (cells, pos) => {
      if (this.remaining(cells) === 0) return true;
      const k = pos + ':' + cells.join('');
      if (dead.has(k)) return false;
      for (const m of this.legalMoves(cells, pos)) {
        const next = Uint8Array.from(cells), i = m.y * this.w + m.x;
        next[i] -= 1;
        path.push(m);
        if (rec(next, i)) return true;
        path.pop();
      }
      dead.add(k);
      return false;
    };
    return rec(this.cells, this.pos) ? path : null;
  }

  // Number of solutions from the start, each subtree capped at `cap`.
  // Gives up and returns -1 after `budget` distinct positions.
  countSolutions(cap = 2, budget = Infinity) {
    const memo = new Map();
    const rec = (cells, pos) => {
      if (this.remaining(cells) === 0) return 1;
      const k = pos + ':' + cells.join('');
      if (memo.has(k)) return memo.get(k);
      if (memo.size > budget) return 0;
      let n = 0;
      for (const m of this.legalMoves(cells, pos)) {
        const next = Uint8Array.from(cells), i = m.y * this.w + m.x;
        next[i] -= 1;
        n = Math.min(cap, n + rec(next, i));
        if (n >= cap) break;
      }
      memo.set(k, n);
      return n;
    };
    const first = Uint8Array.from(this.max);
    first[this.start] -= 1;
    const n = rec(first, this.start);
    return memo.size > budget ? -1 : n;
  }
}

if (typeof module !== 'undefined') module.exports = { Game };
