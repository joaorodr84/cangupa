# Cangupa

A puzzle game in plain HTML, CSS and JavaScript, inspired by the DOS game WESP (*Weltraumspringen*, "space jumping"). No build step: open `apps/web-classic/index.html` in a browser.

The game lives in [apps/web-classic/](apps/web-classic/), set apart from the repo root to leave room for the Expo/React Native app planned alongside it.

Step on every tile to clear the level. You start on the tile marked by the kangaroo.

- **Step**: one tile up, down, left or right.
- **Jump**: two tiles in a straight line, over a gap or over another tile (can be switched off in the settings).
- You can only land on a tile that still has visits left. A used tile drops away as soon as you leave it.
- **Double tiles** (gold) need two visits: they crack on the first and vanish on the second.
- If you run out of moves, undo or restart.

Controls: click or tap a highlighted tile, or use arrows / WASD (Shift + arrow forces a jump). `Z` undo, `R` restart, `H` hint (from a built-in solver), `N` next level. Cleared levels and settings are saved in localStorage.

There are 50 levels, growing from 3×3 to 10×10. Run `node apps/web-classic/tools/test.js` to check the rules and that every level can be solved.

## Level generator

A level is the trail of a random walk of legal moves, so it is solvable by construction. Many walks are tried per level and the one with the fewest solutions is kept (fewer solutions = a narrower puzzle). Plain Node, no dependencies, run from `apps/web-classic/`:

```
node tools/gen-levels.js                  # add missing levels to js/levels.js
node tools/gen-levels.js --regenerate     # rebuild all levels
node tools/gen-levels.js --level 12       # print one level, write nothing
node tools/gen-levels.js --help           # all options (seed, jobs, attempts, ...)
```

To change the difficulty curve, edit the table in `apps/web-classic/tools/level-plan.js` (grid size, steps, how many double tiles, jump chance). Every level has its own seed, so the same options always give the same levels. The big levels take minutes each because the time goes into counting solutions.

- `apps/web-classic/js/config.js` – settings and progress (saved in localStorage)
- `apps/web-classic/js/game.js` – game state, rules and solver (no DOM)
- `apps/web-classic/js/sprites.js` – the kangaroo (SVG: side, front and back views)
- `apps/web-classic/js/levels.js` – generated levels
- `apps/web-classic/js/ui.js` – rendering and input
- `apps/web-classic/tools/level-plan.js` – the difficulty curve, one row per level
- `apps/web-classic/tools/level-generator.js` – the generation algorithm (no file handling)
- `apps/web-classic/tools/gen-levels.js` – command-line tool that writes `js/levels.js`
- `apps/web-classic/tools/test.js` – rules and level checks
- `docs/tile-ideas.md` – ideas for new tile types (not implemented)
