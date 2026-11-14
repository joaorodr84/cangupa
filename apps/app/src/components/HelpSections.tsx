// The Moves and Tiles sections of the Rules reference, factored out of
// HelpScreen.tsx (CANGUPA-121) so HelpPopup.tsx — the board screen's own
// mid-level Help button — can render the exact same content instead of a
// second copy that could drift from it. HelpScreen.tsx still owns its own
// Buttons section, which only makes sense on the full page: HelpPopup
// already sits on top of the real HUD it would describe.
import { StyleSheet, Text, View } from 'react-native';

import Board, { TileSwatch, type SwatchTile } from './Board';
import { type TileLabelStrings, type TileView } from '../game/boardView';
import { useStrings } from '../i18n/useStrings';
import { type Palette } from '../theme/palette';

// Shared fields for every synthetic tile these diagrams ever need: Common
// only, no Gold/Steel/Departure/Arrival — kind/arrow/arrival stay fixed so a
// tile literal only has to say where it is and what state it's in.
const COMMON = { double: false, cracked: false, kind: 1, arrow: null, arrival: null, mud: false, tip: false } as const;

// The kangaroo's own starting tile: a Common tile has one visit, and
// `board.ts`'s `reset()` always spends it just for standing there (see
// CANGUPA-82's note on this), so it's rendered worn from the first frame —
// same as the real board on level 1.
function rooTile(x: number, y: number): TileView {
  return { x, y, ...COMMON, left: 0, worn: true, gone: false, hint: false, jump: false };
}
// A tile a jump passes over: present, whole, not a legal destination, so it
// renders with no highlight at all — jumping over it doesn't consume it.
function plainTile(x: number, y: number): TileView {
  return { x, y, ...COMMON, left: 1, worn: false, gone: false, hint: false, jump: false };
}
// The legal destination: Board.tsx's own hint outline — solid, the same for a step or a jump
// since CANGUPA-127 retired the dashed jump treatment. `jump` only sets the TileView field
// faithfully; it no longer changes how the diagram renders.
function targetTile(x: number, y: number, jump: boolean): TileView {
  return { x, y, ...COMMON, left: 1, worn: false, gone: false, hint: true, jump };
}

// cols x 1 strips. The middle cell of a jump-over-a-gap diagram is simply
// left out of `tiles` — `tilesOf`/Board already render nothing for a cell
// that isn't there, which is exactly what an already-gone tile looks like on
// the real board, no separate "empty" styling needed.
const STEP_TILES: readonly TileView[] = [rooTile(0, 0), targetTile(1, 0, false)];
const JUMP_GAP_TILES: readonly TileView[] = [rooTile(0, 0), targetTile(2, 0, true)];
const JUMP_TILE_TILES: readonly TileView[] = [rooTile(0, 0), plainTile(1, 0), targetTile(2, 0, true)];

// testID names the wrapping View, not the board itself — Board.tsx's own
// tile-x-y testIDs aren't unique once more than one mini-board is on screen,
// since each is its own small coordinate space starting at (0,0); scoping
// through this wrapper is how a test (or anything else) tells them apart.
function MiniBoard({
  cols,
  tiles,
  palette,
  strings,
  testID,
}: {
  readonly cols: number;
  readonly tiles: readonly TileView[];
  readonly palette: Palette;
  readonly strings: TileLabelStrings;
  readonly testID: string;
}) {
  return (
    <View style={styles.diagramRow} testID={testID}>
      <Board
        w={cols}
        h={1}
        tiles={tiles}
        rooX={0}
        rooY={0}
        face="front"
        flip={false}
        palette={palette}
        anim={false}
        strings={strings}
        width={cols * 56}
      />
    </View>
  );
}

interface SectionProps {
  readonly palette: Palette;
}

export function MovesSection({ palette }: SectionProps) {
  const t = useStrings();
  const ink = { color: palette.ink };
  const muted = { color: palette.muted };
  const card = [styles.card, { backgroundColor: palette.panel, borderColor: palette.panelBorder }];

  return (
    <View style={card}>
      <Text style={[styles.sectionLabel, muted]}>{t.help.movesSection}</Text>
      <View style={styles.list}>
        <MiniBoard cols={2} tiles={STEP_TILES} palette={palette} strings={t.board} testID="help-diagram-step" />
        <Text style={[styles.caption, muted]}>{t.help.stepCaption}</Text>
        <Text style={ink}>
          {'• '}
          <Text style={styles.bold}>{t.help.stepBold}</Text>
          {t.help.stepRest}
        </Text>

        <MiniBoard cols={3} tiles={JUMP_GAP_TILES} palette={palette} strings={t.board} testID="help-diagram-jump-gap" />
        <Text style={[styles.caption, muted]}>{t.help.jumpGapCaption}</Text>
        <MiniBoard cols={3} tiles={JUMP_TILE_TILES} palette={palette} strings={t.board} testID="help-diagram-jump-tile" />
        <Text style={[styles.caption, muted]}>{t.help.jumpTileCaption}</Text>
        <Text style={ink}>
          {'• '}
          <Text style={styles.bold}>{t.help.jumpBold}</Text>
          {t.help.jumpRest}
        </Text>
      </View>
      <Text style={[styles.note, muted]}>{t.help.onlyUnused}</Text>
    </View>
  );
}

export function TilesSection({ palette }: SectionProps) {
  const t = useStrings();
  const ink = { color: palette.ink };
  const muted = { color: palette.muted };
  const card = [styles.card, { backgroundColor: palette.panel, borderColor: palette.panelBorder }];

  // One row per tile kind that exists today — Common isn't listed, since
  // "step on it once" is already covered by Step/Jump above and it needs no
  // swatch to recognise. Steel, then Departure, then Arrival were each added
  // here the moment they first shipped in a real level (CANGUPA-68/69/88).
  // Each swatch is a real tile at full strength (left === kind), rendered by
  // TileSwatch the same way rules.html's Tiles table does — real strokes for
  // Gold/Steel, the real doorway-bracket mark for Departure/Arrival, not a
  // flat colour square (CANGUPA-109). y is this row's index, just to keep
  // each swatch's own tile-strokes-*/tile-arrow-* testID distinct from the
  // others on screen.
  const tiles: readonly { readonly key: string; readonly bold: string; readonly rest: string; readonly swatchTile: SwatchTile }[] = [
    { key: 'gold', bold: t.help.doubleBold, rest: t.help.doubleRest, swatchTile: { x: 0, y: 0, kind: 2, left: 2, arrow: null, arrival: null } },
    { key: 'steel', bold: t.help.steelBold, rest: t.help.steelRest, swatchTile: { x: 0, y: 1, kind: 3, left: 3, arrow: null, arrival: null } },
    { key: 'departure', bold: t.help.departureBold, rest: t.help.departureRest, swatchTile: { x: 0, y: 2, kind: 1, left: 1, arrow: 'right', arrival: null } },
    { key: 'arrival', bold: t.help.arrivalBold, rest: t.help.arrivalRest, swatchTile: { x: 0, y: 3, kind: 1, left: 1, arrow: null, arrival: 'right' } },
  ];

  return (
    <View style={card}>
      <Text style={[styles.sectionLabel, muted]}>{t.help.tilesSection}</Text>
      <View style={styles.list}>
        {tiles.map((tile) => (
          <View key={tile.key} style={styles.tileRow}>
            <TileSwatch testID={`help-swatch-${tile.key}`} tile={tile.swatchTile} palette={palette} size={44} />
            <Text style={[styles.tileText, ink]}>
              <Text style={styles.bold}>{tile.bold}</Text>
              {tile.rest}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// Shared across HelpScreen.tsx's own Buttons section too, so both pages'
// cards/rows/labels stay visually identical without copy-pasting the
// StyleSheet.
export const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // A rectangle per section (CANGUPA-109), matching rules.html's panel
  // layout and this app's own existing bordered-panel pattern
  // (StatsScreen.tsx's styles.panel) rather than a new one-off look.
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  list: {
    gap: 4,
  },
  bold: {
    fontWeight: '600',
  },
  tileRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  tileText: {
    flex: 1,
  },
  note: {
    fontSize: 13,
  },
  diagramRow: {
    alignItems: 'center',
    marginTop: 6,
  },
  caption: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 2,
  },
});
