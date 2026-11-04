# Changelog

Notable changes to Cangupa, newest first. Entries describe what the
game does now, not how it was built.

## [Unreleased]

Open work is listed in [TODO.md](TODO.md).

## 2026-11-04

### Added

- The web game's settings panel has a new "Cair ao não haver jogada" ("Fall
  when there's no move") option, off by default. With it on, pressing a
  direction (arrow keys or WASD) with no legal step or jump, or
  clicking/tapping empty space or a tile with no legal move, makes the
  kangaroo fall through the board — with a brief sink-and-fade animation —
  and restarts the level, instead of doing nothing. With it off, the game
  behaves as before.
- The web game now plays a short, upward-gliding chirp on every move —
  a step or a two-tile jump — synthesized on the fly rather than played
  from a sound file. A new "Som" ("Sound") option in the settings panel,
  on by default, mutes sound effects when turned off.
- The web game now also plays a cheerful four-note ascending tune whenever
  a level is cleared, every time — not just on that level's first-ever
  clear — synthesized the same way as the move sound, and muted by the
  same "Som" setting.

### Changed

- The settings screen's "Clear progress" row now sits under its own "Data"
  section header, instead of under the Language section with no header of
  its own.
- Clearing progress now asks for confirmation with the app's own pop-up
  card, matching the one shown when a level is cleared, instead of the
  device's native confirmation dialog. It asks "Are you sure you want to
  clear your progress?" with Yes/No buttons, and No — the safe choice — is
  focused as soon as the pop-up opens.

## 2026-11-03

### Changed

- The app's stats screen is now a single bordered panel of label/value
  rows — "Níveis limpos" and "Jogadas totais" each get their own row —
  matching the layout DigiSpin uses for its own stats screen. The list of
  every cleared level alongside the fewest moves it's ever been cleared
  in is gone, since the "Níveis limpos" row already says how many
  levels are cleared; the empty-state message shown before anything's
  been cleared is gone too, since the panel's two rows now show
  regardless of progress.
- Each group of settings rows — the theme picker, the gameplay toggles,
  the language picker, and the clear-progress row — now reads as a
  single rounded block instead of a stack of separate pills with gaps
  between them, matching DigiSpin's own settings screen. Rows within a
  group sit flush against each other, with only the first and last row
  of each group rounded and a thin border between rows standing in for
  the gap that used to separate them.

### Fixed

- The levels screen now outlines the current/next level with the same
  ink colour the rest of the theme uses, instead of a hardcoded gold
  border, and the outline itself is thinner and less showy to match
  DigiSpin's own styling.
- The settings screen no longer draws a border around the selected
  theme or language row; the filled mark next to it is enough to show
  which one is selected, matching DigiSpin's own settings screen.

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
- The board screen now has a plain back arrow in the upper-left corner
  that returns to the home screen.
- The app now has an English translation alongside its original
  Portuguese. A new "Idioma"/"Language" setting offers "Seguir o
  dispositivo"/"Follow the device", English and Português — the first
  option follows the device's own language and defaults to English if
  that's neither. Every screen — home, settings, stats, rules, the board
  HUD, the win pop-up and the footer nav — follows the chosen language.
  The original web version is unaffected and stays Portuguese-only.
- The board's back-to-board button and the generic back link shown on the
  Levels, Stats and Help screens now share the same plain back-arrow icon.
  The generic one used to be a "‹ Back" text link under a "Cangupa" title
  heading; it's now an icon-only circular button matching the board
  screen's own back button. The "Cangupa" title heading above it is gone
  from every screen that still showed it (Levels, Stats, Help and
  Settings) — nothing replaces it, since the footer nav already says
  which screen you're on.

### Changed

- On the levels screen, the grid of level cells is now laid out in
  explicit rows sized off the window width, instead of a fixed-size cell
  left to the layout's own wrap behaviour, so the grid adapts across
  phone and tablet widths.
- On the levels screen, a cleared level's cell now uses the theme's solid
  accent colour (the same one the Play button uses) instead of a
  translucent green tint, and a locked level's cell is now a plain panel
  background with dimmed text instead of a faded, partly see-through
  cell.
- The board screen's Undo ("Desfazer"), Reiniciar and Dica buttons now sit
  in a row in the upper-right corner, with the status text on the left,
  instead of a centred toolbar below the board.
- The "Cangupa" title above every screen no longer shows on the board
  screen, so it doesn't compete with the new corner controls; it still
  shows on the home, levels, settings and rules screens.
- The home screen now shows the actual Cangupa logo artwork above the
  level number, Jogar and Regras buttons, instead of standing in with the
  plain "Cangupa" text title; it no longer shows that title at all. Each
  theme picks whichever of a light or dark version of the logo contrasts
  better against its background.
- On the board screen, when the device or window is wider than it is
  tall (landscape), the board now shrinks to fit within the screen
  instead of overflowing past the bottom. Portrait is unchanged — the
  board still fills the width and sits at the top.
- The app's saved progress now also remembers, per level, the fewest
  moves that level has ever been cleared in — it previously only
  remembered which levels were done. This feeds the new stats screen's
  numbers. A save from before this change still loads fine; it just
  starts out with no move history.
- The footer nav's four tabs now show as icons (a house, stacked bars, a
  bar chart and sliders) instead of the Início/Níveis/Estatísticas/
  Definições text, and the current tab is marked by the icon itself
  changing color rather than a gold outline. The tray is now a flat
  strip with a hairline top border instead of floating pill buttons. The
  names are still there for screen readers, just not as visible text.
- The settings screen is now laid out as full-width rows grouped under
  "Tema" and "Jogabilidade" section headings, instead of a loose stack of
  a theme chip row and separate toggle rows. Each theme choice is now its
  own row with a trailing selection mark instead of a small rounded chip.
- The settings screen's theme picker no longer offers five decorative
  skins; it's now a plain choice of "Seguir o dispositivo"/"Follow the
  device", "Claro"/"Light" or "Escuro"/"Dark". Following the device makes
  the app match the phone or tablet's own light/dark setting. Anyone who
  had picked one of the old skins will find their choice reset to
  "Seguir o dispositivo" the next time they open the app; their other
  settings, progress and best move counts are unaffected.
- The app's Light and Dark appearances now use the exact same colours as
  DigiSpin's own Light and Dark themes — backgrounds, frame, pit, text
  and panel colours all match. Tile and edge colours are unchanged in
  value, but no longer differ between Light and Dark — they're now the
  same fixed colours in both, as in DigiSpin.
- Internal: the app's Light and Dark backgrounds, frame, pit, text and
  panel colours now read live from the shared theme package instead of a
  copied-in snapshot of it, so a future update to that package's colours
  reaches this app automatically. No visible change today.
- The home screen's "Jogar" button no longer has a fixed gold-tinted
  background; it now uses DigiSpin's own control colour for the
  equivalent button in both Light and Dark. The Jogar and Regras buttons
  are also bigger, matching DigiSpin's sizing.

### Fixed

- The footer nav bar now spans the full screen width and sits flush
  against the bottom edge; it previously inherited the padded content
  area's horizontal margins and extra bottom spacing, which narrowed it
  and left it floating above the bottom edge instead.

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
- The settings screen's "‹ Voltar" back button is gone — Settings is
  already one tap from Home via the footer nav, so the button only
  duplicated that path. The rules screen still has its own back button.
- The app's dark theme no longer shows its decorative starfield of dots
  behind the screens — it was a dark-only flourish and is gone with no
  replacement; the light theme never had one. The unrelated `--stars`
  starfield in the separate web-classic game is untouched.

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
