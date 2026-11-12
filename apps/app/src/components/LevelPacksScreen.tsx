// The Levels tab's top level (CANGUPA-73), styled after DigiSpin's own
// PacksScreen: one row per pack — a coloured swatch (packColors.ts) on the
// left holding a placeholder icon (PackIcon.tsx, until a real icon per pack
// is chosen), its name and level range (t.packRange) in the middle, and on
// the right how many of its levels are solved, as a bare "5/25" with no
// "solved" word — deliberately bare, not just terser, so a future
// cleared/mastered icon (CANGUPA-134) has a slot to sit in just left of it
// without the count itself having to move. A pack's blurb is shown only
// once it's open, on LevelsScreen's own header, not repeated here. Every
// pack opens on tap — a pack is never locked by sequence, only the levels
// inside one can be (state/progress.ts's isUnlocked), same as before.
//
// The packs sit inside one card per collection (CANGUPA-133), whose header
// — the collection's name, with the same bare count summed over every pack
// on the right — collapses and expands the rows below it on tap. With a
// single collection this only tidies the list away; it is shaped as a card
// so a second collection is another card under this one rather than a
// second flat run of rows with only a pill between them. Whether it is
// collapsed is the caller's state, not this component's: opening a pack
// unmounts this screen (App.tsx swaps it for LevelsScreen), and state held
// here would spring back open on every return from a pack.
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

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
  readonly collapsed: boolean;
  readonly onToggleCollapsed: () => void;
  readonly onOpenPack: (packIndex: number) => void;
}

export default function LevelPacksScreen({
  packSizes,
  progress,
  palette,
  collapsed,
  onToggleCollapsed,
  onOpenPack,
}: LevelPacksScreenProps) {
  const t = useStrings();

  let start = 0;
  const packs = packSizes.map((count, packIndex) => {
    const levels = Array.from({ length: count }, (_, i) => start + i);
    start += count;
    const cleared = levels.filter((levelIndex) => isDone(progress, levelIndex)).length;
    return { packIndex, levels, cleared };
  });
  const totalLevels = start;
  const totalCleared = packs.reduce((sum, pack) => sum + pack.cleared, 0);

  return (
    <ScrollView contentContainerStyle={styles.list}>
      <View style={[styles.card, { backgroundColor: palette.panel, borderColor: palette.panelBorder }]}>
        <Pressable
          testID="collection-toggle"
          onPress={onToggleCollapsed}
          accessibilityRole="button"
          accessibilityState={{ expanded: !collapsed }}
          style={({ pressed }) => [styles.header, pressed && styles.pressed]}
        >
          <View style={styles.text}>
            <Text accessibilityRole="header" style={[styles.title, { color: palette.ink }]}>
              {t.collection}
            </Text>
          </View>
          <Text testID="collection-count" style={[styles.collectionCount, { color: palette.muted }]}>
            {totalCleared}/{totalLevels}
          </Text>
          {/* Points up while open ("tap to fold away") and down while closed,
              the usual disclosure convention. */}
          <Svg
            testID={collapsed ? 'collection-chevron-down' : 'collection-chevron-up'}
            width={22}
            height={22}
            viewBox="0 0 24 24"
            fill="none"
            stroke={palette.muted}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <Path d={collapsed ? 'M6 9 L12 15 L18 9' : 'M6 15 L12 9 L18 15'} />
          </Svg>
        </Pressable>
        {!collapsed && (
          <View style={styles.rows}>
            {packs.map(({ packIndex, levels, cleared }) => {
              const text = t.packs[packIndex];
              const color = PACK_COLORS[packIndex % PACK_COLORS.length];
              return (
                <Pressable
                  key={packIndex}
                  testID={`pack-${packIndex + 1}`}
                  onPress={() => onOpenPack(packIndex)}
                  accessibilityRole="button"
                  // palette.control, not the palette.panel a row used before
                  // the card existed: the card itself is panel now, and a
                  // panel row on a panel card has no edge at all.
                  style={({ pressed }) => [styles.row, { backgroundColor: palette.control }, pressed && styles.pressed]}
                >
                  <View testID={`pack-swatch-${packIndex + 1}`} style={[styles.swatch, { backgroundColor: color }]}>
                    <PackIcon pack={packIndex} color={packLabelColorFor(packIndex)} />
                  </View>
                  <View style={styles.text}>
                    <Text style={[styles.name, { color: palette.ink }]}>{text?.name ?? ''}</Text>
                    <Text style={{ color: palette.muted }}>
                      {t.packRange(levels[0] + 1, levels[levels.length - 1] + 1)}
                    </Text>
                  </View>
                  <Text testID={`pack-count-${packIndex + 1}`} style={[styles.packCount, { color: palette.muted }]}>
                    {cleared}/{levels.length}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
    paddingVertical: 4,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  // Both counts sit on the right of their item, centred against its full
  // height by the row's own alignItems. The collection's is deliberately
  // smaller than its 22pt title; a pack's matches its 16pt name (owner's
  // call on both). tabular-nums keeps a column of them from jittering as
  // digits change width.
  collectionCount: {
    fontSize: 16,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  packCount: {
    fontSize: 16,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    marginRight: 4,
  },
  // The same inset on both sides (owner's call over a left-only indent), so
  // the rows read as held inside the card rather than hanging off its title.
  // 14 rather than the header's 16: the row's own 12 of padding then puts a
  // swatch 26 in from the card's edge, clearly inside the title's 16.
  rows: {
    gap: 8,
    paddingHorizontal: 14,
    paddingBottom: 14,
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
