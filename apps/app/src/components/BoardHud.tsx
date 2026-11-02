// Status line and board controls, ported from apps/web-classic/js/ui.js's
// render() status branches and its undo/reset/hint buttons. Reworked for
// CANGUPA-32, similarly to DigiSpin's BoardScreen header: Undo/Reset/Hint
// sit in one row in the screen's upper-right corner instead of a centred
// toolbar below the board, and the win state (previously this row's inline
// "Próximo nível" button) moved out to WinPopup.tsx, since the row here is
// about controlling the board, not what happens once it's cleared. The
// level-navigation ‹/› buttons this toolbar used to carry are gone outright —
// ‹ had no replacement, › became WinPopup's "Próximo nível".
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { type Status } from '../game/boardView';
import { type Palette } from '../theme/palette';

interface BoardHudProps {
  readonly status: Status;
  readonly canUndo: boolean;
  readonly palette: Palette;
  readonly onUndo: () => void;
  readonly onReset: () => void;
  readonly onHint: () => void;
}

export default function BoardHud({ status, canUndo, palette, onUndo, onReset, onHint }: BoardHudProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.status}>
        <StatusLine status={status} palette={palette} />
      </View>
      <View style={styles.buttons}>
        <HudButton label="Desfazer" palette={palette} disabled={!canUndo} onPress={onUndo} />
        <HudButton label="Reiniciar" palette={palette} onPress={onReset} />
        <HudButton label="Dica" palette={palette} disabled={status.kind === 'won'} onPress={onHint} />
      </View>
    </View>
  );
}

// The win state has its own presentation (WinPopup.tsx), so there is nothing
// to show here once won — the status row just goes empty.
function StatusLine({ status, palette }: { status: Status; palette: Palette }) {
  const ink = { color: palette.ink };
  const muted = { color: palette.muted };

  if (status.kind === 'hintFailed') {
    return (
      <Text style={ink}>
        <Text style={styles.bold}>Beco sem saída.</Text> <Text style={muted}>Desfaz algumas jogadas.</Text>
      </Text>
    );
  }

  if (status.kind === 'won') {
    return null;
  }

  const head = `Nível ${status.levelNumber}/${status.totalLevels} · Jogadas ${status.moves} · Faltam ${status.remaining}`;
  if (status.kind === 'stuck') {
    return (
      <Text style={ink}>
        {head} · <Text style={styles.bold}>Sem jogadas.</Text> <Text style={muted}>Desfaz ou reinicia.</Text>
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
