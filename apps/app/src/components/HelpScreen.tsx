// Ported from apps/web-classic/index.html's `#help` aside ("Regras"). The
// keyboard-shortcut sentence in the web version's note is dropped: this port
// is touch-only (CANGUPA-18), so there are no keys to list.
import { StyleSheet, Text, View } from 'react-native';

import { type Palette } from '../theme/palette';

const RULES: readonly { readonly bold?: string; readonly rest: string }[] = [
  { bold: 'Passo:', rest: ' move-te uma casa para cima, baixo, esquerda ou direita.' },
  { bold: 'Salto:', rest: ' duas casas em linha reta, por cima de um buraco ou de outra casa.' },
  { rest: 'Só podes cair numa casa que ainda não foi usada. Ao saíres de uma casa, ela desaparece.' },
  {
    bold: 'Casas duplas',
    rest: ' (douradas) têm de ser pisadas duas vezes: racham à primeira e desaparecem à segunda.',
  },
  { rest: 'Se ficares sem jogadas, desfaz ou reinicia.' },
];

interface HelpScreenProps {
  readonly palette: Palette;
}

export default function HelpScreen({ palette }: HelpScreenProps) {
  const ink = { color: palette.ink };
  const muted = { color: palette.muted };

  return (
    <View style={styles.wrap}>
      <Text style={[styles.heading, ink]}>Regras</Text>
      <Text style={ink}>Pisa todas as casas para limpar o nível. Começas na casa marcada com o canguru.</Text>
      <View style={styles.list}>
        {RULES.map((rule, i) => (
          <Text key={i} style={ink}>
            {'• '}
            {rule.bold && <Text style={styles.bold}>{rule.bold}</Text>}
            {rule.rest}
          </Text>
        ))}
      </View>
      <Text style={[styles.note, muted]}>Toca numa casa destacada para jogar.</Text>
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
