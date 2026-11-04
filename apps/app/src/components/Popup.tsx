// The centered-card overlay WinPopup introduced (CANGUPA-32), factored out
// so any screen that needs to cover its content with a confirmation or a
// celebration — not just the board's win popup — can share the same frame:
// a backdrop that still lets touches outside the card through
// (pointerEvents="box-none"), a rounded panel, an optional ✕ close button
// and an optional heading, with the caller's own text as children.
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
    <View style={styles.overlay} pointerEvents="box-none">
      <View style={[styles.card, { backgroundColor: palette.bg2, borderColor: palette.panelBorder }]}>
        {onClose && (
          <Pressable style={styles.close} onPress={onClose}>
            <Text style={[styles.closeLabel, ink]}>✕</Text>
          </Pressable>
        )}
        <View style={styles.content}>
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
  },
  card: {
    minWidth: 280,
    minHeight: 220,
    maxWidth: '86%',
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 28,
    paddingVertical: 24,
    alignItems: 'center',
  },
  content: {
    flex: 1,
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
