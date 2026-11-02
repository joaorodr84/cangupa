import Svg, { Path } from 'react-native-svg';

interface BackArrowProps {
  readonly color: string;
  readonly size?: number;
}

// A plain left arrow rather than a label, matching DigiSpin's board-screen
// back button (its ControlIcon "back" glyph) — icon-only so it reads as
// "leave this screen" at a glance. Shared between BoardHud's back-to-board
// button and App.tsx's back link for the Levels/Stats/Help screens
// (CANGUPA-46), which used to be a plain text link of its own.
export default function BackArrow({ color, size = 18 }: BackArrowProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M19 12 H6 M11 7 L6 12 L11 17" />
    </Svg>
  );
}
