import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

interface PackIconProps {
  // The pack's index, 0 to 9, in play order.
  readonly pack: number;
  readonly color: string;
  readonly size?: number;
}

// One monochrome line icon per pack (CANGUPA-74), a single bold landscape
// shape for the pack's name. They replace the placeholder dot of CANGUPA-73.
// Drawn in a 48 by 48 box, stroke only, so the pack's label colour tints them.
// Each is kept to one or two shapes so it still reads at 20 px; the first
// drafts (a daisy, a sparkle on the rocks, a sun and a tree together) turned
// to noise at that size. Plateau is wide and low with a line across it and
// Mesa tall and narrow, because as plain trapezoids the two were
// indistinguishable.
const ICONS: readonly (() => React.ReactNode)[] = [
  // Meadow: three blades of grass
  () => (
    <>
      <Path d="M24 40V14" />
      <Path d="M24 40C24 30 14 28 12 16" />
      <Path d="M24 40C24 30 34 28 36 16" />
    </>
  ),
  // Creek: two wavy lines
  () => (
    <>
      <Path d="M4 18q5-6 10 0t10 0 10 0 10 0" />
      <Path d="M4 31q5-6 10 0t10 0 10 0 10 0" />
    </>
  ),
  // Gully: a V-shaped dip
  () => <Path d="M4 14L24 38L44 14" />,
  // Outcrop: two rocks
  () => (
    <>
      <Path d="M4 38L13 18L23 38Z" />
      <Path d="M20 38L32 12L44 38Z" />
    </>
  ),
  // Billabong: a waterhole
  () => (
    <>
      <Ellipse cx={24} cy={24} rx={19} ry={11} />
      <Ellipse cx={24} cy={24} rx={8} ry={4} />
    </>
  ),
  // Ridge: a jagged ridgeline
  () => <Path d="M4 36L15 16L24 28L33 12L44 36" />,
  // Mesa: a flat-topped butte
  () => <Path d="M10 40L15 14H33L38 40Z" />,
  // Gorge: two cliff walls
  () => (
    <>
      <Path d="M4 10H18L13 40H4Z" />
      <Path d="M44 10H30L35 40H44Z" />
    </>
  ),
  // Plateau: a wide, low tabletop
  () => (
    <>
      <Path d="M4 38V28L10 20H38L44 28V38Z" />
      <Path d="M4 28H44" />
    </>
  ),
  // Outback: a lone tree on the horizon, and a small sun
  () => (
    <>
      <Path d="M4 36H44" />
      <Path d="M24 36V20" />
      <Path d="M24 28L17 21" />
      <Path d="M24 25L31 18" />
      <Circle cx={38} cy={14} r={2} />
    </>
  ),
];

export default function PackIcon({ pack, color, size = 24 }: PackIconProps) {
  const draw = ICONS[pack % ICONS.length];
  return (
    <Svg
      testID={`pack-icon-${pack + 1}`}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {draw()}
    </Svg>
  );
}
