// A reusable bottom nav (CANGUPA-31), shown on the home, levels, stats and
// settings screens — the board screen deliberately has none (see CANGUPA-32:
// its HUD was reworked to be chrome-free during play), and Regras has no tab
// of its own, reachable only through the home screen's Rules button
// (CANGUPA-29). Replaces the board screen's old inline Níveis/Regras/
// Definições row, which only ever showed up while playing.
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { type Palette } from '../theme/palette';

export type FooterTab = 'home' | 'levels' | 'stats' | 'settings';

const TABS: readonly { readonly id: FooterTab; readonly label: string }[] = [
  { id: 'home', label: 'Início' },
  { id: 'levels', label: 'Níveis' },
  { id: 'stats', label: 'Estatísticas' },
  { id: 'settings', label: 'Definições' },
];

interface FooterNavProps {
  readonly active: FooterTab;
  readonly palette: Palette;
  readonly onSelect: (tab: FooterTab) => void;
}

export default function FooterNav({ active, palette, onSelect }: FooterNavProps) {
  return (
    <View style={styles.wrap}>
      {TABS.map((tab) => (
        <Pressable
          key={tab.id}
          testID={`footer-${tab.id}`}
          onPress={() => onSelect(tab.id)}
          style={[styles.tab, { backgroundColor: palette.panel }, tab.id === active && styles.active]}
        >
          <Text style={{ color: palette.ink }}>{tab.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  tab: {
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  active: {
    borderColor: 'rgba(255,214,90,0.9)',
  },
});
