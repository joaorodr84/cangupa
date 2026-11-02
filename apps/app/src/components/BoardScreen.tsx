// Ties useBoard, PlayableBoard and BoardHud together into one playable
// level: the controls row on top, the board below it, ported from
// apps/web-classic/index.html's <main> layout. Which level this is (for the
// "Nível X/Y" text) and what happens next are the caller's job — see
// CANGUPA-22 for the app shell that supplies those from the level list and
// progress.
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { type Level, type Rules } from '../game/board';
import { statusFor } from '../game/boardView';
import { useBoard } from '../game/useBoard';
import { type Palette } from '../theme/palette';
import BoardHud from './BoardHud';
import PlayableBoard from './PlayableBoard';
import WinPopup from './WinPopup';

interface BoardScreenProps {
  readonly level: Level;
  readonly rules: Rules;
  readonly hints: boolean;
  readonly anim: boolean;
  readonly palette: Palette;
  readonly levelNumber: number;
  readonly totalLevels: number;
  readonly hasNext: boolean;
  readonly onNext: () => void;
  // Fired once per win (not again until a reset is followed by another win),
  // the moment ui.js's move() would have added the level to progress.done.
  readonly onLevelComplete?: () => void;
}

export default function BoardScreen({
  level,
  rules,
  hints,
  anim,
  palette,
  levelNumber,
  totalLevels,
  hasNext,
  onNext,
  onLevelComplete,
}: BoardScreenProps) {
  const board = useBoard(level, rules, hints);
  const { won, stuck, hintFailed, moves, remaining, canUndo, undo, reset, hint } = board;

  const wasWon = useRef(false);
  useEffect(() => {
    if (won && !wasWon.current) {
      onLevelComplete?.();
    }
    wasWon.current = won;
  }, [won, onLevelComplete]);

  const status = statusFor({ levelNumber, totalLevels, moves, remaining }, { won, stuck, hintFailed, hasNext });

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

  return (
    <View style={styles.wrap}>
      <BoardHud status={status} canUndo={canUndo} palette={palette} onUndo={undo} onReset={reset} onHint={hint} />
      <View style={styles.boardArea}>
        <PlayableBoard board={board} anim={anim} palette={palette} />
        {status.kind === 'won' && !popupClosed && (
          <WinPopup
            moves={status.moves}
            hasNext={status.hasNext}
            palette={palette}
            onNext={onNext}
            onClose={() => setPopupClosed(true)}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 14,
  },
  boardArea: {
    position: 'relative',
  },
});
