// A directional pad (CANGUPA-152), an addition alongside tap-to-move rather than a replacement
// for it — the same relationship apps/web-classic's own WASD/arrow-key mode (CANGUPA-66) has to
// its own tap/click input. BoardScreen.tsx owns the actual move (via PlayableBoard's exposed
// pressTile) and tells this component, per direction, whether one is currently legal — this
// component only renders the four buttons and reports which one was pressed.
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { type ArrowDirection } from '../game/boardView';
import { useStrings } from '../i18n/useStrings';
import { type Palette } from '../theme/palette';

// 44pt: Apple HIG's own recommended minimum touch target, the same floor CANGUPA-153 is adding
// to the board's own tiles — picked directly here rather than left to whatever a chevron needs,
// since nothing else sizes these buttons.
const BUTTON_SIZE = 44;
const GAP = 6;

// A solid triangle arrowhead per direction (CANGUPA-155, picked over the open
// chevron this replaced for more presence/game-like weight) — each one a
// 12x12 triangle centred in the 24x24 viewBox, matching the chevron's own
// footprint before it.
const TRIANGLE: Readonly<Record<ArrowDirection, string>> = {
  right: 'M8 6 L8 18 L18 12 Z',
  left: 'M16 6 L16 18 L6 12 Z',
  down: 'M6 8 L18 8 L12 18 Z',
  up: 'M6 16 L18 16 L12 6 Z',
};

interface DirectionalPadProps {
  readonly palette: Palette;
  // Whether a press in this direction would actually play a move right now — drives both the
  // disabled state and its accessibility counterpart, the same pairing Board.tsx's own tiles use
  // (CANGUPA-149).
  readonly canMove: (direction: ArrowDirection) => boolean;
  readonly onPress: (direction: ArrowDirection) => void;
}

export default function DirectionalPad({ palette, canMove, onPress }: DirectionalPadProps) {
  const t = useStrings();
  const label: Readonly<Record<ArrowDirection, string>> = {
    up: t.boardHud.moveUp,
    down: t.boardHud.moveDown,
    left: t.boardHud.moveLeft,
    right: t.boardHud.moveRight,
  };

  const button = (direction: ArrowDirection) => {
    const enabled = canMove(direction);
    return (
      <Pressable
        key={direction}
        testID={`dpad-${direction}`}
        disabled={!enabled}
        onPress={() => onPress(direction)}
        accessibilityRole="button"
        accessibilityLabel={label[direction]}
        accessibilityState={{ disabled: !enabled }}
        style={[styles.button, { backgroundColor: palette.panel }, !enabled && styles.disabled]}
      >
        <Svg width={18} height={18} viewBox="0 0 24 24" fill={palette.ink}>
          <Path d={TRIANGLE[direction]} />
        </Svg>
      </Pressable>
    );
  };

  return (
    <View testID="directional-pad" style={styles.pad}>
      <View style={styles.row}>{button('up')}</View>
      <View style={styles.row}>
        {button('left')}
        <View style={styles.spacer} />
        {button('right')}
      </View>
      <View style={styles.row}>{button('down')}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  pad: {
    alignItems: 'center',
    gap: GAP,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: GAP,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
  },
  disabled: {
    opacity: 0.4,
  },
});
