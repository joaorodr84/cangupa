// Status line and controls, ported from apps/web-classic/js/ui.js's
// render() status branches and its undo/reset/hint/next buttons.
import { Fragment } from 'react';
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
  readonly onNext: () => void;
}

export default function BoardHud({ status, canUndo, palette, onUndo, onReset, onHint, onNext }: BoardHudProps) {
  return (
    <View style={styles.wrap}>
      <StatusLine status={status} palette={palette} onNext={onNext} />
      <View style={styles.toolbar}>
        <HudButton label="Desfazer" palette={palette} disabled={!canUndo} onPress={onUndo} />
        <HudButton label="Reiniciar" palette={palette} onPress={onReset} />
        <HudButton label="Dica" palette={palette} disabled={status.kind === 'won'} onPress={onHint} />
      </View>
    </View>
  );
}

function StatusLine({ status, palette, onNext }: { status: Status; palette: Palette; onNext: () => void }) {
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
    return (
      <Fragment>
        <Text style={ink}>
          <Text style={styles.bold}>Nível completo!</Text> <Text style={muted}>em {status.moves} jogadas</Text>
          {!status.hasNext && <Text style={muted}> · Acabaste o jogo!</Text>}
        </Text>
        {/* RN's Text cannot nest a Pressable, unlike the web version's
            inline <button> inside the status paragraph — this sits right
            below it instead. */}
        {status.hasNext && <HudButton label="Próximo nível" palette={palette} primary onPress={onNext} />}
      </Fragment>
    );
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
  readonly primary?: boolean;
}

function HudButton({ label, palette, onPress, disabled = false, primary = false }: HudButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        { backgroundColor: primary ? 'rgba(255,214,90,0.3)' : palette.panel },
        disabled && styles.buttonDisabled,
      ]}
    >
      <Text style={{ color: palette.ink }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  toolbar: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
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
