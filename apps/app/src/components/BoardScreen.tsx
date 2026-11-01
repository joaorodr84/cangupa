// Ties useBoard, PlayableBoard and BoardHud together into one playable
// level: the board on top, the status line and controls below it, ported
// from apps/web-classic/index.html's <main> layout. Which level this is (for
// the "Nível X/Y" text and the Next button) and what happens next are the
// caller's job — see CANGUPA-22 for the app shell that will supply those
// from the level list and progress.
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { type Level, type Rules } from '../game/board';
import { statusFor } from '../game/boardView';
import { useBoard } from '../game/useBoard';
import { type Palette } from '../theme/palette';
import BoardHud from './BoardHud';
import PlayableBoard from './PlayableBoard';

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
  readonly onPrevLevel: () => void;
  readonly canGoPrevLevel: boolean;
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
  onPrevLevel,
  canGoPrevLevel,
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

  return (
    <View style={styles.wrap}>
      <PlayableBoard board={board} anim={anim} palette={palette} />
      <BoardHud
        status={status}
        canUndo={canUndo}
        palette={palette}
        onUndo={undo}
        onReset={reset}
        onHint={hint}
        onNext={onNext}
        onPrevLevel={onPrevLevel}
        canGoPrevLevel={canGoPrevLevel}
        canGoNextLevel={hasNext}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 14,
  },
});
