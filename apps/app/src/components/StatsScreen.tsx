// A stats screen for apps/app (CANGUPA-30), scoped to what the saved
// Progress record (progress.ts) already tracks: how many levels are
// cleared, and the fewest moves each cleared level has ever taken. Needed as
// a destination for CANGUPA-31's footer "Stats" tab.
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useStrings } from '../i18n/useStrings';
import { type Progress, totalBestMoves } from '../state/progress';
import { type Palette } from '../theme/palette';

interface StatsScreenProps {
  readonly totalLevels: number;
  readonly progress: Progress;
  readonly palette: Palette;
}

export default function StatsScreen({ totalLevels, progress, palette }: StatsScreenProps) {
  const t = useStrings();
  const ink = { color: palette.ink };
  const muted = { color: palette.muted };
  const cleared = progress.done.length;

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={[styles.heading, ink]}>{t.stats.heading}</Text>

      <View style={styles.summary}>
        <Text style={ink}>{t.stats.levelsCleared(cleared, totalLevels)}</Text>
        <Text style={ink}>{t.stats.totalMoves(totalBestMoves(progress))}</Text>
      </View>

      {cleared === 0 ? (
        <Text style={[styles.empty, muted]}>{t.stats.empty}</Text>
      ) : (
        <View style={styles.list}>
          {progress.done.map((levelIndex) => (
            <View key={levelIndex} style={[styles.row, { backgroundColor: palette.panel }]}>
              <Text style={ink}>{t.stats.level(levelIndex + 1)}</Text>
              <Text style={muted}>{t.stats.moves(progress.bestMoves[levelIndex])}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 14,
    padding: 4,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
  },
  summary: {
    gap: 4,
  },
  empty: {
    fontSize: 13,
  },
  list: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
});
