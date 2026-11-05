// Ported from apps/web-classic/index.html's `#help` aside ("Regras"). The
// keyboard-shortcut sentence in the web version's note is dropped: this port
// is touch-only (CANGUPA-18), so there are no keys to list.
import { StyleSheet, Text, View } from 'react-native';

import { useStrings } from '../i18n/useStrings';
import { type Palette } from '../theme/palette';

interface HelpScreenProps {
  readonly palette: Palette;
}

export default function HelpScreen({ palette }: HelpScreenProps) {
  const t = useStrings();
  const ink = { color: palette.ink };
  const muted = { color: palette.muted };

  const rules: readonly { readonly bold?: string; readonly rest: string }[] = [
    { bold: t.help.stepBold, rest: t.help.stepRest },
    { bold: t.help.jumpBold, rest: t.help.jumpRest },
    { rest: t.help.onlyUnused },
    { bold: t.help.doubleBold, rest: t.help.doubleRest },
    { bold: t.help.steelBold, rest: t.help.steelRest },
    { bold: t.help.signpostBold, rest: t.help.signpostRest },
    { rest: t.help.outOfMoves },
  ];

  return (
    <View style={styles.wrap}>
      <Text style={[styles.heading, ink]}>{t.help.heading}</Text>
      <Text style={ink}>{t.help.intro}</Text>
      <View style={styles.list}>
        {rules.map((rule, i) => (
          <Text key={i} style={ink}>
            {'• '}
            {rule.bold && <Text style={styles.bold}>{rule.bold}</Text>}
            {rule.rest}
          </Text>
        ))}
      </View>
      <Text style={[styles.note, muted]}>{t.help.note}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
  },
  list: {
    gap: 4,
  },
  bold: {
    fontWeight: '600',
  },
  note: {
    fontSize: 13,
  },
});
