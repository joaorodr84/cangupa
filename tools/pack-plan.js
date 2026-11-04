// The level packs: ten packs of 30 levels, each on a bigger board than the one before.
// Edit this to reshape the game; tools/gen-packs.js turns it into levels.
//
// Why these sizes: the area (width × height) grows at every step and squares
// alternate with rectangles (3×3, 3×4, 4×4, 4×5, ...), the pairing CANGUPA-56 asks
// for. Each rectangle is generated landscape; the app rotates it to fit the device.
//
// Why these themes: a pack teaches one thing, so the curve is a sequence of ideas,
// not just a bigger grid. Jumps arrive in pack 2 and two-visit tiles in pack 3;
// after that the packs mix both and push the density of the board.
//
//   name         shown on the pack screen
//   blurb        the idea the pack teaches
//   width,height board size, landscape (width >= height)
//   steps        [lo, hi] share of the board's area the solution's walk covers
//                (landings, counting the start); more landings, more to plan
//   jump         [lo, hi] chance a move of the walk is a two-tile jump
//   doubles      [lo, hi] share of landings that may be on a two-visit tile
//   pool         random candidates measured for this pack; levels are picked from them
const PACKS = [
  { name: 'Meadow',    blurb: 'Hop from tile to tile. Every tile is visited once.',
    width: 3, height: 3, steps: [.60, 1.0], jump: [0, 0],      doubles: [0, 0],      pool: 4000 },
  { name: 'Creek',     blurb: 'Gaps appear. Jump over one missing tile.',
    width: 4, height: 3, steps: [.55, .95], jump: [.15, .40],  doubles: [0, 0],      pool: 4000 },
  { name: 'Gully',     blurb: 'Some tiles crack: they need two visits.',
    width: 4, height: 4, steps: [.55, .90], jump: [0, .30],    doubles: [.10, .25],  pool: 4000 },
  { name: 'Outcrop',   blurb: 'Jumps and cracked tiles together.',
    width: 5, height: 4, steps: [.55, .85], jump: [.20, .40],  doubles: [.05, .25],  pool: 3000 },
  { name: 'Billabong', blurb: 'Open water in the middle. Plan the way round.',
    width: 5, height: 5, steps: [.55, .90], jump: [.20, .40],  doubles: [.10, .25],  pool: 2500 },
  { name: 'Ridge',     blurb: 'Long runs that fold back on themselves.',
    width: 6, height: 5, steps: [.55, .90], jump: [.25, .40],  doubles: [.10, .30],  pool: 2000 },
  { name: 'Mesa',      blurb: 'Wide boards where one wrong jump strands you.',
    width: 6, height: 6, steps: [.50, .90], jump: [.25, .45],  doubles: [.10, .30],  pool: 1600 },
  { name: 'Gorge',     blurb: 'Narrow routes, many cracked tiles.',
    width: 7, height: 6, steps: [.50, .90], jump: [.25, .45],  doubles: [.15, .35],  pool: 1300 },
  { name: 'Plateau',   blurb: 'Everything at once, on a big board.',
    width: 7, height: 7, steps: [.50, .90], jump: [.25, .45],  doubles: [.15, .35],  pool: 1000 },
  { name: 'Outback',   blurb: 'The longest walks in the game.',
    width: 8, height: 7, steps: [.50, .90], jump: [.25, .45],  doubles: [.15, .35],  pool: 800 },
];

const LEVELS_PER_PACK = 30;

// A pack's easiest level starts at about this share of the previous pack's hardest.
// 1 would stack the packs end to end, but the small boards (3x3, 4x3) cannot get hard
// enough to give a stacked pack any ramp of its own: at 0.85 Creek was squeezed into
// 6.9-8.3 pathBits. At 0.65 each pack keeps a ramp and the game still only goes up.
const OVERLAP = 0.65;

module.exports = { PACKS, LEVELS_PER_PACK, OVERLAP };
