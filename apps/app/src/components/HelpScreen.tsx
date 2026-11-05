// Ported from apps/web-classic/index.html's `#help` aside ("Regras"). The
// keyboard-shortcut sentence in the web version's note is dropped: this port
// is touch-only (CANGUPA-18), so there are no keys to list.
//
// Rebuilt for CANGUPA-101 from one flat bullet list into labelled sections
// (SettingsScreen.tsx's own "Appearance"/"Gameplay" pattern), since each new
// tile type (Steel, then Signpost, then Gate) had just kept adding another
// line to an undifferentiated list. Each tile's own line now carries a
// colour swatch, taken from the live palette rather than a hardcoded hex, so
// the page reads as a quick reference a player can actually check mid-level
// (CANGUPA-103's help icon, BoardHud.tsx) rather than a wall of text to read
// once up front — no interactive walkthrough is in scope (CANGUPA-102 kept
// the level-design-only easing-in as-is).
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useStrings } from '../i18n/useStrings';
import { type Palette } from '../theme/palette';

interface HelpScreenProps {
  readonly palette: Palette;
}

export default function HelpScreen({ palette }: HelpScreenProps) {
  const t = useStrings();
  const ink = { color: palette.ink };
  const muted = { color: palette.muted };

  const moves: readonly { readonly bold: string; readonly rest: string }[] = [
    { bold: t.help.stepBold, rest: t.help.stepRest },
    { bold: t.help.jumpBold, rest: t.help.jumpRest },
  ];

  // One row per tile kind that exists today — Common isn't listed, since
  // "step on it once" is already covered by Step/Jump above and it needs no
  // swatch to recognise. Steel, then Signpost, then Gate were each added
  // here the moment they first shipped in a real level (CANGUPA-68/69/88).
  const tiles: readonly { readonly key: string; readonly bold: string; readonly rest: string; readonly swatch: string }[] = [
    { key: 'gold', bold: t.help.doubleBold, rest: t.help.doubleRest, swatch: palette.tile2 },
    { key: 'steel', bold: t.help.steelBold, rest: t.help.steelRest, swatch: palette.tile3 },
    { key: 'signpost', bold: t.help.signpostBold, rest: t.help.signpostRest, swatch: palette.tileSignpost },
    { key: 'gate', bold: t.help.gateBold, rest: t.help.gateRest, swatch: palette.tileGate },
  ];

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={styles.content}>
      <Text style={[styles.heading, ink]}>{t.help.heading}</Text>
      <Text style={ink}>{t.help.intro}</Text>

      <Text style={[styles.sectionLabel, muted]}>{t.help.movesSection}</Text>
      <View style={styles.list}>
        {moves.map((rule, i) => (
          <Text key={i} style={ink}>
            {'• '}
            <Text style={styles.bold}>{rule.bold}</Text>
            {rule.rest}
          </Text>
        ))}
        <Text style={ink}>{'• '}{t.help.onlyUnused}</Text>
      </View>

      <Text style={[styles.sectionLabel, muted]}>{t.help.tilesSection}</Text>
      <View style={styles.list}>
        {tiles.map((tile) => (
          <View key={tile.key} style={styles.tileRow}>
            <View testID={`help-swatch-${tile.key}`} style={[styles.swatch, { backgroundColor: tile.swatch }]} />
            <Text style={[styles.tileText, ink]}>
              <Text style={styles.bold}>{tile.bold}</Text>
              {tile.rest}
            </Text>
          </View>
        ))}
      </View>

      <Text style={ink}>{'• '}{t.help.outOfMoves}</Text>
      <Text style={[styles.note, muted]}>{t.help.note}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
  },
  content: {
    gap: 12,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  list: {
    gap: 4,
  },
  bold: {
    fontWeight: '600',
  },
  tileRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  swatch: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginTop: 2,
  },
  tileText: {
    flex: 1,
  },
  note: {
    fontSize: 13,
  },
});
