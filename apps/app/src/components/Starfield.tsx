// Ported from style.css's `body::before { background: var(--stars); }`:
// the page-wide starfield behind everything, used by the space theme only
// (see theme/palette.ts). Found missing in the CANGUPA-24 parity pass — the
// star data was ported in CANGUPA-15 but nothing ever rendered it.
import { Dimensions, StyleSheet, View } from 'react-native';

import { STARFIELD_TILE_SIZE, type Star } from '../theme/palette';

interface StarfieldProps {
  readonly stars: readonly Star[];
}

export default function Starfield({ stars }: StarfieldProps) {
  if (stars.length === 0) {
    return null;
  }

  // style.css tiles the pattern at a fixed 260x260 px period
  // (STARFIELD_TILE_SIZE); this repeats it across the screen the same way.
  const { width, height } = Dimensions.get('window');
  const cols = Math.ceil(width / STARFIELD_TILE_SIZE) + 1;
  const rows = Math.ceil(height / STARFIELD_TILE_SIZE) + 1;
  const tileKeys = Array.from({ length: rows * cols }, (_, i) => i);

  return (
    <View testID="starfield" pointerEvents="none" style={StyleSheet.absoluteFill}>
      {tileKeys.map((i) => {
        const row = Math.floor(i / cols);
        const col = i % cols;
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: col * STARFIELD_TILE_SIZE,
              top: row * STARFIELD_TILE_SIZE,
              width: STARFIELD_TILE_SIZE,
              height: STARFIELD_TILE_SIZE,
            }}
          >
            {stars.map((star, starIndex) => (
              <View
                key={starIndex}
                style={{
                  position: 'absolute',
                  left: `${star.xPct}%`,
                  top: `${star.yPct}%`,
                  width: star.size,
                  height: star.size,
                  borderRadius: star.size / 2,
                  backgroundColor: star.color,
                }}
              />
            ))}
          </View>
        );
      })}
    </View>
  );
}
