import Svg, { Circle } from 'react-native-svg';

interface PackIconProps {
  readonly color: string;
  readonly size?: number;
}

// A placeholder for each pack's own swatch icon (CANGUPA-73) — DigiSpin
// draws its matching digit there; Cangupa's packs have no such built-in
// glyph, so this plain dot stands in until a real icon per pack is chosen.
export default function PackIcon({ color, size = 20 }: PackIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={9} fill={color} />
    </Svg>
  );
}
