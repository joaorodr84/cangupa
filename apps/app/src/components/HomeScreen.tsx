// Launch screen (CANGUPA-28): the first panel shown, before the board. The
// "Cangupa" wordmark above it (Shell's title in App.tsx, shown on every
// panel) doubles as this screen's logo, so there's no separate art here —
// just the one button into the resume level.
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { type Palette } from '../theme/palette';

interface HomeScreenProps {
  readonly palette: Palette;
  readonly onPlay: () => void;
}

export default function HomeScreen({ palette, onPlay }: HomeScreenProps) {
  return (
    <View style={styles.wrap}>
      <Pressable style={[styles.button, { backgroundColor: 'rgba(255,214,90,0.3)' }]} onPress={onPlay}>
        <Text style={[styles.label, { color: palette.ink }]}>Jogar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
});
