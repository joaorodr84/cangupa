# Changelog

Notable changes to Cangupa, newest first. Entries describe what the
game does now, not how it was built.

## [Unreleased]

Open work is listed in [TODO.md](TODO.md).

## 2026-11-01

### Added

- The Expo/React Native port is now a playable app: the board, level
  picker, rules and settings screens are wired together. On launch it
  resumes the last level and saved settings (theme, rule toggles)
  automatically. A toolbar under the board switches to "Níveis" (levels),
  "Regras" (rules) or "Definições" (settings), each with a "‹ Voltar" button
  back to the board; picking a level, or pressing Next after clearing one,
  returns straight to the board on that level.
- A "Regras" screen was added to the app, with the same rules text as the
  web game's help panel (step, jump, single-use tiles, double tiles, undo
  and restart when stuck), minus the keyboard shortcuts the app doesn't
  have.
- The app now shows Cangupa's own icon on the home screen, instead of the
  generic placeholder it launched with. iOS shows the mark on a cream
  background in light mode and on a near-black background in dark mode,
  matching the system appearance; Android shows the same mark over a
  near-black background, plus a white silhouette version for phones using
  Android's themed icons. The launch screen now shows the Cangupa mark and
  name as the app opens, in the same light or dark styling, and the web
  version's browser tab icon was updated to match.

### Changed

- Toggling "Saltos de duas casas" (two-tile jumps) mid-level now restarts
  the level with a fresh board, matching the web game.

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
