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
//
// Clearing progress sits under its own "Data" section (CANGUPA-52) and is
// confirmed with Popup, the same screen-covering card WinPopup uses for the
// win celebration, rather than the OS-native Alert.alert the web version's
// confirm() inspired — matching the app's own visual language instead of
// looking like a system dialog. The No button takes focus as soon as the
// popup opens, since it's the safe default for a destructive confirmation.
import { type ComponentRef, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { LOCALES, type LanguageSetting, type Locale } from '../i18n/locale';
import { useStrings } from '../i18n/useStrings';
import { type Settings } from '../state/settings';
import { type Palette, type ThemeMode } from '../theme/palette';
import { groupedRowCorners } from './groupedRow';
import Popup from './Popup';

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
  readonly onChangeHints: (hints: boolean) => void;
  readonly onChangeAnim: (anim: boolean) => void;
  readonly onChangeSound: (sound: boolean) => void;
  readonly onChangeFall: (fall: boolean) => void;
  readonly onChangeLanguage: (language: LanguageSetting) => void;
  readonly onClearProgress: () => void;
}

export default function SettingsScreen({
  settings,
  palette,
  onChangeThemeMode,
  onChangeHints,
  onChangeAnim,
  onChangeSound,
  onChangeFall,
  onChangeLanguage,
  onClearProgress,
}: SettingsScreenProps) {
  const t = useStrings();
  const ink = { color: palette.ink };
  const muted = { color: palette.muted };
  const [confirmVisible, setConfirmVisible] = useState(false);
  const noButtonRef = useRef<ComponentRef<typeof Pressable>>(null);

  useEffect(() => {
    if (confirmVisible) {
      noButtonRef.current?.focus();
    }
  }, [confirmVisible]);

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

  const confirmAndClear = () => {
    setConfirmVisible(false);
    onClearProgress();
  };

  return (
    <View style={styles.container}>
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
            testID="toggle-hints"
            label={t.settings.hints}
            value={settings.hints}
            onChange={onChangeHints}
            ink={ink}
            palette={palette}
            index={0}
            length={4}
          />
          <ToggleRow
            testID="toggle-anim"
            label={t.settings.anim}
            value={settings.anim}
            onChange={onChangeAnim}
            ink={ink}
            palette={palette}
            index={1}
            length={4}
          />
          <ToggleRow
            testID="toggle-fall"
            label={t.settings.fall}
            value={settings.fall}
            onChange={onChangeFall}
            ink={ink}
            palette={palette}
            index={2}
            length={4}
          />
          <ToggleRow
            testID="toggle-sound"
            label={t.settings.sound}
            value={settings.sound}
            onChange={onChangeSound}
            ink={ink}
            palette={palette}
            index={3}
            length={4}
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

        <Text style={[styles.sectionLabel, muted]}>{t.settings.data}</Text>
        <Pressable
          style={[
            styles.row,
            { backgroundColor: palette.panel, borderColor: palette.panelBorder },
            groupedRowCorners(0, 1, ROW_RADIUS),
          ]}
          onPress={() => setConfirmVisible(true)}
        >
          <Text style={ink}>{t.settings.clearProgress}</Text>
        </Pressable>
      </ScrollView>

      {confirmVisible && (
        <Popup
          palette={palette}
          heading={t.settings.clearProgressTitle}
          onClose={() => setConfirmVisible(false)}
          actions={
            <View style={styles.confirmActions}>
              <Pressable
                ref={noButtonRef}
                style={[styles.cancelButton, { backgroundColor: palette.panel }]}
                onPress={() => setConfirmVisible(false)}
              >
                <Text style={ink}>{t.settings.no}</Text>
              </Pressable>
              <Pressable style={[styles.primary, { backgroundColor: palette.control }]} onPress={confirmAndClear}>
                <Text style={[styles.primaryLabel, ink]}>{t.settings.yes}</Text>
              </Pressable>
            </View>
          }
        />
      )}
    </View>
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
  container: {
    flex: 1,
  },
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
  confirmActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
  },
  // Same pill shape and palette.control fill as WinPopup's primary button.
  primary: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
  },
  primaryLabel: {
    fontWeight: '600',
  },
});
