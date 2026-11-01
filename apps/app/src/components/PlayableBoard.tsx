// Wires a useBoard result to Board (the view): a tap on a highlighted tile
// plays that move and triggers the hop. This is the whole of
// apps/web-classic/js/ui.js's click handler and move()'s render(true) call —
// everything else move() also does there (status text, saving progress)
// belongs to the screen that owns useBoard and also renders this
// (BoardScreen.tsx), so that screen and this component share one Game
// rather than each calling useBoard and getting their own.
import { useRef } from 'react';

import { type UseBoardResult } from '../game/useBoard';
import { type Palette } from '../theme/palette';
import Board, { type BoardHandle } from './Board';

interface PlayableBoardProps {
  readonly board: UseBoardResult;
  readonly anim: boolean;
  readonly palette: Palette;
  // Called after a move is actually played (not on a tap that misses every
  // legal destination), so the owning screen can save progress or show a
  // win state.
  readonly onMoved?: () => void;
}

export default function PlayableBoard({ board, anim, palette, onMoved }: PlayableBoardProps) {
  const { game, tiles, facing, move } = board;
  const boardRef = useRef<BoardHandle>(null);

  const handlePressTile = (x: number, y: number) => {
    if (move(x, y)) {
      boardRef.current?.hop();
      onMoved?.();
    }
  };

  return (
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
      onPressTile={handlePressTile}
    />
  );
}
