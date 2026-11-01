// Ported from apps/web-classic/js/ui.js's renderLevels() and style.css's
// #level-grid rules: a numbered grid of every level, showing which are
// cleared, which is the current one, and which are still locked.
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { isDone, isUnlocked, type Progress } from '../state/progress';
import { type Palette } from '../theme/palette';

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
  return (
    <ScrollView contentContainerStyle={styles.grid}>
      {Array.from({ length: totalLevels }, (_, levelIndex) => {
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
              { backgroundColor: palette.panel },
              done && styles.done,
              current && styles.current,
              !unlocked && styles.locked,
            ]}
          >
            <Text style={{ color: palette.ink }}>{levelIndex + 1}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 4,
  },
  cell: {
    width: 52,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  done: {
    backgroundColor: 'rgba(120,220,140,0.22)',
    borderColor: 'rgba(120,220,140,0.5)',
  },
  current: {
    borderWidth: 2,
    borderColor: 'rgba(255,214,90,0.9)',
  },
  // `button:disabled { opacity: .4; }` in style.css.
  locked: {
    opacity: 0.4,
  },
});
