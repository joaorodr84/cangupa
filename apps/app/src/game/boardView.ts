// Pure, React-free view derived from a Game, ported from the tile-class and
// facing logic in apps/web-classic/js/ui.js's render() and move(). No
// touch/keyboard handling here — see useBoard.ts for that.
import { type Game, type Move } from './board';
import { type Face } from '../components/Kangaroo';

export type ArrowDirection = 'right' | 'left' | 'down' | 'up';
// Game's arrow directions are an index into its DIRS: right, left, down, up.
const ARROW_DIRECTIONS: readonly ArrowDirection[] = ['right', 'left', 'down', 'up'];

// A Tunnel mouth's pair (CANGUPA-161) — which of the (at most two) pairs on the board it
// belongs to, so Board.tsx can draw the right hole shape. Game's own tunnelPair is an index
// into this same order.
export type TunnelPair = 'a' | 'b';
const TUNNEL_PAIRS: readonly TunnelPair[] = ['a', 'b'];

// The same four vectors as board.ts's own (unexported) DIRS, in ArrowDirection terms rather than
// an index into it, for directionalMove below to compare a legalMoves() entry's offset against.
const DIRECTION_VECTOR: Readonly<Record<ArrowDirection, readonly [number, number]>> = {
  right: [1, 0],
  left: [-1, 0],
  down: [0, 1],
  up: [0, -1],
};

// A directional-pad press (CANGUPA-152, an addition alongside tap rather than a replacement —
// the same relationship apps/web-classic's own WASD/arrow-key mode has to its tap/click input):
// the legalMoves() entry lying in exactly this cardinal direction from the kangaroo's current
// position, or null when there is none. legalMoves() can return both a step and a jump in the
// same direction at once; a directional press needs an explicit tie-break, so this prefers the
// step, the more conservative of the two, the same choice CANGUPA-98's investigation recommended.
export function directionalMove(game: Game, direction: ArrowDirection): Move | null {
  const [dx, dy] = DIRECTION_VECTOR[direction];
  const matches = game.legalMoves().filter((m) => Math.sign(m.x - game.x) === dx && Math.sign(m.y - game.y) === dy);
  return matches.find((m) => !m.jump) ?? matches[0] ?? null;
}

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
  // A Mud tile (CANGUPA-160): it can be stepped off but not jumped off.
  readonly mud: boolean;
  // A Tunnel mouth (CANGUPA-161), and which pair it belongs to, or null for any other tile.
  // Landing on it (play(), not this view) moves the player to its twin instead and uses both
  // up — nothing here needs to know that; worn/gone already read correctly either way, since
  // they come from the real Game state after the warp, not from this field.
  readonly tunnel: TunnelPair | null;
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

// Exactly the strings tileAccessibilityLabel below needs from the `board`
// strings table (i18n/strings/types.ts) — a local shape rather than
// importing that whole table, so this pure game-logic module stays
// decoupled from the i18n/UI layer; Strings['board'] is a structural
// superset of this, so passing it straight through (as Board.tsx does)
// works with no adapter.
export interface TileLabelStrings {
  readonly tilePosition: (row: number, column: number) => string;
  readonly tileGone: string;
  readonly tileHereCommon: string;
  readonly tileHereGold: string;
  readonly tileHereSteel: string;
  readonly tileHereMud: string;
  readonly tileHereTunnel: string;
  readonly tileCommon: string;
  readonly tileGold: (left: number) => string;
  readonly tileSteel: (left: number) => string;
  readonly tileDeparture: (direction: string) => string;
  readonly tileArrival: (direction: string) => string;
  readonly tileMud: string;
  readonly tileTunnel: string;
  readonly tileSuggestedMove: string;
  readonly pillar: string;
  readonly directionTop: string;
  readonly directionBottom: string;
  readonly directionLeft: string;
  readonly directionRight: string;
}

function directionLabel(direction: ArrowDirection, t: TileLabelStrings): string {
  switch (direction) {
    case 'up':
      return t.directionTop;
    case 'down':
      return t.directionBottom;
    case 'left':
      return t.directionLeft;
    case 'right':
      return t.directionRight;
  }
}

// A screen reader's label for one tile (CANGUPA-149, design from
// CANGUPA-140): 1-based row/column, then exactly one of gone/here/
// Departure/Arrival/kind-and-visits-left, then "Suggested move" when this
// is the solver's own tip. gone beats worn beats arrow/arrival beats the
// Mud and Tunnel both beat the plain kind, standing on them included: Mud's rule is about
// leaving, and Tunnel's "here" is only ever the twin a warp just landed the player on, so "you
// are here" is exactly when a listener needs to hear which one it is. The rest is the same
// priority tilesOf's own fields are already mutually exclusive under (a tile can't be both gone
// and worn, and an arrow/arrival/mud/tunnel tile is never also a Gold/Steel one).
export function tileAccessibilityLabel(tile: TileView, t: TileLabelStrings): string {
  const position = t.tilePosition(tile.y + 1, tile.x + 1);
  const state = tile.gone
    ? t.tileGone
    : tile.worn
      ? tile.mud
        ? t.tileHereMud
        : tile.tunnel
          ? t.tileHereTunnel
          : tile.kind === 3
            ? t.tileHereSteel
            : tile.kind === 2
              ? t.tileHereGold
              : t.tileHereCommon
      : tile.arrow
        ? t.tileDeparture(directionLabel(tile.arrow, t))
        : tile.arrival
          ? t.tileArrival(directionLabel(tile.arrival, t))
          : tile.mud
            ? t.tileMud
            : tile.tunnel
              ? t.tileTunnel
              : tile.kind === 3
                ? t.tileSteel(tile.left)
                : tile.kind === 2
                  ? t.tileGold(tile.left)
                  : t.tileCommon;
  return tile.tip ? `${position}, ${state}. ${t.tileSuggestedMove}` : `${position}, ${state}.`;
}

// A Pillar (CANGUPA-159): a solid block on an otherwise empty cell. Its own list, not an entry in
// tilesOf's, because none of TileView's fields mean anything for it — it has no visits, is never
// worn or gone, and is never a destination — and every consumer of TileView would have had to
// learn to skip it.
export interface PillarView {
  readonly x: number;
  readonly y: number;
}

export function pillarsOf(game: Game): readonly PillarView[] {
  const pillars: PillarView[] = [];
  for (let i = 0; i < game.pillar.length; i++) {
    if (game.pillar[i]) pillars.push({ x: i % game.w, y: (i / game.w) | 0 });
  }
  return pillars;
}

// A screen reader's label for a pillar: the same 1-based row/column lead-in a tile gets, so the
// two read as cells of one grid.
export function pillarAccessibilityLabel(pillar: PillarView, t: TileLabelStrings): string {
  return `${t.tilePosition(pillar.y + 1, pillar.x + 1)}, ${t.pillar}.`;
}

// The pillar a refused move ran into (CANGUPA-159), so the board can flash the thing that
// stopped it, not the tile that was tapped: the target cell when that is the pillar itself,
// otherwise the middle square of the jump. Null when (x, y) is not a 'blocked-pillar' move.
export function blockingPillar(game: Game, x: number, y: number): PillarView | null {
  if (game.moveKind(x, y) !== 'blocked-pillar') return null;
  if (game.pillar[y * game.w + x]) return { x, y };
  return { x: (game.x + x) / 2, y: (game.y + y) / 2 };
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
      mud: game.mud[i] === 1,
      tunnel: game.tunnelPair[i] >= 0 ? TUNNEL_PAIRS[game.tunnelPair[i]] : null,
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

// A tap forbidden by a Departure/Arrival arrow rule (CANGUPA-129), by a Pillar in the way
// (CANGUPA-159) or by a jump off Mud (CANGUPA-160) — the same union Game.moveKind() (board.ts)
// returns four members of, and PlayableBoard's own local state's type.
export type BlockedReason = 'blocked-departure' | 'blocked-arrival' | 'blocked-pillar' | 'blocked-mud';

// Ported from ui.js's render()'s status-line branches, plus hint()'s dead-end
// message. `hintFailed` wins over won/playing: it is the direct response to
// the button just pressed, the same way the web version's hint() replaces
// the status outright. `stuck` and a blocked tap (CANGUPA-129) both used to
// have their own kind here too (CANGUPA-53, CANGUPA-131), swapped in the same
// way — moved back out to their own message area below the board instead
// (CANGUPA-132), once that area reserved its own room, so BoardHud no longer
// needs to represent either. It still carries StatusProgress (CANGUPA-53) so
// BoardHud's "Level N" line stays up even on a dead end — only the second
// line swaps to the message.
export type Status =
  | ({ readonly kind: 'hintFailed' } & StatusProgress)
  | { readonly kind: 'won'; readonly moves: number; readonly hasNext: boolean }
  | ({ readonly kind: 'playing' } & StatusProgress);

export function statusFor(
  progress: StatusProgress,
  state: { readonly won: boolean; readonly hintFailed: boolean; readonly hasNext: boolean },
): Status {
  if (state.hintFailed) {
    return { kind: 'hintFailed', ...progress };
  }
  if (state.won) {
    return { kind: 'won', moves: progress.moves, hasNext: state.hasNext };
  }
  return { kind: 'playing', ...progress };
}
