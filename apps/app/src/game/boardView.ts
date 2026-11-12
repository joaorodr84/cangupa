// Pure, React-free view derived from a Game, ported from the tile-class and
// facing logic in apps/web-classic/js/ui.js's render() and move(). No
// touch/keyboard handling here — see useBoard.ts for that.
import { type Game, type Move } from './board';
import { type Face } from '../components/Kangaroo';

export type ArrowDirection = 'right' | 'left' | 'down' | 'up';
// Game's arrow directions are an index into its DIRS: right, left, down, up.
const ARROW_DIRECTIONS: readonly ArrowDirection[] = ['right', 'left', 'down', 'up'];

export interface TileView {
  readonly x: number;
  readonly y: number;
  // Needs two visits rather than one.
  readonly double: boolean;
  // A double tile with its first visit spent: one crack, one visit left.
  readonly cracked: boolean;
  // How many visits the tile needs when whole: 1 Common, 2 Gold (double), 3 Steel.
  readonly kind: 1 | 2 | 3;
  // Visits still left, the number the strokes on a Gold or Steel tile show.
  readonly left: number;
  // The way an arrow (Departure) tile can be left, or null for any other tile.
  readonly arrow: ArrowDirection | null;
  // The one side an Arrival tile (CANGUPA-104) can be entered from, or null for any other tile —
  // the mirror of `arrow`: the opposite edge from the direction of travel Game.arrival actually
  // stores, since that's the side the triangle mark (and the player) reads as "open".
  readonly arrival: ArrowDirection | null;
  // Used up and the kangaroo is standing on it.
  readonly worn: boolean;
  // Used up and the kangaroo has moved off it: it has dropped away.
  readonly gone: boolean;
  // A legal destination from here, shown when the hints setting is on.
  readonly hint: boolean;
  // The hint is a jump rather than a step.
  readonly jump: boolean;
  // The solver's suggested next move (from the hint button), pulsed.
  readonly tip: boolean;
}

export interface TilesOptions {
  readonly hints: boolean;
  readonly tip?: Move | null;
}

// One entry per tile that exists on the board (ports the `if (!game.max[i])
// continue` skip in ui.js's build()/render(), so an empty cell renders nothing).
export function tilesOf(game: Game, { hints, tip = null }: TilesOptions): readonly TileView[] {
  const moves = game.legalMoves();
  const targets = new Map(moves.map((m) => [m.y * game.w + m.x, m]));
  const tipIndex = tip ? tip.y * game.w + tip.x : -1;
  const tiles: TileView[] = [];
  for (let i = 0; i < game.max.length; i++) {
    if (!game.max[i]) continue;
    const x = i % game.w;
    const y = (i / game.w) | 0;
    const left = game.cells[i];
    const double = game.max[i] === 2;
    const target = targets.get(i);
    tiles.push({
      x,
      y,
      double,
      cracked: double && left === 1,
      kind: game.max[i] as 1 | 2 | 3,
      left,
      arrow: game.dir[i] >= 0 ? ARROW_DIRECTIONS[game.dir[i]] : null,
      // ^ 1 flips right<->left (0<->1) and down<->up (2<->3) — DIRS' own pairing (see board.ts).
      arrival: game.arrival[i] >= 0 ? ARROW_DIRECTIONS[game.arrival[i] ^ 1] : null,
      worn: left === 0 && i === game.pos,
      gone: left === 0 && i !== game.pos,
      hint: Boolean(target) && hints,
      jump: Boolean(target?.jump) && hints,
      tip: i === tipIndex,
    });
  }
  return tiles;
}

export interface Facing {
  readonly face: Face;
  readonly flip: boolean;
}

// Ported from ui.js's move(): a mostly-horizontal step/jump faces sideways
// (mirrored when moving left); anything else faces up (back) or down (front).
export function facingFor(dx: number, dy: number): Facing {
  if (Math.abs(dx) >= Math.abs(dy) && dx !== 0) {
    return { face: 'side', flip: dx < 0 };
  }
  return { face: dy < 0 ? 'back' : 'front', flip: false };
}

export const DEFAULT_FACING: Facing = { face: 'front', flip: false };

export interface StatusProgress {
  readonly levelNumber: number;
  readonly totalLevels: number;
  readonly moves: number;
  readonly remaining: number;
}

// A tap forbidden by a Departure/Arrival arrow rule (CANGUPA-129) — the same union Game.moveKind()
// (board.ts) returns two members of, now also PlayableBoard's own onBlocked payload and BoardHud's
// status-line reason, so all three name it the same way instead of three independent inline unions.
export type BlockedReason = 'blocked-departure' | 'blocked-arrival';

// Ported from ui.js's render()'s status-line branches, plus hint()'s dead-end
// message. `blocked` (CANGUPA-131, moved here from its own text below the
// board — see BoardHud.tsx's CentreText for why) wins over everything else,
// including hintFailed: both are a direct response to the player's last
// action, but a blocked tap doesn't bump `tick` the way a move/undo/reset/
// hint does, so a stale hintFailed can still be true underneath it — ranking
// blocked first keeps the freshest action's message on screen either way.
// It still carries StatusProgress so BoardHud's "Level N" line stays up even
// then — only the second line swaps to the message.
export type Status =
  | ({ readonly kind: 'blocked'; readonly reason: BlockedReason } & StatusProgress)
  | ({ readonly kind: 'hintFailed' } & StatusProgress)
  | { readonly kind: 'won'; readonly moves: number; readonly hasNext: boolean }
  | ({ readonly kind: 'stuck' } & StatusProgress)
  | ({ readonly kind: 'playing' } & StatusProgress);

export function statusFor(
  progress: StatusProgress,
  state: {
    readonly won: boolean;
    readonly stuck: boolean;
    readonly hintFailed: boolean;
    readonly hasNext: boolean;
    readonly blockedReason: BlockedReason | null;
  },
): Status {
  if (state.blockedReason) {
    return { kind: 'blocked', reason: state.blockedReason, ...progress };
  }
  if (state.hintFailed) {
    return { kind: 'hintFailed', ...progress };
  }
  if (state.won) {
    return { kind: 'won', moves: progress.moves, hasNext: state.hasNext };
  }
  if (state.stuck) {
    return { kind: 'stuck', ...progress };
  }
  return { kind: 'playing', ...progress };
}
