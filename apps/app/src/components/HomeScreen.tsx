// Launch screen (CANGUPA-28): the first panel shown, before the board. The
// "Cangupa" wordmark above it (Shell's title in App.tsx, shown on every
// panel) doubles as this screen's logo, so there's no separate art here.
// Stacked below it (CANGUPA-29): which level Play opens, Play itself, and a
// Rules button into the existing Regras screen (HelpScreen.tsx, CANGUPA-26).
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { type Palette } from '../theme/palette';

interface HomeScreenProps {
  readonly palette: Palette;
  readonly levelNumber: number;
  readonly onPlay: () => void;
  readonly onRules: () => void;
}

export default function HomeScreen({ palette, levelNumber, onPlay, onRules }: HomeScreenProps) {
  return (
    <View style={styles.wrap}>
      <Text style={[styles.level, { color: palette.muted }]}>Nível {levelNumber}</Text>
      <Pressable style={[styles.button, { backgroundColor: 'rgba(255,214,90,0.3)' }]} onPress={onPlay}>
        <Text style={[styles.label, { color: palette.ink }]}>Jogar</Text>
      </Pressable>
      <Pressable style={[styles.rulesButton, { backgroundColor: palette.panel }]} onPress={onRules}>
        <Text style={[styles.rulesLabel, { color: palette.ink }]}>Regras</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  level: {
    fontSize: 15,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 999,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
  },
  rulesButton: {
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 999,
  },
  rulesLabel: {
    fontSize: 15,
  },
});
