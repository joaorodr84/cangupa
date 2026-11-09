import { Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// The icons on BoardHud's Undo/Restart/Hint/Help group, ported from DigiSpin's
// own ControlIcon (DIGISPIN-28) — Cangupa has no redo, so that glyph and the
// 'back' glyph (already its own BackArrow.tsx, CANGUPA-46) aren't carried
// over. Each is drawn on the same 24-unit grid with a round stroke, so they
// match BackArrow's weight. A button keeps its accessibilityLabel as the
// screen-reader text, so this is decoration only. 'help' (CANGUPA-117) is the
// odd one out: a plain Unicode "?" character rather than a drawn glyph, since
// the platform's own question-mark glyph already reads clearly at this size.
export type ControlIconId = 'hint' | 'restart' | 'undo' | 'help';

const ICON_SIZE = 20;

export default function ControlIcon({ id, color }: { readonly id: ControlIconId; readonly color: string }) {
  if (id === 'help') {
    return <Text style={{ fontSize: ICON_SIZE - 2, fontWeight: '700', color, lineHeight: ICON_SIZE }}>?</Text>;
  }

  return (
    <Svg
      width={ICON_SIZE}
      height={ICON_SIZE}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {id === 'restart' ? (
        <Path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M20.49 15a9 9 0 0 1-14.85 3.36L1 14" />
      ) : id === 'hint' ? (
        <Path d="M12 3 A6 6 0 0 0 7 12.5 C7 14.5 8.5 15.5 9 17 H15 C15.5 15.5 17 14.5 17 12.5 A6 6 0 0 0 12 3 Z M9.5 21 H14.5" />
      ) : (
        <Path d="M9 14 L4 9 L9 4 M4 9 H14 A5 5 0 0 1 14 19 H11" />
      )}
    </Svg>
  );
}
