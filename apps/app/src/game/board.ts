// Pure game state and rules, ported from apps/web-classic/js/game.js. No React/RN here.
// A level is an array of strings:
//   .  empty     1  tile needing one visit     2  tile needing two visits     3  tile needing three visits
//   S  start on a 1-tile      s  start on a 2-tile      T  start on a 3-tile
//   > < v ^   a Departure tile: needs one visit, and can only be LEFT in the way it points
//             (steps and jumps alike). Never the start tile.
//   R L D U   an Arrival tile (CANGUPA-104): needs one visit, and can only be ENTERED by moving in
//             that direction (steps and jumps alike) — the mirror of a Departure's restriction,
//             checked on arrival instead of on departure. Never the start tile.
// Coordinates: x is the column, y the row, both counted from the top-left.
//
// cells[i] is how many visits a tile still needs. The start tile counts as
// visited. Landing needs cells[i] > 0 and takes one off. A tile that reaches 0
// is used up: it stays under the player and drops away when they leave.
// The level is cleared when every cell is 0.

export type Level = readonly string[];

export interface Move {
  readonly x: number;
  readonly y: number;
  readonly jump: boolean;
}

interface HistoryEntry {
  readonly pos: number;
  readonly cells: Uint8Array;
}

const DIRS: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];
// the Departure characters, in the same order as DIRS: right, left, down, up
const ARROWS = '><v^';
// the Arrival characters, in the same order as DIRS: entered moving right, left, down, up
const ARRIVALS = 'RLDU';

export class Game {
  readonly w: number;
  readonly h: number;
  readonly max: Uint8Array;
  // which way a Departure tile points, as an index into DIRS; -1 for any other tile
  readonly dir: Int8Array;
  // the direction of travel an Arrival tile must be entered by, as an index into DIRS; -1 otherwise
  readonly arrival: Int8Array;
  readonly start: number;
  cells!: Uint8Array;
  pos!: number;
  private history!: HistoryEntry[];

  constructor(rows: Level) {
    this.h = rows.length;
    this.w = Math.max(...rows.map((r) => r.length));
    this.max = new Uint8Array(this.w * this.h);
    this.dir = new Int8Array(this.w * this.h).fill(-1);
    this.arrival = new Int8Array(this.w * this.h).fill(-1);
    let start = -1;
    rows.forEach((row, y) => {
      for (let x = 0; x < this.w; x++) {
        const c = row[x] || '.';
        const i = y * this.w + x;
        if (c === '1' || c === 'S') this.max[i] = 1;
        else if (c === '2' || c === 's') this.max[i] = 2;
        else if (c === '3' || c === 'T') this.max[i] = 3;
        else if (ARROWS.includes(c)) {
          this.max[i] = 1;
          this.dir[i] = ARROWS.indexOf(c);
        } else if (ARRIVALS.includes(c)) {
          this.max[i] = 1;
          this.arrival[i] = ARRIVALS.indexOf(c);
        }
        if (c === 'S' || c === 's' || c === 'T') start = i;
      }
    });
    if (start < 0) throw new Error('level has no start');
    this.start = start;
    this.reset();
  }

  reset(): void {
    this.cells = Uint8Array.from(this.max);
    this.cells[this.start] -= 1;
    this.pos = this.start;
    this.history = [];
  }

  get x(): number {
    return this.pos % this.w;
  }

  get y(): number {
    return (this.pos / this.w) | 0;
  }

  get moves(): number {
    return this.history.length;
  }

  at(x: number, y: number): number {
    return this.cells[y * this.w + x];
  }

  remaining(cells: Uint8Array = this.cells): number {
    let n = 0;
    for (const v of cells) n += v;
    return n;
  }

  get won(): boolean {
    return this.remaining() === 0;
  }

  get stuck(): boolean {
    return !this.won && this.legalMoves().length === 0;
  }

  // Steps of one tile, plus jumps of two. Standing on a Departure tile, only
  // the way it points; landing on an Arrival tile, only moving the way it opens.
  legalMoves(cells: Uint8Array = this.cells, pos: number = this.pos): Move[] {
    const px = pos % this.w;
    const py = (pos / this.w) | 0;
    const out: Move[] = [];
    for (let k = 0; k < DIRS.length; k++) {
      if (this.dir[pos] >= 0 && k !== this.dir[pos]) continue;
      const [dx, dy] = DIRS[k];
      for (let d = 1; d <= 2; d++) {
        const x = px + dx * d;
        const y = py + dy * d;
        if (x < 0 || y < 0 || x >= this.w || y >= this.h) continue;
        const i = y * this.w + x;
        if (this.arrival[i] >= 0 && k !== this.arrival[i]) continue;
        if (cells[i] > 0) out.push({ x, y, jump: d === 2 });
      }
    }
    return out;
  }

  // Whether (x, y) sits where a step or jump could land from `pos` — same
  // geometry as legalMoves(), minus the "is there actually a tile" check.
  // Lets PlayableBoard tell a real move attempt (e.g. a step/jump onto a
  // worn or missing tile) from an arbitrary tap elsewhere on the board.
  inMoveShape(x: number, y: number, pos: number = this.pos): boolean {
    const px = pos % this.w;
    const py = (pos / this.w) | 0;
    const dx = x - px;
    const dy = y - py;
    if (dx !== 0 && dy !== 0) return false;
    const d = Math.abs(dx || dy);
    return d >= 1 && d <= 2;
  }

  // Play a move from legalMoves().
  play(move: Pick<Move, 'x' | 'y'>): void {
    this.history.push({ pos: this.pos, cells: Uint8Array.from(this.cells) });
    this.pos = move.y * this.w + move.x;
    this.cells[this.pos] -= 1;
  }

  undo(): boolean {
    const s = this.history.pop();
    if (!s) return false;
    this.pos = s.pos;
    this.cells = s.cells;
    return true;
  }

  // Moves that clear the level from here, or null. Dead positions are remembered.
  solve(): Move[] | null {
    const dead = new Set<string>();
    const path: Move[] = [];
    const rec = (cells: Uint8Array, pos: number): boolean => {
      if (this.remaining(cells) === 0) return true;
      const k = pos + ':' + cells.join('');
      if (dead.has(k)) return false;
      for (const m of this.legalMoves(cells, pos)) {
        const next = Uint8Array.from(cells);
        const i = m.y * this.w + m.x;
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
  countSolutions(cap = 2, budget = Infinity): number {
    const memo = new Map<string, number>();
    const rec = (cells: Uint8Array, pos: number): number => {
      if (this.remaining(cells) === 0) return 1;
      const k = pos + ':' + cells.join('');
      const memoized = memo.get(k);
      if (memoized !== undefined) return memoized;
      if (memo.size > budget) return 0;
      let n = 0;
      for (const m of this.legalMoves(cells, pos)) {
        const next = Uint8Array.from(cells);
        const i = m.y * this.w + m.x;
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
