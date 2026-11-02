import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import BoardScreen from './src/components/BoardScreen';
import FooterNav, { type FooterTab } from './src/components/FooterNav';
import HelpScreen from './src/components/HelpScreen';
import HomeScreen from './src/components/HomeScreen';
import LevelsScreen from './src/components/LevelsScreen';
import SettingsScreen from './src/components/SettingsScreen';
import Starfield from './src/components/Starfield';
import StatsScreen from './src/components/StatsScreen';
import { LEVELS } from './src/game/levels';
import { isDone, type Progress } from './src/state/progress';
import { type Settings, type Theme } from './src/state/settings';
import { useProgress } from './src/state/useProgress';
import { useSettings } from './src/state/useSettings';
import { paletteFor } from './src/theme/palette';

type Panel = 'home' | 'board' | 'levels' | 'help' | 'settings' | 'stats';

// Which panels FooterNav covers (CANGUPA-31) — 'board' (reworked chrome-free
// in CANGUPA-32) and 'help' (reachable only via the home screen's Rules
// button, CANGUPA-29) are deliberately left out.
function isFooterTab(panel: Panel): panel is FooterTab {
  return panel === 'home' || panel === 'levels' || panel === 'stats' || panel === 'settings';
}

// The app root. Settings and progress are read before anything is shown, so
// no panel flashes the wrong theme or the wrong level while they load —
// the same guard apps/web-classic/js/ui.js gets for free from localStorage
// being synchronous, and DigiSpin's App.tsx also uses for AsyncStorage.
export default function App() {
  const { settings, setTheme, setJumps, setHints, setAnim } = useSettings();
  const { progress, recordDone, recordLevel, clearProgress } = useProgress();

  if (!settings || !progress) {
    return <View style={styles.app} />;
  }

  return (
    <SafeAreaProvider>
      <Shell
        settings={settings}
        onChangeTheme={setTheme}
        onChangeJumps={setJumps}
        onChangeHints={setHints}
        onChangeAnim={setAnim}
        progress={progress}
        onLevelDone={recordDone}
        onChangeLevel={recordLevel}
        onClearProgress={clearProgress}
      />
    </SafeAreaProvider>
  );
}

interface ShellProps {
  readonly settings: Settings;
  readonly onChangeTheme: (theme: Theme) => void;
  readonly onChangeJumps: (jumps: boolean) => void;
  readonly onChangeHints: (hints: boolean) => void;
  readonly onChangeAnim: (anim: boolean) => void;
  readonly progress: Progress;
  readonly onLevelDone: (levelIndex: number, moves: number) => void;
  readonly onChangeLevel: (levelIndex: number) => void;
  readonly onClearProgress: () => void;
}

function Shell({
  settings,
  onChangeTheme,
  onChangeJumps,
  onChangeHints,
  onChangeAnim,
  progress,
  onLevelDone,
  onChangeLevel,
  onClearProgress,
}: ShellProps) {
  const insets = useSafeAreaInsets();
  const [panel, setPanel] = useState<Panel>('home');
  const palette = paletteFor(settings.theme);
  const currentLevel = Math.max(0, Math.min(LEVELS.length - 1, progress.level));

  const goToLevel = (levelIndex: number) => {
    onChangeLevel(levelIndex);
    setPanel('board');
  };

  let content;
  if (panel === 'home') {
    content = (
      <HomeScreen
        palette={palette}
        levelNumber={currentLevel + 1}
        onPlay={() => setPanel('board')}
        onRules={() => setPanel('help')}
      />
    );
  } else if (panel === 'levels') {
    content = (
      <LevelsScreen
        totalLevels={LEVELS.length}
        progress={progress}
        currentLevel={currentLevel}
        palette={palette}
        onSelectLevel={goToLevel}
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
        onChangeTheme={onChangeTheme}
        onChangeJumps={onChangeJumps}
        onChangeHints={onChangeHints}
        onChangeAnim={onChangeAnim}
        onClearProgress={() => {
          onClearProgress();
          setPanel('board');
        }}
      />
    );
  } else {
    content = (
      // Keyed on the level and on the jumps rule: a new level starts from a
      // fresh board, and so does a jumps toggle mid-level — ui.js's reset()
      // call on a rule change, achieved here by remounting rather than by
      // useBoard reacting to a changed prop (see useBoard.ts).
      <BoardScreen
        key={`${currentLevel}-${settings.jumps}`}
        level={LEVELS[currentLevel]}
        rules={{ jumps: settings.jumps }}
        hints={settings.hints}
        anim={settings.anim}
        palette={palette}
        levelNumber={currentLevel + 1}
        totalLevels={LEVELS.length}
        hasNext={currentLevel < LEVELS.length - 1 && isDone(progress, currentLevel)}
        onBack={() => setPanel('home')}
        onNext={() => onChangeLevel(currentLevel + 1)}
        onLevelComplete={(moves) => onLevelDone(currentLevel, moves)}
      />
    );
  }

  return (
    <View style={[styles.app, { backgroundColor: palette.bg2 }]}>
      <Starfield stars={palette.stars} />
      <View style={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
        {panel !== 'board' && panel !== 'home' && (
          <Text style={[styles.title, { color: palette.ink }]}>Cangupa</Text>
        )}
        {/* Redundant on 'settings': it's a footer tab (CANGUPA-31), already one
            tap from Home, so "Voltar" only duplicated that path. */}
        {panel !== 'board' && panel !== 'home' && panel !== 'settings' && (
          <Pressable style={styles.back} onPress={() => setPanel('board')}>
            <Text style={{ color: palette.ink }}>‹ Voltar</Text>
          </Pressable>
        )}
        <View style={styles.body}>{content}</View>
        {isFooterTab(panel) && <FooterNav active={panel} palette={palette} onSelect={setPanel} />}
      </View>
      <StatusBar style="light" />
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
  title: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  back: {
    alignSelf: 'flex-start',
  },
  body: {
    flex: 1,
  },
});
