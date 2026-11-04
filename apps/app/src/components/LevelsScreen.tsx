// Ported from apps/web-classic/js/ui.js's renderLevels() and style.css's
// #level-grid rules: a numbered grid of every level, showing which are
// cleared, which is the current one, and which are still locked. Laid out
// in explicit rows sized off the window width (levelGrid.ts, CANGUPA-46),
// the same technique DigiSpin's own LevelsScreen uses for its level grid,
// rather than a fixed-width cell left to flexbox's own wrap behaviour. The
// current-level outline (CANGUPA-50) also follows DigiSpin's own: a plain
// `palette.ink` border rather than an accent colour, since ink already
// tracks the external @joaorodr84/themes package instead of holding its
// own fixed hex value.
//
// Scoped to one pack at a time (CANGUPA-73, mirroring DigiSpin's own
// LevelsScreen once it gained the same split, DIGISPIN-163): the Levels tab
// shows the pack list (LevelPacksScreen) first, and opening a pack brings up
// just its own grid here — replacing CANGUPA-56's one long scroll of every
// pack's grid stacked in a row. Getting back to the list reuses App.tsx's
// existing header back arrow (it steps to the pack list instead of the
// board while a pack is open) rather than a second arrow of this screen's
// own. Cells keep the level's play-order number, the one the board's HUD
// and the home screen show, so a number means the same level on every
// screen.
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { useStrings } from '../i18n/useStrings';
import { isDone, isUnlocked, type Progress } from '../state/progress';
import { type Palette } from '../theme/palette';
import { GAP_PT, levelRows, levelsPerRow, squareSize } from './levelGrid';

interface LevelsScreenProps {
  readonly packIndex: number;
  // How many levels each pack has, in pack order; level indices run on from
  // one pack to the next, so a pack starts where the one before it ends.
  readonly packSizes: readonly number[];
  readonly progress: Progress;
  readonly currentLevel: number;
  readonly palette: Palette;
  readonly onSelectLevel: (levelIndex: number) => void;
}

export default function LevelsScreen({
  packIndex,
  packSizes,
  progress,
  currentLevel,
  palette,
  onSelectLevel,
}: LevelsScreenProps) {
  const t = useStrings();
  const { width } = useWindowDimensions();
  const perRow = levelsPerRow(width);
  const size = squareSize(width, perRow);

  let start = 0;
  for (let i = 0; i < packIndex; i++) {
    start += packSizes[i];
  }
  const levels = Array.from({ length: packSizes[packIndex] }, (_, i) => start + i);
  const text = t.packs[packIndex];
  const cleared = levels.filter((levelIndex) => isDone(progress, levelIndex)).length;

  return (
    <ScrollView contentContainerStyle={styles.grid}>
      <View style={styles.header} testID="pack-header">
        <Text accessibilityRole="header" style={[styles.packName, { color: palette.ink }]}>
          {text?.name ?? ''}
        </Text>
        <Text style={{ color: palette.muted }}>{`${cleared}/${levels.length}`}</Text>
      </View>
      {text ? <Text style={{ color: palette.muted }}>{text.blurb}</Text> : null}
      <View style={styles.rows}>
        {levelRows(levels, perRow).map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((levelIndex) => {
              const done = isDone(progress, levelIndex);
              const unlocked = isUnlocked(progress, levelIndex);
              const current = levelIndex === currentLevel;
              return (
                <Pressable
                  key={levelIndex}
                  testID={`level-${levelIndex + 1}`}
                  disabled={!unlocked}
                  onPress={() => onSelectLevel(levelIndex)}
                  style={[
                    styles.cell,
                    { width: size, height: size },
                    // Solid either way — done takes the theme's one accent
                    // colour (the same one the Play button uses) instead of
                    // the previous translucent green tint, and locked drops
                    // the opacity-0.4 fade for a plain panel background with
                    // dimmed text below, so no cell is ever see-through
                    // (CANGUPA-46).
                    { backgroundColor: done ? palette.control : palette.panel, borderColor: palette.ink },
                    current && styles.current,
                  ]}
                >
                  <Text style={{ color: unlocked ? palette.ink : palette.muted }}>{levelIndex + 1}</Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 12,
    paddingVertical: 4,
  },
  header: {
    gap: 2,
  },
  packName: {
    fontSize: 20,
    fontWeight: '700',
  },
  rows: {
    gap: GAP_PT,
  },
  row: {
    flexDirection: 'row',
    gap: GAP_PT,
  },
  cell: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
  },
  current: {
    borderWidth: 2,
  },
});
