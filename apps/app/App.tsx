import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import * as Sound from './src/audio/sound';
import BackArrow from './src/components/BackArrow';
import BoardScreen from './src/components/BoardScreen';
import FooterNav, { type FooterTab } from './src/components/FooterNav';
import HelpScreen from './src/components/HelpScreen';
import HomeScreen from './src/components/HomeScreen';
import LevelPacksScreen from './src/components/LevelPacksScreen';
import LevelsScreen from './src/components/LevelsScreen';
import SettingsScreen from './src/components/SettingsScreen';
import StatsScreen from './src/components/StatsScreen';
import { LEVELS, PACK_SIZES } from './src/game/levels';
import { LanguageContext } from './src/i18n/LanguageContext';
import { type LanguageSetting } from './src/i18n/locale';
import { useStrings } from './src/i18n/useStrings';
import { firstUnsolvedLevel, isDone, type Progress } from './src/state/progress';
import { type Settings } from './src/state/settings';
import { useProgress } from './src/state/useProgress';
import { useSettings } from './src/state/useSettings';
import { DARK, paletteFor, type ThemeMode } from './src/theme/palette';

type Panel = 'home' | 'board' | 'levels' | 'help' | 'settings' | 'stats';

// Which panels FooterNav covers (CANGUPA-31) — 'board' (reworked chrome-free
// in CANGUPA-32) and 'help' (reachable from the home screen's Rules button,
// CANGUPA-29, and from CANGUPA-103's BoardHud Help button) are deliberately
// left out.
function isFooterTab(panel: Panel): panel is FooterTab {
  return panel === 'home' || panel === 'levels' || panel === 'stats' || panel === 'settings';
}

// Board and Help are one-level detail screens pushed on top of whichever
// panel was active, not peers in a general-purpose history stack (CANGUPA-86)
// — Board has two real entry points (Home's Play button, Levels'
// onSelectLevel), so a hardcoded "back always goes home" stranded a level
// opened from Levels on the wrong tab, and (CANGUPA-103) Help now also opens
// from Board itself, not just Home. `returnTo` remembers whichever single
// panel launched the current Board/Help, the same way `openPack` already
// does for the Levels tab's own pack-grid/pack-list depth, instead of a full
// stack — which would risk a confusing bounce (Home → Board → Help → Board →
// …) for screens that are never more than one level deep from whatever's
// right behind them.

// The app root. Settings and progress are read before anything is shown, so
// no panel flashes the wrong theme or the wrong level while they load —
// the same guard apps/web-classic/js/ui.js gets for free from localStorage
// being synchronous, and DigiSpin's App.tsx also uses for AsyncStorage.
export default function App() {
  const { settings, setThemeMode, setHints, setAnim, setSound, setFall, setLanguage } = useSettings();
  const { progress, recordDone, recordLevel, clearProgress } = useProgress();

  // Kept in sync here rather than read fresh on every Sound.jump() call,
  // the same split as the web version's `Sound.enabled` (ui.js sets it,
  // sound.js only reads it).
  useEffect(() => {
    if (settings) {
      Sound.setEnabled(settings.sound);
    }
  }, [settings]);

  if (!settings || !progress) {
    return <View style={styles.app} />;
  }

  return (
    <SafeAreaProvider>
      <LanguageContext.Provider value={settings.language}>
        <Shell
          settings={settings}
          onChangeThemeMode={setThemeMode}
          onChangeHints={setHints}
          onChangeAnim={setAnim}
          onChangeSound={setSound}
          onChangeFall={setFall}
          onChangeLanguage={setLanguage}
          progress={progress}
          onLevelDone={recordDone}
          onChangeLevel={recordLevel}
          onClearProgress={clearProgress}
        />
      </LanguageContext.Provider>
    </SafeAreaProvider>
  );
}

interface ShellProps {
  readonly settings: Settings;
  readonly onChangeThemeMode: (themeMode: ThemeMode) => void;
  readonly onChangeHints: (hints: boolean) => void;
  readonly onChangeAnim: (anim: boolean) => void;
  readonly onChangeSound: (sound: boolean) => void;
  readonly onChangeFall: (fall: boolean) => void;
  readonly onChangeLanguage: (language: LanguageSetting) => void;
  readonly progress: Progress;
  readonly onLevelDone: (levelIndex: number, moves: number) => void;
  readonly onChangeLevel: (levelIndex: number) => void;
  readonly onClearProgress: () => void;
}

function Shell({
  settings,
  onChangeThemeMode,
  onChangeHints,
  onChangeAnim,
  onChangeSound,
  onChangeFall,
  onChangeLanguage,
  progress,
  onLevelDone,
  onChangeLevel,
  onClearProgress,
}: ShellProps) {
  const insets = useSafeAreaInsets();
  const t = useStrings();
  const [panel, setPanel] = useState<Panel>('home');
  // The open pack's index within the Levels tab, or null to show the pack
  // list (CANGUPA-73, mirroring DigiSpin's own DIGISPIN-163/166). Persists
  // across a switch to another tab and back — leaving and returning to a
  // pack's own grid finds it exactly as it was — the one way back to the
  // list without using its own back arrow is tapping the Levels tab again
  // while already on it.
  const [openPack, setOpenPack] = useState<number | null>(null);
  // Which panel Board/Help should return to (CANGUPA-86, widened by
  // CANGUPA-103) — set by `goTo` every time either opens, defaulting to
  // 'home' since that's the first screen there is anything to return from at
  // all. Board is only ever opened from a footer tab, so its own `returnTo`
  // is always one; Help can now also open from Board itself (CANGUPA-103's
  // BoardHud button), so this has to be a full `Panel`, not just a `FooterTab`.
  const [returnTo, setReturnTo] = useState<Panel>('home');
  const palette = paletteFor(settings.themeMode, useColorScheme());
  const currentLevel = Math.max(0, Math.min(LEVELS.length - 1, progress.level));
  // Where Play opens into, not just progress.level (the last level played):
  // the first level, across every pack in pack order, not yet cleared — so
  // Play still lands on the right level after CANGUPA-77 let a pack be
  // played out of order.
  const playLevel = firstUnsolvedLevel(progress, LEVELS.length);

  // Opens Board or Help, remembering whichever panel is active right now so
  // its own Back returns to exactly that — a footer tab in most cases, or
  // 'board' when Help is opened from BoardHud's own Help button (CANGUPA-103)
  // mid-level, rather than from the home screen's Rules button.
  const goTo = (target: 'board' | 'help') => {
    setReturnTo(panel);
    setPanel(target);
  };

  const goToLevel = (levelIndex: number) => {
    onChangeLevel(levelIndex);
    goTo('board');
  };

  const selectFooterTab = (tab: FooterTab) => {
    if (tab === 'levels' && panel === 'levels') {
      setOpenPack(null);
    }
    setPanel(tab);
  };

  const showFooter = isFooterTab(panel);

  let content;
  if (panel === 'home') {
    content = (
      <HomeScreen
        palette={palette}
        levelNumber={playLevel + 1}
        onPlay={() => goToLevel(playLevel)}
        onRules={() => goTo('help')}
      />
    );
  } else if (panel === 'levels') {
    content =
      openPack === null ? (
        <LevelPacksScreen packSizes={PACK_SIZES} progress={progress} palette={palette} onOpenPack={setOpenPack} />
      ) : (
        <LevelsScreen
          packIndex={openPack}
          packSizes={PACK_SIZES}
          progress={progress}
          currentLevel={currentLevel}
          palette={palette}
          onSelectLevel={goToLevel}
          onBack={() => setOpenPack(null)}
        />
      );
  } else if (panel === 'stats') {
    content = <StatsScreen totalLevels={LEVELS.length} progress={progress} palette={palette} />;
  } else if (panel === 'help') {
    content = <HelpScreen palette={palette} />;
  } else if (panel === 'settings') {
    content = (
      <SettingsScreen
        settings={settings}
        palette={palette}
        onChangeThemeMode={onChangeThemeMode}
        onChangeHints={onChangeHints}
        onChangeAnim={onChangeAnim}
        onChangeSound={onChangeSound}
        onChangeFall={onChangeFall}
        onChangeLanguage={onChangeLanguage}
        onClearProgress={() => {
          onClearProgress();
          goTo('board');
        }}
      />
    );
  } else {
    content = (
      // Keyed on the level: a new level starts from a fresh board, achieved
      // here by remounting rather than by useBoard reacting to a changed
      // prop (see useBoard.ts).
      <BoardScreen
        key={currentLevel}
        level={LEVELS[currentLevel]}
        hints={settings.hints}
        anim={settings.anim}
        fall={settings.fall}
        palette={palette}
        levelNumber={currentLevel + 1}
        totalLevels={LEVELS.length}
        hasNext={currentLevel < LEVELS.length - 1 && isDone(progress, currentLevel)}
        onBack={() => setPanel(returnTo)}
        onNext={() => onChangeLevel(currentLevel + 1)}
        onHelp={() => goTo('help')}
        onLevelComplete={(moves) => onLevelDone(currentLevel, moves)}
      />
    );
  }

  return (
    <View style={[styles.app, { backgroundColor: palette.bg2 }]}>
      <View
        style={[
          styles.content,
          // Below a footer tab, the bar itself (not this padding) reaches the
          // bottom edge and carries its own insets.bottom — see FooterNav's
          // insetBottom prop — so this box owes no bottom padding of its own.
          { paddingTop: insets.top + 16, paddingBottom: showFooter ? 0 : insets.bottom + 16 },
        ]}
      >
        {/* Help is the only panel that still needs this floating button: every
            footer tab is one tap from another via FooterNav (no "back" concept
            of its own — CANGUPA-86 fixed `stats` wrongly showing this too,
            alongside the footer nav, left over from before it was a tab), an
            open pack carries its own back button in LevelsScreen's own header
            row (CANGUPA-76) instead, and Board has BoardHud's own (CANGUPA-35). */}
        {panel === 'help' && (
          <Pressable
            onPress={() => setPanel(returnTo)}
            accessibilityRole="button"
            accessibilityLabel={t.common.back}
            style={[styles.backButton, { backgroundColor: palette.panel }]}
          >
            <BackArrow color={palette.ink} />
          </Pressable>
        )}
        <View style={styles.body}>{content}</View>
      </View>
      {/* Outside the padded content box (CANGUPA-45), so the bar spans the
          screen's full width and sits flush against the bottom edge, instead
          of inheriting content's horizontal padding and insets.bottom gap. */}
      {showFooter && <FooterNav active={panel} palette={palette} onSelect={selectFooterTab} insetBottom={insets.bottom} />}
      {/* Light status-bar content reads against the dark palette's near-black
          bg2; the light palette needs the inverse (DigiSpin's App.tsx does
          the same identity check rather than going through resolvedThemeOf,
          since the only two values are its own DARK/LIGHT constants). */}
      <StatusBar style={palette === DARK ? 'light' : 'dark'} />
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    gap: 14,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
  },
});
