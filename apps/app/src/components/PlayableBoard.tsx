// Wires useBoard (the Game, owned once per level) to Board (the view): a
// tap on a highlighted tile plays that move and triggers the hop. This is
// the whole of apps/web-classic/js/ui.js's click handler and move()'s
// render(true) call — everything else move() also does there (status text,
// saving progress) belongs to the screens that use this (CANGUPA-19/22).
import { useRef } from 'react';

import { type Level, type Rules } from '../game/board';
import { useBoard } from '../game/useBoard';
import { type Palette } from '../theme/palette';
import Board, { type BoardHandle } from './Board';

interface PlayableBoardProps {
  readonly level: Level;
  readonly rules: Rules;
  readonly hints: boolean;
  readonly anim: boolean;
  readonly palette: Palette;
  // Called after a move is actually played (not on a tap that misses every
  // legal destination), so a screen can save progress or show a win state.
  readonly onMoved?: () => void;
}

export default function PlayableBoard({ level, rules, hints, anim, palette, onMoved }: PlayableBoardProps) {
  const { game, tiles, facing, move } = useBoard(level, rules, hints);
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
