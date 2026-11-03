// Ported from apps/web-classic/index.html's `#settings` aside and ui.js's
// settings wiring and clear-progress confirm(). The web version still has no
// i18n layer (CANGUPA-38 only covers apps/app).
//
// Laid out in labelled sections of rounded rows (CANGUPA-37), matching
// DigiSpin's SettingsScreen.tsx: an uppercase section label above a group of
// full-width rows, each with a trailing mark for the selected choice. Rows
// within a group sit flush against each other with only the group's first
// and last corners rounded (CANGUPA-51), so the group reads as one block
// rather than a stack of separate pills; a 1px border stands in for the gap
// that used to separate the rows. The language section (CANGUPA-38) follows
// DigiSpin's own language picker: 'system' listed first, each language shown
// in its own name (an endonym), not translated — the same convention every
// mainstream OS language picker follows, so "Português" still reads as
// "Português" while the app is currently showing English. No on-screen title
// (CANGUPA-49): the footer tab already names this screen "Settings".
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { LOCALES, type LanguageSetting, type Locale } from '../i18n/locale';
import { useStrings } from '../i18n/useStrings';
import { type Settings } from '../state/settings';
import { type Palette, type ThemeMode } from '../theme/palette';
import { groupedRowCorners } from './groupedRow';

// The radius each row group rounds its first and last row to (CANGUPA-51);
// matches the plain rounded corners the rows used before they were grouped.
const ROW_RADIUS = 12;

const LANGUAGE_NAMES: Readonly<Record<Locale, string>> = {
  en: 'English',
  pt: 'Português',
};

interface SettingsScreenProps {
  readonly settings: Settings;
  readonly palette: Palette;
  readonly onChangeThemeMode: (themeMode: ThemeMode) => void;
  readonly onChangeJumps: (jumps: boolean) => void;
  readonly onChangeHints: (hints: boolean) => void;
  readonly onChangeAnim: (anim: boolean) => void;
  readonly onChangeLanguage: (language: LanguageSetting) => void;
  readonly onClearProgress: () => void;
}

export default function SettingsScreen({
  settings,
  palette,
  onChangeThemeMode,
  onChangeJumps,
  onChangeHints,
  onChangeAnim,
  onChangeLanguage,
  onClearProgress,
}: SettingsScreenProps) {
  const t = useStrings();
  const ink = { color: palette.ink };
  const muted = { color: palette.muted };

  // 'system' first, as the default and the choice most players want
  // (DigiSpin's SettingsScreen.tsx lists its own equivalent the same way).
  const themeChoices: readonly { readonly mode: ThemeMode; readonly label: string }[] = [
    { mode: 'system', label: t.settings.followDevice },
    { mode: 'light', label: t.settings.light },
    { mode: 'dark', label: t.settings.dark },
  ];

  const languageChoices: readonly { readonly language: LanguageSetting; readonly label: string }[] = [
    { language: 'system', label: t.settings.followDevice },
    ...LOCALES.map((locale) => ({ language: locale, label: LANGUAGE_NAMES[locale] })),
  ];

  const confirmClear = () => {
    Alert.alert(t.settings.clearProgressTitle, undefined, [
      { text: t.settings.cancel, style: 'cancel' },
      { text: t.settings.confirmClear, style: 'destructive', onPress: onClearProgress },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={[styles.sectionLabel, muted]}>{t.settings.appearance}</Text>
      <View accessibilityRole="radiogroup" accessibilityLabel={t.settings.appearance}>
        {themeChoices.map((choice, index) => {
          const selected = choice.mode === settings.themeMode;
          return (
            <Pressable
              key={choice.mode}
              testID={`theme-mode-${choice.mode}`}
              onPress={() => onChangeThemeMode(choice.mode)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              style={[
                styles.row,
                { backgroundColor: palette.panel, borderColor: palette.panelBorder },
                groupedRowCorners(index, themeChoices.length, ROW_RADIUS),
              ]}
            >
              <Text style={ink}>{choice.label}</Text>
              <View style={[styles.mark, { borderColor: palette.muted }, selected && { backgroundColor: palette.ink }]} />
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.sectionLabel, muted]}>{t.settings.gameplay}</Text>
      <View>
        <ToggleRow
          testID="toggle-jumps"
          label={t.settings.jumps}
          value={settings.jumps}
          onChange={onChangeJumps}
          ink={ink}
          palette={palette}
          index={0}
          length={3}
        />
        <ToggleRow
          testID="toggle-hints"
          label={t.settings.hints}
          value={settings.hints}
          onChange={onChangeHints}
          ink={ink}
          palette={palette}
          index={1}
          length={3}
        />
        <ToggleRow
          testID="toggle-anim"
          label={t.settings.anim}
          value={settings.anim}
          onChange={onChangeAnim}
          ink={ink}
          palette={palette}
          index={2}
          length={3}
        />
      </View>

      <Text style={[styles.sectionLabel, muted]}>{t.settings.language}</Text>
      <View accessibilityRole="radiogroup" accessibilityLabel={t.settings.language}>
        {languageChoices.map((choice, index) => {
          const selected = choice.language === settings.language;
          return (
            <Pressable
              key={choice.language}
              testID={`language-${choice.language}`}
              onPress={() => onChangeLanguage(choice.language)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              style={[
                styles.row,
                { backgroundColor: palette.panel, borderColor: palette.panelBorder },
                groupedRowCorners(index, languageChoices.length, ROW_RADIUS),
              ]}
            >
              <Text style={ink}>{choice.label}</Text>
              <View style={[styles.mark, { borderColor: palette.muted }, selected && { backgroundColor: palette.ink }]} />
            </Pressable>
          );
        })}
      </View>

      <Pressable
        style={[
          styles.row,
          { backgroundColor: palette.panel, borderColor: palette.panelBorder },
          groupedRowCorners(0, 1, ROW_RADIUS),
        ]}
        onPress={confirmClear}
      >
        <Text style={ink}>{t.settings.clearProgress}</Text>
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
  readonly index: number;
  readonly length: number;
}

function ToggleRow({ testID, label, value, onChange, ink, palette, index, length }: ToggleRowProps) {
  return (
    <View
      style={[
        styles.row,
        { backgroundColor: palette.panel, borderColor: palette.panelBorder },
        groupedRowCorners(index, length, ROW_RADIUS),
      ]}
    >
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
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  // Corner radius comes from groupedRowCorners instead of a fixed value here
  // (CANGUPA-51): only a group's first and last row round, so the group
  // reads as one block rather than a stack of separate pills.
  row: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  mark: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
  },
});
