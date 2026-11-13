// A single Store tab (CANGUPA-147), consolidating every in-app purchase
// instead of each one getting its own separate entry point. Today that's
// just Hints (CANGUPA-79's HintStoreRows, the same rows HintStorePopup.tsx
// shows, reused rather than reimplemented) — Packs (CANGUPA-106) is still
// blocked on the owner's free/paid pack cut and pricing, so it has no
// section here yet; ship with Hints only, add Packs once that decision
// lands. Laid out like SettingsScreen.tsx (a labelled section above a
// group of rows) rather than HintStorePopup's own screen-covering card: a
// footer tab is a destination, not an interruption, so it gets no heading
// or close button of its own — the footer tab already names the screen.
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { HintStoreRows } from './HintStorePopup';
import { useStrings } from '../i18n/useStrings';
import { type Palette } from '../theme/palette';

interface StoreScreenProps {
  readonly palette: Palette;
  readonly onPurchased: (hints: number) => void;
}

export default function StoreScreen({ palette, onPurchased }: StoreScreenProps) {
  const t = useStrings();
  const muted = { color: palette.muted };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.wrap}>
        {/* Reuses settings.hintStoreSection rather than a new string: it's the
            exact same section, "Hints," just shown here instead of (or as
            well as) under Settings. */}
        <Text style={[styles.sectionLabel, muted]}>{t.settings.hintStoreSection}</Text>
        <HintStoreRows palette={palette} onPurchased={onPurchased} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrap: {
    gap: 12,
    padding: 4,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
});
