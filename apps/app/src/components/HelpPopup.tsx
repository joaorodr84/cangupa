// The board screen's own Help button (BoardHud.tsx) used to navigate to the
// full HelpScreen, which unmounted BoardScreen and so silently restarted the
// level (useBoard.ts's Game lives in BoardScreen's own local state) — the
// opposite of what helpDesc has always promised ("without leaving the
// level"). CANGUPA-121 replaces that navigation with this popup instead,
// rendered on top of the board the same way WinPopup.tsx already is, so
// BoardScreen never unmounts. Content is MovesSection/TilesSection, shared
// verbatim with HelpScreen.tsx (HelpSections.tsx) rather than a second copy
// that could drift — the Buttons section is left out, since the player is
// already looking at the real HUD it would describe.
import { ScrollView, StyleSheet, useWindowDimensions } from 'react-native';

import { MovesSection, TilesSection } from './HelpSections';
import Popup from './Popup';
import { useStrings } from '../i18n/useStrings';
import { type Palette } from '../theme/palette';

interface HelpPopupProps {
  readonly palette: Palette;
  readonly onClose: () => void;
}

export default function HelpPopup({ palette, onClose }: HelpPopupProps) {
  const t = useStrings();
  // CANGUPA-123: Popup's own content wrapper used to be flex: 1, which this
  // ScrollView leant on to fill the card — but that flex: 1 was also what
  // made *every* Popup (WinPopup, Settings' clear-progress confirm, not
  // just this one) balloon out to the card's full maxHeight regardless of
  // how little text it had, so it had to go. Without it, this ScrollView
  // needs to size itself: an explicit height (not a cap — a cap only limits
  // a size it would otherwise reach on its own, and it never grows on its
  // own without flex or an explicit size to begin with) comfortably inside
  // card's own 82%-of-screen ceiling.
  const { height: windowHeight } = useWindowDimensions();

  return (
    <Popup palette={palette} heading={t.boardHud.help} onClose={onClose}>
      <ScrollView
        testID="help-popup-scroll"
        style={[styles.scroll, { height: windowHeight * 0.5 }]}
        contentContainerStyle={styles.content}
      >
        <MovesSection palette={palette} />
        <TilesSection palette={palette} />
      </ScrollView>
    </Popup>
  );
}

const styles = StyleSheet.create({
  // alignSelf: 'stretch' opts out of Popup's own content box centering its
  // children (WinPopup's short, centred text), so this takes the card's
  // full width instead of shrinking to its own content's width.
  scroll: {
    alignSelf: 'stretch',
    width: '100%',
  },
  content: {
    gap: 12,
  },
});
