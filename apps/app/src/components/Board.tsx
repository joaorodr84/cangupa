// The game board: tile grid, tile states, hint highlighting, and the
// kangaroo's hop and facing. Ported from apps/web-classic/js/ui.js's
// build()/render() and style.css's #board/.cell/.tile rules. Owning the Game
// and calling `hop()` through the ref after a played move is useBoard.ts's
// job, not this component's — see PlayableBoard.tsx for the two wired together.
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  type GestureResponderEvent,
  type LayoutChangeEvent,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import Svg, { G, Line, Polygon } from 'react-native-svg';

import { type ArrowDirection, type TileView } from '../game/boardView';
import { type Palette } from '../theme/palette';
import Kangaroo, { type Face } from './Kangaroo';

// The CSS keyframe hop was a percentage of the cell's own size (-40%); React
// Native's transform does not take percentages, so this is a fixed amount
// instead. It reads fine at every grid size the game actually uses.
const HOP_HEIGHT = 16;
const HOP_LEG_MS = 120;
// Total duration of hop()'s up-then-down sequence — PlayableBoard waits this
// long after a fall's lead-in jump before starting fall() (CANGUPA-64), the
// same way it waits for a real move's hop before anything else happens.
export const HOP_MS = HOP_LEG_MS * 2;

// style.css's `.falling #roo` keyframe (sink, shrink, fade) over the same
// 0.5s — ui.js's fall() waits exactly this long before resetting the level.
const FALL_DROP = 30;
const FALL_MS = 500;

interface BoardProps {
  readonly w: number;
  readonly h: number;
  readonly tiles: readonly TileView[];
  readonly rooX: number;
  readonly rooY: number;
  readonly face: Face;
  readonly flip: boolean;
  readonly palette: Palette;
  readonly anim: boolean;
  // Caps the board at this many px wide (CANGUPA-33), overriding the default
  // width:'100%' — set by PlayableBoard once it knows the height available
  // isn't the looser constraint. Omitted: falls back to 100% of the
  // container, as before.
  readonly width?: number;
  // Tapping a highlighted tile calls this with its cell. Tiles that are not
  // a legal destination (tile.hint false) are not pressable at all, the same
  // way ui.js's click handler only ever resolves a move among legalMoves().
  readonly onPressTile?: (x: number, y: number) => void;
  // A tap anywhere else on the board — truly empty space between tiles, or a
  // tile with no legal move — only when the falling setting is on
  // (CANGUPA-58). Undefined (the setting is off): the board stays a plain,
  // non-interactive background there, as it always was. Called with the
  // tapped cell (CANGUPA-64, so the caller can jump the kangaroo there
  // before falling) — computed from the press location even over true
  // background with no tile at all (CANGUPA-66), since the caller still
  // needs a cell to jump to. Undefined only before the very first layout,
  // when this Pressable's own size isn't known yet.
  readonly onPressEmpty?: (target?: { x: number; y: number }) => void;
}

export interface BoardHandle {
  // Plays the hop bounce once. Called by the mover right after a played
  // move, not after undo/reset/hint — the same asymmetry ui.js's
  // render(hop) argument encodes.
  hop(): void;
  // Sinks, shrinks and fades the kangaroo, then calls `onComplete` — the
  // caller's job from there is ui.js's fall()'s own next step, resetting the
  // level. Unlike hop(), this always animates regardless of the `anim`
  // setting, matching the web version's `.falling` keyframe, which isn't
  // gated by `.no-anim` either.
  fall(onComplete: () => void): void;
}

const Board = forwardRef<BoardHandle, BoardProps>(function Board(
  { w, h, tiles, rooX, rooY, face, flip, palette, anim, width, onPressTile, onPressEmpty }: BoardProps,
  ref,
) {
  const hopAnim = useRef(new Animated.Value(0)).current;
  const fallAnim = useRef(new Animated.Value(0)).current;
  // Peek (CANGUPA-71, ported from web-classic's CANGUPA-70): holding on the
  // kangaroo's own tile fades it so a special tile underneath — easy to miss
  // when it's cracked or a double tile hidden by the sprite — shows through.
  // Plain state rather than another Animated value: it only ever toggles a
  // single opacity between two fixed numbers, nothing to interpolate, and it
  // stays a plain JS number the opacity test below can read back directly.
  const [peeking, setPeeking] = useState(false);
  // The board's own rendered size (CANGUPA-66), kept in a ref rather than
  // state since it only feeds a later press's own math, not a render — set
  // once on layout and whenever the aspectRatio box is resized.
  const sizeRef = useRef({ width: 0, height: 0 });
  const handleLayout = (e: LayoutChangeEvent) => {
    sizeRef.current = { width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height };
  };

  // The grid cell under a press, from where it landed within this
  // Pressable's own box — there is no border/padding between the two, so
  // locationX/Y map 1:1 onto w x h. Undefined only before the first layout
  // (practically unreachable: nothing is pressable before it renders).
  // ui.js's cellAt() does the same job from a DOM rect, for the same reason:
  // a tap on true background, with no tile at all, still needs a cell to
  // jump to (CANGUPA-66), not just "no target".
  const cellAt = ({ nativeEvent }: GestureResponderEvent): { x: number; y: number } | undefined => {
    const { width, height } = sizeRef.current;
    if (!width || !height) return undefined;
    const x = Math.floor((nativeEvent.locationX / width) * w);
    const y = Math.floor((nativeEvent.locationY / height) * h);
    return x >= 0 && y >= 0 && x < w && y < h ? { x, y } : undefined;
  };

  useImperativeHandle(
    ref,
    () => ({
      hop() {
        if (!anim) return;
        hopAnim.setValue(0);
        Animated.sequence([
          Animated.timing(hopAnim, {
            toValue: -HOP_HEIGHT,
            duration: HOP_LEG_MS,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(hopAnim, {
            toValue: 0,
            duration: HOP_LEG_MS,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]).start();
      },
      fall(onComplete) {
        fallAnim.setValue(0);
        Animated.timing(fallAnim, {
          toValue: 1,
          duration: FALL_MS,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }).start(() => {
          // Otherwise the kangaroo would stay sunk, shrunk and invisible
          // forever — `fallAnim` only ever drives *this* fall, there's no
          // later reset back to 0 once it reaches 1. Confirmed live against
          // the running app (Jest's `useNativeDriver: true` support is a
          // no-op, so this path isn't exercised by a unit test here).
          fallAnim.setValue(0);
          onComplete();
        });
      },
    }),
    [anim, hopAnim, fallAnim],
  );

  const fallTranslateY = fallAnim.interpolate({ inputRange: [0, 1], outputRange: [0, FALL_DROP] });
  const fallScale = fallAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.5] });
  const fallOpacity = fallAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });

  return (
    <Pressable
      style={[styles.board, { aspectRatio: w / h, backgroundColor: palette.pit }, width !== undefined && { width }]}
      testID="board"
      onLayout={handleLayout}
      onPress={onPressEmpty && ((e) => onPressEmpty(cellAt(e)))}
    >
      {tiles.map((tile) => (
        <Tile
          key={`${tile.x}-${tile.y}`}
          tile={tile}
          w={w}
          h={h}
          palette={palette}
          anim={anim}
          onPress={onPressTile}
          onPressEmpty={onPressEmpty}
          isRoo={tile.x === rooX && tile.y === rooY}
          onPeekStart={() => setPeeking(true)}
          onPeekEnd={() => setPeeking(false)}
        />
      ))}
      <View
        testID="roo"
        pointerEvents="none"
        style={[
          styles.rooSlot,
          { width: `${100 / w}%`, height: `${100 / h}%`, left: `${(100 * rooX) / w}%`, top: `${(100 * rooY) / h}%` },
          peeking && styles.peek,
        ]}
      >
        <Animated.View
          style={{
            flex: 1,
            opacity: fallOpacity,
            transform: [{ translateY: Animated.add(hopAnim, fallTranslateY) }, { scale: fallScale }],
          }}
        >
          <Kangaroo face={face} flip={flip} />
        </Animated.View>
      </View>
    </Pressable>
  );
});

export default Board;

interface TileProps {
  readonly tile: TileView;
  readonly w: number;
  readonly h: number;
  readonly palette: Palette;
  readonly anim: boolean;
  readonly onPress?: (x: number, y: number) => void;
  // Same prop Board received (CANGUPA-64): a tile with no legal move (worn
  // down to nothing, or just out of reach) reports its own cell here instead
  // of falling through to the board's blanket onPress, which has no cell to
  // give.
  readonly onPressEmpty?: (target?: { x: number; y: number }) => void;
  // Whether this is the cell the kangaroo is currently rendered on (CANGUPA-71)
  // — its own cell is never a legal move (distance 0) and, with the fall
  // setting off, has no Pressable at all otherwise, so peeking needs its own
  // press handling independent of onPress/onPressEmpty above.
  readonly isRoo?: boolean;
  readonly onPeekStart?: () => void;
  readonly onPeekEnd?: () => void;
}

// The width of one visit-left stroke, in percent of the tile.
const STROKE_WIDTH = 7.5;

// The face and the lip of a tile: a Departure tile is green and an Arrival tile (CANGUPA-104)
// raspberry whatever its visits, otherwise the kind sets it. Typed on just the three fields
// either one reads, not the full TileView, so TileSwatch below can call them without the fields
// (worn, gone, hint, ...) that only make sense for a tile actually on the board.
function faceColor(tile: Pick<TileView, 'kind' | 'arrow' | 'arrival'>, palette: Palette): string {
  if (tile.arrow) return palette.tileDeparture;
  if (tile.arrival) return palette.tileArrival;
  return tile.kind === 3 ? palette.tile3 : tile.kind === 2 ? palette.tile2 : palette.tile;
}
function edgeColor(tile: Pick<TileView, 'kind' | 'arrow' | 'arrival'>, palette: Palette): string {
  if (tile.arrow) return palette.edgeDeparture;
  if (tile.arrival) return palette.edgeArrival;
  return tile.kind === 3 ? palette.edge3 : tile.kind === 2 ? palette.edge2 : palette.edge;
}

// The visits left on a Gold or Steel tile, as short diagonal strokes from top right to bottom left, side by
// side like tally marks (the design chosen on the tile-metals review page). A tile on its last visit has one.
// Positions are percentages of the tile, so the strokes scale with the board.
function Strokes({ x, y, count, color }: { readonly x: number; readonly y: number; readonly count: number; readonly color: string }) {
  return (
    <View testID={`tile-strokes-${x}-${y}`} pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          style={[styles.stroke, { left: `${50 + (i - (count - 1) / 2) * 22 - STROKE_WIDTH / 2}%`, backgroundColor: color }]}
        />
      ))}
    </View>
  );
}

// CANGUPA-107's chosen replacement for the plain triangle: a doorway bracket, shut on three
// sides, open on the edge the tile is left/entered by, with a real arrow threaded through that
// opening — tip past the edge for Departure (leaves), tip at the bracket's back wall for Arrival
// (enters). Decided and reviewed on tools/visualizers/tile-marks.html's Option B; ported
// verbatim from that page's AXIS/pt/geometry functions rather than redrawn, so this is exactly
// what was reviewed there, just as React Native SVG elements instead of a markup string.
//
// Edge-relative coordinates: k is depth from the edge (0 = at the boundary, increasing = further
// into the tile's interior), c is lateral offset from the edge's own midpoint. Converting
// through this one axis table means the mark is designed once, in (k, c) terms, instead of by
// hand for all four directions.
const AXIS: Readonly<Record<ArrowDirection, { readonly axis: 'x' | 'y'; readonly sign: 1 | -1; readonly edgeAt: number; readonly acrossCenter: number }>> = {
  right: { axis: 'x', sign: 1, edgeAt: 64, acrossCenter: 28.5 },
  left: { axis: 'x', sign: -1, edgeAt: 0, acrossCenter: 28.5 },
  up: { axis: 'y', sign: -1, edgeAt: 0, acrossCenter: 32 },
  down: { axis: 'y', sign: 1, edgeAt: 57, acrossCenter: 32 },
};
function pt(direction: ArrowDirection, k: number, c: number): readonly [number, number] {
  const a = AXIS[direction];
  const depth = a.edgeAt - a.sign * k;
  return a.axis === 'x' ? [depth, a.acrossCenter + c] : [a.acrossCenter + c, depth];
}

// The bracket is drawn once in its own small coordinate patch near the edge, then scaled up and
// recentred on the tile's true centre (32, 28.5 in this viewBox, regardless of direction). At
// that size the padding to the tile's own edges would stop being even if capK/w stayed fixed:
// the tile is 64 by 57, not square, so the same numbers leave more room behind the bracket's
// back wall than beside its rails. capK and w are solved per direction instead, from that
// direction's own depth/across extent, so every side lands on the same target padding.
const BRACKET_SCALE = 2;
const BRACKET_BASE_K = 12;
const BRACKET_PADDING = 10;
const BRACKET_OPEN_K = 6;
const BRACKET_SHALLOW_K = 4;
const BRACKET_ARROW_GAP = 8;
function bracketGeometry(direction: ArrowDirection) {
  const a = AXIS[direction];
  const ext = a.axis === 'x' ? { depth: 64, across: 57 } : { depth: 57, across: 64 };
  const capK = BRACKET_BASE_K + (ext.depth / 2 - BRACKET_PADDING) / BRACKET_SCALE;
  const w = (ext.across / 2 - BRACKET_PADDING) / BRACKET_SCALE;
  return { capK, w, openK: BRACKET_OPEN_K, deepK: capK - BRACKET_ARROW_GAP, shallowK: BRACKET_SHALLOW_K };
}

function ArrowMark({
  x,
  y,
  kind,
  direction,
  color,
}: {
  readonly x: number;
  readonly y: number;
  readonly kind: 'arrow' | 'arrival';
  readonly direction: ArrowDirection;
  readonly color: string;
}) {
  const isEnter = kind === 'arrival';
  const g = bracketGeometry(direction);

  // The bracket: a back wall (cap) and two rails running from it to the opening.
  const cap = [pt(direction, g.capK, -g.w), pt(direction, g.capK, g.w)];
  const railA = [pt(direction, g.capK, -g.w), pt(direction, g.openK, -g.w)];
  const railB = [pt(direction, g.capK, g.w), pt(direction, g.openK, g.w)];

  // The threaded arrow: outward for Departure (tip past the edge, it leaves this way), inward
  // for Arrival (tip at the bracket's back wall, it enters this way).
  const outward = !isEnter;
  const headLen = 6;
  const tailK = outward ? g.deepK : g.shallowK;
  const headK = outward ? g.shallowK : g.deepK;
  const baseK = outward ? headK + headLen : headK - headLen;
  const tail = pt(direction, tailK, 0);
  const base = pt(direction, baseK, 0);
  const baseA = pt(direction, baseK, -5);
  const baseB = pt(direction, baseK, 5);
  const tip = pt(direction, headK, 0);

  const localCenter = pt(direction, BRACKET_BASE_K, 0);
  const transform = `translate(32,28.5) scale(${BRACKET_SCALE}) translate(${-localCenter[0]},${-localCenter[1]})`;

  return (
    <Svg testID={`tile-${kind}-${x}-${y}-${direction}`} pointerEvents="none" style={StyleSheet.absoluteFill} viewBox="0 0 64 57" preserveAspectRatio="none">
      <G transform={transform}>
        <Line x1={cap[0][0]} y1={cap[0][1]} x2={cap[1][0]} y2={cap[1][1]} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
        <Line x1={railA[0][0]} y1={railA[0][1]} x2={railA[1][0]} y2={railA[1][1]} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
        <Line x1={railB[0][0]} y1={railB[0][1]} x2={railB[1][0]} y2={railB[1][1]} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
        <Line x1={tail[0]} y1={tail[1]} x2={base[0]} y2={base[1]} stroke={color} strokeWidth={3} strokeLinecap="round" />
        <Polygon points={`${baseA[0]},${baseA[1]} ${tip[0]},${tip[1]} ${baseB[0]},${baseB[1]}`} fill={color} />
      </G>
    </Svg>
  );
}

// Everything a static tile face needs to draw itself — no worn/gone/hint/jump/tip, since those
// only mean something for a tile that's actually part of a playable board.
export type SwatchTile = Pick<TileView, 'x' | 'y' | 'kind' | 'left' | 'arrow' | 'arrival'>;

// A tile's face, lip and visit/direction mark with none of the real Tile's Pressable,
// animation or kangaroo — for anywhere else in the app that wants to show what a tile kind
// looks like (CANGUPA-109: HelpScreen.tsx's Tiles section, replacing a flat colour square with
// the tile's actual rendering, same strokes/marks a real board uses).
export function TileSwatch({
  tile,
  palette,
  size = 40,
  testID,
}: {
  readonly tile: SwatchTile;
  readonly palette: Palette;
  readonly size?: number;
  readonly testID?: string;
}) {
  return (
    <View
      testID={testID}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.18,
        backgroundColor: faceColor(tile, palette),
        borderBottomWidth: Math.max(3, Math.round(size * 0.1)),
        borderBottomColor: edgeColor(tile, palette),
      }}
    >
      {tile.arrow && <ArrowMark x={tile.x} y={tile.y} kind="arrow" direction={tile.arrow} color={palette.markDeparture} />}
      {tile.arrival && <ArrowMark x={tile.x} y={tile.y} kind="arrival" direction={tile.arrival} color={palette.markArrival} />}
      {!tile.arrow && !tile.arrival && tile.kind >= 2 && tile.left >= 1 && (
        <Strokes x={tile.x} y={tile.y} count={tile.left} color={tile.kind === 3 ? palette.mark3 : palette.mark2} />
      )}
    </View>
  );
}

function Tile({ tile, w, h, palette, anim, onPress, onPressEmpty, isRoo = false, onPeekStart, onPeekEnd }: TileProps) {
  const pulse = useRef(new Animated.Value(0)).current;

  useAnimatedTip(pulse, tile.tip && anim);

  const outlineColor = tile.tip ? 'rgba(255,214,90,0.95)' : 'rgba(255,255,255,0.7)';
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });

  const content = (
    <Animated.View
      testID={`tile-${tile.x}-${tile.y}`}
      style={[
        styles.tile,
        { backgroundColor: faceColor(tile, palette), borderBottomColor: edgeColor(tile, palette) },
        (tile.hint || tile.tip) && {
          borderWidth: 3,
          borderColor: outlineColor,
          borderStyle: tile.jump && !tile.tip ? 'dashed' : 'solid',
        },
        tile.worn && styles.worn,
        tile.gone && styles.gone,
        tile.tip && { transform: [{ scale }] },
      ]}
    >
      {tile.arrow && <ArrowMark x={tile.x} y={tile.y} kind="arrow" direction={tile.arrow} color={palette.markDeparture} />}
      {tile.arrival && <ArrowMark x={tile.x} y={tile.y} kind="arrival" direction={tile.arrival} color={palette.markArrival} />}
      {!tile.arrow && !tile.arrival && tile.kind >= 2 && tile.left >= 1 && (
        <Strokes x={tile.x} y={tile.y} count={tile.left} color={tile.kind === 3 ? palette.mark3 : palette.mark2} />
      )}
    </Animated.View>
  );

  return (
    <View
      style={[styles.cell, { width: `${100 / w}%`, height: `${100 / h}%`, left: `${(100 * tile.x) / w}%`, top: `${(100 * tile.y) / h}%` }]}
    >
      {tile.hint ? (
        <Pressable
          testID={`tile-press-${tile.x}-${tile.y}`}
          style={styles.pressable}
          onPress={() => onPress?.(tile.x, tile.y)}
        >
          {content}
        </Pressable>
      ) : onPressEmpty ? (
        <Pressable
          testID={`tile-empty-${tile.x}-${tile.y}`}
          style={styles.pressable}
          onPress={() => onPressEmpty({ x: tile.x, y: tile.y })}
          onPressIn={isRoo ? onPeekStart : undefined}
          onPressOut={isRoo ? onPeekEnd : undefined}
        >
          {content}
        </Pressable>
      ) : isRoo ? (
        <Pressable
          testID={`tile-roo-${tile.x}-${tile.y}`}
          style={styles.pressable}
          onPressIn={onPeekStart}
          onPressOut={onPeekEnd}
        >
          {content}
        </Pressable>
      ) : (
        content
      )}
    </View>
  );
}

// Loops the tip's pulse while it stays the solver's suggested move; stops
// (and resets) once it is cleared or the tile is no longer the tip.
function useAnimatedTip(pulse: Animated.Value, active: boolean) {
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);
  if (active && !loopRef.current) {
    loopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 450, useNativeDriver: true }),
      ]),
    );
    loopRef.current.start();
  } else if (!active && loopRef.current) {
    loopRef.current.stop();
    loopRef.current = null;
    pulse.setValue(0);
  }
}

const styles = StyleSheet.create({
  board: {
    position: 'relative',
    width: '100%',
    borderRadius: 6,
  },
  cell: {
    position: 'absolute',
  },
  pressable: {
    flex: 1,
  },
  tile: {
    position: 'absolute',
    top: '7%',
    right: '7%',
    bottom: '11%',
    left: '7%',
    borderRadius: 8,
    borderBottomWidth: 4,
  },
  // One visit-left stroke: a bar a quarter of the way down, half the tile tall, turned 24 degrees so its top
  // leans right. Narrower than it looks (7.5% of the tile) and spaced 22% apart, so four fit on a tile.
  stroke: {
    position: 'absolute',
    top: '25%',
    height: '50%',
    width: `${STROKE_WIDTH}%`,
    borderRadius: 99,
    transform: [{ rotate: '24deg' }],
  },
  // CSS used filter: brightness(.82); RN has no reliable cross-platform
  // filter, so a slight opacity drop stands in for the dimming.
  worn: {
    opacity: 0.82,
  },
  gone: {
    opacity: 0,
    transform: [{ translateY: '40%' }, { scale: 0.55 }],
  },
  rooSlot: {
    position: 'absolute',
    zIndex: 2,
  },
  // Peek (CANGUPA-71): 20% opacity, not 0, so the kangaroo stays visible as a
  // landmark while the tile underneath shows through — same value web-classic
  // uses (CANGUPA-70's `#roo.peek`).
  peek: {
    opacity: 0.2,
  },
});
