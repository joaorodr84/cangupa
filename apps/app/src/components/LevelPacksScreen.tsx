// The Levels tab's top level (CANGUPA-73), styled after DigiSpin's own
// PacksScreen: the collection's name in a pill badge, then one row per
// pack — a coloured swatch (packColors.ts) on the left holding a
// placeholder icon (PackIcon.tsx, until a real icon per pack is chosen),
// its name, and its level range with how many are solved
// (t.packRange, matching DigiSpin's own "Levels 1–25 · 5/25 solved"
// wording). A pack's blurb is shown only once it's open, on LevelsScreen's
// own header, not repeated here. Every pack opens on tap — a pack is never
// locked by sequence, only the levels inside one can be
// (state/progress.ts's isUnlocked), same as before.
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import PackIcon from './PackIcon';
import { useStrings } from '../i18n/useStrings';
import { isDone, type Progress } from '../state/progress';
import { type Palette } from '../theme/palette';
import { PACK_COLORS, packLabelColorFor } from '../theme/packColors';

interface LevelPacksScreenProps {
  // How many levels each pack has, in pack order; level indices run on from
  // one pack to the next, so a pack starts where the one before it ends.
  readonly packSizes: readonly number[];
  readonly progress: Progress;
  readonly palette: Palette;
  readonly onOpenPack: (packIndex: number) => void;
}

export default function LevelPacksScreen({ packSizes, progress, palette, onOpenPack }: LevelPacksScreenProps) {
  const t = useStrings();

  let start = 0;
  const packs = packSizes.map((count, packIndex) => {
    const levels = Array.from({ length: count }, (_, i) => start + i);
    start += count;
    return { packIndex, levels };
  });

  return (
    <ScrollView contentContainerStyle={styles.list}>
      <View style={[styles.titleBadge, { backgroundColor: palette.control }]}>
        <Text accessibilityRole="header" style={[styles.title, { color: palette.ink }]}>
          {t.collection}
        </Text>
      </View>
      {packs.map(({ packIndex, levels }) => {
        const text = t.packs[packIndex];
        const cleared = levels.filter((levelIndex) => isDone(progress, levelIndex)).length;
        const color = PACK_COLORS[packIndex % PACK_COLORS.length];
        return (
          <Pressable
            key={packIndex}
            testID={`pack-${packIndex + 1}`}
            onPress={() => onOpenPack(packIndex)}
            accessibilityRole="button"
            style={({ pressed }) => [styles.row, { backgroundColor: palette.panel }, pressed && styles.pressed]}
          >
            <View testID={`pack-swatch-${packIndex + 1}`} style={[styles.swatch, { backgroundColor: color }]}>
              <PackIcon color={packLabelColorFor(packIndex)} />
            </View>
            <View style={styles.text}>
              <Text style={[styles.name, { color: palette.ink }]}>{text?.name ?? ''}</Text>
              <Text style={{ color: palette.muted }}>
                {t.packRange(levels[0] + 1, levels[levels.length - 1] + 1, cleared, levels.length)}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
    paddingVertical: 4,
  },
  titleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 12,
    borderRadius: 14,
  },
  swatch: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
});
