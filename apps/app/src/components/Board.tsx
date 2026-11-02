// The game board: tile grid, tile states, hint highlighting, and the
// kangaroo's hop and facing. Ported from apps/web-classic/js/ui.js's
// build()/render() and style.css's #board/.cell/.tile rules. Owning the Game
// and calling `hop()` through the ref after a played move is useBoard.ts's
// job, not this component's — see PlayableBoard.tsx for the two wired together.
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';

import { type TileView } from '../game/boardView';
import { type Palette } from '../theme/palette';
import Kangaroo, { type Face } from './Kangaroo';

// The CSS keyframe hop was a percentage of the cell's own size (-40%); React
// Native's transform does not take percentages, so this is a fixed amount
// instead. It reads fine at every grid size the game actually uses.
const HOP_HEIGHT = 16;
const HOP_LEG_MS = 120;

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
}

export interface BoardHandle {
  // Plays the hop bounce once. Called by the mover right after a played
  // move, not after undo/reset/hint — the same asymmetry ui.js's
  // render(hop) argument encodes.
  hop(): void;
}

const Board = forwardRef<BoardHandle, BoardProps>(function Board(
  { w, h, tiles, rooX, rooY, face, flip, palette, anim, width, onPressTile }: BoardProps,
  ref,
) {
  const hopAnim = useRef(new Animated.Value(0)).current;

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
    }),
    [anim, hopAnim],
  );

  return (
    <View
      style={[styles.board, { aspectRatio: w / h, backgroundColor: palette.pit }, width !== undefined && { width }]}
      testID="board"
    >
      {tiles.map((tile) => (
        <Tile key={`${tile.x}-${tile.y}`} tile={tile} w={w} h={h} palette={palette} anim={anim} onPress={onPressTile} />
      ))}
      <View
        pointerEvents="none"
        style={[
          styles.rooSlot,
          { width: `${100 / w}%`, height: `${100 / h}%`, left: `${(100 * rooX) / w}%`, top: `${(100 * rooY) / h}%` },
        ]}
      >
        <Animated.View style={{ flex: 1, transform: [{ translateY: hopAnim }] }}>
          <Kangaroo face={face} flip={flip} />
        </Animated.View>
      </View>
    </View>
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
}

function Tile({ tile, w, h, palette, anim, onPress }: TileProps) {
  const pulse = useRef(new Animated.Value(0)).current;

  useAnimatedTip(pulse, tile.tip && anim);

  const outlineColor = tile.tip ? 'rgba(255,214,90,0.95)' : 'rgba(255,255,255,0.7)';
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });

  const content = (
    <Animated.View
      testID={`tile-${tile.x}-${tile.y}`}
      style={[
        styles.tile,
        { backgroundColor: tile.double ? palette.tile2 : palette.tile, borderBottomColor: tile.double ? palette.edge2 : palette.edge },
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
      {tile.double && !tile.cracked && (
        <>
          <View style={[styles.pip, { top: '34%' }]} />
          <View style={[styles.pip, { top: '58%' }]} />
        </>
      )}
      {tile.cracked && <View style={styles.crack} />}
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
  // Approximates style.css's `.tile.two::before/::after` pips: a double
  // tile's two remaining visits.
  pip: {
    position: 'absolute',
    left: '30%',
    width: '40%',
    height: '8%',
    borderRadius: 99,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  // `.tile.two.cracked::before`: one visit left, shown as a single angled crack.
  crack: {
    position: 'absolute',
    top: '44%',
    left: '22%',
    width: '56%',
    height: '6%',
    borderRadius: 99,
    backgroundColor: 'rgba(0,0,0,0.28)',
    transform: [{ rotate: '-22deg' }],
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
});
