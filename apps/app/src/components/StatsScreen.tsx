// A stats screen for apps/app (CANGUPA-30), laid out as a single bordered
// panel of label/value rows (CANGUPA-48), matching DigiSpin's own
// StatsScreen.tsx. The per-level best-move list this screen used to show
// (CANGUPA-30) was removed: the panel's own "Levels cleared" row already
// said as much, and a flat row list leaves room to add further stats here
// later without reshaping the screen.
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
  const cleared = progress.done.length;

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={[styles.heading, { color: palette.ink }]}>{t.stats.heading}</Text>

      <View style={[styles.panel, { backgroundColor: palette.panel, borderColor: palette.panelBorder }]}>
        <Row label={t.stats.levelsCleared} value={t.stats.levelsClearedValue(cleared, totalLevels)} palette={palette} />
        <Row label={t.stats.totalMoves} value={t.stats.totalMovesValue(totalBestMoves(progress))} palette={palette} />
      </View>
    </ScrollView>
  );
}

function Row({ label, value, palette }: { readonly label: string; readonly value: string; readonly palette: Palette }) {
  return (
    <View style={styles.row}>
      <Text style={{ color: palette.muted }}>{label}</Text>
      <Text style={[styles.value, { color: palette.ink }]}>{value}</Text>
    </View>
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
  panel: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
  },
  value: {
    fontWeight: '600',
  },
});
