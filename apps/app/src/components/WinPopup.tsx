// Shown over the board once a level is cleared (CANGUPA-32), replacing both
// the toolbar's old › next-level button and the win-triggered inline
// "Próximo nível" button BoardHud used to carry. It only covers part of the
// screen, so BoardHud's Undo/Reset/Hint corner stays reachable underneath —
// Reset is still the way to play the level again without leaving this popup
// up, the same as before. The overlay/card/close/heading frame itself now
// lives in Popup (CANGUPA-52), shared with SettingsScreen's clear-progress
// confirmation.
import { Pressable, StyleSheet, Text } from 'react-native';

import { useStrings } from '../i18n/useStrings';
import { type Palette } from '../theme/palette';
import Popup from './Popup';

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
    <Popup
      palette={palette}
      heading={t.winPopup.levelComplete}
      onClose={onClose}
      actions={
        hasNext && (
          <Pressable style={[styles.primary, { backgroundColor: palette.control }]} onPress={onNext}>
            <Text style={[styles.primaryLabel, ink]}>{t.winPopup.nextLevel}</Text>
          </Pressable>
        )
      }
    >
      <Text style={muted}>{t.winPopup.inMoves(moves)}</Text>
      {!hasNext && <Text style={muted}>{t.winPopup.gameComplete}</Text>}
    </Popup>
  );
}

const styles = StyleSheet.create({
  primary: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 999,
  },
  primaryLabel: {
    fontWeight: '600',
  },
});
