// A stats screen for apps/app (CANGUPA-30): the totals panel (CANGUPA-48)
// first, unchanged by CANGUPA-90 below, then the achievements grid. The
// per-level best-move list this screen used to show (CANGUPA-30) was
// removed: the panel's own "Levels cleared" row already said as much, and
// a flat row list leaves room to add further stats here later without
// reshaping the screen. No on-screen title (CANGUPA-49): the footer tab
// already names this screen "Stats".
//
// The achievements grid (CANGUPA-90) is displayed the same way as
// DigiSpin's own (its StatsScreen.tsx, achievementGrid.ts), ported
// directly rather than reinvented: a width-driven grid of cards (an icon,
// a title, a fixed-height description, and an earned date once earned),
// an unearned card dimmed and sat on the page's own background instead of
// the panel colour. It lives below the totals panel rather than a new
// footer tab or screen of its own — there's no spare tab slot today
// (CANGUPA-147 already has first claim on a fifth one, for Store).
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { useStrings } from '../i18n/useStrings';
import { ACHIEVEMENTS, type AchievementRecord } from '../state/achievements';
import { type Progress, totalBestMoves } from '../state/progress';
import { type Palette } from '../theme/palette';
import { achievementRows, achievementsPerRow, cardWidth, GAP_PT } from './achievementGrid';

interface StatsScreenProps {
  readonly totalLevels: number;
  readonly progress: Progress;
  readonly achievements: AchievementRecord;
  readonly palette: Palette;
}

// A friendly rendering of an earned id's "YYYY-MM-DD" date (CANGUPA-90,
// ported from DigiSpin's own formatEarnedDate) as dd/mm/yyyy — always
// date-only, since an achievement's earned date never carries a time.
function formatEarnedDate(iso: string): string {
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
}

// An unearned achievement's name is kept out of sight (the description
// still shows, by the owner's choice, so this isn't a full spoiler guard —
// just the name and icon stay a surprise until earned).
const HIDDEN_TITLE = '???';
const HIDDEN_ICON = 'lock-closed-outline';

export default function StatsScreen({ totalLevels, progress, achievements, palette }: StatsScreenProps) {
  const t = useStrings();
  const cleared = progress.done.length;
  const { width } = useWindowDimensions();
  const perRow = achievementsPerRow(width);
  const rows = achievementRows(ACHIEVEMENTS, perRow);
  const cardSize = cardWidth(width, perRow);

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <View style={[styles.panel, { backgroundColor: palette.panel, borderColor: palette.panelBorder }]}>
        <Row label={t.stats.levelsCleared} value={t.stats.levelsClearedValue(cleared, totalLevels)} palette={palette} />
        <Row label={t.stats.totalMoves} value={t.stats.totalMovesValue(totalBestMoves(progress))} palette={palette} />
        <Row label={t.stats.hintsUsed} value={t.stats.hintsUsedValue(progress.hintsUsed)} palette={palette} />
        <Row label={t.stats.undosUsed} value={t.stats.undosUsedValue(progress.undosUsed)} palette={palette} />
      </View>

      <Text style={[styles.heading, { color: palette.muted }]} accessibilityRole="header">
        {t.achievements.heading}
      </Text>
      <View style={styles.grid}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.gridRow}>
            {row.map((achievement) => {
              const earned = achievements.earned.includes(achievement.id);
              const earnedDate = achievements.earnedDates[achievement.id];
              const color = earned ? palette.ink : palette.muted;
              const text = t.achievements.items[ACHIEVEMENTS.indexOf(achievement)];
              return (
                <View
                  key={achievement.id}
                  style={[
                    styles.card,
                    { width: cardSize, backgroundColor: earned ? palette.panel : palette.bg2, borderColor: palette.panelBorder },
                  ]}
                  // `accessible` makes this one element over the card's icon,
                  // title and description Texts, rather than a screen reader
                  // landing on each in turn.
                  accessible
                  accessibilityLabel={t.achievements.achievementStatus(text.title, earned)}
                >
                  <Ionicons name={(earned ? achievement.icon : HIDDEN_ICON) as never} size={28} color={color} />
                  <Text style={[styles.cardTitle, { color }]}>{earned ? text.title : HIDDEN_TITLE}</Text>
                  {/* Exactly three lines of height, whatever the text needs
                      (1, 2 or 3), so the line below always sits at the same
                      spot on every card. */}
                  <Text style={[styles.cardDescription, { color: palette.muted }]} numberOfLines={3}>
                    {text.description}
                  </Text>
                  {/* No "Not yet" for an unearned achievement: this line
                      shows nothing, but still reserves its height, so
                      earning it does not change the card's shape. An
                      achievement earned before earnedDates existed has
                      none to show either. */}
                  <Text style={[styles.cardValue, { color: palette.muted }]}>
                    {earned && earnedDate ? t.achievements.earnedOn(formatEarnedDate(earnedDate)) : ''}
                  </Text>
                </View>
              );
            })}
          </View>
        ))}
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
    paddingVertical: 4,
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
  heading: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  grid: {
    gap: GAP_PT,
  },
  gridRow: {
    flexDirection: 'row',
    gap: GAP_PT,
  },
  card: {
    minHeight: 150,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Exactly three lines tall (3 * lineHeight), whatever the actual text
  // needs, so the line below sits at the same position on every card.
  cardDescription: {
    fontSize: 13,
    lineHeight: 18,
    height: 18 * 3,
    textAlign: 'center',
  },
  // One line tall even when empty (an unearned achievement, or one earned
  // before earnedDates recorded a date), so earning it does not reshape
  // the card.
  cardValue: {
    fontSize: 11,
    fontWeight: '500',
    height: 16,
  },
});
