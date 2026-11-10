// Ties useBoard, PlayableBoard and BoardHud together into one playable
// level: the controls row on top, the board below it, ported from
// apps/web-classic/index.html's <main> layout. Which level this is (for the
// "Nível X/Y" text) and what happens next are the caller's job — see
// CANGUPA-22 for the app shell that supplies those from the level list and
// progress.
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { type Level } from '../game/board';
import { statusFor } from '../game/boardView';
import { orientLevel } from '../game/orient';
import { useBoard } from '../game/useBoard';
import { type Palette } from '../theme/palette';
import BoardHud from './BoardHud';
import HelpPopup from './HelpPopup';
import PlayableBoard from './PlayableBoard';
import WinPopup from './WinPopup';

interface BoardScreenProps {
  readonly level: Level;
  readonly hints: boolean;
  // Hints left to spend (CANGUPA-54) — gates pressing Hint, independent of
  // the `hints` display toggle above (whether legal moves are outlined at
  // all, unrelated to the balance).
  readonly hintBalance: number;
  readonly anim: boolean;
  // Rule option (CANGUPA-58, off by default): tapping the board where there
  // is no legal move falls instead of doing nothing.
  readonly fall: boolean;
  readonly palette: Palette;
  readonly levelNumber: number;
  readonly totalLevels: number;
  readonly hasNext: boolean;
  readonly onBack: () => void;
  readonly onNext: () => void;
  // Fired once per win (not again until a reset is followed by another win),
  // the moment ui.js's move() would have added the level to progress.done —
  // with the move count it was cleared in, for CANGUPA-30's per-level best.
  readonly onLevelComplete?: (moves: number) => void;
  // Fired once per hint that actually finds a move — not on a dead end,
  // which reveals nothing and so shouldn't cost one (CANGUPA-54).
  readonly onHintUsed?: () => void;
}

export default function BoardScreen({
  level,
  hints,
  hintBalance,
  anim,
  fall,
  palette,
  levelNumber,
  totalLevels,
  hasNext,
  onBack,
  onNext,
  onLevelComplete,
  onHintUsed,
}: BoardScreenProps) {
  // A rectangular level is turned once, to the orientation the device is in when
  // the level opens (CANGUPA-56). Not tracked after that: turning the board while
  // it is being played would mean rebuilding it, and fitBoardWidth already
  // keeps whichever shape it has inside the screen.
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const startedLandscape = useRef(windowWidth > windowHeight);
  const oriented = useMemo(() => orientLevel(level, startedLandscape.current), [level]);
  const board = useBoard(oriented, hints);
  const { won, stuck, hintFailed, moves, remaining, canUndo, undo, reset, hint } = board;

  const wasWon = useRef(false);
  useEffect(() => {
    if (won && !wasWon.current) {
      onLevelComplete?.(moves);
    }
    wasWon.current = won;
  }, [won, moves, onLevelComplete]);

  const status = statusFor({ levelNumber, totalLevels, moves, remaining }, { won, stuck, hintFailed, hasNext });

  // Guards the spend here rather than trusting BoardHud's own disabled state
  // alone (CANGUPA-54) — the balance is what actually decides whether a
  // hint is allowed, the UI is only a reflection of it — and only spends one
  // when the solver actually found a move, not on a dead end.
  const handleHint = () => {
    if (hintBalance <= 0) return;
    if (hint()) onHintUsed?.();
  };

  // Closing the popup (CANGUPA-32) only hides it — the board stays solved
  // underneath, reachable through BoardHud's corner (Undo to step back into
  // it, Reset to play it again). It reopens on the next win, tracked by
  // leaving the won state at all (a reset or an undo past the winning move),
  // not by the move count, so replaying into the same win count still shows it.
  const [popupClosed, setPopupClosed] = useState(false);
  useEffect(() => {
    if (status.kind !== 'won') {
      setPopupClosed(false);
    }
  }, [status.kind]);

  // The board screen's own Help popup (CANGUPA-121) — purely local, unlike
  // the old `onHelp` prop this replaced: there's no navigation involved, so
  // nothing above this component needs to know it's open.
  const [helpOpen, setHelpOpen] = useState(false);

  // The space left for the board once BoardHud has taken its own height
  // (CANGUPA-33) — measured rather than computed from constants, since it
  // already varies with the safe-area insets and with which HUD lines are
  // showing. Zero until the first layout, which PlayableBoard treats as
  // "not yet known" and falls back to width:'100%' for.
  const [boardArea, setBoardArea] = useState({ width: 0, height: 0 });

  return (
    <View style={styles.wrap}>
      <BoardHud
        status={status}
        canUndo={canUndo}
        hintBalance={hintBalance}
        palette={palette}
        onBack={onBack}
        onUndo={undo}
        onReset={reset}
        onHint={handleHint}
        onHelp={() => setHelpOpen(true)}
      />
      <View
        style={styles.boardArea}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          setBoardArea({ width, height });
        }}
      >
        <PlayableBoard
          board={board}
          anim={anim}
          fall={fall}
          palette={palette}
          maxWidth={boardArea.width}
          maxHeight={boardArea.height}
        />
        {status.kind === 'won' && !popupClosed && (
          <WinPopup
            moves={status.moves}
            hasNext={status.hasNext}
            palette={palette}
            onNext={onNext}
            onClose={() => setPopupClosed(true)}
          />
        )}
        {helpOpen && <HelpPopup palette={palette} onClose={() => setHelpOpen(false)} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // flex: 1 so boardArea below gets whatever vertical room the screen
  // actually has to give it, rather than only ever being as tall as the
  // board wants to be — the signal fitBoardWidth needs to cap a landscape
  // board by height instead of overflowing it (CANGUPA-33).
  wrap: {
    flex: 1,
    gap: 14,
  },
  // No alignItems/justifyContent override here: both stay their defaults
  // ('stretch' and 'flex-start'), so the frame fills the full width and
  // sits at the top exactly as it always did — flex:1 only exists so this
  // view's own measured height is the real space available, not its
  // content's height, which is what fitBoardWidth needs to cap a landscape
  // board by height instead of overflowing it (CANGUPA-33).
  boardArea: {
    flex: 1,
    position: 'relative',
  },
});
