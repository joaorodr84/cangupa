// A reusable bottom nav (CANGUPA-31), shown on the home, levels, stats and
// settings screens — the board screen deliberately has none (see CANGUPA-32:
// its HUD was reworked to be chrome-free during play), and Regras has no tab
// of its own, reachable only through the home screen's Rules button
// (CANGUPA-29). Replaces the board screen's old inline Níveis/Regras/
// Definições row, which only ever showed up while playing.
//
// Icon-only tray styled after DigiSpin's TabBar (CANGUPA-36): hand-drawn
// react-native-svg glyphs on a 24-unit grid rather than a vector-icons
// dependency neither app installs, a flat tray with a hairline top border
// instead of Cangupa's old floating pill buttons, and the active tab marked
// by swapping the icon's own color (ink vs muted) rather than a border or
// background — labels still exist, just as accessibilityLabel instead of
// visible text.
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { useStrings } from '../i18n/useStrings';
import { type Palette } from '../theme/palette';

export type FooterTab = 'home' | 'levels' | 'stats' | 'settings';

const ICON_SIZE = 28;

interface TabIconProps {
  readonly id: FooterTab;
  readonly color: string;
}

function TabIcon({ id, color }: TabIconProps) {
  return (
    <Svg testID={`footer-icon-${id}`} width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none">
      {id === 'home' && (
        <Path
          d="M3 11 L12 4 L21 11 M5 10 V20 H10 V14 H14 V20 H19 V10"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {id === 'levels' && (
        <Path
          d="M4 6 H20 M4 12 H20 M4 18 H20"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {id === 'stats' && (
        <Path
          d="M5 20 V13 M12 20 V5 M19 20 V10"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {id === 'settings' && (
        <>
          <Path d="M4 7 H20 M4 17 H20" stroke={color} strokeWidth={2} strokeLinecap="round" />
          <Circle cx={9} cy={7} r={2.5} fill={color} />
          <Circle cx={15} cy={17} r={2.5} fill={color} />
        </>
      )}
    </Svg>
  );
}

interface FooterNavProps {
  readonly active: FooterTab;
  readonly palette: Palette;
  readonly onSelect: (tab: FooterTab) => void;
}

export default function FooterNav({ active, palette, onSelect }: FooterNavProps) {
  const t = useStrings();
  const tabs: readonly { readonly id: FooterTab; readonly label: string }[] = [
    { id: 'home', label: t.tabs.home },
    { id: 'levels', label: t.tabs.levels },
    { id: 'stats', label: t.tabs.stats },
    { id: 'settings', label: t.tabs.settings },
  ];
  return (
    <View style={[styles.wrap, { backgroundColor: palette.panel, borderTopColor: palette.muted }]}>
      {tabs.map((tab) => {
        const selected = tab.id === active;
        return (
          <Pressable
            key={tab.id}
            testID={`footer-${tab.id}`}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected }}
            onPress={() => onSelect(tab.id)}
            style={styles.tab}
          >
            <TabIcon id={tab.id} color={selected ? palette.ink : palette.muted} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    borderTopWidth: 1,
  },
  tab: {
    flex: 1,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
