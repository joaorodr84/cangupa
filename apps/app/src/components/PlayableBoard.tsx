// Wires a useBoard result to Board (the view): a tap on a highlighted tile
// plays that move and triggers the hop. This is the whole of
// apps/web-classic/js/ui.js's click handler and move()'s render(true) call —
// everything else move() also does there (status text, saving progress)
// belongs to the screen that owns useBoard and also renders this
// (BoardScreen.tsx), so that screen and this component share one Game
// rather than each calling useBoard and getting their own.
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import * as Sound from '../audio/sound';
import { type UseBoardResult } from '../game/useBoard';
import { type Palette } from '../theme/palette';
import Board, { type BoardHandle } from './Board';
import { fitBoardWidth } from './boardLayout';

// styles.frame's own padding, subtracted before fitting the board to the
// space BoardScreen measured for this component — that measurement is the
// frame's outer box, not the board's.
const FRAME_PADDING = 12;

interface PlayableBoardProps {
  readonly board: UseBoardResult;
  readonly anim: boolean;
  // Rule option (CANGUPA-58, off by default): tapping the board where there
  // is no legal move falls instead of doing nothing.
  readonly fall: boolean;
  readonly palette: Palette;
  // The space on screen available for this component, in px (CANGUPA-33) —
  // BoardScreen measures it via onLayout, since there's no CSS-only way to
  // cap a React Native aspectRatio view's width by the *height* available.
  // Omitted (e.g. before the first layout): falls back to the board's old
  // width:'100%' behaviour, capped by width alone.
  readonly maxWidth?: number;
  readonly maxHeight?: number;
  // Called after a move is actually played (not on a tap that misses every
  // legal destination), so the owning screen can save progress or show a
  // win state.
  readonly onMoved?: () => void;
}

export default function PlayableBoard({ board, anim, fall, palette, maxWidth, maxHeight, onMoved }: PlayableBoardProps) {
  const { game, tiles, facing, move, won, reset } = board;
  const boardRef = useRef<BoardHandle>(null);
  // Mid fall-and-restart animation (CANGUPA-58): input is ignored until it
  // settles, the same guard ui.js's `falling` module-level flag gives the
  // web version.
  const [falling, setFalling] = useState(false);

  const handlePressTile = (x: number, y: number) => {
    if (falling) return;
    if (move(x, y)) {
      boardRef.current?.hop();
      Sound.jump();
      // `game.won` (not the destructured `won` above, stale from the last
      // render) reflects the move just played — fires every time a level is
      // completed, including a replay of an already-cleared level, matching
      // ui.js's move(): the sound isn't gated by whether this is the first
      // clear, only `onLevelDone`'s progress bookkeeping is (BoardScreen.tsx).
      if (game.won) Sound.win();
      onMoved?.();
    }
  };

  // A tap on empty board space or a tile with no legal move — ui.js's click
  // handler falls through to the same thing when settings.fall is on.
  const handlePressEmpty = () => {
    if (falling || won) return;
    setFalling(true);
    boardRef.current?.fall(() => {
      setFalling(false);
      reset();
    });
  };

  const boardWidth =
    maxWidth && maxHeight
      ? fitBoardWidth(game.w, game.h, maxWidth - FRAME_PADDING * 2, maxHeight - FRAME_PADDING * 2)
      : undefined;

  return (
    // ports style.css's #board-wrap: the padded card the board itself (the
    // "pit") sits in — found missing in the CANGUPA-24 parity pass, where
    // the board rendered edge-to-edge with no frame around it. It stretches
    // to the full width by default (as it always did) and only shrinks to
    // hug a narrower, height-capped board (CANGUPA-33) once one is known —
    // alignSelf:'center' opts out of that default stretch, so this must stay
    // conditional or the frame (and the width:'100%' Board falls back to
    // before the first layout) would have no definite width to resolve.
    <View style={[styles.frame, { backgroundColor: palette.frame }, boardWidth !== undefined && styles.frameFit]}>
      <Board
        ref={boardRef}
        w={game.w}
        h={game.h}
        tiles={tiles}
        rooX={game.x}
        rooY={game.y}
        face={facing.face}
        flip={facing.flip}
        palette={palette}
        anim={anim}
        width={boardWidth}
        onPressTile={handlePressTile}
        onPressEmpty={fall ? handlePressEmpty : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    padding: FRAME_PADDING,
    borderRadius: 14,
  },
  frameFit: {
    alignSelf: 'center',
  },
});
