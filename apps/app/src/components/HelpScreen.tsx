// Ported from apps/web-classic/index.html's `#help` aside ("Regras"). The
// keyboard-shortcut sentence in the web version's note is dropped: this port
// is touch-only (CANGUPA-18), so there are no keys to list.
//
// Rebuilt for CANGUPA-101 from one flat bullet list into labelled sections
// (SettingsScreen.tsx's own "Appearance"/"Gameplay" pattern), since each new
// tile type (Steel, then Departure, then Arrival) had just kept adding another
// line to an undifferentiated list. Each tile's own line now carries a
// colour swatch, taken from the live palette rather than a hardcoded hex, so
// the page reads as a quick reference a player can actually check mid-level
// rather than a wall of text to read once up front — no interactive
// walkthrough is in scope (CANGUPA-102 kept the level-design-only easing-in
// as-is).
//
// CANGUPA-109 added the Step/Jump mini-boards, the Buttons section, and
// upgraded the Tiles section's flat colour squares to real tile renders —
// following tools/visualizers/rules.html's lead (itself following DigiSpin's
// ReferenceScreen.tsx) but built from the app's own real components instead
// of redrawn: Board (via its exported TileSwatch) renders these exactly as
// it renders the real board — real strokes on Gold/Steel, the real
// doorway-bracket mark (CANGUPA-107) on Departure/Arrival — and ControlIcon
// is the exact icon set BoardHud.tsx uses, so none of this can silently
// drift from what the board screen actually looks like.
//
// CANGUPA-121 moved the Moves and Tiles sections out to HelpSections.tsx, so
// the board screen's own mid-level Help button (HelpPopup.tsx, replacing the
// navigation CANGUPA-103 originally wired here — it was unmounting and so
// restarting the level) can render identical content instead of a second
// copy that could drift from this page. The Buttons section stays here only:
// it documents the real HUD, which only makes sense on a page reached
// without that HUD already on screen.
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import ControlIcon, { type ControlIconId } from './ControlIcon';
import { MovesSection, TilesSection, styles as sections } from './HelpSections';
import { useStrings } from '../i18n/useStrings';
import { type Palette } from '../theme/palette';

interface HelpScreenProps {
  readonly palette: Palette;
}

export default function HelpScreen({ palette }: HelpScreenProps) {
  const t = useStrings();
  const ink = { color: palette.ink };
  const muted = { color: palette.muted };

  // BoardHud.tsx's control group. CANGUPA-109 had this list open with Back
  // too (BoardHud's own leave-the-board arrow); CANGUPA-118 dropped that row
  // at the owner's request, so this is Hint/Undo/Restart/Help only now.
  const buttons: readonly { readonly id: ControlIconId; readonly name: string; readonly desc: string }[] = [
    { id: 'hint', name: t.boardHud.hint, desc: t.help.hintDesc },
    { id: 'undo', name: t.boardHud.undo, desc: t.help.undoDesc },
    { id: 'restart', name: t.boardHud.restart, desc: t.help.restartDesc },
    { id: 'help', name: t.boardHud.help, desc: t.help.helpDesc },
  ];

  const card = [sections.card, { backgroundColor: palette.panel, borderColor: palette.panelBorder }];

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={styles.content}>
      <Text style={[styles.heading, ink]}>{t.help.heading}</Text>
      <Text style={ink}>{t.help.intro}</Text>

      <MovesSection palette={palette} />
      <TilesSection palette={palette} />

      <View style={card}>
        <Text style={[sections.sectionLabel, muted]}>{t.help.buttonsSection}</Text>
        <View style={sections.list}>
          {buttons.map((button) => (
            <View key={button.id} style={sections.tileRow}>
              <View testID={`help-button-${button.id}`} style={[styles.buttonIcon, { backgroundColor: palette.control }]}>
                <ControlIcon id={button.id} color={palette.ink} />
              </View>
              <Text style={[sections.tileText, ink]}>
                <Text style={sections.bold}>{button.name}</Text>
                {'\n'}
                <Text style={muted}>{button.desc}</Text>
              </Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={[sections.note, muted]}>{t.help.note}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
  },
  content: {
    gap: 12,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
  },
  buttonIcon: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
