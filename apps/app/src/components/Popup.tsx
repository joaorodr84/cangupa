// The centered-card overlay WinPopup introduced (CANGUPA-32), factored out
// so any screen that needs to cover its content with a confirmation or a
// celebration — not just the board's win popup — can share the same frame:
// a dimmed backdrop that blocks touches to whatever is behind it
// (CANGUPA-122 — a plain View at default pointerEvents already absorbs
// touches rather than passing them through, so no Pressable/onPress is
// needed just to block), a rounded panel, an optional ✕ close button and an
// optional heading, with the caller's own text as children.
//
// `actions` (CANGUPA-52) is a separate slot from `children`, not just more
// content: it gets a fixed-height strip pinned to the card's bottom, while
// `children` gets whatever height is left above it and centers in it — so
// the button row always sits at the same place instead of drifting with
// how much body text a given popup has.
import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { type Palette } from '../theme/palette';

// Tall enough for one row of pill buttons plus breathing room on both sides.
const ACTIONS_HEIGHT = 72;

interface PopupProps {
  readonly palette: Palette;
  readonly heading?: string;
  readonly onClose?: () => void;
  readonly children?: ReactNode;
  readonly actions?: ReactNode;
}

export default function Popup({ palette, heading, onClose, children, actions }: PopupProps) {
  const ink = { color: palette.ink };

  return (
    <View style={styles.overlay} testID="popup-overlay">
      <View testID="popup-card" style={[styles.card, { backgroundColor: palette.bg2, borderColor: palette.panelBorder }]}>
        {onClose && (
          <Pressable style={styles.close} onPress={onClose}>
            <Text style={[styles.closeLabel, ink]}>✕</Text>
          </Pressable>
        )}
        <View testID="popup-content" style={styles.content}>
          {heading && <Text style={[styles.heading, ink]}>{heading}</Text>}
          {children}
        </View>
        {actions && <View style={styles.actions}>{actions}</View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    // Dims whatever the popup covers, independent of palette (light or
    // dark), so it reads as "unavailable" the same way in both themes.
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  card: {
    minWidth: 280,
    // CANGUPA-123: minHeight and maxHeight both live here, same as before
    // this chased its tail — content's own flex: 1 (removed below) was the
    // actual problem, not which node held which bound. A node with min+max
    // height that also contains a flex: 1 descendant is a known native
    // layout footgun: it doesn't auto-size to content at all, it just
    // snaps to whichever single explicit bound is present — pinned to
    // minHeight when both were on this node, then to maxHeight once
    // content's flex: 1 was the only constraint left opposing it (every
    // popup, not just HelpPopup, rendered at ~82% of the screen). Content
    // below has no flex now, so card is a plain auto-sized box again,
    // clamped between these two like any ordinary View.
    minHeight: 220,
    maxWidth: '86%',
    // Bounds the card so a popup with more content than WinPopup's short
    // text (HelpPopup.tsx's Moves/Tiles sections) has a fixed height to
    // scroll inside, instead of just growing past the screen. HelpPopup's
    // own ScrollView carries an explicit height of its own to actually
    // fill that room — see its own comment for why.
    maxHeight: '82%',
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 28,
    paddingVertical: 24,
    alignItems: 'center',
    // card has no flex-grow child to fill its minHeight floor now (see
    // above), so without this, short content (WinPopup's heading + a line
    // of text + actions) just stacks from the top by default, leaving any
    // slack between that and the floor as a single gap below actions
    // instead of split evenly around the group.
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  actions: {
    height: ACTIONS_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  close: {
    position: 'absolute',
    top: 10,
    right: 12,
    padding: 8,
  },
  closeLabel: {
    fontSize: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: '600',
  },
});
