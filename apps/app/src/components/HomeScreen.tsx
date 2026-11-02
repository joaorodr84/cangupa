// Launch screen (CANGUPA-28): the first panel shown, before the board. The
// Cangupa logo (CANGUPA-34, asset from TILE-JUMPER-7) replaces the "Cangupa"
// text wordmark Shell's title in App.tsx otherwise shows on every panel.
// Stacked below it (CANGUPA-29): which level Play opens, Play itself, and a
// Rules button into the existing Regras screen (HelpScreen.tsx, CANGUPA-26).
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

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
      <Image source={palette.logo} style={styles.logo} resizeMode="contain" accessibilityRole="image" />
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
  logo: {
    // Fixed, not width: '%' + aspectRatio: the two don't combine reliably on
    // react-native-web — the image fell back to its native pixel size
    // instead of scaling down. Height is just width * (805 / 691), the
    // bundled PNGs' trimmed aspect ratio (TILE-JUMPER-7's vertical crop,
    // trimmed of its extra transparent canvas margin — see palette.ts).
    width: 200,
    height: 233,
    // On top of wrap's 16px gap, so the logo reads as its own block above
    // the level/Play/Rules group rather than one more item in the stack.
    marginBottom: 24,
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
