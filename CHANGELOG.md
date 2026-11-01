# Changelog

Notable changes to Cangupa, newest first. Entries describe what the
game does now, not how it was built.

## [Unreleased]

Open work is listed in [TODO.md](TODO.md).

## 2026-10-27

### Added

- First playable release: a puzzle game in plain HTML, CSS and JavaScript,
  inspired by the DOS game WESP. Step onto every tile to clear a level —
  move to an adjacent tile or jump two tiles over a gap or another tile.
  Gold double tiles need two visits before they vanish. A used tile drops
  away as soon as you leave it, and running out of moves calls for undo or
  restart.
- 20 generated levels, each verified solvable by a built-in solver before
  it ships.
- A hint button that calls the solver for the next move, an undo button,
  and a restart button.
- Keyboard and pointer controls: click or tap a highlighted tile, or use
  the arrow keys / WASD (Shift forces a jump); `Z` undoes, `R` restarts,
  `H` hints, `N` moves to the next level.
- Settings and level progress are saved in the browser's local storage, so
  progress survives a reload.
- Selectable visual themes.

### Changed

- The player's piece is now a kangaroo, drawn from the front, back and
  side depending on the direction of travel, replacing the original wasp
  sprite.
