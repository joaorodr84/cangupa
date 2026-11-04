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
// pack's grid stacked in a row. Cells keep the level's play-order number,
// the one the board's HUD and the home screen show, so a number means the
// same level on every screen.
//
// The header (CANGUPA-76, matching DigiSpin's own pack header,
// DIGISPIN-173/174) carries its own back button rather than reusing
// App.tsx's floating one: the button and the pack's name share one row,
// the name centred across the whole row — via a same-sized spacer balancing
// the button on the other side — and set in the pack's own colour
// (packColors.ts) instead of the theme's ink. A done level is coloured the
// same way, no separate "N/M solved" count repeated here (LevelPacksScreen
// already shows it per pack on the list before this). Cangupa has no
// DigiSpin-style "mastered" state (every solution found), so a done cell
// gets no star overlay — just its pack colour.
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import BackArrow from './BackArrow';
import { useStrings } from '../i18n/useStrings';
import { isDone, isUnlocked, type Progress } from '../state/progress';
import { type Palette } from '../theme/palette';
import { PACK_COLORS, packLabelColorFor } from '../theme/packColors';
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
  readonly onBack: () => void;
}

export default function LevelsScreen({
  packIndex,
  packSizes,
  progress,
  currentLevel,
  palette,
  onSelectLevel,
  onBack,
}: LevelsScreenProps) {
  const t = useStrings();
  const { width } = useWindowDimensions();
  const perRow = levelsPerRow(width);
  const size = squareSize(width, perRow);
  const color = PACK_COLORS[packIndex % PACK_COLORS.length];
  const labelColor = packLabelColorFor(packIndex);

  let start = 0;
  for (let i = 0; i < packIndex; i++) {
    start += packSizes[i];
  }
  const levels = Array.from({ length: packSizes[packIndex] }, (_, i) => start + i);
  const text = t.packs[packIndex];

  return (
    <ScrollView contentContainerStyle={styles.grid}>
      <View style={styles.header} testID="pack-header">
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel={t.common.backToList}
          style={[styles.back, { backgroundColor: palette.panel }]}
        >
          <BackArrow color={palette.ink} />
        </Pressable>
        <Text accessibilityRole="header" style={[styles.packName, { color }]}>
          {text?.name ?? ''}
        </Text>
        <View style={styles.back} />
      </View>
      {text ? <Text style={[styles.fact, { color: palette.muted }]}>{text.blurb}</Text> : null}
      <View style={styles.rows}>
        {levelRows(levels, perRow).map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((levelIndex) => {
              const done = isDone(progress, levelIndex);
              const unlocked = isUnlocked(progress, levelIndex, start);
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
                    // Solid either way — done takes the pack's own colour
                    // (CANGUPA-76, matching LevelPacksScreen's swatch)
                    // instead of a plain theme accent, and locked drops the
                    // opacity-0.4 fade for a plain panel background with
                    // dimmed text below, so no cell is ever see-through
                    // (CANGUPA-46).
                    { backgroundColor: done ? color : palette.panel, borderColor: palette.ink },
                    current && styles.current,
                  ]}
                >
                  <Text style={[styles.number, { color: done ? labelColor : unlocked ? palette.ink : palette.muted }]}>
                    {levelIndex + 1}
                  </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  // Centred in the row via flex:1 on both sides of it — the back button and
  // its same-sized spacer (styles.back) — not just the room beside the
  // button (DigiSpin's own DIGISPIN-174).
  packName: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  back: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fact: {
    fontSize: 16,
    lineHeight: 22,
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
  number: {
    fontSize: 18,
    fontWeight: '600',
  },
});
