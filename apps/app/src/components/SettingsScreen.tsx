// Ported from apps/web-classic/index.html's `#settings` aside and ui.js's
// settings wiring and clear-progress confirm(). Text stays the Portuguese
// of the original — the web version has no i18n layer either, so this port
// doesn't add one.
//
// Laid out in labelled sections of rounded rows (CANGUPA-37), matching
// DigiSpin's SettingsScreen.tsx: an uppercase section label above a group of
// full-width rows, each with a trailing mark for the selected choice. Cangupa
// has only one radio-style group (Tema) plus a toggle group, so it keeps
// those two and drops DigiSpin's digit-colour and language sections, which
// this game has nothing equivalent to.
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { type Settings, THEMES, type Theme } from '../state/settings';
import { type Palette } from '../theme/palette';

const THEME_LABELS: Readonly<Record<Theme, string>> = {
  cosmos: 'Cosmos',
  space: 'Espaço (verde)',
  sand: 'Areia',
  ice: 'Gelo',
  classic: 'Clássico',
};

interface SettingsScreenProps {
  readonly settings: Settings;
  readonly palette: Palette;
  readonly onChangeTheme: (theme: Theme) => void;
  readonly onChangeJumps: (jumps: boolean) => void;
  readonly onChangeHints: (hints: boolean) => void;
  readonly onChangeAnim: (anim: boolean) => void;
  readonly onClearProgress: () => void;
}

export default function SettingsScreen({
  settings,
  palette,
  onChangeTheme,
  onChangeJumps,
  onChangeHints,
  onChangeAnim,
  onClearProgress,
}: SettingsScreenProps) {
  const ink = { color: palette.ink };
  const muted = { color: palette.muted };

  const confirmClear = () => {
    Alert.alert('Apagar todo o progresso?', undefined, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar', style: 'destructive', onPress: onClearProgress },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={[styles.heading, ink]}>Definições</Text>

      <Text style={[styles.sectionLabel, muted]}>Tema</Text>
      <View style={styles.group} accessibilityRole="radiogroup" accessibilityLabel="Tema">
        {THEMES.map((theme) => {
          const selected = theme === settings.theme;
          return (
            <Pressable
              key={theme}
              testID={`theme-${theme}`}
              onPress={() => onChangeTheme(theme)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              style={[styles.row, { backgroundColor: palette.panel }, selected && styles.rowSelected]}
            >
              <Text style={ink}>{THEME_LABELS[theme]}</Text>
              <View style={[styles.mark, { borderColor: palette.muted }, selected && { backgroundColor: palette.ink }]} />
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.sectionLabel, muted]}>Jogabilidade</Text>
      <View style={styles.group}>
        <ToggleRow
          testID="toggle-jumps"
          label="Saltos de duas casas"
          value={settings.jumps}
          onChange={onChangeJumps}
          ink={ink}
          palette={palette}
        />
        <ToggleRow
          testID="toggle-hints"
          label="Destacar jogadas possíveis"
          value={settings.hints}
          onChange={onChangeHints}
          ink={ink}
          palette={palette}
        />
        <ToggleRow testID="toggle-anim" label="Animações" value={settings.anim} onChange={onChangeAnim} ink={ink} palette={palette} />
      </View>

      <Pressable style={[styles.row, { backgroundColor: palette.panel }]} onPress={confirmClear}>
        <Text style={ink}>Apagar progresso</Text>
      </Pressable>
    </ScrollView>
  );
}

interface ToggleRowProps {
  readonly testID: string;
  readonly label: string;
  readonly value: boolean;
  readonly onChange: (value: boolean) => void;
  readonly ink: { color: string };
  readonly palette: Palette;
}

function ToggleRow({ testID, label, value, onChange, ink, palette }: ToggleRowProps) {
  return (
    <View style={[styles.row, { backgroundColor: palette.panel }]}>
      <Text style={ink}>{label}</Text>
      <Switch testID={testID} value={value} onValueChange={onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
    padding: 4,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  group: {
    gap: 8,
  },
  row: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  rowSelected: {
    borderColor: 'rgba(255,214,90,0.9)',
  },
  mark: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
  },
});
