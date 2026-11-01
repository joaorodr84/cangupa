import { useCallback, useState } from 'react';

import { Game, type Level, type Rules } from './board';
import { DEFAULT_FACING, facingFor, tilesOf, type Facing } from './boardView';

// Owns one Game for the lifetime of the component that calls this — it is
// built once, from the `level`/`rules` this hook first saw, the same way
// DigiSpin's BoardScreen is remounted with `key={level.number}` for a new
// level rather than kept reactive to a changed prop. Settings/undo/reset/hint
// are added where they are actually used (CANGUPA-19); this hook only turns
// a tap on a legal tile into a played move.
export function useBoard(level: Level, rules: Rules, hints: boolean) {
  const [game] = useState(() => new Game(level, rules));
  const [tick, setTick] = useState(0);
  const [facing, setFacing] = useState<Facing>(DEFAULT_FACING);

  // Attempts the move to (x, y). Returns whether it was legal and played, so
  // the caller knows whether to also play the hop animation.
  const move = useCallback(
    (x: number, y: number): boolean => {
      if (game.won) return false;
      const target = game.legalMoves().find((m) => m.x === x && m.y === y);
      if (!target) return false;
      setFacing(facingFor(x - game.x, y - game.y));
      game.play(target);
      setTick((t) => t + 1);
      return true;
    },
    [game],
  );

  return {
    game,
    tiles: tilesOf(game, { hints }),
    facing,
    won: game.won,
    stuck: game.stuck,
    move,
    // Not read, only depended on: tiles/won/stuck above are freshly derived
    // from `game` on every call, but React only re-renders this hook's owner
    // when one of the returned values changes identity — `tick` is that
    // signal after a mutation to the Game instance's own internal state.
    tick,
  };
}
