// Ported from apps/web-classic/index.html's `#settings` aside and ui.js's
// settings wiring and clear-progress confirm(). Text stays the Portuguese
// of the original — the web version has no i18n layer either, so this port
// doesn't add one.
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

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

  const confirmClear = () => {
    Alert.alert('Apagar todo o progresso?', undefined, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar', style: 'destructive', onPress: onClearProgress },
    ]);
  };

  return (
    <View style={styles.wrap}>
      <Text style={[styles.heading, ink]}>Definições</Text>

      <Text style={ink}>Tema</Text>
      <View style={styles.row}>
        {THEMES.map((theme) => (
          <Pressable
            key={theme}
            testID={`theme-${theme}`}
            onPress={() => onChangeTheme(theme)}
            style={[
              styles.chip,
              { backgroundColor: palette.panel },
              theme === settings.theme && styles.chipSelected,
            ]}
          >
            <Text style={ink}>{THEME_LABELS[theme]}</Text>
          </Pressable>
        ))}
      </View>

      <ToggleRow
        testID="toggle-jumps"
        label="Saltos de duas casas"
        value={settings.jumps}
        onChange={onChangeJumps}
        ink={ink}
      />
      <ToggleRow
        testID="toggle-hints"
        label="Destacar jogadas possíveis"
        value={settings.hints}
        onChange={onChangeHints}
        ink={ink}
      />
      <ToggleRow testID="toggle-anim" label="Animações" value={settings.anim} onChange={onChangeAnim} ink={ink} />

      <Pressable style={[styles.button, { backgroundColor: palette.panel }]} onPress={confirmClear}>
        <Text style={ink}>Apagar progresso</Text>
      </Pressable>
    </View>
  );
}

interface ToggleRowProps {
  readonly testID: string;
  readonly label: string;
  readonly value: boolean;
  readonly onChange: (value: boolean) => void;
  readonly ink: { color: string };
}

function ToggleRow({ testID, label, value, onChange, ink }: ToggleRowProps) {
  return (
    <View style={styles.toggleRow}>
      <Text style={ink}>{label}</Text>
      <Switch testID={testID} value={value} onValueChange={onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipSelected: {
    borderColor: 'rgba(255,214,90,0.9)',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  button: {
    alignSelf: 'flex-start',
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 999,
  },
});
