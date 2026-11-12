// Status line and board controls, ported from apps/web-classic/js/ui.js's
// render() status branches and its undo/reset/hint buttons. Reworked for
// CANGUPA-32, similarly to DigiSpin's BoardScreen header: Undo/Reset/Hint
// sit in one row in the screen's upper-right corner instead of a centred
// toolbar below the board, and the win state (previously this row's inline
// "Próximo nível" button) moved out to WinPopup.tsx, since the row here is
// about controlling the board, not what happens once it's cleared. The
// level-navigation ‹/› buttons this toolbar used to carry are gone outright —
// › became WinPopup's "Próximo nível", and CANGUPA-35 gives ‹ its own
// replacement: a plain arrow back, upper-left, the same corner DigiSpin's
// board header puts its own back arrow in. CANGUPA-86 made where it actually
// goes track whichever footer tab opened this level (Home or Levels), not
// always home — the label stayed generic ("Back") rather than naming a
// destination that varies.
//
// CANGUPA-53 reworked the row again, closer still to DigiSpin's own layout:
// the status text became a centred "Level N" / "Moves M" pair (DigiSpin's
// `centre` column) instead of one left-aligned "Level N/Total · Moves M · R
// left" line, and Undo/Restart/Hint became one joined icon-button group
// (DigiSpin's `group`/`groupDivider`), kept at Cangupa's own fully-rounded
// pill radius rather than DigiSpin's 8pt corners. CANGUPA-103 added a fourth
// button, Help, opening the rules screen mid-level — the group's own always-
// available escape hatch, never disabled the way Hint is once the level is won.
// CANGUPA-116 reordered the group to Hint, Undo, Restart, Help.
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { type Status } from '../game/boardView';
import { useStrings } from '../i18n/useStrings';
import { type Strings } from '../i18n/strings';
import { type Palette } from '../theme/palette';
import BackArrow from './BackArrow';
import ControlIcon, { type ControlIconId } from './ControlIcon';

interface BoardHudProps {
  readonly status: Status;
  readonly canUndo: boolean;
  // Hints left to spend (CANGUPA-54) — disables Hint once it hits 0, same as
  // winning does, and shows as a small badge on the Hint icon.
  readonly hintBalance: number;
  readonly palette: Palette;
  readonly onBack: () => void;
  readonly onUndo: () => void;
  readonly onReset: () => void;
  readonly onHint: () => void;
  readonly onHelp: () => void;
}

export default function BoardHud({
  status,
  canUndo,
  hintBalance,
  palette,
  onBack,
  onUndo,
  onReset,
  onHint,
  onHelp,
}: BoardHudProps) {
  const t = useStrings();
  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel={t.boardHud.back}
        style={[styles.sideButton, { backgroundColor: palette.panel }]}
      >
        <BackArrow color={palette.ink} />
      </Pressable>
      <View style={styles.centre}>
        <CentreText status={status} palette={palette} t={t} />
      </View>
      <View style={[styles.group, { backgroundColor: palette.panel }]}>
        <GroupButton
          id="hint"
          label={t.boardHud.hint}
          palette={palette}
          disabled={status.kind === 'won' || hintBalance <= 0}
          badge={hintBalance}
          onPress={onHint}
        />
        <View style={[styles.groupDivider, { backgroundColor: palette.panelBorder }]} />
        <GroupButton
          id="undo"
          label={t.boardHud.undo}
          palette={palette}
          disabled={!canUndo}
          onPress={onUndo}
        />
        <View style={[styles.groupDivider, { backgroundColor: palette.panelBorder }]} />
        <GroupButton id="restart" label={t.boardHud.restart} palette={palette} onPress={onReset} />
        <View style={[styles.groupDivider, { backgroundColor: palette.panelBorder }]} />
        <GroupButton id="help" label={t.boardHud.help} palette={palette} onPress={onHelp} />
      </View>
    </View>
  );
}

// The level number stays up on every line but "won" (WinPopup takes over
// then, same as before CANGUPA-53) — including hintFailed, which now carries
// StatusProgress for exactly this. The second line is "Moves N" normally,
// and swaps to the stuck/dead-end message when one applies, rather than
// appending it, so the centred pair never grows past two short lines.
function CentreText({ status, palette, t }: { status: Status; palette: Palette; t: Strings }) {
  const ink = { color: palette.ink };
  const muted = { color: palette.muted };

  if (status.kind === 'won') {
    return null;
  }

  const level = <Text style={[styles.level, ink]}>{t.boardHud.level(status.levelNumber)}</Text>;

  // CANGUPA-131: the same warning that used to render as its own Text below the board — moved
  // here so it shares BoardHud's own reserved, fixed-height status line instead of a space the
  // board's own layout (boardLayout.ts's fitBoardWidth) doesn't hold any room for.
  if (status.kind === 'blocked') {
    return (
      <>
        {level}
        <Text style={[styles.moves, styles.bold, ink]}>
          {status.reason === 'blocked-departure' ? t.board.blockedDeparture : t.board.blockedArrival}
        </Text>
      </>
    );
  }

  if (status.kind === 'hintFailed') {
    return (
      <>
        {level}
        <Text style={styles.moves}>
          <Text style={[styles.bold, ink]}>{t.boardHud.deadEnd}</Text> <Text style={muted}>{t.boardHud.undoSomeMoves}</Text>
        </Text>
      </>
    );
  }

  if (status.kind === 'stuck') {
    return (
      <>
        {level}
        <Text style={styles.moves}>
          <Text style={[styles.bold, ink]}>{t.boardHud.stuck}</Text> <Text style={muted}>{t.boardHud.undoOrRestart}</Text>
        </Text>
      </>
    );
  }

  return (
    <>
      {level}
      <Text style={[styles.moves, muted]}>{t.boardHud.moves(status.moves)}</Text>
    </>
  );
}

interface GroupButtonProps {
  readonly id: ControlIconId;
  readonly label: string;
  readonly palette: Palette;
  readonly onPress: () => void;
  readonly disabled?: boolean;
  // A small count badge on the icon's corner (CANGUPA-54's hint balance) —
  // omitted entirely rather than shown as 0 would be ambiguous with "no
  // badge at all", and 0 is exactly the balance that matters most to show.
  readonly badge?: number;
}

function GroupButton({ id, label, palette, onPress, disabled = false, badge }: GroupButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.groupButton, disabled && styles.buttonDisabled]}
    >
      <ControlIcon id={id} color={palette.ink} />
      {badge !== undefined && (
        // ink/bg2 swapped (rather than a fixed accent colour) so the badge
        // reads against either theme: a light chip with dark text on the
        // dark theme, a dark chip with light text on the light one — the
        // same contrast pairing the rest of the UI's text already relies on.
        <View style={[styles.badge, { backgroundColor: palette.ink }]}>
          <Text style={[styles.badgeText, { color: palette.bg2 }]}>{badge}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Back and the group are fixed-size flow children at the row's edges, and
  // centre is `flex: 1` between them, so its text is centred against the
  // space actually left over rather than the row's full width — DigiSpin's
  // same three-column trick (its `header`/`centre` comment).
  sideButton: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  centre: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  level: {
    fontSize: 16,
    fontWeight: '600',
  },
  moves: {
    fontSize: 13,
    marginTop: 2,
  },
  bold: {
    fontWeight: '600',
  },
  // Undo/Restart/Hint as one joined control, Cangupa's own fully-rounded
  // pill radius standing in for DigiSpin's 8pt corners (CANGUPA-53) — the
  // "rounder buttons" already used elsewhere in this app (e.g. sideButton
  // above), kept consistent rather than copying DigiSpin's squarer shape.
  group: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: 999,
    overflow: 'hidden',
    flexShrink: 0,
  },
  groupDivider: {
    width: StyleSheet.hairlineWidth,
  },
  groupButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  // A small count badge on a control icon's corner (CANGUPA-54), sized to
  // read a one- or two-digit number without the circle growing past it.
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 15,
    height: 15,
    borderRadius: 999,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
