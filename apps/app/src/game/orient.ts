// Turns a rectangular level to suit the device (CANGUPA-56): a wide level is
// shown wide on a landscape screen and tall on a portrait one, and the other
// way round, so a board uses as much of the screen as it can instead of sitting
// small in the wrong shape. Square levels are never turned.
//
// Turning means swapping rows for columns (a transpose). Every move works the
// same in all four directions, so the transposed level is the same puzzle with
// the same solutions; only which way it is drawn changes. The levels themselves
// are generated landscape (tools/pack-plan.js) and stay that way in the data.
import { type Level } from './board';

// An arrow (Departure) tile points a way, and swapping rows for columns swaps its axis: a tile
// pointing right now points down, one pointing up now points left, and the other two likewise.
// An Arrival tile (CANGUPA-104) turns the same way, with its own character set. Every other
// character stays, a Pillar (CANGUPA-159), Mud (CANGUPA-160) and a Tunnel mouth (CANGUPA-161)
// included: none of the three has a direction to turn. A mouth's twin is found fresh by Game's
// own constructor from whichever two cells still carry its letter, so turning the board (which
// only ever relabels a cell's coordinates, never its character) carries the pairing over for free.
const TRANSPOSED: Readonly<Record<string, string>> = { '>': 'v', v: '>', '<': '^', '^': '<', R: 'D', D: 'R', L: 'U', U: 'L' };

export function orientLevel(level: Level, landscape: boolean): Level {
  const height = level.length;
  const width = Math.max(...level.map((row) => row.length));
  if (width === height || width > height === landscape) {
    return level;
  }
  const columns: string[] = [];
  for (let x = 0; x < width; x++) {
    columns.push(level.map((row) => { const c = row[x] ?? '.'; return TRANSPOSED[c] ?? c; }).join(''));
  }
  return columns;
}
