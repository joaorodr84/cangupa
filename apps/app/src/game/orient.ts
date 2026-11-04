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

export function orientLevel(level: Level, landscape: boolean): Level {
  const height = level.length;
  const width = Math.max(...level.map((row) => row.length));
  if (width === height || width > height === landscape) {
    return level;
  }
  const columns: string[] = [];
  for (let x = 0; x < width; x++) {
    columns.push(level.map((row) => row[x] ?? '.').join(''));
  }
  return columns;
}
