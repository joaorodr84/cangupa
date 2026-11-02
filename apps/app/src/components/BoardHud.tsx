// Status line and board controls, ported from apps/web-classic/js/ui.js's
// render() status branches and its undo/reset/hint buttons. Reworked for
// CANGUPA-32, similarly to DigiSpin's BoardScreen header: Undo/Reset/Hint
// sit in one row in the screen's upper-right corner instead of a centred
// toolbar below the board, and the win state (previously this row's inline
// "Próximo nível" button) moved out to WinPopup.tsx, since the row here is
// about controlling the board, not what happens once it's cleared. The
// level-navigation ‹/› buttons this toolbar used to carry are gone outright —
// › became WinPopup's "Próximo nível", and CANGUPA-35 gives ‹ its own
// replacement: a plain arrow back to the home screen, upper-left, the same
// corner DigiSpin's board header puts its own back arrow in.
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { type Status } from '../game/boardView';
import { useStrings } from '../i18n/useStrings';
import { type Strings } from '../i18n/strings';
import { type Palette } from '../theme/palette';
import BackArrow from './BackArrow';

interface BoardHudProps {
  readonly status: Status;
  readonly canUndo: boolean;
  readonly palette: Palette;
  readonly onBack: () => void;
  readonly onUndo: () => void;
  readonly onReset: () => void;
  readonly onHint: () => void;
}

export default function BoardHud({ status, canUndo, palette, onBack, onUndo, onReset, onHint }: BoardHudProps) {
  const t = useStrings();
  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel={t.boardHud.backToHome}
        style={[styles.backButton, { backgroundColor: palette.panel }]}
      >
        <BackArrow color={palette.ink} />
      </Pressable>
      <View style={styles.status}>
        <StatusLine status={status} palette={palette} t={t} />
      </View>
      <View style={styles.buttons}>
        <HudButton label={t.boardHud.undo} palette={palette} disabled={!canUndo} onPress={onUndo} />
        <HudButton label={t.boardHud.restart} palette={palette} onPress={onReset} />
        <HudButton label={t.boardHud.hint} palette={palette} disabled={status.kind === 'won'} onPress={onHint} />
      </View>
    </View>
  );
}

// The win state has its own presentation (WinPopup.tsx), so there is nothing
// to show here once won — the status row just goes empty.
function StatusLine({ status, palette, t }: { status: Status; palette: Palette; t: Strings }) {
  const ink = { color: palette.ink };
  const muted = { color: palette.muted };

  if (status.kind === 'hintFailed') {
    return (
      <Text style={ink}>
        <Text style={styles.bold}>{t.boardHud.deadEnd}</Text> <Text style={muted}>{t.boardHud.undoSomeMoves}</Text>
      </Text>
    );
  }

  if (status.kind === 'won') {
    return null;
  }

  const head = t.boardHud.status(status.levelNumber, status.totalLevels, status.moves, status.remaining);
  if (status.kind === 'stuck') {
    return (
      <Text style={ink}>
        {head} · <Text style={styles.bold}>{t.boardHud.stuck}</Text> <Text style={muted}>{t.boardHud.undoOrRestart}</Text>
      </Text>
    );
  }
  return <Text style={ink}>{head}</Text>;
}

interface HudButtonProps {
  readonly label: string;
  readonly palette: Palette;
  readonly onPress: () => void;
  readonly disabled?: boolean;
}

function HudButton({ label, palette, onPress, disabled = false }: HudButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, { backgroundColor: palette.panel }, disabled && styles.buttonDisabled]}
    >
      <Text style={{ color: palette.ink }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  status: {
    flex: 1,
  },
  // Right-aligned, so the row reads as the board's controls sitting in its
  // upper-right corner rather than a full-width toolbar.
  buttons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  bold: {
    fontWeight: '600',
  },
  button: {
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 999,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
});
