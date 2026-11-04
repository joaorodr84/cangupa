// The level packs: ten packs of 50 levels, each on a bigger board than the one before.
// Edit this to reshape the game; tools/gen-packs.js turns it into levels.
//
// Why these sizes: the area (width × height) grows at every step and squares
// alternate with rectangles (3×3, 3×4, 4×4, 4×5, ...), the pairing CANGUPA-56 asks
// for. Each rectangle is generated landscape; the app rotates it to fit the device.
//
// Why these themes: a pack teaches one thing, so the curve is a sequence of ideas,
// not just a bigger grid. The tile mix is Common only in pack 1, Common and Gold in pack 2,
// Common and Steel (no Gold) in pack 3, all three in pack 4, Common and arrow tiles in
// pack 5, and in pack 6 Common, arrows and one metal per level, Gold then Steel then Gold.
// No level in packs 1 to 10 has more than three tile kinds, Common included. Pack 1 has a few jumps (up to a quarter of the moves) because a 3x3 board of
// Common tiles with none has only 37 distinct levels, too few for a pack of 50; with jumps
// it has 137.
//
//   name         shown on the pack screen
//   blurb        the idea the pack teaches
//   width,height board size, landscape (width >= height)
//   steps        [lo, hi] share of the board's area the solution's walk covers
//                (landings, counting the start); more landings, more to plan
//   jump         [lo, hi] chance a move of the walk is a two-tile jump
//   tiles        the tile kinds a level may use, besides the start: 1 Common (one visit), 2 Gold
//                (two visits), 3 Steel (three visits). [1] only Common; [1, 3] Common and Steel and
//                no Gold; [1, 2, 3] all three. Default [1, 2].
//   doubles      [lo, hi] share of landings that may be on a tile needing more than one visit
//   arrows       [lo, hi] share of landings that become arrow tiles: one visit, and it can only be
//                left in the way its triangle points
//   intro        the kind this pack introduces ('gold', 'steel' or 'arrow'): its first few levels
//                (INTRO_PLAIN in gen-packs.js) do not have it, so the pack starts gently
//   mixes        variants a pack alternates between, level by level (pack 6: Common, arrows and Gold, then
//                Common, arrows and Steel). Each variant has its own tiles / doubles / arrows
//   designed     false: no designed layouts in this pack (they have only Common tiles)
//   frozen       true: leave this pack exactly as it is in tools/packs.json. Packs 7 to 10 are frozen
//                (CANGUPA-68 and CANGUPA-69 do not touch them); their other fields are what they were
//                generated with, kept as a record
//   pool         random candidates measured for this pack; levels are picked from them
const PACKS = [
  { name: 'Meadow',    blurb: 'Hop from tile to tile and visit each one once.',
    width: 3, height: 3, steps: [.60, 1.0], jump: [0, .25],    tiles: [1],          pool: 4000 },
  { name: 'Creek',     blurb: 'Jump over a missing tile. Gold tiles need two visits.',
    width: 4, height: 3, steps: [.55, .95], jump: [.15, .40],  tiles: [1, 2],       doubles: [0, .20],   intro: 'gold',  pool: 4000 },
  { name: 'Gully',     blurb: 'Steel tiles hold on for three visits.',
    width: 4, height: 4, steps: [.55, .90], jump: [0, .30],    tiles: [1, 3],       doubles: [.10, .25], intro: 'steel', pool: 4000 },
  { name: 'Outcrop',   blurb: 'Gold and steel tiles share the board.',
    width: 5, height: 4, steps: [.55, .85], jump: [.20, .40],  tiles: [1, 2, 3],    doubles: [.10, .30],  pool: 3000 },
  { name: 'Billabong', blurb: 'Arrow tiles can only be left the way they point.',
    width: 5, height: 5, steps: [.55, .90], jump: [.20, .40],  tiles: [1],          arrows: [.15, .35], intro: 'arrow', pool: 2500 },
  { name: 'Ridge',     blurb: 'Arrows and metals, gold on one level and steel on the next.',
    width: 6, height: 5, steps: [.55, .90], jump: [.25, .40],  designed: false, pool: 3000,
    mixes: [{ tiles: [1, 2], doubles: [.10, .25], arrows: [.12, .28] }, { tiles: [1, 3], doubles: [.10, .20], arrows: [.12, .28] }] },
  { name: 'Mesa',      blurb: 'Wide boards where one wrong jump leaves you stranded.', frozen: true,
    width: 6, height: 6, steps: [.50, .90], jump: [.25, .45],  doubles: [.10, .30],  pool: 1600 },
  { name: 'Gorge',     blurb: 'Narrow routes and plenty of gold tiles.', frozen: true,
    width: 7, height: 6, steps: [.50, .90], jump: [.25, .45],  doubles: [.15, .35],  pool: 1300 },
  { name: 'Plateau',   blurb: 'A big board and long routes to plan.', frozen: true,
    width: 7, height: 7, steps: [.50, .90], jump: [.25, .45],  doubles: [.15, .35],  pool: 1000 },
  { name: 'Outback',   blurb: 'The biggest board and the longest walks of all.', frozen: true,
    width: 8, height: 7, steps: [.50, .90], jump: [.25, .45],  doubles: [.15, .35],  pool: 800 },
];

const LEVELS_PER_PACK = 50;

// A pack's easiest level starts at about this share of the previous pack's hardest.
// 1 would stack the packs end to end, but the small boards (3x3, 4x3) cannot get hard
// enough to give a stacked pack any ramp of its own: at 0.85 Creek was squeezed into
// 6.9-8.3 pathBits. At 0.65 each pack keeps a ramp and the game still only goes up.
const OVERLAP = 0.65;

module.exports = { PACKS, LEVELS_PER_PACK, OVERLAP };
