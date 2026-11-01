// Pure, React-free view derived from a Game, ported from the tile-class and
// facing logic in apps/web-classic/js/ui.js's render() and move(). No
// touch/keyboard handling here — see useBoard.ts for that.
import { type Game, type Move } from './board';
import { type Face } from '../components/Kangaroo';

export interface TileView {
  readonly x: number;
  readonly y: number;
  // Needs two visits rather than one.
  readonly double: boolean;
  // A double tile with its first visit spent: one crack, one visit left.
  readonly cracked: boolean;
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

// Ported from ui.js's render()'s status-line branches, plus hint()'s dead-end
// message. `hintFailed` wins over everything else: it is the direct response
// to the button just pressed, the same way the web version's hint() replaces
// the status outright rather than folding into the usual won/stuck/playing text.
export type Status =
  | { readonly kind: 'hintFailed' }
  | { readonly kind: 'won'; readonly moves: number; readonly hasNext: boolean }
  | ({ readonly kind: 'stuck' } & StatusProgress)
  | ({ readonly kind: 'playing' } & StatusProgress);

export function statusFor(
  progress: StatusProgress,
  state: { readonly won: boolean; readonly stuck: boolean; readonly hintFailed: boolean; readonly hasNext: boolean },
): Status {
  if (state.hintFailed) {
    return { kind: 'hintFailed' };
  }
  if (state.won) {
    return { kind: 'won', moves: progress.moves, hasNext: state.hasNext };
  }
  if (state.stuck) {
    return { kind: 'stuck', ...progress };
  }
  return { kind: 'playing', ...progress };
}
