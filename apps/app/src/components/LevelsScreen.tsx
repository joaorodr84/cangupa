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
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { isDone, isUnlocked, type Progress } from '../state/progress';
import { type Palette } from '../theme/palette';
import { GAP_PT, levelRows, levelsPerRow, squareSize } from './levelGrid';

interface LevelsScreenProps {
  readonly totalLevels: number;
  readonly progress: Progress;
  readonly currentLevel: number;
  readonly palette: Palette;
  readonly onSelectLevel: (levelIndex: number) => void;
}

export default function LevelsScreen({
  totalLevels,
  progress,
  currentLevel,
  palette,
  onSelectLevel,
}: LevelsScreenProps) {
  const { width } = useWindowDimensions();
  const perRow = levelsPerRow(width);
  const size = squareSize(width, perRow);
  const rows = levelRows(
    Array.from({ length: totalLevels }, (_, levelIndex) => levelIndex),
    perRow,
  );

  return (
    <ScrollView contentContainerStyle={styles.grid}>
      {rows.map((row, rowIndex) => (
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: GAP_PT,
    paddingVertical: 4,
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
