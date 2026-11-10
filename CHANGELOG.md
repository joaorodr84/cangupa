# Changelog

Notable changes to Cangupa, newest first. Entries describe what the
game does now, not how it was built.

## [Unreleased]

Open work is listed in [TODO.md](TODO.md).

## 2026-11-10

### Changed

- The Help screen's Buttons section no longer lists Back among the board
  screen's controls — it now explains Hint, Undo, Restart and Help only.
  The screen's own floating back arrow, used to leave the Help screen
  itself, is unaffected and still works the same.
- The app's Rules screen no longer names the colour in parentheses after
  Gold, Steel, Departure and Arrival tiles — each line already shows a
  colour swatch for that exact colour, so spelling it out again was
  redundant. Applies to both English and Portuguese.

### Fixed

- The app's Rules screen no longer tells players that Departure and
  Arrival tiles are left or entered "through the edge where the triangle
  is" — wording left over from before the triangle mark was replaced with
  a doorway bracket. It now says "through the edge the bracket opens on"
  in English and "pelo lado onde a marca abre" in Portuguese.
- Pressing Help on the app's board screen no longer restarts the level.
  It now opens a reference popup with the Moves and Tiles sections right
  over the board, instead of leaving for the full Help screen, so the
  level's progress is kept. The home screen's own Rules button still opens
  the full Help screen as before.
- The area behind the win popup, the help popup and the clear-progress
  confirmation is now dimmed and no longer passes taps through to
  whatever it's covering — a board tile, or another settings row — while
  the popup is open.

## 2026-11-09

### Changed

- Every level pack's blurb, in English and Portuguese, is rewritten to
  evoke its own landscape (a creek's slick stepping stones, a mesa's one
  climbable face, a billabong that only drains one way...) instead of
  stating its tile rule plainly, while the rule itself still comes through.
  Pack names are unchanged.
- The app's Plateau pack (9, 7×7) now combines Gold, Steel and Gate tiles
  together on every level, instead of just Gold and Steel — its blurb
  changes from "A bigger board with gold and steel tiles throughout." to
  "Gold, steel and gate tiles, all together."
- The app's Outback pack (10, 8×7), the game's final pack, now combines
  every tile kind in the game — Gold, Steel, Signpost and Gate, alongside
  the base Common tile — together on every level, instead of just Gold and
  Steel — its blurb changes from "The biggest board and the longest walks
  of all, with gold and steel throughout." to "The biggest board, with
  every tile kind in the game together." Both packs' levels were rebuilt
  from scratch for this, so players who already progressed through them
  will see new, different levels there.
- The tile kind previously called Signpost is now called Departure, and
  the one previously called Gate is now called Arrival, in the Help
  screen and pack blurbs — more symmetrical, less jargon-y names for the
  same tiles, colours, marks and rules as before. The Portuguese
  translation changes to match: "casas de sinalização" becomes "casas de
  partida", and "casas de portão" becomes "casas de chegada".
- The board screen's control buttons are now ordered Hint, Undo, Restart,
  Help, instead of Undo, Restart, Hint, Help — the Help screen's own
  Buttons section, which lists and explains each one, is reordered to
  match: Back, Hint, Undo, Restart, Help.
- The Help button's icon on the board screen is now a plain bold "?",
  instead of a hand-drawn question-mark glyph.

### Fixed

- The dev-only level pack and level difficulty preview pages (used to
  review the game's level packs, not shown to players) now draw Signpost
  and Gate tiles with the same doorway-bracket mark — shut on three sides,
  with a real arrow threaded through the open side — that the app itself
  shows, instead of the older plain triangle the pages had kept drawing.
  Their legend also now lists Signpost (green, "leave only the way it
  points") and Gate (raspberry, "enter only from one side") as two separate
  lines, matching the app's own rule text, instead of one leftover "Arrow"
  line still shown in the wrong, pre-recolour colour.

## 2026-11-08

### Added

- The app's in-game Rules/Help screen now shows three small live diagrams
  in its "Moves" section — one step, one jump over a gap, and one jump
  over a tile — each with a caption, using the same solid-outline (step)
  vs. dashed-outline (jump) convention the real board's hints use.
- The Help screen has a new "Buttons" section explaining the board
  screen's five controls — Back, Undo, Restart, Hint and Help — each
  shown with its real icon and a plain-language description of what it
  does and when it's greyed out.

### Changed

- Signpost and Gate tiles in the app now show a doorway-bracket mark —
  shut on three sides, with a real arrow threaded through the open side —
  instead of the plain triangle they showed before. The arrow points out
  through the edge for a Signpost tile, since that's the way it leaves,
  and in toward the tile's centre for a Gate tile, since that's the way
  it's entered.
- The Help screen's "Tiles" section now shows real miniature tile
  renders — with the real Gold/Steel visit-count strokes and the real
  Signpost/Gate bracket mark — instead of flat colour swatches.
- "When you're stuck" (the undo/restart tip) is now its own labelled
  section on the Help screen, instead of a bullet buried in "Moves".
- Every section of the Help screen is now visually grouped in its own
  bordered card.

## 2026-11-05

### Added

- The app's Mesa pack (7, 6×6) is redesigned to teach the Gate tile on its
  own, with only Common and Gate tiles — the first of the four previously
  frozen Gold-only packs to be rebuilt around the Gate tile.
- The app's Gorge pack (8, 7×6) is redesigned to combine the Gate tile with
  one metal tile, alternating Gold and Steel from level to level.
- The app's Plateau (9, 7×7) and Outback (10, 8×7) packs are redesigned to
  combine Common, Gold and Steel tiles together — no Gate tiles in either
  pack.
- The Gate tile now has a visual appearance in the app: a raspberry-red
  tile with a white triangle on the edge it must be entered from, mirroring
  how Signpost tiles are drawn. The engine already enforced the rule, but
  this is the first time a Gate tile is visible or playable in a shipped
  level.
- The app's help screen now explains the Gate tile, in English and
  Portuguese: "Gate tiles (raspberry) can only be entered through the edge
  where the triangle is."
- The app's Rules screen is split into two labelled sections, "Moves" and
  "Tiles" ("Jogadas" and "Casas" in Portuguese), instead of one flat list —
  and each tile's line now shows a small colour swatch, taken from the
  current theme, next to its description, so the page matches whatever
  colours are actually on the board and works as a quick reference rather
  than a wall of text. The screen now scrolls, since the new layout made it
  taller.
- The app's board screen now has a Help button alongside Undo, Restart and
  Hint, always available (even after winning the level), so you can check
  the rules mid-level without leaving the board. Pressing Back from the
  rules screen returns you to the level you were on.

### Changed

- Every tile type now keeps the same colours in every visual theme —
  the common tile, the gold double-tile and the steel triple-tile no
  longer change look when you switch themes. Themes still differ in
  background, frame, pit and other decoration.
- The one-way directional tile is now called "Signpost" instead of
  "Arrow", and is green instead of raspberry/magenta, in the help
  screens and level pack descriptions of both the web game and the app.

### Fixed

- Meadow (the app's first level pack)'s easiest levels no longer solve as a
  single forced walk with no real choice in it — the pack's difficulty
  floor was raised so every one of its 50 levels now has at least one
  actual decision point, while still keeping them varied from each other.
- Fixed a level-generation bug that could leave a level's starting tile one
  visit short of its real strength as a Gold (2-visit) or Steel (3-visit)
  tile, since the game always spends one of its visits just having the
  kangaroo stand there at the start. The Creek, Gully, Outcrop and Ridge
  packs were regenerated to fix the 79 affected levels found in them; the
  same issue in 67 levels across the frozen Mesa, Gorge, Plateau and
  Outback packs is left for a follow-up.
- Gate tiles in the app's rectangular levels (Gorge and Outback) now point
  the correct direction when the board is turned to fit a portrait phone
  screen — previously this case wasn't handled and could have stranded the
  player on a level that got turned.
- The app's back button on the board screen now returns to wherever the
  level was actually opened from — Home or the Levels tab — instead of
  always landing on Home. The same fix applies to the back button on the
  Help/Rules screen. Its accessibility label no longer claims "Back to
  home" ("Voltar ao início") now that it doesn't always go there — it's
  just "Back" ("Voltar").
- The app's Stats tab no longer shows a stray floating back button
  alongside its normal footer navigation; Stats is reached and left
  through the footer tabs like Home, Levels and Settings, so it never
  needed one.

### Removed

- The "two-tile jumps" setting is gone from both the web game's and the
  app's settings screens — jumping over a gap or another tile now always
  works. No shipped level ever let you turn it off and still finish, so
  no level plays any differently; the option just isn't there to toggle
  any more.

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
- The web game now also plays a descending glide when the kangaroo falls
  through the board, timed to match the brief sink-and-fade animation —
  synthesized the same way as the other sounds, and muted by the same
  "Som" setting.
- The kangaroo now has a joey peeking out of its pouch, visible whenever
  the kangaroo is shown hopping or standing idle. It isn't drawn from
  behind, since a pouch isn't visible from that angle on a real kangaroo
  either.
- Holding down on the kangaroo's own cell in the web game now fades it to
  a faint outline, so a special tile hidden underneath it — a cracked
  tile or a double tile — shows through. Releasing restores the kangaroo
  to full view.
- Holding a finger on the kangaroo's own cell in the app now does the same:
  it fades to a faint outline so a special tile hidden underneath — a
  cracked tile or a double tile — shows through, and releasing restores
  the kangaroo to full view.
- The app now plays a short sound effect on every move — a step or a
  two-tile jump — matching the sound the web version already has. A new
  "Sound" toggle in the Settings screen's Gameplay section, on by
  default, turns it off for players who don't want it.
- The app now also plays a cheerful four-note ascending tune whenever a
  level is cleared, every time — not just on that level's first-ever
  clear — matching the web version's own win sound, and muted by the same
  "Sound" toggle.
- The app's Settings screen's Gameplay section has a new "Fall when there
  is no move" toggle, off by default, matching the web version's own
  falling setting. With it on, tapping anywhere on the board with no legal
  move — empty space, or a stuck tile — makes the kangaroo sink, shrink
  and fade, then resets the current level back to the start.
- The app now also plays a falling sound effect when that "Fall when
  there is no move" setting triggers, alongside the kangaroo's
  sink-and-fade animation, matching the sound the web version already
  plays, and muted by the same "Sound" toggle.
- The app's kangaroo now also has a joey peeking out of its pouch on its
  side-facing and front-facing sprites, matching the web version's own
  joey art. The back-facing sprite is unchanged, since a pouch isn't
  visible from that angle either.
- The app now has ten level packs of 50 levels each, 500 levels in all:
  Meadow, Creek, Gully, Outcrop, Billabong, Ridge, Mesa, Gorge, Plateau and
  Outback (Prado, Ribeiro, Barranco, Afloramento, Lagoa, Crista, Mesa,
  Desfiladeiro, Planalto and Ermo in Portuguese). Each pack has its own
  theme, and boards get bigger from pack to pack, from 3×3 up to 8×7.
  Levels get harder within each pack and from one pack to the next.
- The app's Levels screen now shows a collection label ("Base") and one
  section per pack, with the pack's name, a one-line description and how
  many of its levels are cleared. Clearing a pack's last level opens the
  next pack. Pack names and descriptions are in English and European
  Portuguese.
- Rectangular boards in the app are turned to fit the phone: wide when the
  phone is held sideways, tall when it is upright.
- The app has a new Steel tile, grey-blue, that needs three visits.
- The app has a new arrow tile: a raspberry tile with a white triangle on
  one edge. It needs one visit and can only be left through the edge where
  the triangle is, whether by a step or a jump.
- The app's help screen now explains the Gold, Steel and arrow tiles, in
  English and Portuguese.
- The first six level packs in the app now have new descriptions, in English
  and Portuguese.

### Changed

- The level packs collection is named Lay of the Land (O Relevo in
  Portuguese) instead of Australia (Austrália).
- Each level pack has its own icon on the level packs screen, a simple
  one-colour landscape shape (grass, waves, a V-shaped dip, rocks, a
  waterhole, a ridge, a butte, cliff walls, a tabletop, a lone tree) in
  place of the placeholder dot. Every pack's sentence is reworded in English
  and Portuguese, and the ones for packs 7 to 10 no longer promise things
  those packs do not have.
- The app's 50 original levels are replaced by the new level packs. Because
  the levels are new, progress made on the old ones is not carried over and
  the game starts fresh. The web game keeps its own 50 levels, unchanged.

- The settings screen's "Clear progress" row now sits under its own "Data"
  section header, instead of under the Language section with no header of
  its own.
- Clearing progress now asks for confirmation with the app's own pop-up
  card, matching the one shown when a level is cleared, instead of the
  device's native confirmation dialog. It asks "Are you sure you want to
  clear your progress?" with Yes/No buttons, and No — the safe choice — is
  focused as soon as the pop-up opens.
- The app's plain tile is now called the Common tile.
- In the app, a Gold or Steel tile shows how many visits it has left as short
  diagonal strokes, one per visit left, side by side like tally marks (dark
  on gold, white on steel). A tile on its last visit shows one stroke. This
  replaces the two bars and the single crack the gold tile used to show.
- The app's level packs now introduce tiles one at a time. Pack 1 has only
  Common tiles (and some jumps), pack 2 adds Gold, pack 3 has Steel, pack 4
  has Gold and Steel together, and pack 5 has arrow tiles. In pack 6 each
  level has arrow tiles plus one metal, gold on one level and steel on the
  next. No level in the first ten packs mixes more than three kinds of tile,
  counting the Common tile. Packs 7 to 10 are unchanged.
- The levels in packs 1 to 6 of the app are different from earlier builds, so
  progress made on those levels in earlier builds no longer lines up with
  them. The web game is unchanged.
- The app's Levels tab now shows the ten level packs as a list first,
  instead of one long scroll of every pack's levels. Each row has a
  colour swatch with a placeholder icon, the pack's name, and a "Levels
  X–Y · N/M solved" line, under a collection name shown in a pill badge
  that is now "Australia" ("Austrália" in Portuguese) instead of "Base".
  Tapping a pack opens just that pack's own level grid; the existing
  header back arrow steps from the grid back to the list instead of a
  second back arrow being added, and it stays hidden while the pack list
  itself is showing, the same way it's hidden on other footer tabs'
  top-level screens. Re-tapping the Levels tab while a pack is open also
  closes back to the list.
- A level pack's own grid now has its own header with its own back
  button, instead of sharing the app's floating back arrow. The pack's
  name sits centred in that header, shown in the pack's own colour — the
  same one as its swatch on the pack list — instead of the plain text
  colour, and the solved count that used to sit next to the name there is
  gone, since the pack list already shows each pack's own solved count.
- A level that's already been solved now shows in its own pack's colour,
  matching that pack's swatch on the list screen, instead of one generic
  highlight colour for every pack. The number inside is drawn in whichever
  of black or white stays readable against that colour.

### Fixed

- When the "fall when there's no move" setting is on and the kangaroo
  taps or arrow-keys into a specific stuck tile, it now hops there first
  — the same jump a real move plays — before sinking through the board,
  instead of sinking in place where it already stood. Walking off the
  edge of the board with the arrow keys still falls in place, since
  there's nowhere to jump to.
- When the "fall when there's no move" setting is on, tapping or clicking
  a tile now only makes the kangaroo fall when that tile is a step or
  jump away from it in one of the four cardinal directions — the same
  shape a legal move checks. A diagonal tap, a tap too far away, or a
  jump-distance tap with the jumps rule off used to also trigger a fall;
  now those taps do nothing, same as before falling could jump to a
  target.
- Tapping or clicking the kangaroo's own current cell, with the "fall
  when there's no move" setting on, is now correctly a no-op in both
  the web game and the app, instead of making the kangaroo sink and
  fall in place where it already stood.
- Tapping or clicking true empty background that's a step or jump away
  from the kangaroo, with the "fall when there's no move" setting on,
  now hops it there first — the same jump a real move plays — before
  falling through the board, matching what tapping a stuck tile at that
  same distance already did, in both the web game and the app. Empty
  background that isn't a step or jump away still falls in place, since
  there's nowhere to jump to.
- When the "fall when there's no move" setting is on and a jump lands
  on a tile that's already been fully used up, the tile the kangaroo
  jumped away from now correctly looks vacated for the brief moment it
  takes to fall, instead of still looking occupied even though the
  kangaroo has visibly left it, in both the web game and the app.

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
