# Changelog

Notable changes to Cangupa, newest first. Entries describe what the
game does now, not how it was built.

## [Unreleased]

Open work is listed in [TODO.md](TODO.md).

## 2026-11-02

### Added

- The app now opens on a home screen with the Cangupa title and a single
  "Jogar" button, instead of dropping straight onto the board. Pressing
  it goes straight to the board at the level you last left off on, same
  as before. There's no way back to this screen once you've moved past
  it, same as the board's own back button, which only ever returns as
  far as the board.
- The home screen now also shows which level "Jogar" is about to open
  (e.g. "Nível 7"), and has a "Regras" button beneath Play that opens the
  rules screen directly, without having to go into the board first.
- Clearing a level now shows a dismissable pop-up over the board with the
  move count, and either a "Próximo nível" button or, on the last level,
  an "Acabaste o jogo!" message. Closing it with ✕ just hides it — the
  cleared board and the Undo/Reiniciar/Dica controls underneath stay
  usable, and it reopens on the next win.
- The app has a new stats screen showing "Níveis limpos" (levels cleared
  out of the total), "Jogadas totais" (total moves, summed from each
  level's best move count), and every cleared level alongside the fewest
  moves it's ever been cleared in; before anything's been cleared, it
  shows an empty-state message instead.
- The home, levels, stats and settings screens now share a bottom footer
  nav with four tabs — Início, Níveis, Estatísticas, Definições — with
  the current one marked by a gold outline; tapping a tab jumps straight
  to that screen. This is what makes the stats screen reachable for the
  first time. The footer doesn't appear on the board screen, which keeps
  its own chrome-free HUD, or on the Regras screen, which stays reachable
  only via the button on the home screen.

### Changed

- The board screen's Undo ("Desfazer"), Reiniciar and Dica buttons now sit
  in a row in the upper-right corner, with the status text on the left,
  instead of a centred toolbar below the board.
- The "Cangupa" title above every screen no longer shows on the board
  screen, so it doesn't compete with the new corner controls; it still
  shows on the home, levels, settings and rules screens.
- On the board screen, when the device or window is wider than it is
  tall (landscape), the board now shrinks to fit within the screen
  instead of overflowing past the bottom. Portrait is unchanged — the
  board still fills the width and sits at the top.
- The app's saved progress now also remembers, per level, the fewest
  moves that level has ever been cleared in — it previously only
  remembered which levels were done. This feeds the new stats screen's
  numbers. A save from before this change still loads fine; it just
  starts out with no move history.

### Removed

- The board toolbar's ‹ previous-level button is gone, with no
  replacement — once you're on a level there's no way back to the
  previous one from here.
- The board toolbar's › next-level button and the old inline "Próximo
  nível" button in the win status line are gone, replaced by the new
  win pop-up's own "Próximo nível" button.
- The board screen's old inline "Níveis" / "Regras" / "Definições" button
  row below the board is gone, replaced by the new footer nav. Regras is
  no longer reachable while playing — only from the home screen's button.

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
- The board screen's toolbar now has ‹ and › buttons to jump straight to
  the previous or next level, alongside Desfazer/Reiniciar/Dica. Before
  this, the only way to move on was the "Próximo nível" button that
  appears after winning, and there was no way to go back to an earlier
  level at all.

### Changed

- Toggling "Saltos de duas casas" (two-tile jumps) mid-level now restarts
  the level with a fresh board, matching the web game.

### Fixed

- The board now sits inside a padded, rounded-corner frame, matching the
  web version, instead of running edge-to-edge with nothing around it.
- The space theme's starfield background now actually shows up; the star
  data had been in place since an earlier change, but nothing was
  rendering it.

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
