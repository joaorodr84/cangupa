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
import { ScrollView, StyleSheet } from 'react-native';

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

  return (
    <Popup palette={palette} heading={t.boardHud.help} onClose={onClose}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
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
