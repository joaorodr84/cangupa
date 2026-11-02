// Shown over the board once a level is cleared (CANGUPA-32), replacing both
// the toolbar's old › next-level button and the win-triggered inline
// "Próximo nível" button BoardHud used to carry. It only covers part of the
// screen, so BoardHud's Undo/Reset/Hint corner stays reachable underneath —
// Reset is still the way to play the level again without leaving this popup
// up, the same as before.
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useStrings } from '../i18n/useStrings';
import { type Palette } from '../theme/palette';

interface WinPopupProps {
  readonly moves: number;
  readonly hasNext: boolean;
  readonly palette: Palette;
  readonly onNext: () => void;
  readonly onClose: () => void;
}

export default function WinPopup({ moves, hasNext, palette, onNext, onClose }: WinPopupProps) {
  const t = useStrings();
  const ink = { color: palette.ink };
  const muted = { color: palette.muted };

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <View style={[styles.card, { backgroundColor: palette.panel }]}>
        <Pressable style={styles.close} onPress={onClose}>
          <Text style={ink}>✕</Text>
        </Pressable>
        <Text style={[styles.heading, ink]}>{t.winPopup.levelComplete}</Text>
        <Text style={muted}>{t.winPopup.inMoves(moves)}</Text>
        {hasNext ? (
          <Pressable style={[styles.primary, { backgroundColor: 'rgba(255,214,90,0.3)' }]} onPress={onNext}>
            <Text style={[styles.primaryLabel, ink]}>{t.winPopup.nextLevel}</Text>
          </Pressable>
        ) : (
          <Text style={[styles.done, muted]}>{t.winPopup.gameComplete}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    minWidth: 220,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    gap: 10,
  },
  close: {
    position: 'absolute',
    top: 8,
    right: 10,
    padding: 4,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
  },
  primary: {
    marginTop: 6,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 999,
  },
  primaryLabel: {
    fontWeight: '600',
  },
  done: {
    marginTop: 6,
  },
});
