import { useCallback, useState } from 'react';

import { Game, type Level, type Move } from './board';
import { DEFAULT_FACING, facingFor, tilesOf, type Facing } from './boardView';

// Owns one Game for the lifetime of the component that calls this — it is
// built once, from the `level` this hook first saw, the same way DigiSpin's
// BoardScreen is remounted with `key={level.number}` for a new level rather
// than kept reactive to a changed prop.
export function useBoard(level: Level, hints: boolean) {
  const [game] = useState(() => new Game(level));
  const [tick, setTick] = useState(0);
  const [facing, setFacing] = useState<Facing>(DEFAULT_FACING);
  const [tip, setTip] = useState<Move | null>(null);
  // Set for one render after hint() finds no path (ui.js's "Beco sem
  // saída" message), and cleared by anything else that changes the board.
  const [hintFailed, setHintFailed] = useState(false);

  // Attempts the move to (x, y). Returns whether it was legal and played, so
  // the caller knows whether to also play the hop animation.
  const move = useCallback(
    (x: number, y: number): boolean => {
      if (game.won) return false;
      const target = game.legalMoves().find((m) => m.x === x && m.y === y);
      if (!target) return false;
      setTip(null);
      setHintFailed(false);
      setFacing(facingFor(x - game.x, y - game.y));
      game.play(target);
      setTick((t) => t + 1);
      return true;
    },
    [game],
  );

  const undo = useCallback(() => {
    if (game.undo()) {
      setTip(null);
      setHintFailed(false);
      setTick((t) => t + 1);
    }
  }, [game]);

  const reset = useCallback(() => {
    game.reset();
    setTip(null);
    setHintFailed(false);
    setTick((t) => t + 1);
  }, [game]);

  // Highlights the solver's first suggested move, or reports a dead end
  // (hintFailed) when none exists — ported from ui.js's hint().
  const hint = useCallback(() => {
    if (game.won) return;
    const path = game.solve();
    setTip(path ? path[0] : null);
    setHintFailed(!path);
    setTick((t) => t + 1);
  }, [game]);

  return {
    game,
    tiles: tilesOf(game, { hints, tip }),
    facing,
    tip,
    hintFailed,
    won: game.won,
    stuck: game.stuck,
    moves: game.moves,
    remaining: game.remaining(),
    canUndo: game.moves > 0,
    move,
    undo,
    reset,
    hint,
    // Not read, only depended on: everything above is freshly derived from
    // `game` on every call, but React only re-renders this hook's owner when
    // one of the returned values changes identity — `tick` is that signal
    // after a mutation to the Game instance's own internal state.
    tick,
  };
}

export type UseBoardResult = ReturnType<typeof useBoard>;
