# Tile ideas

Ideas for new tile types and level features. Nothing here is implemented: the game has only normal tiles (one visit) and double tiles (two visits), and the level generator knows only those two.

For each idea: the **rule**, what it would cost in the **engine** (`js/game.js`, which also holds the solver) and in the **generator** (`tools/`), and a rough **cost** (S, M or L). The generator builds a level by walking legal moves, so every new rule has to be added to the walk too, or levels will not be solvable by construction.

## How a new tile fits in

- A tile is one character in a level string (`1`, `2`, `S`, `s`, `.` today). A new tile needs a character, a drawing in `style.css`, and a rule in `Game.legalMoves()` / `Game.play()`.
- The solver (`Game.solve`, `Game.countSolutions`) memoises on `pos + cells`. Any new state (keys collected, switches flipped, the joey picked up) has to be added to that key, or the solver will treat different positions as the same.
- The generator walk must simulate the new rule, so the walk stays a valid solution. Tiles that change *where you end up* (ice, trampoline, conveyor, teleporter) need the most care here.
- Always finish with `node tools/test.js`: it proves every level can be cleared.

## Ideas from the first round

### 1. Ice tile
- **Rule:** landing on ice makes you keep sliding in the direction you moved until the next tile is a gap or a non-ice tile.
- **Engine:** the move's destination is computed by sliding, and the slid-over ice tiles are visited on the way.
- **Generator:** the walk has to slide too. Hardest part: deciding which ice tiles count as visited.
- **Cost:** L. The classic WESP-style tile and the most interesting one.

### 2. Trampoline
- **Rule:** landing on it throws you two tiles further in the same direction (a forced jump).
- **Engine:** one extra move rule after landing; the landing tile is still visited.
- **Generator:** the walk must make that second move; if it can't, the trampoline can't be placed.
- **Cost:** S to M.

### 3. One-way arrow
- **Rule:** you can only leave the tile in the direction of its arrow (steps and jumps).
- **Engine:** `legalMoves` filters directions when standing on an arrow tile.
- **Generator:** when the walk is on an arrow tile, it only picks that direction. Easy to add.
- **Cost:** S. Great value: it prunes the move graph and makes levels narrower.

### 4. Switch and gate
- **Rule:** stepping on a switch toggles all gate tiles of the same colour; closed gates cannot be landed on.
- **Engine:** gate state joins the solver's key.
- **Generator:** the walk tracks gate state; a gate tile is only landed on while open.
- **Cost:** L. Makes levels about ordering.

### 5. Teleporter pair
- **Rule:** landing on one teleporter moves you to its twin. Both tiles are used up in one move.
- **Engine:** after landing, jump the position to the twin.
- **Generator:** the walk places twins as a pair; the second must be unvisited and otherwise unreachable.
- **Cost:** M. Makes layouts feel non-planar.

### 6. Triple tile
- **Rule:** like the gold double tile but needing three visits.
- **Engine:** none really: `cells` already stores a count; add `3` to the parser and drawing.
- **Generator:** raise the per-tile visit cap from 2 to 3 and add a `triples` column to the plan.
- **Cost:** S.

### 7. Bonus (free) tile
- **Rule:** a tile that need not be visited. It can be walked on any number of times and never disappears.
- **Engine:** needs an "optional" flag so it does not count towards `remaining()`.
- **Generator:** use it to loosen a level, or to connect two parts the walk could not link.
- **Cost:** M.

### 8. Timed (crumbling) tile
- **Rule:** vanishes after N of your moves, whether or not you stand on it.
- **Engine:** needs a move counter in the solver key. Gets expensive fast.
- **Generator:** the walk has to arrive before the timer runs out.
- **Cost:** L. Adds pressure but is hard to explain; probably not worth it.

### 9. Rotating or sliding tile
- **Rule:** a tile that changes position every move, like a moving platform.
- **Engine:** the board changes on every move, so the state key must include the phase.
- **Generator:** the walk simulates the movement.
- **Cost:** L. Likely to make levels hard to read. Last on the list.

## New ideas

### 10. Conveyor tile
- **Rule:** after you land, it pushes you one more tile in its arrow's direction. If that tile is not available, the move is not allowed.
- **Engine:** like the trampoline but one tile long, always a step.
- **Generator:** the walk makes the forced step too.
- **Cost:** S to M.

### 11. Mirror tile
- **Rule:** standing on it flips your next move: left becomes right, up becomes down.
- **Engine:** the move set from a mirror tile is the mirror image of the normal one (a flag on the position).
- **Generator:** the walk picks a mirrored move after landing on one.
- **Cost:** M. Fun, but can feel like a bug; needs a clear animation.

### 12. Key and lock
- **Rule:** a locked tile cannot be landed on until its key tile has been visited.
- **Engine:** a set of collected keys in the solver key. A simpler cousin of the switch.
- **Generator:** the walk may only land on a locked tile after its key.
- **Cost:** M.

### 13. Numbered tiles
- **Rule:** tiles marked 1, 2, 3, … must be visited in that order. Normal tiles are free.
- **Engine:** track the next number; landing out of order is not allowed.
- **Generator:** number the tiles in the order the walk visits them. Easy and neat.
- **Cost:** M.

### 14. Colour-alternating tiles
- **Rule:** coloured tiles (blue and red) must alternate: after a blue one, the next coloured tile must be red.
- **Engine:** remember the last colour.
- **Generator:** colour tiles along the walk, alternating.
- **Cost:** M. A parity puzzle.

### 15. Bomb tile
- **Rule:** stepping on it destroys its four neighbours. Any neighbour not visited yet is lost, so you must clear them first.
- **Engine:** landing zeroes the neighbours; the level can then become impossible.
- **Generator:** the walk may land on a bomb only after visiting all its neighbours.
- **Cost:** M. Makes the order of play matter in a visible way.

### 16. Pillar
- **Rule:** a solid block that is not a tile. A jump cannot pass over it; steps are unaffected.
- **Engine:** `legalMoves` forbids a jump whose middle square is a pillar.
- **Generator:** place pillars only where no walk jump crosses them.
- **Cost:** S. Cheap and useful, and it can force steps instead of jumps.

### 17. Mud tile
- **Rule:** you can step off it but not jump off it.
- **Engine:** `legalMoves` limits moves to steps when standing on mud.
- **Generator:** the walk only steps from mud tiles.
- **Cost:** S.

### 18. Refill tile
- **Rule:** landing on it restores the tile you just left, giving you one more visit to it.
- **Engine:** needs the previous position in the state.
- **Generator:** the walk may revisit that tile after a refill.
- **Cost:** M. Lets levels reuse ground.

### 19. Diagonal tile
- **Rule:** from this tile only, you can also move diagonally (one tile).
- **Engine:** extra directions in `legalMoves` when standing on it.
- **Generator:** the walk includes the diagonals from that tile.
- **Cost:** S to M.

### 20. Joey tile (kangaroo theme)
- **Rule:** picking it up gives you one three-tile super-jump to use whenever you like.
- **Engine:** a "joey" flag in the solver key, consumed by the long jump.
- **Generator:** the walk uses the super-jump exactly once after the pickup.
- **Cost:** M. A good fit with the kangaroo.

### 21. Exit-only portal
- **Rule:** a one-way portal that you can only come out of, never go into. Pairs with teleporters.
- **Engine:** the destination of a teleporter, not a landing tile.
- **Generator:** same as teleporters, with direction.
- **Cost:** M.

### 22. Gate tile (entry-locked)
- **Rule:** the mirror of the one-way arrow/Signpost tile (#3): a Gate can only be *landed on* from one side; the other three are closed to it. Leaving it, once on it, is unrestricted.
- **Engine:** `legalMoves` filters which direction a move *into* a Gate is allowed from, rather than which direction it can be left by (#3's filter runs the other way round).
- **Generator:** when the walk lands on a Gate, the direction it arrived from becomes that gate's one open side — easy to add, mirrors #3.
- **Cost:** S. Named Gate rather than "wall", which would read as impassable next to Pillar (#16) when this tile is still enterable from its one open side; coloured raspberry red once Signpost (#3's arrow tile, CANGUPA-87) freed that colour up by moving to green.

## Level modifiers and game features (not tiles)

- **Stars instead of par:** a move count cannot rank a run, because every solution of a level makes exactly the same number of moves (the total number of visits is fixed). Rate a run by something else: undos used, hints used, or time.
- **No-undo hard mode:** a setting that disables Undo and Hint for a cleaner challenge.
- **Daily level:** one level per day, generated from the date as the seed. The generator is already seedable.
- **Level editor:** draw a level in the browser, check solvability with the in-game solver, share it as a text string. The level format is already plain text.
- **Level packs:** group levels by tile type, so a new tile gets its own tutorial levels.

## Suggested order

1. **Pillar, mud, one-way arrow, triple tile.** All small, almost no new game state, and the generator barely changes. Each one also gives the levels a new feel.
2. **Trampoline, conveyor, numbered tiles, key and lock.** Medium work; the walk needs a rule each.
3. **Teleporters, bomb, joey, ice.** Larger and more interesting; do these once the rules engine and the generator have an easy way to register a new tile type.
4. **Switches and gates, timed, rotating.** Largest. Only if the game needs them.

Before adding any of these, a small refactor would pay off: give each tile type its own small object (character, drawing, how it changes `legalMoves`, how it changes the solver key), so a new tile is one entry instead of edits in five places. The generator would use the same objects, which keeps the rules in one place.
