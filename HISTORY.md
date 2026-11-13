# Building Cangupa

**Project report · 27 October 2026 · 2 commits**

A puzzle game in plain HTML, CSS and JavaScript, built in one day and
still in its first era. This file tells the engineering story behind
[CHANGELOG.md](CHANGELOG.md) — not one line per commit, but the reasoning
and the decisions, as they accumulate.

| | |
| --- | --- |
| Commits | 2 |
| Days | 1 |
| Levels | 20 |
| Dependencies | 0 |

> **This is not [CHANGELOG.md](CHANGELOG.md), and does not replace it.**
> The changelog is written for a player who should not need the repo
> open: what the game does now, in player-facing terms. This is the
> narrative behind it — grouped by era, carrying the reasoning and the
> decisions that never reached a release note. Where the two disagree
> about a date, the changelog and the commit history win; this file is
> derived from them.

---

## Era 1 — Oct 27: the game, start to finish

One commit builds the whole thing: a 5×N grid of tiles, a move/jump rules
engine with no DOM dependency (`js/game.js`), a solver the level generator
and the in-game hint button both call, and a renderer (`js/ui.js`) driving
it from clicks, taps and the keyboard. Settings and progress persist to
`localStorage` (`js/config.js`).

The 20 shipped levels are not hand-placed. `tools/gen-levels.js` generates
candidates as random legal walks — a walk is a legal level by
construction — and keeps the one with the fewest distinct solutions, so
the levels that ship are the ones with the least ambiguity the generator
could find. `tools/test.js` then re-solves every level in `js/levels.js`
before it's trusted, which is also what the in-game hint button leans on
at runtime: the solver is one piece of logic serving the generator, the
hint button and the test suite alike.

## Era 2 — Oct 27 (continued): the kangaroo replaces the wasp

A one-commit visual change: the player's piece became a kangaroo, drawn
from three angles (front, back, side) in `js/sprites.js` depending on
which way it last moved, in place of the original wasp sprite. `js/ui.js`
and `style.css` picked up the view-selection and sizing changes that come
with a piece that now has a facing.

## Era 3 — Nov 1: the Expo port becomes a playable app

The Expo/React Native port at `apps/app` (CANGUPA-10 through CANGUPA-21)
landed game logic, persistence, theming, and the board, levels and
settings screens one at a time, each self-contained and with nothing yet
to open them from. This commit is the first with somewhere to open them
into: `App.tsx` loads settings and progress before rendering anything,
holds one `panel` state switching between the board, levels, rules and
settings screens, and reads the current level straight from saved
progress rather than tracking it separately, so there is one source of
truth for which level is loaded. Toggling the jumps rule mid-level
remounts the board screen — keyed on the level and the rule together —
rather than teaching `useBoard` to react to a changed prop, reproducing
`ui.js`'s "a rule change restarts the level" behavior by remounting
instead of by making the hook reactive.

Wiring the shell also surfaced a fourth reachable panel the port's
backlog had missed entirely: the "Regras" (rules) screen, toggled from
the same toolbar as Levels and Settings in the original game. It ships
here as `HelpScreen.tsx`, ported verbatim from `apps/web-classic/index.html`'s
`#help` aside — heading, intro and all five rule bullets — except the
keyboard-shortcuts sentence, replaced with a touch-appropriate one since
this port has no keyboard handling at all.

One commit. Verified with `tsc --noEmit`, the full Jest suite (196 tests
across 16 files), and a non-interactive `expo export -p web` bundle,
confirming the app actually boots end to end rather than just that its
pieces pass in isolation. Full interactive QA on device is left to
CANGUPA-24.

CANGUPA-23 followed with the platform-ready icon, adaptive-icon and
splash assets Expo's pipeline expects, derived from `TILE-JUMPER-7`'s
existing logo design rather than designed from scratch.

Era 3 closes here: Nov 1, 14 commits, CANGUPA-10 through CANGUPA-23 and
CANGUPA-26 — the port built from nothing to a playable, themed, five-screen
app, with nowhere left unbuilt.

## Era 4 — Nov 1 (continued): the parity pass

CANGUPA-24 closes out the port by checking it, not just reviewing its
code: a feature-by-feature comparison against `apps/web-classic`'s
`index.html`, `ui.js` and `style.css` surfaced two gaps confirmed by
`grep` turning up no reference anywhere in `apps/app` — the board had
no outer frame (`style.css`'s `#board-wrap`), and the space theme's
starfield data (ported in CANGUPA-15) was never actually rendered by
anything. A third gap, the toolbar's ‹/› level-navigation buttons, was
missed by that code-level pass entirely and only turned up once the app
was actually run and compared side by side with a screenshot of the real
`apps/web-classic` — only the win-triggered "Próximo nível" button
(CANGUPA-19) had ever been built.

All three were fixed, not just logged. `PlayableBoard.tsx` now wraps the
board in a padded, `palette.frame`-coloured card. A new `Starfield.tsx`
renders `palette.stars` tiled at `STARFIELD_TILE_SIZE` across the screen,
wired into `App.tsx` as the background layer behind everything, the same
role `body::before` plays in the CSS. `BoardHud.tsx` gained an
always-visible ‹/› pair: › reuses the `onNext` callback the win-triggered
button already called, since `ui.js`'s `#next` and its status-text
"go-next" button both already did the identical `loadLevel(levelIndex +
1)`; ‹ is new, threaded through `BoardScreen.tsx` and `App.tsx` as
`onPrevLevel`.

Verified with `tsc --noEmit`, the full Jest suite (205 tests across 17
files), and — unlike CANGUPA-22's commit, which stopped at a
non-interactive `expo export` — a real interactive session: `expo start
--web` driven headlessly with Playwright (resolved ad hoc from its npx
cache, not added as a project dependency), tapping tiles, watching the
move counter, opening and returning from every panel, switching to the
space theme to confirm the starfield actually renders, and pressing Dica
to watch the hint highlight appear, with the browser console staying
empty throughout. The same session screenshotted `apps/web-classic`'s
`index.html` directly over `file://` for the side-by-side comparisons,
including the one that caught the missing toolbar buttons, and a second
pass after the fix confirmed the toolbar now matches it exactly.

Three things were found and left alone on purpose, not missed: keyboard
shortcuts (this port is touch-only by design, CANGUPA-18, and
`HelpScreen`'s note text already says so); the page background is a flat
`palette.bg2` colour rather than the CSS's `bg1`→`bg2` radial gradient,
since no gradient library is installed and one wasn't judged worth adding
for a background; and the CSS-to-RN approximations already called out in
comments from earlier tasks (`outline` for `outline`, `opacity` for
`filter: brightness()`, box-shadow dropped) were re-confirmed reasonable
rather than revisited. No native iOS or Android run happened in this
session, for lack of a simulator or device — that still needs a session
that has one.

## Era 5 — Nov 2: a front door for the app

CANGUPA-28 gives `apps/app` a screen of its own to open on. Launching it
had always dropped straight into the board — `App.tsx`'s `panel` state
started at `'board'` — with no entry point, unlike every other screen in
the app, which is only ever reached by tapping something. A new `'home'`
`Panel` variant now comes first: `HomeScreen.tsx` shows a single "Jogar"
button that moves to `'board'`, landing on whichever level
`progress.level` was already tracking for resume. It carries no logo
asset of its own, reusing the "Cangupa" title `Shell` already renders on
every panel. `'home'` joins `'board'` in the condition that hides the
"‹ Voltar" button, since there is no way back to it once past it — the
same rule the back button already followed for `'board'`.

One commit. `App.test.tsx`'s existing tests now press "Jogar" first,
since render no longer lands on the board directly; a new test asserts
the app starts on the home screen and that pressing Jogar removes it
with no way back. Verified with the full Jest suite (18 suites, 207
tests across `apps/app`) and `tsc --noEmit`, both passing.

CANGUPA-29 followed, stacking the level number Play is about to open and a
Regras (rules) button beneath it on the same screen, with tests added for both
and the full suite (209 tests) and `tsc --noEmit` passing again.

Era 5 closes here: Nov 2, 2 commits, CANGUPA-28 and CANGUPA-29 — the app
gained a front door, with nowhere left on that screen unbuilt.

## Era 6 — Nov 2 (continued): the board screen's HUD, cleared of its toolbar

CANGUPA-32 reworks the board screen's HUD, similarly to DigiSpin's: the
Undo ("Desfazer"), Reiniciar and Dica buttons move out of a centred
toolbar below the board into one row in the screen's upper-right corner,
status text on the left. The toolbar's ‹ previous-level button is
removed entirely, with no replacement. Its › next-level button and the
win-triggered inline "Próximo nível" button both built in CANGUPA-19 and
CANGUPA-24 are also gone, replaced by a new `WinPopup.tsx`: a dismissable
overlay shown over the board once a level is cleared, carrying the move
count and either a "Próximo nível" button or, on the last level, an
"Acabaste o jogo!" message. Closing it with ✕ only hides it — the
cleared board and BoardHud's Undo/Reiniciar/Dica corner stay reachable
underneath, and it reopens on the next win. `App.tsx`'s `Shell` now hides
the "Cangupa" title specifically when `panel === 'board'`, instead of
rendering it unconditionally above every panel, keeping it on the other
screens including the home screen, where it doubles as that screen's
logo (CANGUPA-29).

One commit. `BoardHud.test.tsx` and `BoardScreen.test.tsx` were updated
for the new shape, and a new `WinPopup.test.tsx` added. Verified with the
full Jest suite (208 tests across 19 suites) and `tsc --noEmit`, both
passing, plus a manual pass in a running Expo web dev server driven by a
throwaway Playwright script, confirming no title on the board screen, the
three buttons sitting top-right, the win popup appearing on clearing a
level with a working close button, and the board and controls staying
usable after closing it.

Era 6 closes here: Nov 2, 1 commit, CANGUPA-32 — the board screen's HUD
moved into a corner, with its old toolbar and inline next-level button
gone.

## Era 7 — Nov 2 (continued): the board shrinks to fit landscape

CANGUPA-33 fixes the board overflowing vertically on a wide/short
(landscape) window, similarly to DigiSpin: `Board.tsx` had sized itself
purely off container width (`width: '100%'` plus `aspectRatio: w/h`),
with nothing capping it by the available height. A new
`boardLayout.ts` exposes a pure `fitBoardWidth(w, h, maxWidth, maxHeight)`
helper that caps the board's width by whichever of width or height,
converted through the board's own aspect ratio, is the tighter fit.
`Board.tsx` gained an optional `width` prop overriding its old
`width: '100%'` (omitted, behaviour is unchanged). `PlayableBoard.tsx`
takes optional `maxWidth`/`maxHeight` props — the space on screen
available for the whole board component — subtracts its frame's own
padding, and feeds the result to `fitBoardWidth` before passing a width
down to `Board`; the padded frame around the board only shrinks and
centers itself once that capped width is actually known, so there is no
change before the first layout measurement or in the normal,
width-constrained (portrait) case. `BoardScreen.tsx` now measures its own
available size via `onLayout`, which needed `flex: 1` threaded up through
its wrapper so the measurement reflects the real space available rather
than content height, and passes it down as `maxWidth`/`maxHeight`.

One commit. `boardLayout.test.ts` is new, with width/cap assertions also
added to `Board.test.tsx` and `PlayableBoard.test.tsx`. Verified with the
full Jest suite (217 tests across 20 suites) and `tsc --noEmit`, both
passing, plus a manual check in a running Expo web dev server via
throwaway Playwright scripts: a landscape viewport (844x390) shows the
board capped and centered well within the viewport height, and a
portrait viewport (390x844) screenshot is pixel-for-pixel unchanged from
before this change.

Era 7 closes here: Nov 2, 1 commit, CANGUPA-33 — the board now shrinks to
fit landscape screens instead of overflowing past the bottom.

## Era 8 — Nov 2 (continued): stats tracking, ahead of a screen to show it

CANGUPA-30 adds a stats screen for `apps/app`, scoped with the project
owner to: levels cleared (X/total), best moves per level, and a
total-moves summary. `progress.ts`'s `Progress` gained a
`bestMoves: Readonly<Record<number, number>>` field (level index to the
fewest moves that level has ever been cleared in). `markDone(progress,
levelIndex, moves)` now takes the move count and keeps the record only
when it's new or an improvement, still returning the same object when
nothing changed — including when a replay doesn't beat the existing
best. A new `totalBestMoves(progress)` sums every level's best for the
screen's "Jogadas totais" line. `parseProgress` defaults a missing or
invalid `bestMoves` to `{}` and sanitizes entries (non-negative integer
level index, positive integer move count), so a save written before this
field existed loads fine with no best-move history — not a breaking
change to the saved shape. `useProgress.ts`'s `recordDone` now takes
`(levelIndex, moves)` and forwards to the updated `markDone`.
`BoardScreen.tsx`'s `onLevelComplete` now passes the move count the level
was just cleared in, and `App.tsx`'s `onLevelDone` type and call site
were updated to carry it through. The new `StatsScreen.tsx` shows
"Níveis limpos: X/Y", "Jogadas totais: N", and a list of cleared levels
with their best move count each, with an empty state when nothing's
cleared yet — it isn't wired into any navigation yet, since CANGUPA-31
(blocked on this task) is what adds the footer nav tab that reaches it.

One commit. `progress.test.ts` was extended for `bestMoves`, `markDone`'s
new signature, `totalBestMoves` and `parseProgress`'s sanitizing;
`LevelsScreen.test.tsx`'s `Progress` literals were updated for the new
required field; a new `StatsScreen.test.tsx` covers the screen itself.
Verified with the full Jest suite (225 tests across 21 suites) and
`tsc --noEmit`, both passing. Because the screen isn't reachable from
the running app yet, it was only checked via its own component tests,
not in a browser — that manual look is expected to happen as part of
CANGUPA-31 once the nav tab exists, not skipped here by oversight.

## Era 9 — Nov 2 (continued): a footer nav ties the screens together

CANGUPA-31 adds a reusable bottom-footer nav to `apps/app`:
`FooterNav.tsx` renders four tabs, in order — Início (home), Níveis
(levels), Estatísticas (stats), Definições (settings) — with the active
tab outlined, and exports a `FooterTab` type (`'home' | 'levels' |
'stats' | 'settings'`). `App.tsx` gains a `'stats'` panel wired to the
stats screen built in CANGUPA-30, and a new `isFooterTab` type guard
shows the footer on exactly those four screens — not on the board
screen, left chrome-free by CANGUPA-32, and not on the Regras/help
screen, reachable only through the home screen's Rules button from
CANGUPA-29. The board screen's old inline Níveis/Regras/Definições nav
row, and the now-unused `NavButton` helper and `nav`/`navButton` styles
it depended on, are gone, replaced by `FooterNav`.

One commit. `App.test.tsx`'s navigation tests were rewritten to drive
the footer instead of the old board nav row (opening Levels, Settings
and now Stats), plus new tests for the footer's Home tab returning to
the home screen from levels/stats/settings, and for the board screen
showing no footer at all; a new `FooterNav.test.tsx` covers rendering,
the active outline, and press-reports-id. Verified with the full Jest
suite (231 tests across 22 suites) and `tsc --noEmit`, both passing, and
with a throwaway Playwright script against a running Expo web dev
server confirming the footer on home/levels/stats/settings with the
active tab outlined, the stats screen reachable, and no footer at all
on the board screen.

Closing out CANGUPA-30's open thread, this also surfaced something
worth flagging rather than fixing quietly: once the board's old inline
nav row is gone, the board screen has no way off it at all except
clearing the level — no back button, no footer, nothing. That's a
direct consequence of CANGUPA-29's home screen, CANGUPA-32's
chrome-free HUD rework, and this task's explicit instruction to remove
the board's old inline nav as its finishing step, with no replacement
specified anywhere — implemented as written rather than second-guessed,
but a real gap for the project owner to decide on.

## Era 10 — Nov 2 (continued): the home screen gets its real logo

CANGUPA-34 wires the actual Cangupa logo into the `apps/app` home
screen, replacing the "Cangupa" text title Shell showed there as a
stand-in since CANGUPA-28. New `assets/logo-light.png` and
`assets/logo-dark.png` are cropped tight from TILE-JUMPER-7’s
`cangupa-logo-{light,dark}-vertical.png` in `apps/web-classic`’s
asset set, trimmed of the ~38% transparent canvas margin below the
wordmark that would otherwise show up as dead space under the
level/Play/Rules stack. `palette.ts` adds a `logo` field per theme,
picked for contrast against `bg1`/`bg2` and following the light/dark
naming convention `assets/icon-light.png` already uses, and
`HomeScreen.tsx` renders the chosen logo above that stack at a fixed
200×233 size — the trimmed PNGs’ own aspect ratio — rather than
`width: '%'` plus `aspectRatio`, which do not combine reliably on
react-native-web, where the image fell back to its native pixel size
instead of scaling down. `App.tsx`’s Shell now also hides its
"Cangupa" text title on the home panel, since the logo replaces it
there.

One commit. Verified with the full Jest suite (231 tests across 22
suites) and `tsc --noEmit`, both passing, and visually with a
Playwright screenshot against a running Expo web dev server,
confirming the logo renders clearly against the default theme’s
background with no stretching or clipping.

## Era 11 — Nov 2 (continued): the board screen gets a way back home

CANGUPA-35 gives the `apps/app` board screen a plain arrow back button,
upper-left, matching DigiSpin's own board-header back icon, that
returns to the home screen — closing the gap Era 9's CANGUPA-31 entry
flagged and left open: once that task's finishing step removed the
board's old inline nav row, the board screen had no way back to the
home screen at all short of clearing the level. `BoardHud.tsx` adds an
icon-only `Pressable` in a circular `palette.panel`-coloured button,
drawing a plain left-pointing arrow with `react-native-svg` (already a
dependency), with an accessibility label of "Voltar ao início" rather
than a text label, so it reads as "leave the board" at a glance instead
of competing with the Desfazer/Reiniciar/Dica labels beside it. A new
`onBack` prop threads from `App.tsx`'s Shell, through `BoardScreen.tsx`,
to `BoardHud.tsx`, wired to the same `setPanel('home')` the home
screen's own navigation already uses. `App.test.tsx`'s
"starts on the home screen, with no way back to it once past it" test
is rewritten to "starts on the home screen, and the board screen has
its own way back to it", now exercising the new button instead of
asserting its absence; new tests in `BoardHud.test.tsx` and
`BoardScreen.test.tsx` cover pressing it.

One commit. Verified with the full Jest suite (233 tests across 22
suites) and `tsc --noEmit`, both passing, and with a throwaway
Playwright script against a running Expo web dev server confirming the
back button renders on the board screen and returns to the home screen
when pressed.

## Era 12 — Nov 2 (continued): the footer nav trades labels for icons

CANGUPA-36 swaps `FooterNav`'s four text labels (Início/Níveis/
Estatísticas/Definições) for icons, styled after DigiSpin's own TabBar.
Rather than pull in a vector-icons dependency neither app installs, the
icons are hand-drawn `react-native-svg` glyphs on a 24-unit grid — a
house, three stacked bars, three bar-chart columns and a sliders glyph
for home/levels/stats/settings respectively. The tray itself changes
shape to match: a flat strip with a hairline top border in
`palette.panel`, replacing the old floating pill buttons, and the
active tab is now marked by swapping the icon's own color between
`palette.ink` and `palette.muted` rather than a border or background.
The text labels aren't gone, just invisible — each tab keeps its
Portuguese label as an `accessibilityLabel`/`accessibilityRole="tab"`
pair instead of visible `Text`, so `FooterNav.test.tsx` now queries
`getByLabelText` and asserts `accessibilityState.selected` instead of
checking border color, plus a new test confirming each tab renders its
own icon.

One commit. Verified with the full Jest suite (234 tests across 22
suites) and `tsc --noEmit`, both passing.

## Era 13 — Nov 2 (continued): the settings screen loses its redundant back button and borrows DigiSpin's row layout

CANGUPA-37 is two related changes to the settings screen. Shell's
`panel !== 'board' && panel !== 'home'` guard around the ‘‹ Voltar’ back
button gains a third exclusion, `panel !== 'settings'`: the button was
redundant there, since Settings is already a footer tab (CANGUPA-31's
`FooterNav`) one tap from Home, and the button only duplicated that
path. The ‘Cangupa’ title text stays. Separately, `SettingsScreen.tsx`
is rearranged into labelled sections of full-width rows, styled after
the sibling DigiSpin app's own `SettingsScreen.tsx`: an uppercase
section heading (‘Tema’, ‘Jogabilidade’) above a group of rows, each
theme choice now a row with a trailing selection mark instead of a
small rounded chip, and the three toggles grouped visually under
‘Jogabilidade’ instead of sitting as loose rows. Functionality, test
IDs and text are unchanged. A new `App.test.tsx` test confirms the
settings screen renders with no ‘‹ Voltar’ text, covering the Shell
change from the outside.

One commit. Verified with the full Jest suite (235 tests across 22
suites) and `tsc --noEmit`, both passing.

## Era 14 — Nov 2 (continued): English joins Portuguese

CANGUPA-38 gives `apps/app` a second language, mirroring DigiSpin's own
i18n layer rather than inventing a new one: a new `src/i18n/` module with
`locale.ts` (resolving a `language` setting of 'system'/'en'/'pt' into a
concrete locale, following the device's own language and falling back to
English for anything else), a `LanguageContext` plus `useLocale`/
`useStrings` pair, and a `strings/` folder holding `types.ts`, `en.ts`,
`pt.ts` and an `index.ts` tying them together. Every component in
`apps/app` — `App.tsx`'s Shell, `BoardHud`, `BoardScreen`, `FooterNav`,
`HelpScreen`, `HomeScreen`, `SettingsScreen`, `StatsScreen` and
`WinPopup` — is rewired from hardcoded Portuguese strings to
`useStrings()`. Settings (`state/settings.ts`, `useSettings.ts`) gains a
`language` field persisted alongside the app's other settings, and
`SettingsScreen.tsx` gets a new Language section with a System/English/
Português picker — the language names themselves (endonyms) are left
untranslated. Every existing component and `App` test is updated to
assert the new English defaults, and new tests cover `locale.ts`'s
locale resolution, `useStrings`' context wiring, and the language
picker. Scoped to `apps/app` only; `apps/web-classic` is unchanged.

One commit. Verified with the full Jest suite (251 tests across 24
suites), and manually in the browser via the Expo web build, confirming
the language switch applies live across the Home, Settings and Stats
screens, and that the choice persists.

## Era 15 — Nov 2 (continued): borrowing DigiSpin's shared themes package

CANGUPA-39 wires `apps/app` up to install from the external
`joaorodr84/themes` repo, the same way DigiSpin already does: a git
dependency pinned by semver tag (`github:joaorodr84/themes#semver:^1.0.0`),
no registry needed. This is scoped to the dependency mechanism only, not
a redesign of cangupa's own theming — `theme/palette.ts` still models
cangupa's own five decorative skins (cosmos/space/sand/ice/classic), not
DigiSpin's light/dark surface appearance, so its `Palette` shape stays
local. The one piece genuinely shared is `contrastRatio`, now imported
in `palette.test.ts` for a new describe block asserting every theme's
`ink` text colour clears 4.5:1 (WCAG AA, normal text) and `muted` clears
3:1 (WCAG AA, large text, since muted is deliberately the lower-contrast
secondary colour) against both ends of that theme's background gradient.

One commit. Verified with `npx tsc --noEmit` and the full Jest suite,
green at 261 tests.

## Era 16 — Nov 2 (continued): five skins become light, dark, and system

CANGUPA-40 replaces the five decorative skins (cosmos/space/sand/ice/classic)
with a plain light/dark/system appearance setting, matching DigiSpin's own
`themeMode`/`useColorScheme` pattern. `@joaorodr84/themes` is bumped to
`^2.0.0` first (owner-requested); its own `DARK`/`LIGHT`/`paletteFor` are
DigiSpin's own well-and-tray shape and don't fit cangupa's gradient-background
tile board, so only its `ThemeMode`/`SystemScheme` types are reused —
`theme/palette.ts` keeps a local `Palette` shape with its own `DARK` (cosmos's
colours plus space's starfield, so the previous default look is unchanged on a
dark or unreported device) and `LIGHT` (ice's colours), plus a local
`paletteFor(mode, system)`. `Settings.theme` becomes `Settings.themeMode`
(`'system' | 'light' | 'dark'`, default `'system'`) — a record saved before
this change has `theme`, not `themeMode`, so it falls through the existing
missing-field fallback to the new default rather than needing explicit
migration code; `jumps`/`hints`/`anim`/`language` are unaffected.
`SettingsScreen.tsx`'s theme picker now lists Follow the device/Light/Dark,
and `App.tsx` resolves the palette via
`paletteFor(settings.themeMode, useColorScheme())`, switching the status bar
style on it. Before removing the old skins, `develop`'s pre-change tip was
archived as `archive-five-skin-themes-pre-cangupa-40` and pushed to the
remote (owner-requested). This is a breaking change to the saved settings
shape: a previously-chosen skin is lost and the theme resets to 'system' on
upgrade, though other settings and progress are untouched.

CANGUPA-42 later replaces DARK and LIGHT's carried-over cosmos/ice colours
with values copied verbatim from @joaorodr84/themes's own DARK/LIGHT, so
the two appearances are colour-identical to DigiSpin's, not just matching
its light/dark/system model. CANGUPA-43 then replaces that verbatim copy
with a live read of @joaorodr84/themes's own DARK/LIGHT fields, so a
future version bump of that package carries its colour changes into this
app automatically instead of drifting out of sync with a frozen hex
snapshot. CANGUPA-44 then gives the home screen's Play button that same
package's own control colour instead of a hardcoded rgba(255,214,90,0.3),
and enlarges the Play and Rules buttons to match DigiSpin's sizing.

One commit. Verified with `npx tsc --noEmit` clean and the full Jest suite
green, 258 tests.

---

## Era 17 — Nov 2 (continued): the footer nav sits flush against the bottom edge

CANGUPA-45 fixes `FooterNav` sitting inset from the screen's edges instead
of flush against them. It was rendered inside `App.tsx`'s padded `content`
View, which added `paddingHorizontal: 16` (so the bar didn't span the full
screen width) and `paddingBottom: insets.bottom + 16` after it (so the bar
floated above the bottom edge instead of sitting flush against it).
`FooterNav` now takes an `insetBottom` prop and applies it as its own
`paddingBottom`, so it still clears the home-indicator safe area without
depending on the padded box's bottom padding. In `App.tsx`, `FooterNav` was
moved out of the padded `content` View to be a direct sibling in the outer
`app` View, so it spans the full screen width and sits flush at the bottom
edge, and `content`'s own `paddingBottom` is set to 0 whenever a footer tab
is showing, avoiding a doubled gap. `FooterNav.test.tsx`'s four render calls
were updated to pass the new required `insetBottom` prop (0, since those
tests don't exercise safe-area insets).

One commit. Verified with the full `apps/app` Jest suite green (258 tests)
and a clean `npx tsc --noEmit`.

---

## Era 18 — Nov 2 (continued): the levels screen gets a responsive grid and a shared back arrow

CANGUPA-46 polishes the levels screen two ways. The level grid
(`LevelsScreen.tsx`) was a fixed 52 pt cell left to flexbox's own wrap
behaviour; it is now laid out in explicit rows sized off the window width
via a new `levelGrid.ts` helper (`levelsPerRow`/`squareSize`/`levelRows`),
the same technique DigiSpin's own levels screen uses, so the grid adapts
across phone and tablet widths instead of wrapping wherever flexbox
happens to break the row. Within that grid, a cleared cell now uses the
theme's solid `palette.control` colour (the same one the Play button uses)
instead of a translucent green tint, and a locked cell is a plain
`palette.panel` background with dimmed `palette.muted` text instead of a
faded, partly see-through cell — no cell is ever see-through either way.

The back-arrow icon drawn inline inside `BoardHud.tsx` is factored out into
a shared `BackArrow.tsx`, and `App.tsx`'s generic back link (shown on the
Levels, Stats and Help screens) now reuses it instead of its old `‹ Back`
text link under a `Cangupa` title heading — it becomes an icon-only
circular button matching the board screen's own back button, and the
per-locale `appTitle` string is removed from the strings table since
nothing reads it anymore.

One commit. Verified with the full `apps/app` Jest suite green (272 tests).

---

## Era 19 — Nov 2 (continued): the starfield background is removed

CANGUPA-47 removes the apps/app `Starfield` component — the dark-theme-only
decorative background rendered behind the whole app — and all of its
associated code, per explicit owner request to remove the feature outright
rather than adjust it. `Starfield.tsx` and its test are deleted, its
import and `<Starfield stars={palette.stars} />` render call are removed
from `App.tsx`, and `theme/palette.ts` loses the `Star` interface, the
`STARFIELD` data array, the `STARFIELD_TILE_SIZE` export, the `stars`
field from the `Palette` interface and from `DARK`/`LIGHT`, and a stale
comment referencing the starfield. `App.test.tsx` and `palette.test.ts`
lose their now-dead starfield-related tests and assertions. The unrelated
apps/web-classic `--stars` CSS custom property (part of its old "space"
theme preset) is untouched.

One commit. Verified with the full apps/app Jest suite (265/266 passing;
the one failure is a pre-existing flaky timeout in SettingsScreen.test.tsx
unrelated to this change, confirmed passing 10/10 when re-run in
isolation).

---

## Era 20 — Nov 3: the stats screen becomes a DigiSpin-style panel

CANGUPA-48 reworks the apps/app stats screen (`StatsScreen.tsx`) into a
single bordered panel of label/value rows, matching DigiSpin's own
`StatsScreen.tsx` layout, and drops the per-level best-moves list it used
to show below the summary — the panel's own "levels cleared" row already
said as much. The two existing stats (levels cleared, total moves) move
from single-sentence i18n strings to separate label/value string pairs,
so each becomes its own row, leaving room to add further stats the same
way later. A new `Palette.panelBorder` field, read live from
`@joaorodr84/themes` alongside the other live-read fields CANGUPA-43
introduced, supplies the panel's border colour.

One commit. Verified with `npx tsc --noEmit` clean and the full apps/app
Jest suite green (266 tests).

---

## Era 21 — Nov 3: the levels/settings highlight matches DigiSpin exactly

CANGUPA-50 removes the gold `rgba(255,214,90,0.9)` border that marked the
current level on the apps/app levels screen and the selected row on its
settings screen, replacing both with DigiSpin's own styling instead. The
settings screen's `rowSelected` style and its two usages are removed
outright — DigiSpin's own `SettingsScreen.tsx` marks the selected row
only with the filled mark/dot, not a border colour. The levels screen's
current-level outline becomes a `palette.ink` 2px border, matching
DigiSpin's own `LevelsScreen.tsx` (`borderColor: palette.text`), so it
now tracks the live `@joaorodr84/themes` ink colour instead of a fixed
hex value.

One commit. Verified with `npx tsc --noEmit` clean and the full apps/app
Jest suite green (266 tests).

---

## Era 22 — Nov 3: settings rows group into flush, rounded blocks

CANGUPA-51 makes each group of rows on the apps/app `SettingsScreen.tsx`
(Appearance, Gameplay, Language, and the standalone Clear progress row)
read as one rounded block, matching DigiSpin's own `SettingsScreen.tsx`,
instead of a stack of separate pills. A new `groupedRow.ts` ports
DigiSpin's `groupedRowCorners` helper, which rounds only a group's first
and last row and leaves the middle rows square-cornered. The `8pt` gap
`styles.group` used to put between rows of the same group is dropped so
the rows sit flush, and a `1px` `palette.panelBorder` border is added to
each row so adjacent flush rows still have a visible seam, the job the
gap used to do. `ToggleRow` gained `index`/`length` props so the three
gameplay toggles can compute their own corners.

One commit. Verified with `npx tsc --noEmit` clean, the full apps/app
Jest suite green (266 tests), and a Playwright screenshot of the Expo web
build.

---

## Era 23 — Nov 4: clear-progress confirmation moves into the app's own Popup

CANGUPA-52 gives the apps/app settings screen's "Clear progress" row its
own "Data" section header (previously it sat under Language with no
header of its own), and replaces the confirmation `Alert.alert` with the
app's own in-app popup card instead of an OS dialog. A reusable `Popup`
component is factored out of `WinPopup` (CANGUPA-32) so both the
level-complete popup and this new confirmation share the same
overlay/card/close/heading frame; `Popup` gains a new `actions` slot, a
fixed-height strip pinned to the card's bottom, so the button row sits in
the same place regardless of how much body text a given popup shows. The
confirmation now reads "Are you sure you want to clear your progress?"
with Yes/No buttons (previously "Clear all progress?" with Cancel/Clear),
and the No button is focused automatically when the popup opens, since
it's the safe default for a destructive action.

One commit. Verified with `npx tsc --noEmit` clean and the full
apps/app Jest suite green (271 tests).

---

## Era 24 — Nov 4: falling becomes an opt-in setting in the web game

TILE-JUMPER-3 adds a "Cair ao não haver jogada" checkbox to
apps/web-classic's settings panel (`js/config.js`'s `DEFAULT_SETTINGS`,
off by default). With it on, a direction press (arrow keys/WASD) that
finds no legal step or jump, or a click/tap on empty space or a tile with
no legal move, falls instead of doing nothing: `js/ui.js`'s new `fall()`
adds a `.falling` class to the board, which plays a sink-and-fade
keyframe animation on the kangaroo sprite, then after 500ms resets the
level. A module-level `falling` flag ignores further input while the
animation runs. `js/game.js` was untouched — "no legal move in that
direction" is already exactly what `legalMoves()` computes, so this is a
different UI response to an existing condition rather than a new rule,
and ships with no new rules assertion. TILE-JUMPER-2 adds a short
synthesized jump sound (new `js/sound.js`, a Web Audio API oscillator
with a gain envelope, no audio files) that plays on every move, plus a
new "Som" settings checkbox, on by default, to mute it. TILE-JUMPER-4
adds a win sound: `js/sound.js` gained a `melody()` helper (schedules a
run of `tone()` notes against `ctx.currentTime` instead of stacking
`setTimeout`s) and a `win()` four-note ascending arpeggio built on it,
which `js/ui.js`'s `move()` now plays every time a level is cleared,
including on a replay of an already-cleared level. TILE-JUMPER-5 adds a
fall sound: `js/sound.js` gained `fall()`, a descending sawtooth glide
from 300Hz to 70Hz over 0.45s, timed to roughly match the `.falling`
CSS animation's 0.5s duration, called from `js/ui.js`'s `fall()` right
after it adds the `.falling` class.

Four commits. Verified with `node apps/web-classic/tools/test.js` (50
levels, existing rules assertions); not yet checked visually/audibly in
a browser.

---

## Era 25 — Nov 4: a joey rides in the kangaroo's pouch

TILE-JUMPER-6 redraws part of the kangaroo's inline-SVG art in
`apps/web-classic/js/sprites.js`: a small joey (two ears, a round head,
two eyes, a nose, in matching but slightly lighter tones) now peeks out
of the pouch in the `side` and `front` poses. `back` is left untouched on
purpose, since a kangaroo's pouch isn't visible from behind — noted in
a new comment at the top of the file. The rest of the existing kangaroo
art was kept as-is; this is an addition to the established style rather
than a redesign.

One commit. `js/game.js` wasn't touched, so no new rules assertion
applies, but `node apps/web-classic/tools/test.js` was re-run (50 levels,
existing rules assertions) to confirm nothing else broke. Checked
visually in headless Chrome — standalone renders of all four sprite
variants (side, front, back, and the CSS-mirrored side) and the real
`apps/web-classic/index.html` game page at in-tile scale, in both the
front-facing idle pose and the side-facing hop pose — confirming the
joey reads clearly with no overlap or clipping against the mother's arm,
jaw, or belly patch.

---

## Era 26 — Nov 4: apps/app reaches parity with web-classic's sound, falling, and joey art

CANGUPA-57 ports the web version's jump sound effect (`TILE-JUMPER-2`) and
its sound on/off setting to apps/app, the first of five parity tasks
(CANGUPA-57–61) carrying work just landed on web-classic over to the
Expo/React Native port. React Native has no Web Audio API to synthesize
tones live, so the same tone math (oscillator waveform plus exponential
gain/pitch envelopes) that `js/sound.js` computes at runtime is instead
pre-rendered once to a WAV file by a new `tools/gen-sounds.js`, mirroring
`tools/gen-levels.js`'s generate-then-commit pattern; the output
(`assets/sounds/jump.wav`, a 440→660Hz triangle-wave chirp) is committed
alongside the script. Playback goes through a new `expo-audio` dependency
(plus its `expo-asset` peer dependency): a new `src/audio/sound.ts` module
exposes `setEnabled()`/`jump()` backed by one `AudioPlayer` created once
and replayed with `seekTo(0)`/`play()` rather than recreated per call.
`expo-audio`'s native `AudioPlayer` isn't mocked by the `jest-expo` preset,
so a manual `__mocks__/expo-audio.ts` stub was added. `Settings.sound:
boolean` (default `true`) was added alongside `jumps`/`hints`/`anim` in
`state/settings.ts`/`useSettings.ts`, and a fourth `ToggleRow` ("Sound")
joins the Gameplay section of `SettingsScreen.tsx`. The asset pipeline and
`Sound` module were built with `win()`/`fall()` in mind, for
CANGUPA-59/CANGUPA-60 to extend later, even though only `jump()` ships
here.

One commit. Verified with `npx tsc --noEmit` clean, the full apps/app
Jest suite green (274 tests), `npx expo-doctor` clean after adding the
missing `expo-asset` peer dependency, and a headless-Chrome/Puppeteer run
against the live Expo web build confirming the new Sound row renders
correctly in Settings and that a tap-to-move still plays with no console
errors from the new audio code path.

CANGUPA-58 continues the same series, porting falling as an opt-in setting
(`TILE-JUMPER-3`) to apps/app: `Settings.fall` (default off) gates a new
`onPressEmpty` prop on `Board.tsx`'s outer container, now a `Pressable` instead
of a plain `View`, which drives a sink/shrink/fade animation on the kangaroo
and then resets the board, with a live-caught bug fixed along the way where the
animation's driving value was never reset back to 0, leaving the kangaroo
permanently invisible after the first fall.

CANGUPA-59 continues the series, porting the finish-level sound effect
(`TILE-JUMPER-4`): a new `win()` export in `src/audio/sound.ts`, backed by a
`win.wav` rendered by a `renderMelody` helper added back to
`tools/gen-sounds.js`, plays the same C5/E5/G5/C6 triangle-wave arpeggio as
the web version, wired into `PlayableBoard.tsx`'s move handler (not
`BoardScreen.tsx`'s first-clear-only progress effect) so it fires on every
move that leaves the level cleared, matching `ui.js`'s own behaviour.

CANGUPA-60 continues the series, porting the falling sound effect
(`TILE-JUMPER-5`): a new `fall()` export in `src/audio/sound.ts`, backed by a
`fall.wav` rendered by `tools/gen-sounds.js` matching the web version's
300→70Hz sawtooth glide exactly, wired into `PlayableBoard.tsx`'s
`handlePressEmpty` right before the sink-and-fade animation starts.

CANGUPA-61 closes out the series, porting the joey-in-pouch art
(`TILE-JUMPER-6`) to apps/app: the same joey (two ears, a round head, two
eyes, a nose) was added to `Kangaroo.tsx`'s `SideSprite` and `FrontSprite`,
ported 1:1 from `apps/web-classic/js/sprites.js`'s SVG paths —
`react-native-svg`'s `<G>`/`<Path>`/`<Ellipse>`/`<Circle>` mirror the plain
SVG elements directly, same coordinates, same nesting — while `BackSprite`
stays untouched, since no pouch is visible from behind a kangaroo either.

Five commits across CANGUPA-57–61, completing the apps/app parity series.
Verified with `npx tsc --noEmit` clean, the full apps/app Jest suite green
(283 tests, unchanged by this last task since it ships no new logic), and
the two kangaroo poses (front-facing idle, side-facing after one move)
checked against the live Expo web build, matching web-classic's rendering
exactly with no clipping or overlap.

---

## Era 27 — Nov 4 (continued): falling jumps to its landing cell before it sinks

CANGUPA-64 fixes a gap in TILE-JUMPER-3/CANGUPA-58's falling feature: tapping
(or arrow-keying into) a tile with no legal move sank the kangaroo in place,
where it already stood, instead of showing it fall at the cell the player
actually aimed at. Both apps now play the kangaroo's normal jump animation
toward that cell first, then sink-and-restart at the landed position; a tap
or key-press with nowhere to jump to (true board background, or walking off
the grid's edge) still falls in place, since there's nowhere to jump to. On
web-classic (`apps/web-classic/js/ui.js`), the facing-direction calculation
was factored out of `move()` into a shared `faceFor(dx, dy)`, reused by the
now target-aware `fall(target)`, which sets position/facing and plays the
jump sound and hop bounce before the sink begins, 240ms later
(`apps/web-classic/style.css`) to match the hop, skipped when animations are
off. Along the way, a real latent bug surfaced: the `.falling` sink/shrink/
fade keyframe had been applied to `#roo` itself, which also carries the
kangaroo's own position transform, so a fall away from column/row 0 blended
the horizontal position back toward the top-left corner while sinking —
pre-existing since CANGUPA-58/TILE-JUMPER-3, just not obvious until this
change made falls land away from the origin more often. Fixed by moving the
`fall-through` animation to the nested `.hopper` element, which only ever
carries the bounce. On `apps/app`, `Board`'s `onPressEmpty` prop now takes an
optional target cell instead of none, with an always-empty cell and any tile
with no legal move each getting their own `Pressable` reporting their own
coordinates; `PlayableBoard` added local state that, only during a fall with
a known target, overrides where `Board` renders the kangaroo (never touching
the real game position, since the move was illegal), runs the existing
`hop()` and jump sound, waits the newly exported `HOP_MS` (240ms) when
animations are on, then runs the existing sink exactly as before — no
analogous positional bug there, since the sink was already a separate layer
from the position-bearing slot.

One commit across both apps. Verified with `node tools/test.js` (unaffected
rules/levels, still green) and, on the `apps/app` side, new
`Board.test.tsx`/`PlayableBoard.test.tsx` cases covering the target-aware
`onPressEmpty` and the jump-then-fall sequencing, the full suite (285 tests,
25 suites) green, and `tsc --noEmit` clean. The web-classic UI change itself
was not checked live in a browser this round — no dev server was reachable
from this session. CANGUPA-65 then fixed a bug this introduced: a tap on
any tile with no legal move, not just one a step or jump away in a
cardinal direction, was wrongly treated as a fall target, so both
`Game` implementations gained an `inMoveShape()` check, used by
`ui.js`'s click handler and `PlayableBoard.tsx`'s `handlePressEmpty`
to reject an out-of-shape tap as a no-op instead of falling.
CANGUPA-66 and CANGUPA-67 then fixed two more gaps found in the same sitting:
a tapped cell is now found purely from where the tap landed on the board
instead of needing an existing tile there, so tapping the kangaroo's own
cell is correctly a no-op and tapping true empty background a step or jump
away now jumps there first instead of always falling in place; and the tile
just jumped away from now renders as vacated, not still occupied, for the
duration of a fall triggered by an already-exhausted landing tile.

---

## Era 28 — Nov 4 (continued): holding on the kangaroo peeks at the tile underneath

CANGUPA-70 adds a hold-to-peek: pressing down (pointerdown) on the
kangaroo's own cell in web-classic fades it to 20% opacity via a new
`#roo.peek` CSS class, so a special tile underneath — easy to miss when
it's cracked or a double tile hidden by the sprite — shows through;
releasing (pointerup/pointercancel, bound to `document` rather than the
board so a press that drags off the board or the window still clears it)
restores full opacity. `#roo`'s existing transform transition gained a
matching opacity transition so the fade isn't instant.

One commit. Verified with `node tools/test.js` (a pure UI/CSS change, so
rules and level solvability are unaffected and stayed green) and a
Playwright script driven against the real page, confirming `#roo`'s
computed opacity goes 1 → 0.2 on mouse down over the kangaroo and back to
1 on mouse up, with no console or page errors, and a screenshot taken while
held showing the tile color reading through the faded sprite as intended.

CANGUPA-71 then ported the same fade to apps/app: a new `peeking`
boolean on `Board.tsx` (plain state, not an `Animated.Value`, since it
only ever toggles between two fixed opacities) drives a 20%-opacity
style on the kangaroo's `View`, wired through a new
`isRoo`/`onPeekStart`/`onPeekEnd` prop pass-through on the per-cell
`Tile` so its own cell gets press-in/press-out handling even when the
`fall` setting's `onPressEmpty` handler isn't present. Verified with the
full Jest suite (27 suites, 765 tests) plus `tsc --noEmit`, and a
Playwright-driven check of the real Expo web build showing the
kangaroo fade to a faint silhouette with the tile color reading through
on press-and-hold, restoring on release, with no console errors.

---

## Era 29 — Nov 4 (continued): the Levels tab splits into a pack list and a pack's own grid

CANGUPA-73 replaces CANGUPA-56's one long scroll of all ten level packs'
grids stacked in a row with a DigiSpin-style two-screen flow: a new
`LevelPacksScreen` lists the ten packs one row per pack — a colour
swatch with a placeholder icon (`theme/packColors.ts`, `PackIcon.tsx`),
the pack's name, and a "Levels X–Y · N/M solved" line — under the
collection name, now "Australia"/"Austrália" (previously "Base"), shown
in a pill badge. Tapping a pack opens `LevelsScreen` now scoped to just
that pack's own grid via a new `packIndex` prop, instead of rendering
every pack's grid on one screen. `App.tsx` gained an `openPack` state
tracking which pack, if any, is open; the Shell header's existing back
arrow does double duty instead of a second arrow being added — with a
pack open it steps back to the pack list, otherwise it steps out to the
board — and is hidden on the pack list itself, the same way it already
was on Settings, since both are a footer tab's own top-level view.
Re-tapping the Levels tab while a pack is open also closes back to the
list, matching DigiSpin's own pack-list behaviour.

CANGUPA-76 then gave the open pack's own `LevelsScreen` its own back
button in its own header row, matching DigiSpin's own pack header more
closely (DIGISPIN-173/174) and replacing that shared floating arrow for
the whole Levels tab, centring the pack name in the row and colouring it
and each done cell in the pack's own colour instead of the plain theme
ink/accent, and dropping the now-redundant "N/M solved" count the pack
list already shows.

One commit. Verified with `tsc --noEmit` (clean) and the full Jest suite
(771 tests passing).

---

## Era 30 — Nov 4 (continued): the level pack and difficulty visualizers move to a standalone page

CANGUPA-81 moved the level pack and level difficulty visualizer pages out of
`tools/difficulty-report/` (deleted) into `tools/visualizers/`
(`level-packs.html`, `level-difficulty.html`), built by a new
`gen-visualizers.js` from `tools/packs.json` with the pack data inlined into
the page instead of `fetch()`ed from a sibling JSON file, so each page opens
straight from disk (`file://`) with no server needed — `serve-visualizer.js`
is still there for anyone who'd rather open a `localhost` URL, now with a
`--watch` mode that regenerates the pages and live-reloads any open tab over
SSE whenever `tools/packs.json` or a template changes. `gen-packs.js` now
calls `writeVisualizers()` at the end of every run, so the pages regenerate
automatically whenever the packs change and can't go stale relative to
`tools/packs.json`/`packs.ts`. Scoped to `apps/app`'s packs, per CANGUPA-80's
scope decision; `apps/web-classic`'s original 50 levels keep a difficulty
measure (`export-difficulty.js` → `tools/levels-difficulty.json`, moved out
of the old `difficulty-report/` folder) but no page of their own.

One commit. Verified with `node tools/test.js`.

---

## Era 31 — Nov 5: the Meadow ramp and a start-tile bug found reviewing the packs for CANGUPA-80

CANGUPA-82 fixed two problems found while reviewing `apps/app`'s level
packs for CANGUPA-80. First, Meadow (pack 1)'s easiest third of levels had
pathBits 0 — a forced walk with no actual decision anywhere in the solve,
which felt like no puzzle at all. Raising `tools/pack-plan.js`'s `steps`
floor to .80 fixed that (floor 0 to 3) but shrank the usable board pool
from 137 to 53, and drawing 50 levels from only 53 boards made the pack
look repetitive — nearly every level the same near-full board with the
start shuffled. .65 was kept instead: 113 boards, floor raised to pathBits
1 rather than all the way to 3, no more zero-decision levels, and real
variety restored. Still a 3x3 board, Common tiles only, 50 levels. The
superseded (pre-CANGUPA-82) Meadow levels are kept as an unused
`MEADOW_V1_LEVELS` export in `pack-plan.js` rather than deleted, in case
they're useful later.

Second, `tools/level-generator.js`'s `randomWalk` could revisit a level's
start cell later in the walk and turn it into a 2- or 3-visit tile (Gold or
Steel) — but `board.ts`'s `reset()` always spends one of the start tile's
visits just for standing there, so that tile began one visit short of its
real strength (a Gold tile showing 1 stroke instead of 2, Steel showing 2
instead of 3). An audit of all 500 shipped levels found 146 affected.
`randomWalk` now never lets the start cell be revisited, and every
non-frozen pack (Creek, Gully, Outcrop, Ridge) was regenerated to clear its
79 affected levels. The remaining 67 live in the four frozen packs (Mesa,
Gorge, Plateau, Outback) — `pack-plan.js` marks them `frozen: true` per
CANGUPA-68/69's decision not to regenerate them, and this commit respects
that rather than breaking it, leaving them as a known follow-up.
`tools/packs.json`, `apps/app/src/game/packs.ts` and `tools/visualizers/`
were regenerated to match.

One commit. Verified with `node tools/test.js` (50 levels and 500 pack
levels solvable) and the full `apps/app` Jest suite (796 tests), plus
`npx tsc --noEmit` clean.

---

## Era 32 — Nov 5 (continued): the two-tile jump setting is removed as never truly optional

CANGUPA-83 removed the `jumps` setting — the toggle that let a player turn
off two-tile jumps — from both apps entirely, rather than just defaulting
it on. It was never actually optional in practice: every shipped level in
both apps already requires a jump to solve, so switching it off could
strand a player with no way to finish. `apps/web-classic/js/game.js` and
`apps/app/src/game/board.ts`'s `legalMoves`/`inMoveShape` now always allow
a step or a jump (distance 1 or 2) unconditionally, and `Game`'s
`rules`/`Rules` parameter is gone outright, since `jumps` was its only
field. `apps/web-classic/js/config.js` and `apps/app/src/state/settings.ts`
drop `DEFAULT_SETTINGS.jumps`/`Settings.jumps`; a pre-CANGUPA-83 saved
record's `jumps` field is simply ignored on load now, like any other field
this build doesn't know. The settings UI for it — `js/ui.js`'s wiring,
`index.html`'s checkbox, `SettingsScreen.tsx`'s toggle row and
`useSettings.ts`'s `setJumps`, and the `jumps` string in
`i18n/strings/{types,en,pt}.ts` — are all removed, along with
`README.md`'s "(can be switched off in settings)" line.

Several tests in both apps had used `{ jumps: false }` purely as a way to
put some tile out of reach for an unrelated assertion, mostly fall/stuck
scenarios — those were redesigned around a tile placed past jump range
instead (e.g. level `S..1`, three tiles from the start). The one test that
was genuinely about the jumps toggle itself, `apps/app`'s
`PlayableBoard.test.tsx`'s "tapping a jump-distance tile does nothing when
the jumps rule is off", was deleted outright, since that behavior no
longer exists. Net: `apps/app`'s Jest suite went from 796 to 790 tests,
six removed rather than rewritten.

One commit. Breaking change to both apps' saved-settings shape, expected
and already noted when the task was opened. Verified with
`node tools/test.js` (rules and all 550 levels across both apps solvable),
`npx tsc --noEmit` clean in `apps/app`, and the full `apps/app` Jest suite
green (790 tests).

---

## Era 33 — Nov 5 (continued): tile colours become theme-independent, and two tiles get names

CANGUPA-87 decided tile-type colours should be a fixed brand constant, not
something each visual theme recolors, and settled names/colours for two
tiles. `apps/app`'s `theme/palette.ts` tile colours (`tile`/`tile2`/
`tile3`/edges) were already theme-independent constants as of
CANGUPA-42/43, so the real gap was `apps/web-classic/style.css`:
`--tile`/`--tile2`/`--edge`/`--edge2` used to vary per `[data-theme="..."]`
block (classic's common tile was green, sand's was orange-red); they now
live in `:root` as fixed constants — the same cyan (`#4cc9f0`)/gold
(`#ffc857`) `apps/app` already used — and the five theme blocks only vary
`--bg1`/`--bg2`/`--frame`/`--pit`/`--ink`/`--muted`/`--panel`/`--stars`
now.

The arrow tile (`ARROWS`/`dir` in `game.js`, implemented since CANGUPA-69
but never rendered or shipped in a real level) is renamed Signpost
everywhere it's player-facing and recoloured green, freeing raspberry for
the future Gate tile: `theme/palette.ts`'s `tileArrow`/`edgeArrow`/
`markArrow` fields are renamed `tileSignpost`/`edgeSignpost`/
`markSignpost` and changed from raspberry (`#9d1057`/`#ba5889`) to green
(`#2f9e44`/`#7cd48f`); `Board.tsx`'s call sites, `i18n/strings/{types,en,
pt}.ts`'s help-screen strings (`arrowBold`/`arrowRest` →
`signpostBold`/`signpostRest`), and the pack 5 (Billabong)/pack 6
(Ridge) blurbs in `en.ts` and `tools/pack-plan.js` all follow. The
internal mechanic identifiers (`ARROWS`, `TileView.arrow`,
`ArrowDirection`, `ArrowMark`, `tile-arrow-*` testIDs) were deliberately
left alone, since they name the mechanic itself, not the tile's display
name.

The second tile, Gate (raspberry red, a new unimplemented entry-locked
tile that mirrors Signpost's exit-side restriction on the entry side
instead), is a naming/colour decision only — written up as idea #22 in
`docs/tile-ideas.md`, distinct from that doc's Pillar (#16). Actually
implementing it is split out as the new CANGUPA-104, which the
rebuilt-packs task CANGUPA-88 is now blocked on. Changing the pack 5/6
blurb text changed `pack-plan.js`'s cache-key hash for those two pools, so
`tools/packs.json`, `apps/app/src/game/packs.ts`, and `tools/visualizers/`
were regenerated; only the two blurb strings changed in the output,
packs 5/6's levels came out byte-identical, and packs 7-10 stayed frozen.

One commit. Verified with `node tools/test.js`, `npx tsc --noEmit` clean
in `apps/app`, and the full `apps/app` Jest suite green (790 tests,
unchanged count) — not checked live in a browser, no browser-automation
tooling available in this environment.

---

## Era 34 — Nov 5 (continued): the Gate tile lands in the engine, with no level using it yet

CANGUPA-87 named and coloured Gate (raspberry red) as the mirror of the
existing Signpost/arrow tile (CANGUPA-69): a Signpost can only be *left*
in the direction it points, a Gate can only be *entered* by moving in
the direction it names. CANGUPA-104 builds that mechanic for real, in
both apps plus the level generator, while deliberately shipping no level
that uses it — that's left to CANGUPA-88.

A new `R L D U` level character parallels the arrow tile's `> < v ^`,
same `DIRS` ordering (right/left/down/up), one visit, never the start —
gate characters simply aren't in the start-character list, the same
parsing rule arrows already used. A new `gate`/`this.gate` `Int8Array`
parallels the existing `dir` array: `gate[i]` is the one direction of
travel a move is allowed to land on tile `i` with, -1 for every other
tile. `legalMoves()` now also rejects a candidate move whose direction
doesn't match the destination tile's `gate` value, checked on arrival —
the mirror of the existing check that rejects a move whose direction
doesn't match the *current* tile's `dir` value, checked on departure.
`inMoveShape()` needed no change — it stays purely geometric and unaware
of gates, the same as it's already unaware of arrows, so a gate-blocked
tap still counts as "in move shape" and falls instead of silently doing
nothing. No solver-key change either: which side is open is fixed per
tile (static board data, not mutable game state), so `solve()`/
`countSolutions()`'s existing `pos + cells` memo key already covered it,
same as arrows needed none. `apps/web-classic/js/game.js` and
`apps/app/src/game/board.ts` both got this identically.

`tools/level-generator.js`'s `randomWalk` gained a `gates` option
mirroring its existing `arrows` one. A new `entries` map (the mirror of
the existing `exits` map, which already records the direction each tile
was first *left* by) records the direction each tile was first
*entered* by. Up to `gates` single-visit, non-start tiles — excluding
any already picked as an arrow, since a tile can't be both — are marked
with the `RLDU` character matching that entry direction, so a walk that
places Gate tiles is still guaranteed a valid solution: the walk's own
path already used exactly that direction to get there.

Deliberately left untouched, for CANGUPA-88 to pick up: `tools/
pack-generator.js` (its `variants()`/`canonical()` rotation-and-mirroring
logic has no Gate-turning support yet, the way `turnArrow` handles
arrows; `hasKinds()`/`kindsOf()` don't know about gates; `buildPool()`
has no `gates` option wired through), `tools/pack-plan.js` (no pack
actually requests gates), `tools/gen-packs.js`, and `apps/app/src/game/
orient.ts` (screen-orientation turning) — none of it is exercised yet
since no real level contains a Gate tile.

One commit. Verified with `node tools/test.js` (new rules assertions
mirroring the existing arrow ones, plus a 200-trial check that
`randomWalk({ gates: 2 })` always produces a solvable level), `npx tsc
--noEmit` clean in `apps/app`, and the full `apps/app` Jest suite green
(793 tests, up from 790 — three new Gate-tile tests in `board.test.ts`).

CANGUPA-88 then picked up exactly where this left off, rebuilding packs
7-10 (Mesa, Gorge, Plateau, Outback) around Gate — wiring the
rotation/mirroring, pool-building, and portrait-turning support
`pack-generator.js`/`orient.ts` still lacked, un-freezing the four packs,
and giving Gate its first real levels, its rendering, and its help-screen
rule line, while packs 9-10 stayed Gold+Steel only to keep within the
project's three-tile-kind limit.

---

## Era 35 — Nov 5 (continued): the back button learns which tab a level or the rules screen was opened from

CANGUPA-86 decided between two fixes for a real inconsistency in `apps/
app`'s `Shell` (`App.tsx`): a true history stack (back always returns to
the literal previous screen) versus a fixed per-screen "came from"
pointer. Board and Help are one-level detail screens pushed on top of
whichever footer tab was active, not peers in an arbitrary-depth chain,
so a general stack risked a confusing bounce (Home → Board → Help →
Board → …) for no real gain over just remembering which tab launched
the current screen — the pointer won. Before the fix, `BoardScreen`'s
`onBack` always went to `setPanel('home')`, but Board has two legitimate
entry points, Home's Play button and Levels' `onSelectLevel`, so opening
a level from the Levels tab and pressing back landed on Home instead of
back on Levels.

A new `returnTo: FooterTab` state (default `'home'`) and a `goTo(target:
'board' | 'help')` helper capture the current `panel` into `returnTo`
immediately before switching panels — `panel` is always a footer tab at
each of this helper's three call sites, since Board/Help can only be
entered from a footer tab's own content. `goToLevel`, the home screen's
`onRules`, and the settings screen's clear-progress handler all go
through `goTo` now instead of calling `setPanel('board')`/`setPanel(
'help')` directly; `BoardScreen`'s `onBack` and the floating back button
both read `returnTo` instead of a hardcoded target.

Two smaller bugs sitting right next to this one got fixed while touching
the same code. The floating back button's exclusion condition had never
excluded `'stats'`, even though Stats is a footer tab with no "back"
concept of its own — so viewing Stats showed both the footer nav and
this floating button at once, the button wired to a stale, wrong target
(`setPanel('board')`) left over from before Stats became a footer tab;
the condition simplified to `panel === 'help'`, the only panel that
genuinely still needs it, since Board has had its own back arrow since
CANGUPA-35, an open pack its own since CANGUPA-76, and every footer tab
is one tap from another via FooterNav. `BoardHud`'s back button was also
accessibility-labelled "Back to home" (`boardHud.backToHome`) even on
levels that no longer return to home — renamed to `boardHud.back`/
"Back" (`en.ts`) / "Voltar" (`pt.ts`) across `types.ts`/`en.ts`/`pt.ts`/
`BoardHud.tsx` and every test referencing the old label text.

One commit. `TODO.md`'s own suggestion to check whether DigiSpin's shell
has the same hardcoded-back inconsistency became the new `CANGUPA-105`,
tracked but not done here since DigiSpin lives in a different repo.
Verified with `npx tsc --noEmit` clean in `apps/app` and the full `apps/
app` Jest suite green (800 tests, up from 798 — one stale test fixed in
place, which had asserted the old, wrong "Back returns to the board"
behavior, plus two new tests covering the Levels-tab and
clear-progress entry points).

## Era 36 — Nov 5 (continued): the rules page gets labelled sections and tile swatches

CANGUPA-101 rebuilt `apps/app`'s rules page (`HelpScreen.tsx`, ported from
`apps/web-classic`'s `#help` aside) out of one flat, undifferentiated
bullet list — step, jump, a general note, then one bullet per tile kind
added as each shipped (double/Gold and Steel from CANGUPA-68/69, Signpost,
Gate from CANGUPA-88) plus two closing notes — that had simply kept
growing in a straight line with nothing grouping it.

The screen is now two labelled sections, reusing `SettingsScreen.tsx`'s own
section-label styling (uppercase, letter-spaced, muted colour) for visual
consistency with the rest of the app: "Moves" (Step, Jump, and the "you can
only land where visits are left" note) and "Tiles" (one row per tile kind
that actually exists today — Gold, Steel, Signpost, Gate). Common isn't
given its own row — it's already covered by the Moves section and doesn't
need a swatch to recognise. Each tile's row now carries a small colour
swatch next to its text, read live from the palette (`palette.tile2`/
`tile3`/`tileSignpost`/`tileGate`) rather than only describing the colour in
words ("Gold tiles (yellow)..."), so the page works as an actual
quick-reference a player can check against what's on their board, not just
a wall of text to read once and forget. The screen is now wrapped in a
`ScrollView` (was a plain `View`), since the new section structure makes
the content taller than before.

This also sets up where CANGUPA-103's per-tile tutorial content is decided
to live — the same screen, reframed from a separate tutorial flow, per an
explicit owner decision — and what a new Board HUD help icon (also
CANGUPA-103, not part of this commit) will open.

One commit. New i18n strings: `help.movesSection`/`help.tilesSection` in
`types.ts`/`en.ts` ("Moves"/"Tiles") / `pt.ts` ("Jogadas"/"Casas").
Verified with `npx tsc --noEmit` clean in `apps/app` and the full `apps/
app` Jest suite green (802 tests, up from 800 — two new tests, one
confirming the "Moves"/"Tiles" section labels render, one confirming each
tile row's swatch, queried by a new `help-swatch-<kind>` testID, actually
carries the right palette colour).

CANGUPA-103 followed through on that setup: `BoardHud.tsx` gained a fourth
icon-button, Help, next to Undo/Restart/Hint and never disabled the way Hint is
once a level is won, opening the same rules page mid-level — which required
widening `App.tsx`'s `returnTo` pointer (CANGUPA-86) from `FooterTab` to the
full `Panel`, so Back from a Board-opened Help screen returns to Board instead
of wherever launched Board in the first place.

## Era 37 — Nov 8: the doorway-bracket mark ships, and the rules page gets live diagrams

CANGUPA-107's own review (`tools/visualizers/tile-marks.html`, Option B)
had already picked a doorway-bracket mark over the plain triangle
`Board.tsx`'s `ArrowMark` drew for Signpost and Gate, and CANGUPA-108 had
ported that bracket into the dev-only visualizer — but the live board
itself still drew the old triangle, so the two disagreed depending on
where you looked. This commit wires the bracket into `ArrowMark` for real,
ported verbatim from `tile-marks.html`'s own geometry functions rather
than redrawn by hand: a single per-direction `AXIS` table expresses depth
and lateral offset in `(k, c)` terms so the bracket shape is specified
once instead of four times, and `capK`/`w` are solved per axis so the
bracket sits with even padding inside the tile's own non-square 64×57
face.

That unblocked CANGUPA-109, which had been explicitly waiting on it:
`HelpScreen.tsx`'s rules content moved from a flat tile list into live
diagrams, following `tools/visualizers/rules.html`'s and DigiSpin's
`ReferenceScreen.tsx`'s lead of reusing the app's real components instead
of redrawing them. The Moves section traded its bullet list for three
small Step/Jump mini-boards (one step; jump over a gap; jump over a
tile), fed synthetic `TileView` rows into `Board.tsx` itself through a
new `MiniBoard` wrapper, each captioned to tell the solid (step) from the
dashed (jump) hint outline, and the two jump diagrams tell a gap (the
cell simply absent) from an untouched middle tile. The Tiles section's
flat colour squares became a new exported `TileSwatch` (`Board.tsx`) —
the real face/edge/strokes/mark rendering minus a real `Tile`'s
Pressable/animation/kangaroo plumbing — so Gold/Steel show their real
tally strokes and Signpost/Gate the real bracket mark, not just a colour.
A new Buttons section lists the board screen's five controls
(Back/Undo/Restart/Hint/Help) with their real `BackArrow`/`ControlIcon`
icons and a plain-language description of what each does and when it's
disabled, content `BoardHud.tsx` already rendered but nothing in-app
explained. "When you're stuck" was promoted out of the Moves bullet list
into its own section, and every section is now wrapped in a bordered card
(`StatsScreen.tsx`'s existing panel pattern), matching `rules.html`'s own
panel layout.

Both tasks landed in one commit, since CANGUPA-109 could not have reused
the bracket mark before CANGUPA-107 shipped it. Verified: `npx tsc
--noEmit` clean, full `apps/app` Jest suite green (810 tests).

Era 37 closes here: Nov 8, one commit, CANGUPA-107 and CANGUPA-109 — the
doorway-bracket mark ships to the live board and the `HelpScreen` rules
page gets live diagrams.

---

## Era 38 — Nov 9: the pack/difficulty visualizer catches up on Signpost and Gate

CANGUPA-110 found `tools/visualizers/tiles.js` (shared by
`level-packs.html` and `level-difficulty.html`) stale while checking
that CANGUPA-88's packs 7/8 Gate levels actually render — it hadn't been
touched since CANGUPA-81 moved it here, so it missed both CANGUPA-87's
Signpost recolour and CANGUPA-88's new Gate tile. `ARROW`'s Signpost
colour was still the pre-CANGUPA-87 raspberry (`#9d1057`/`#ba5889`)
instead of green (`#2f9e44`/`#7cd48f`); renamed to `SIGNPOST` and
recoloured to match `apps/app/src/theme/palette.ts`. Gate tiles
(`R`/`L`/`D`/`U`) had no entry in `TILES`/`EDGE` at all, so
`sketch()`'s `if (!t) continue;` silently skipped them — packs 7/8
would show blank gaps where a Gate tile sits. Added a `GATE` colour
(raspberry, freed by the Signpost recolour) and four new `EDGE`
triangles (`R`/`L`/`D`/`U`), each the same depth as the matching
Signpost arrow but pointing inward instead of outward, mirroring
`Game.gate`'s entry-side semantics (`apps/web-classic/js/game.js`)
and `boardView.ts`'s `ARROW_DIRECTIONS[game.gate[i] ^ 1]` convention.
No generator/template change was needed — `tiles.js` is loaded live by
both pages, not inlined at generation time.

One commit. Verified: `node tools/test.js` green (unaffected,
`tiles.js` is browser-only); no browser-automation tool was available
in this environment, so checked by evaluating `sketch()` under a
minimal Node DOM stub against a real Gate level (pack 7) and a real
Signpost level (pack 5) from `tools/packs.json`, confirming the
expected fill colours (raspberry/green) and polygon count appear,
rather than a live screenshot.

CANGUPA-111 followed in the same era, porting
`apps/app/src/components/Board.tsx`'s doorway-bracket mark verbatim into
`tiles.js` in place of the plain triangle CANGUPA-110 had left drawing —
stale again the moment CANGUPA-107 shipped that same replacement in the
real app — and fixing `level-packs.template.html`/
`level-difficulty.template.html`'s legend, which still read "Arrow, leave
only the way it points" instead of separate Signpost/Gate entries.

Era 38 closes here: Nov 9, two commits, CANGUPA-110 and CANGUPA-111 — the
pack/difficulty visualizer catches up on Signpost and Gate.

---

## Era 39 — Nov 9: the last two packs combine every tile kind

CANGUPA-112 rebuilt pack 9 Plateau (7×7) to put Common, Gold, Steel and
Gate together on every level, and pack 10 Outback (8×7) to put every
tile kind in the game together — Common, Gold, Steel, Signpost and Gate
— as the series finale. Both packs had quietly respected a documented,
test-enforced design rule since CANGUPA-68/69 that no single level may
use more than three tile kinds, Common included
(`1 + special <= 3` in `tools/test.js`); combining four kinds on pack 9
or five on pack 10 meant breaking it, so, flagged to and confirmed by
the owner, the rule was removed project-wide rather than worked around
with alternating per-level mixes. `tools/test.js`'s assertion was
deleted and its `MIX` table updated for packs 9 and 10;
`tools/pack-plan.js`'s header comment, which used to document "no level
in packs 1-10 has more than three tile kinds" as a hard rule, now says
CANGUPA-112 dropped it — it was always a design choice, never an
engine or save-format requirement.

Getting there took more random-walk candidates than either pack had
needed before: `pack-plan.js`'s Plateau entry gained
`gates: [.12, .28]` and its pool went from 1000 to 4000, since
`gen-packs.js`'s `full` filter requires gold, steel and gate together
on every non-designed, non-intro level, and that combination is rare
among random walks. Outback's entry gained `arrows: [.08, .20]` and
`gates: [.08, .20]`; a first run at pool 8000 never finished in over
three hours, likely the four-special-feature-together filter driving
the measuring loop close to its internal try-cap with many wasted
solver calls — killed and rerun at pool 4000 instead, matching
Plateau's proven size, which completed in under an hour with no
errors. `node tools/gen-packs.js` then produced the real
`tools/packs.json` and `apps/app/src/game/packs.ts`, and regenerated
`tools/visualizers/level-packs.html`/`level-difficulty.html` along the
way (`gen-visualizers.js` runs at the end of `gen-packs.js`, not as a
separate step). Both packs' blurbs changed to match — "Gold, steel and
gate tiles, all together." for Plateau, "The biggest board, with every
tile kind in the game together." for Outback — so
`apps/app/src/i18n/strings/en.ts`/`pt.ts` were updated too, since
`packText.test.ts` cross-checks them against the generated blurbs.

This surfaced a real bug, not just a stale test: `orient.test.ts`'s
"every level with arrows is still solvable when turned" test crashed
with `RangeError: Set maximum size exceeded` inside `Game.solve()`'s
uncapped recursive search (`board.ts`) — the already-open,
already-tracked CANGUPA-72 backlog item (the hint solver can hang on
big, complex turned levels), previously only ever hit by Outback's
Gold/Steel levels, now also hit via its new Signpost tiles. The test's
own filter had identified CANGUPA-72-risk levels indirectly, by "packs
5/6 are the only ones with arrow characters" — an invariant CANGUPA-112
just broke by giving Outback Signpost tiles too. Fixed by filtering on
the pack by name instead (importing `PACKS` directly rather than the
flat `LEVELS` list), with a comment explaining why. A note was also
added to `TODO.md`'s existing CANGUPA-72 entry flagging that Outback's
content changed again and that its "~15/50 levels" figure needs
re-measuring whenever that task is actually picked up; CANGUPA-72
itself was not attempted here.

One commit. Verified: `node tools/test.js` green (500 pack levels,
rules, solvability); `npx tsc --noEmit` clean in `apps/app`; the full
`apps/app` Jest suite green (810/810 tests, 29/29 suites) after the
`orient.test.ts` fix, which failed before the fix and passed after,
confirming it addresses a real crash rather than a pre-existing flake.

Era 39 closes here: Nov 9, one commit, CANGUPA-112 — the last two packs
combine every tile kind.

---

## Era 40 — Nov 9 (continued): the visualizer's Gate bracket points at the right edge

CANGUPA-113 fixed `tools/visualizers/tiles.js`'s `GATE_DIR`, which mapped
a Gate's letter (`R`/`L`/`D`/`U`) straight to its direction of travel
instead of the opposite edge the tile is actually entered through.
`apps/app/src/game/boardView.ts` deliberately flips this before
rendering (`ARROW_DIRECTIONS[game.gate[i] ^ 1]`), because a Gate's mark
belongs on the opposite edge from the direction `Game.gate` stores
(`apps/web-classic/js/game.js`'s `GATES = 'RLDU'`); `tiles.js` never
applied that flip, so every Gate tile in the visualizer showed its
bracket mirrored relative to the real app. Swapped `GATE_DIR`'s four
values to apply the same flip: `R: 'left', L: 'right', D: 'up',
U: 'down'`.

One commit. Verified: loaded `tiles.js` in a Node `vm` context under a
minimal DOM stub and confirmed the new `GATE_DIR` values match
`boardView.ts`'s `^ 1` table for all four directions; ran `sketch()`
against a real Mesa (pack 7) Gate level with no thrown errors;
`node tools/test.js` green (unaffected — `tiles.js` is browser-only).

---

Era 40 closes here: Nov 9, one commit, CANGUPA-113 — the visualizer's
Gate bracket points at the right edge.

---

## Era 41 — Nov 9 (continued): Signpost and Gate become Departure and Arrival

CANGUPA-114 renamed the Signpost and Gate tiles to Departure and Arrival
throughout, at the owner's request for more symmetrical, less jargon-y
names. Their own suggestion, Exit/Entrance, was passed over since
Departure/Arrival already matches `board.ts`'s own comment language —
"checked on arrival instead of on departure" — and avoids colliding
with the existing start-tile/win-state vocabulary that Entrance/Exit
would read as.

Renamed everywhere either name is spelled out as the tile concept,
case-insensitively, across `apps/web-classic`, `apps/app` (engine, UI
components, palette, and both English and Portuguese i18n strings),
and `tools` (the pack generator, its plan and blurb text, `test.js`,
and the `tools/visualizers` reference pages) — excluding generic
English "gated by"/"this only gates that" verb usage and
`docs/tile-ideas.md`'s unrelated, unimplemented idea #4 ("Switch and
gate"), a different mechanic that happens to share the word.
`tools/visualizers/level-difficulty.html` and `level-packs.html` were
regenerated via `node tools/gen-visualizers.js` after editing
`packs.json`'s blurb lines and the two `.template.html` legend lines,
rather than hand-edited. Also updated `TASKS.md`'s two still-open rows
(CANGUPA-72, CANGUPA-97) and the matching `TODO.md` backlog entries,
since those describe ongoing work against today's code rather than a
historical snapshot. Left `CHANGELOG.md`, `HISTORY.md`, and every
existing Done row in `TASKS.md` untouched, as genuine history of what
shipped under the old names at the time.

One commit, no behaviour change. Verified: `node tools/test.js` green;
`npx tsc --noEmit` clean in `apps/app`; full `apps/app` Jest suite
green (810/810 tests, 29/29 suites).

---

Era 41 closes here: Nov 9, one commit, CANGUPA-114 — Signpost and Gate
become Departure and Arrival throughout.

---

## Era 42 — Nov 9 (continued): every pack blurb leads with its landscape

CANGUPA-115 rewrote all 10 level-pack blurbs, in English and Portuguese,
at the owner's request. Drafted in chat over several rounds: a first
pass stated each pack's mechanic plainly with a landscape clause tacked
on, then the owner asked for the mechanic to be blended into the
landscape imagery rather than stated outright, and for no dashes. The
final text leads with each pack's own landscape — Meadow's open grass,
Creek's slick stepping stones and one washed-out gap, Gully's scree that
only lets go after three steps, Outcrop's two rock types side by side,
Billabong's one-way drain, Ridge's colour-changing spine, Mesa's one
climbable face, Gorge's colour-changing narrow walls, Plateau's
tableland where every ground meets, Outback's wild country holding it
all — and lets the tile rule (visit counts, one-way departure/arrival,
alternating gold/steel) come through via colour and texture words
instead of naming the tile kind. The Portuguese versions are fresh
sentences built the way Portuguese would say it, not clause-by-clause
translations — Mesa's especially, redone from scratch at the owner's
request rather than mirrored off the English. Pack names are
unchanged (the owner explicitly kept "Mesa" over the geomorphology
terms "chapada"/"monte testemunho" also discussed).

Touched `tools/pack-plan.js` (the source of truth), hand-edited
`tools/packs.json` and `apps/app/src/game/packs.ts` to match (a
text-only change, not level data, the same shortcut as CANGUPA-114),
`apps/app/src/i18n/strings/en.ts` (which must equal `packs.ts` exactly,
per `packText.test.ts`) and `pt.ts` (free Portuguese text), regenerated
`tools/visualizers/{level-packs,level-difficulty}.html` via
`node tools/gen-visualizers.js`, and fixed one stale hardcoded blurb
assertion in `LevelsScreen.test.tsx`.

One commit, no behaviour change. Verified: `node tools/test.js` green
(500 pack levels + rules); `npx tsc --noEmit` clean in `apps/app`; full
`apps/app` Jest suite green (810/810 tests, 29/29 suites).

Era 42 closes here: Nov 9, one commit, CANGUPA-115 — every pack blurb
leads with its landscape.

---

## Era 43 — Nov 9 (continued): the board screen's control buttons reorder

CANGUPA-116 reordered `apps/app`'s board-screen control group
(`BoardHud.tsx`) from Undo, Restart, Hint, Help to Hint, Undo, Restart,
Help, at the owner's request. The far-left leave-screen Back arrow sits
outside this group and is untouched. `HelpScreen.tsx`'s matching
Buttons-section list, which documents each control by name, is
reordered to match: Back, Hint, Undo, Restart, Help.

One commit, no behaviour change beyond button order. Verified:
`apps/app`'s `BoardHud` and `HelpScreen` Jest suites green (17/17
tests passing).

Era 43 closes here: Nov 9, one commit, CANGUPA-116 — the board
screen's control buttons reorder to Hint, Undo, Restart, Help.

---

## Era 44 — Nov 9 (continued): the Help icon becomes a question mark

CANGUPA-117 swapped the Help icon in `apps/app`'s board-screen control group
(`ControlIcon.tsx`) from a hand-drawn SVG path (Lucide's "help-circle" glyph,
minus the circle, matching the group's other bare-glyph icons) to a plain
Unicode "?" character, rendered in a `<Text>` element (bold, sized to
roughly match the stroke weight of the other icons) instead of an `Svg`/
`Path`. `ControlIcon`'s `help` branch is now an early return before the
`Svg` return, at the owner's request for a simpler, plainer glyph.

One commit, no behaviour change — decoration only, the button's
accessibility label is untouched. Verified by running the Expo web build in
a headless browser and screenshotting the board screen's control group,
confirming the glyph renders correctly next to the lightbulb/undo/restart
icons. The regular Jest/`tsc` suite was skipped for this change at the
owner's explicit request.

Era 44 closes here: Nov 9, one commit, CANGUPA-117 — the Help icon becomes
a plain question mark.

---

## Era 45 — Nov 10: the Help screen's Buttons list drops Back

CANGUPA-118 removed the "Back" row from the Help screen's Buttons
reference section (`HelpScreen.tsx`), which lists each board-screen
control with its icon, name and description — Hint, Undo, Restart and
Help remain. The owner asked for this after a clarifying exchange that
distinguished it from the Help screen's *own* floating back-navigation
arrow (`App.tsx`, `panel === 'help'`), the only way to leave the Help
screen itself — explicitly not the one to touch. Nothing about navigation
changed; this is a trim to reference content only. The `BackArrow` import
and the now-fully-unused `help.backDesc` string (both locales) went with
it, along with the matching row in `HelpScreen.test.tsx`'s button-id
assertion.

One commit, no behaviour change. Verified by `npx tsc --noEmit` and the
`HelpScreen`/strings Jest suites (11/11 passing), run before the commit
agent was invoked; the commit agent itself skipped tests at the owner's
request.

Era 45 closes here: Nov 10, one commit, CANGUPA-118 — the Help screen's
Buttons list drops Back.

---

## Era 46 — Nov 10 (continued): stale colour parens and triangle wording drop from Tiles copy

CANGUPA-119 cleaned up two stale bits of the Rules screen's Tiles-section
copy (`HelpScreen.tsx`), at the owner's request. The " (yellow)"/
" (grey-blue)"/" (green)"/" (raspberry)" colour-name parenthetical came off
the Gold, Steel, Departure and Arrival tile lines in both `en.ts` and
`pt.ts` — redundant now that each line already shows a real colour
swatch for that exact colour, added back in CANGUPA-109. Departure and
Arrival's own rule sentence, which still read "through the edge where the
triangle is" — stale since CANGUPA-107 replaced the plain triangle mark
with a doorway-bracket mark — was rewritten to "through the edge the
bracket opens on" (English) and "pelo lado onde a marca abre"
(Portuguese), matching the wording `tools/visualizers/rules.html` already
used for the same rule.

One commit, text-only, no behaviour change. Verified: `npx tsc --noEmit`
clean, `HelpScreen`/strings Jest suites green (11/11 passing).

Era 46 closes here: Nov 10, one commit, CANGUPA-119 — stale colour parens
and triangle wording drop from the Rules screen's Tiles copy.

---

## Era 47 — Nov 10 (continued): the board screen's Help button becomes a popup

CANGUPA-121 fixed a real bug, not a copy edit: the board screen's Help
button (`BoardHud.tsx`) used to navigate to the full `HelpScreen`, which
unmounted `BoardScreen` — since `useBoard.ts` owns its `Game` instance in
local state, that remount silently restarted the level, losing the
player's moves, the exact opposite of what `helpDesc`'s copy had always
promised ("without leaving the level"). Found by the owner while
reviewing the Help button's own behaviour.

Fixed by replacing that navigation with `HelpPopup.tsx`, a popup rendered
on top of the board the same way `WinPopup.tsx` already does, so
`BoardScreen` never unmounts. The popup shows the Moves and Tiles
sections only — the Buttons section is left out, since it would be
redundant with the real HUD visible underneath the popup. Those two
sections were factored out of `HelpScreen.tsx` into a new shared
`HelpSections.tsx` (`MovesSection`/`TilesSection`), so the full Rules page
and the popup render identical content instead of two copies that could
drift apart. `Popup.tsx` gained a `maxHeight: '82%'` bound on its card,
since `HelpPopup`'s content runs longer than `WinPopup`'s short text.
Home's Rules button is unaffected and still opens the full `HelpScreen`.

One commit, with a regression test. Verified: `npx tsc --noEmit` clean,
full `apps/app` Jest suite green (30/30 suites, 814/814 tests), including
a new test (`BoardScreen.test.tsx`, `App.test.tsx`) that plays a move,
opens Help, and confirms the move count survives closing the popup — the
exact bug this fixes.

Era 47 closes here: Nov 10, one commit, CANGUPA-121 — the board screen's
Help button becomes a popup instead of a level-restarting navigation.

---

## Era 48 — Nov 10 (continued): the shared popup backdrop actually blocks what it covers

CANGUPA-122 fixed a different bug in the same `Popup.tsx` shared overlay
Era 47 had just touched: its backdrop had `pointerEvents="box-none"`, so a
tap anywhere outside the card passed straight through to whatever the
popup was supposed to be covering — a board tile behind `WinPopup`/
`HelpPopup`, or another settings row behind the clear-progress
confirmation dialog.

Fixed by dropping `box-none`: a plain View at default `pointerEvents`
already absorbs touches rather than passing them through, so no
`Pressable`/`onPress` was needed just to block them. The backdrop is also
now dimmed (`backgroundColor: 'rgba(0, 0, 0, 0.5)'`), independent of
palette, so it reads as "covered"/"unavailable" the same way in light and
dark themes. `Popup.tsx` gained a `testID="popup-overlay"` so the new
tests can target the backdrop directly.

One commit, with two new tests in `Popup.test.tsx` asserting the dim
backdrop colour and that `pointerEvents` is no longer `box-none`.
Verified: `npx tsc --noEmit` clean, full `apps/app` Jest suite green
(30/30 suites, 816/816 tests).

Era 48 closes here: Nov 10, one commit, CANGUPA-122 — the shared popup
backdrop stops letting touches through to what it covers.

---

## Era 49 — Nov 10 (continued): popups size themselves to their content, not a fixed 82%

CANGUPA-123 fixed a third bug in the same `Popup.tsx` shared card Era 47
and 48 had just touched: it had both `minHeight: 220` and `maxHeight:
'82%'`, with its content wrapper carrying `flex: 1`. That combination
doesn't auto-size to content and clamp between the two bounds the way it
looks like it should — it snaps to whichever single bound is still in
play instead. The result was every popup (`WinPopup`, `HelpPopup`, the
clear-progress confirmation), not just `HelpPopup`, rendering at ~82% of
the screen regardless of how little content it actually had, confirmed
on-device.

Fixed by dropping content's `flex: 1`, so the card goes back to being an
ordinary auto-sized box clamped between its min and max bounds, plus
`justifyContent: 'center'` on the card itself so short content
(`WinPopup`'s heading, text and actions) still centres in the slack
instead of stacking from the top and leaving a single gap below. With
that `flex: 1` gone, `HelpPopup.tsx`'s internal `ScrollView` — which used
to lean on it to fill the card — needed a size of its own: it now gets an
explicit height (half the window height, via `useWindowDimensions`)
rather than a cap, since a cap only limits a size a view would otherwise
grow to on its own, and this one no longer grows on its own at all.
`testID`s (`popup-card`, `popup-content`, `help-popup-scroll`) were added
so the new tests could target each node directly.

One commit, with new tests in `Popup.test.tsx` (card auto-sizes, content
carries no flex) and `HelpPopup.test.tsx` (the scroll view has an
explicit, positive height). Verified: `npx tsc --noEmit` clean, full
`apps/app` Jest suite green (30/30 suites, 818/818 tests).

Era 49 closes here: Nov 10, one commit, CANGUPA-123 — popups stop
rendering at a fixed ~82% of the screen and size themselves to their own
content instead.

---

## Era 50 — Nov 10 (continued): the hint button spends from a balance instead of being free and unlimited

CANGUPA-54 added the hint-balance system `apps/app` had been without since
the Hint button first appeared (CANGUPA-32/53): a save now starts with 3
hints (`STARTING_HINTS` in `state/progress.ts`), and a save written before
this change — with no `hints` field at all — is treated as having that
same starting balance rather than zero, since nothing has actually been
spent by a player who simply predates the field.

The balance shows as a small round badge on the Hint icon's corner
(`BoardHud.tsx`'s new `GroupButton` `badge` prop), coloured with
`palette.ink`/`palette.bg2` swapped rather than a fixed accent colour so it
reads against either theme. `useBoard.ts`'s `hint()` now returns whether
the solver actually found a move, so `BoardScreen.tsx`'s new `handleHint`
only spends one — via `useProgress.ts`'s new `recordHintUsed` and
`progress.ts`'s new `spendHint` — when a move was found, never on a dead
end that reveals nothing. The Hint button disables once the balance hits
0, the same as it already did on a won level. `spendHint` floors at 0 and
is a no-op once there, the same "no save on a press that changes nothing"
shape `markDone`/`withLevel` already use. The Help popup's description of
the Hint button was updated in English and Portuguese to mention the new
out-of-hints case.

Replenishing the balance beyond its starting 3 is deliberately out of
scope here — reward-video (`CANGUPA-78`) and in-app-purchase (`CANGUPA-79`)
paths, and a third earn-on-clear path (`CANGUPA-124`), are split out as
follow-ups, as is bringing an equivalent system to `apps/web-classic`
(`CANGUPA-125`), which has no hint balance of any kind today.

One commit, with new tests across `App.test.tsx`, `BoardHud.test.tsx`,
`BoardScreen.test.tsx` and `progress.test.ts`. Verified: `npx tsc --noEmit`
clean, full `apps/app` Jest suite green (30/30 suites, 830/830 tests).

Era 50 closes here: Nov 10, one commit, CANGUPA-54 — the hint button stops
being free and unlimited and starts spending from a balance.

---

## Era 51 — Nov 10 (continued): the hint balance earns itself back on a first clear

CANGUPA-124 is the first of the three replenishment paths CANGUPA-54 split
out to land: `state/progress.ts`'s `markDone` now adds one hint, uncapped,
whenever a level goes from not-done to done. A replay of an already-done
level earns nothing — even one that beats the level's recorded best move
count — because `markDone` already distinguishes a first clear from a
replay to decide whether `done`/`bestMoves` change, and the hint piggybacks
on that same `alreadyDone` check rather than a new one.

No wiring was needed outside `progress.ts`: `useProgress.ts`'s `recordDone`
already calls `markDone` with the live progress and persists whatever comes
back, so the earned hint reaches `BoardHud.tsx`'s existing badge and
`spendHint`'s existing floor for free. `CANGUPA-78`'s reward-video path and
`CANGUPA-79`'s in-app-purchase path stay open, as does bringing an
equivalent system to `apps/web-classic` (`CANGUPA-125`).

One commit, with three new `progress.test.ts` cases: earns one hint on a
first clear, keeps earning past the starting balance (uncapped), and earns
nothing on a replay. Verified: `npx tsc --noEmit` clean, full `apps/app`
Jest suite green (30/30 suites, 833/833 tests).

Era 51 closes here: Nov 10, one commit, CANGUPA-124 — clearing a level for
the first time earns back one hint.

---

## Era 52 — Nov 11: a review visualizer for the legal-move and hint tile outlines

CANGUPA-126 built `tools/visualizers/tile-outlines.html`, a hand-authored
static page in the same pattern as `tile-marks.html`/`tile-metals.html`,
served via `tools/serve-visualizer.js` rather than generated. It went
through several rounds before settling: started at 40 swatches (5 tile
kinds × 2 themes × legal-move step/jump × hint solid/hypothetical-dashed),
then the scope narrowed to just 2 outline treatments — legal move and
hint, both solid — dropping the jump-dashed and hypothetical-dashed-hint
variants outright.

A few colour schemes were tried for the two treatments (theme-aware pairs,
a single fixed hint colour reused from the Gold tile's own lip, then a
searched-for replacement burnt orange), but each one collided, at the
colour or luminance level, with at least one of the 5 tiles' own face/lip
colours — a systematic search across hue/saturation/lightness confirmed no
single colour clears even a 1.5:1 worst-case contrast against all 5 tiles'
own face/lip colours (best found: 1.4:1). The final design drops colour as
the differentiator entirely: both outlines use the same theme-aware ink
colour (`@joaorodr84/themes`'s own `LIGHT.text`/`DARK.text`, near-black on
light, near-white on dark) and are told apart by border width and style
instead — legal move solid 2px, hint dashed 4px — with the live app's own
pulse animation on the hinted tile (`Board.tsx`'s `useAnimatedTip`) left as
a cue this static page can't reproduce.

Along the way also built `tools/visualizers/index.html`, a hub linking
every page under `tools/visualizers/`, served via a new root-level
`package.json`'s `visualizer` script (port 4230) rather than either app's
own `package.json`.

One commit, 20 swatches total (5 × 2 × 2). Verified the page's generation
script against a minimal DOM stub (`node -e`) at each stage; not opened in
an actual browser, no browser tool available in this environment.

Era 52 closes here: Nov 11, one commit, CANGUPA-126 — a review visualizer
for the legal-move and hint tile outlines.

(Correction: the CANGUPA-126 commit message's bookkeeping note said it
"closed Era 51 and opened Era 52" — Era 51 had already closed in the prior
commit, CANGUPA-124; this commit only opened Era 52.)

---

## Era 53 — Nov 11 (continued): CANGUPA-126's outline design lands in the real app

CANGUPA-127 wired the visualizer's findings into `apps/app`'s own
`Board.tsx` `Tile`, departing from the visualizer's own shared-ink-colour
plan where on-device testing demanded it. The tile was split into its own
lip (edge colour, full footprint, never bordered) and face (inset
`LIP_HEIGHT` above the lip's own bottom edge) boxes, so the legal-move
outline — now solid 2px `palette.ink` for both a step and a jump, retiring
`tile.jump`'s dashed case entirely — only ever borders the face, never
bleeding onto the lip's sides.

The solver tip's own outline moved off the tile altogether: a sibling halo
a few percent outside the tile's own footprint, solid 2px `palette.muted`,
so it only ever reads against the board's one pit colour rather than any
of the 5 tiles' own face/lip colours — `CANGUPA-126`'s colour search never
found one that did. It's a plain bordered View rather than SVG, since
solid + `borderRadius` is one of the combinations React Native's native
border renderer always handles fine, unlike `borderStyle: 'dashed'` +
`borderRadius`, confirmed missing entirely on Android. The face's own
legal-move border no longer turns off when the tile is also the tip, since
a tip is always a legal move too. `HelpSections.tsx`'s jump-outline
diagram and both locales' help copy (`jumpGapCaption`/`jumpTileCaption`)
were updated to match the single, non-dashed outline convention.

The tip's pulse animation (`useAnimatedTip`) is paused for now, left
disabled with a comment to restore once a separate halo-missing-bottom-edge
rendering bug found along the way is sorted — scoped out of this task
rather than blocking it.

One commit, with two new `Board.test.tsx` cases (the halo, and no-dashed-jump
outline). Verified: `npx tsc --noEmit` clean, full `apps/app` Jest suite
green (30/30 suites, 835/835 tests).

Era 53 closes here: Nov 11, one commit, CANGUPA-127 — the tile-outline
review visualizer's design lands in the real app.

---

## Era 54 — Nov 11 (continued): the joey finally faces the same way as its parent

CANGUPA-128 fixed the joey riding in the kangaroo's pouch in the
side-facing sprite, shared by `apps/web-classic` (`js/sprites.js`) and
`apps/app` (`Kangaroo.tsx`): it used to be drawn facing the viewer, two
symmetric eyes and a centered nose, even though the whole sprite is a side
profile — so the baby read as staring straight out of the screen while
its parent looks sideways. The fix rotates the joey's ears, head, eye and
nose together as one rigid group, then redraws the face itself as a
profile: one eye, and the nose offset to the same side as the parent's own
nose sits relative to its eye, so the joey now faces the same direction as
the parent.

While there, the parent's forearm path was found to start inside the
joey's own head circle — about 3.6 units from a center with radius 6.2 —
making the arm look like it sprouted out of the baby's skull rather than
resting near it; moved to start clear of the head instead. Dialing in both
the rotated face and the arm's path by hand against the rendered SVG was
slow, so `tools/visualizers/kangaroo-joey-arm.html` was built alongside
the fix: a live-tuning page with sliders for the forearm and the joey's
own lean, rendering the same markup both apps use, so the numbers could be
nailed down there first and copied back into `Kangaroo.tsx`/`sprites.js`
afterwards. It's linked from `tools/visualizers/index.html`'s hub, same
as `CANGUPA-126`'s own tile-outline visualizer.

One commit, with a new `Kangaroo.test.tsx` case asserting the joey's
nose-to-eye offset direction matches the parent's own. Verified: `npx tsc
--noEmit` clean, full `apps/app` Jest suite green (30/30 suites, 836/836
tests).

Era 54 closes here: Nov 11, one commit, CANGUPA-128 — the joey's face and
its parent's arm both get fixed in the side-facing sprite.

---

## Era 55 — Nov 11 (continued): a blocked arrow move no longer sinks the level

CANGUPA-129 fixed a reported bug: with the fall setting on (`CANGUPA-58`),
stepping out of a Departure tile the wrong way — or into an Arrival tile
from the wrong side — sank the level exactly like stepping onto a missing
tile, even when a perfectly live tile sat at the target. The fall
setting's fall-trigger check only ever asked `inMoveShape()` (pure
step/jump geometry), inheriting a signal `legalMoves()` had already merged
for its own purposes — "an arrow forbids this" and "nothing to land on"
were indistinguishable once `legalMoves()` excluded both, and nothing had
needed to tell them apart until the fall setting came along.

The fix adds `Game.moveKind()` (`apps/app/src/game/board.ts`, mirrored in
`apps/web-classic/js/game.js`), classifying an attempted move as `'none'`
(not even in the step/jump shape), `'blocked-departure'`/`'blocked-arrival'`
(an arrow forbids it outright, live tile or not — never falls; split into
two reasons rather than one shared `'blocked'` so a caller can explain
*which* rule tripped), `'empty'` (nothing to land on — falls, as before),
or `'legal'` (defensive; never reached through this path). It's wired into
both apps' fall triggers (`PlayableBoard.tsx`'s `handlePressEmpty`; `ui.js`'s
click and keydown handlers), replacing the bare `inMoveShape()` check. A
blocked attempt shakes the kangaroo in place, flashes the offending tile's
outline (a new fixed `palette.blocked` in `apps/app`, a fixed
`rgba(255,86,64,…)` keyframe in `web-classic`'s CSS), and plays a short
double-beep "no" cue (`Sound.blocked()`, ported to both apps —
`apps/app`'s rendered via `tools/gen-sounds.js` to `assets/sounds/blocked.wav`)
— never resets the level.

At the owner's follow-up request, a text explanation was added too: a new
line just below the board (`apps/app`'s `PlayableBoard.tsx`, a new
`#blocked-msg` element in `web-classic`'s `index.html`) names which rule
blocked the move, in two new `board.blockedDeparture`/`board.blockedArrival`
strings (`en.ts`/`pt.ts`, phrased to match `help.departureRest`/`arrivalRest`'s
existing "edge the bracket opens on" wording) for `apps/app`, and two
hardcoded Portuguese sentences for `web-classic` (which has no i18n
layer). Unlike the shake/flash's own short timeout, the text persists
until the player's next real action — `apps/app` clears it on `useBoard`'s
`tick` changing (the same signal `hintFailed`'s own message rides),
`web-classic` clears it at the top of `render()` — rather than fading on a
fixed delay, so there's time to actually read it.

One commit, with `moveKind()` rules assertions added to `board.test.ts`/
`tools/test.js` (asserting the specific `'blocked-departure'`/`'blocked-arrival'`
reason), Board's new `shake()`/blocked-tile-flash added to `Board.tsx`,
and `PlayableBoard.test.tsx` cases reproducing the exact reported scenario
(a Departure pointing right, stepping down onto a live tile), a distinct
Arrival-blocked case, and one confirming the warning outlives the
shake/flash's own timeout and clears on the next real move. Verified:
`node tools/test.js` green, `npx tsc --noEmit` clean, full `apps/app` Jest
suite green (30/30 suites, 841/841 tests). `apps/web-classic`'s
`ui.js`/`style.css`/`index.html` changes were not opened in an actual
browser — no browser automation tool available in this environment (same
limitation `CANGUPA-126` hit) — reviewed by hand instead.

Era 55 closes here: Nov 11, one commit, CANGUPA-129 — a blocked arrow move
shakes and explains itself instead of sinking the level.

---

## Era 56 — Nov 12: a stuck board already had its invitation to retry

CANGUPA-130 set out to add an invitation to retry once `apps/app`'s board
is stuck (`useBoard`'s `stuck` flag true, no legal moves left, board not
won). Two designs were tried and rejected in conversation with the owner.
A `StuckPopup` modeled on `WinPopup` (`CANGUPA-32`) went first — rejected
because `BoardHud`'s Undo/Restart live in their own corner, so a popup
covering the board would sit in front of the very controls it's telling
the player to use. A plain message below the board, reusing `CANGUPA-129`'s
blocked-move-warning placement and persistence, went next — rejected once
`boardLayout.ts`'s `fitBoardWidth` turned out to size the board using the
*entire* measured `boardArea` height with nothing held back for a message
below it, so that placement risks being pushed past the visible screen on
a height-constrained board.

`BoardHud.tsx` already shows "No moves left. Undo or restart." inline, in
its own reserved, fixed-height status line (`CANGUPA-53`) — immune to that
risk by construction, and already satisfying the task's own ask. Nothing
further was built: both tried implementations were built, tested green,
then fully reverted, leaving no app code in the closing commit.

The same below-board-placement risk found here also applies to
`CANGUPA-129`'s existing blocked-move warning, not just this task's own
stuck message — moving it into the same HUD status line is split out as
`CANGUPA-131`.

One commit, bookkeeping only: `TASKS.md` closes CANGUPA-130 and bumps the
next-ID counter to CANGUPA-132, `TODO.md` gains CANGUPA-131.

Era 56 closes here: Nov 12, one commit, CANGUPA-130 — a stuck board's
retry invitation turns out to already exist, and the search for a second
one surfaces a shared placement risk worth its own task.

---

## Era 57 — Nov 12 (continued): the blocked-move warning moves into the HUD

CANGUPA-131 acted on the placement risk CANGUPA-130's investigation
surfaced: `apps/app`'s blocked-departure/blocked-arrival warning
(CANGUPA-129) used to render as its own `Text` below the board in
`PlayableBoard.tsx`, a spot `boardLayout.ts`'s `fitBoardWidth` never held
any room for — it sizes the board using the entire measured `boardArea`
height. The fix moves the warning into `BoardHud`'s own centre status
line instead, the same reserved, fixed-height slot CANGUPA-53's
won/stuck/hintFailed swap already uses above the board, immune to the
same risk by construction.

`boardView.ts`'s `Status` gained a `blocked` kind, carrying a new shared
`BlockedReason` type, ranked *above* `hintFailed` rather than just above
`stuck`/`playing`: a blocked tap doesn't bump `useBoard`'s `tick`, so a
stale `hintFailed` can still be true underneath it, and `blocked` is the
fresher of the two. `BoardHud.tsx`'s `CentreText` renders it, reusing the
existing `board.blockedDeparture`/`blockedArrival` strings. `PlayableBoard.tsx`
keeps owning the shake/flash/sound reflex cue, but now calls a new
`onBlocked` prop instead of holding its own text state and rendering
below the board; `BoardScreen.tsx` holds that state instead, clearing it
on `tick` the same way `PlayableBoard` used to.

Three `PlayableBoard.test.tsx` cases moved: the two shake/flash/sound ones
now assert `onBlocked` was called instead of checking for rendered text,
and the "stays up until the next real action" persistence case moved to
`BoardScreen.test.tsx`, the HUD-level behaviour it actually tests now
that persistence depends on `BoardScreen`'s own tick-clearing effect. Two
new `BoardHud.test.tsx` cases render the `blocked` kind directly, and two
new `boardView.test.ts` cases cover the new priority ordering (blocked
over a stale hintFailed, blocked over won/stuck).

While reviewing the diff, the owner also asked to shorten
`board.blockedDeparture`/`blockedArrival` in `en.ts`/`pt.ts` — the
original sentence ("You can't leave that way — only through the edge the
bracket opens on.") didn't fit comfortably once it had to live in the
HUD's narrower centre column, so it became "Can't leave that way — only
through the open edge." (and the Portuguese equivalent), with the
affected test expectations updated to match.

Scoped to `apps/app` only, matching CANGUPA-130's own scope note —
`apps/web-classic` has no HUD-swap mechanism to move this into. Verified:
`npx tsc --noEmit` clean, full `apps/app` Jest suite green (30/30 suites,
845/845 tests).

A separate, pre-existing bug surfaced while testing this (inherited from
CANGUPA-129, not introduced here, and not fixed in this commit): the
blocked-move check only ever runs through `PlayableBoard`'s
`onPressEmpty` handler, which is only wired up when the fall setting is
on, so with fall off, tapping a tile that's shape-legal but arrow-blocked
does nothing at all — no shake, no message. Left as a candidate for a
future task, not yet registered with an ID.

Era 57 closes here: Nov 12, one commit, CANGUPA-131 — the blocked-move
warning moves into the HUD, closing the placement risk CANGUPA-130
found, and a new gap (fall off) is noted for later.

---

## Era 58 — Nov 12 (continued): the blocked-move and stuck messages get their own reserved room

CANGUPA-132 fixes the root cause CANGUPA-130's investigation found, rather
than keep working around it the way CANGUPA-131 had: `boardLayout.ts`'s
`fitBoardWidth` used to hand the board the *entire* measured `boardArea`
height, holding nothing back for anything rendered below it.
`PlayableBoard.tsx` now reserves a fixed `MESSAGE_AREA_HEIGHT` (64px, not
one tile row — a row's actual height swings hugely by level, huge on a
3-row pack and tiny on an 8-row one, so it would either waste space on a
small grid or still not fit two lines of text on a tall one) always,
whether or not a message is currently showing, subtracting it from the
height `fitBoardWidth` sees and rendering a same-height `View` below the
board frame to hold the message.

With that room now existing, both the blocked-move warning (CANGUPA-131
had moved it into BoardHud's status line) and the stuck message
(BoardHud's own `boardHud.stuck`/`undoOrRestart` swap, predating both,
from CANGUPA-53) move back out of the HUD and into the new area — the HUD
detour was only ever needed because the space below the board didn't
exist. `BoardHud.tsx`'s `CentreText` now only ever shows `hintFailed` or
the ordinary "Moves N" line; `boardView.ts`'s `Status`/`statusFor` dropped
the `blocked`/`stuck` kinds entirely, though it keeps exporting the
shared `BlockedReason` type since `PlayableBoard` still needs it for its
own local state. A new `board.noMovesLeft` string (`en.ts`/`pt.ts`/
`types.ts`) replaces the removed `boardHud.stuck`/`undoOrRestart` pair,
combining their wording into the one-sentence shape
`board.blockedDeparture`/`blockedArrival` already used. Those two strings
themselves got shortened too, at the owner's request, from "You can't
leave/enter that way — only through the edge the bracket opens on." to
"Can't leave/enter that way — only through the open edge." — they'd only
needed to fit CANGUPA-131's narrower HUD column, and that constraint is
gone now.

`PlayableBoard.test.tsx` regained the original rendered-text assertions
and the "stays up until the next real action" persistence case, both
briefly moved out by CANGUPA-131, plus a new case for the stuck message
and one asserting the message area holds a fixed 64px height whether idle
or showing a message; `boardView.test.ts` and `BoardHud.test.tsx` dropped
their now-invalid `blocked`/`stuck`-kind cases. Scoped to `apps/app`
only — `apps/web-classic`'s board isn't height-fitted the same way, so it
never carried this risk. Verified: `npx tsc --noEmit` clean, full
`apps/app` Jest suite green (30/30 suites, 841/841 tests).

Era 58 closes here: Nov 12, one commit, CANGUPA-132 — the blocked-move and
stuck messages leave the HUD for a reserved area below the board, closing
the loop CANGUPA-130 opened two eras ago.

---

## Era 59 — Nov 12 (continued): the pack list becomes a collapsible card

CANGUPA-133 reshapes the Levels tab's pack list ("Lay of the Land") in
`apps/app`: `LevelPacksScreen.tsx` now wraps every pack inside one
collapsible card instead of a flat pill plus a list of rows. The
collection's name becomes the card's header, with a chevron that
collapses and expands the pack rows below it on tap; pack rows sit inset
equally on both sides inside the card (an owner choice over a left-only
indent), now on the palette's `control` colour since the card itself
took over `panel`.

Progress display changed along with the shape: the translated "N/M
solved" wording is gone everywhere, replaced by a bare "N/M" shown on the
right-hand side of each item — the collection header and every pack row
alike — vertically centred against the full item height. The
collection's count is smaller (16pt) than its 22pt title; a pack's count
matches its 16pt name. Left deliberately bare, not "N/M levels", so a
future done/mastered icon (CANGUPA-134, opened in this same commit as a
parked backlog idea, not implemented) has a slot to sit in just left of
the count without the count itself moving. `packRange` (`en.ts`/`pt.ts`)
dropped its solved/total params to match, now just the bare "Levels X–Y"
range text.

Collapsed/expanded state lives in `App.tsx` (`useState` plus a
`LayoutAnimation` easing, skipped when the player's Animations setting is
off), not in `LevelPacksScreen` itself — opening a pack unmounts that
screen entirely (`App.tsx` swaps it for `LevelsScreen`), so state held in
the screen would reset to expanded on every return from a pack. It starts
expanded and is session-only, not persisted to AsyncStorage: with a
single collection today, a card that stayed collapsed across app launches
would open the Levels tab onto an apparently empty screen.

Verified: `npx tsc --noEmit` clean, full `apps/app` Jest suite green
(845/845 tests, including new coverage for the collapse toggle, the bare
counts, and the card persisting its collapsed state across a tab switch),
and checked visually via a headless-Chromium screenshot of the Expo web
build in both light and dark mode.

Era 59 closes here: Nov 12, one commit, CANGUPA-133 — the pack list
becomes a collapsible card, with CANGUPA-134 opened alongside it as a
parked idea for a cleared/mastered icon in the new count's slot.

---

## Era 60 — Nov 12: a small margin on the HUD's dividers

CANGUPA-135 gives the thin vertical divider lines between the
Hint/Undo/Restart/Help icon buttons in `apps/app`'s board HUD
(`BoardHud.tsx`) a small margin above and below instead of running
edge-to-edge: the button group's row uses `alignItems: 'stretch'`, which
had stretched each `groupDivider` the full height of the row, touching
the buttons' top and bottom edges flush. Added `marginVertical: 8` to
the `groupDivider` style to inset them.

CANGUPA-136 carries the same treatment to the Settings screen, where each group becomes one rounded panel with a single outline and 1px dividers inset to the row text, replacing per-row borders.

Era 60 closes here: Nov 12, two commits, CANGUPA-135 and CANGUPA-136 — small visual
fixes to divider lines in the board HUD and the Settings screen.

---

## Era 61 — Nov 12 (continued): the board gets its own previous/next arrows

CANGUPA-85 ports `apps/web-classic`'s existing `‹`/`›` prev/next toolbar
buttons (`index.html`, `js/ui.js`) to `apps/app`'s `BoardScreen`
(`BoardScreen.tsx`), which until now only offered a "next level" action
inside the win popup after clearing a level, and no way back to a previous
one at all. A new row of two circular arrow buttons sits below the board;
the previous arrow is disabled only at level 1, and the next arrow stays
disabled until `hasNext` (the same `isDone`/`isUnlocked`-derived flag
`App.tsx` already computed for `LevelsScreen`'s grid) goes true, so the row
never reflows at either end. `BoardScreen` gained a new required
`onPrevious` prop, wired in `App.tsx` to `onChangeLevel(currentLevel - 1)`;
the icons are plain chevrons drawn with `react-native-svg`, labelled by new
`boardHud.previousLevel`/`boardHud.nextLevel` strings in English and
European Portuguese for accessibility. Verified: `npx tsc --noEmit` clean,
`apps/app`'s Jest suite green.

Era 61 closes here: Nov 12, one commit, CANGUPA-85 — prev/next level arrows
land on the board screen.

---

## Era 62 — Nov 12 (continued): confirming the sound-mute baseline

CANGUPA-99 closes with no code change: it asks whether sound can be fully
muted in both apps and whether any game cue is sound-only, something its
own backlog note had suspected but not confirmed. The investigation finds
the baseline already holds. `apps/web-classic`'s `sound.js` now has four
effects (`jump`, `win`, `fall`, and `blocked`, added since by CANGUPA-129),
all routed through `tone()`, which returns immediately once
`Sound.enabled` is false; `ui.js` sets `Sound.enabled = settings.sound` at
startup and on every toggle change. `apps/app`'s `src/audio/sound.ts`
mirrors this exactly — all four exports go through a shared `replay()`
gated on a module-level `enabled` flag set via `setEnabled()`, which
`App.tsx` keeps in sync with the Settings screen's toggle through a
`useEffect` keyed on `settings`. No other audio call site exists in either
app, and every one of the four cues already pairs with a visual signal
(`jump`'s tile move, `win`'s `WinPopup`, `fall`'s falling animation,
`blocked`'s shake-and-flash from CANGUPA-129), so nothing conveys
information through sound alone.

Era 62 closes here: Nov 12, one commit, CANGUPA-99 — verified sound can be
fully muted and no cue is sound-only in either app.

---

## Era 63 — Nov 12 (continued): scoping what accessibility still needs

CANGUPA-100 closes with no code change and no new task opened: it asks
which disability types, beyond the visual, motor, and auditory ones
already opened (CANGUPA-97/98/99), deserve their own dedicated
accessibility task. Cognitive/learning load and photosensitivity/seizure
risk both check out clean — searching both apps for a timer, countdown,
score, life, or move-limit mechanic finds none, confirming the suspected
no-fail-state/no-timer baseline outright rather than leaving it assumed;
reviewing every animation in `apps/web-classic/style.css` and
`apps/app/src/components/Board.tsx` finds the only repeating one (the
hint-tip pulse, disabled per CANGUPA-127) at ~1.1Hz, well under WCAG's
3Hz flash threshold, with everything else a one-shot transition rather
than a strobe. Situational constraints — one-handed use and
glare/bright-sunlight contrast — are folded into the two tasks that
already cover the same ground instead of spun into a new one: glare
added to CANGUPA-97's per-theme contrast work, one-handed use added to
CANGUPA-98's directional-pad-control investigation, since that same
control scheme would help both.

Era 63 closes here: Nov 12, one commit, CANGUPA-100 — scoped the
remaining accessibility candidates and found none needed a new task.

---

## Era 64 — Nov 12 (continued): auditing apps/app end to end

CANGUPA-89 was the deliberately broad "full audit of apps/app for bugs,
improvements, and performance issues" placeholder, run now that
tsc --noEmit and the Jest suite already cover correctness — the audit
targeted what those don't catch: real-device performance, startup
behaviour, AsyncStorage save patterns, accessibility gaps, dependency
bloat, and dead code.

Much of it checked out clean and stays unopened: every package.json
dependency is used, every image and sound asset is small (images
20-32KB, sounds 108KB total), progress.ts's parseProgress/
sanitizeBestMoves already handle corrupt or missing save data
defensively, no stray TODO/FIXME/XXX comments exist in src/,
LevelsScreen's ~50-item ScrollView is fine unvirtualized at that size,
and Board.tsx's per-tile rendering isn't memoized but doesn't matter
yet at the current max board size (8x7 = 56 tiles).

Four real issues did surface, and — per the task's own expectation,
the way CANGUPA-54 was split into CANGUPA-78/CANGUPA-79 — each became
its own scoped task rather than a fix bundled into this one:
CANGUPA-137 (the shared Popup.tsx close button has no accessibility
label), CANGUPA-138 (a possible splash-to-content flash on startup,
especially in dark mode), CANGUPA-139 (a theoretical AsyncStorage
write-ordering race in useProgress/useSettings, parked), and
CANGUPA-140 (board tiles have no screen-reader semantics at all,
parked as a substantial design problem).

Era 64 closes here: Nov 12, one commit, CANGUPA-89 — audited apps/app
end to end and split what it found into four scoped follow-ups.

---

## Era 65 — Nov 12 (continued): scoping the stats page's next rows

CANGUPA-91 asked which of five candidate stats-page additions were
worth tracking before adding fields to the saved Progress shape:
hints used, undos used, time played, a per-pack breakdown, and a
longest-day-streak. Each got checked against what's actually already
there, rather than assumed.

Per-pack breakdown turned out to need no new field at all — done/
bestMoves plus the existing PACK_SIZES (levels.ts) already derive
each pack's cleared count and summed best moves, so it split out as
CANGUPA-141. Hints used is a cheap one-field addition that rides the
save recordHintUsed already fires on every hint press, no new write
frequency, split out as CANGUPA-142. Undos used needs its own new
save call — unlike hints, undo had none before — split out as
CANGUPA-145. The owner asked for both directly rather than leaving
them merely scoped, so each lands its own implementation right behind
this investigation, the same way CANGUPA-124 later closed a task
CANGUPA-54 had only opened. Time played needs real new infrastructure
rather than a field (session timing via AppState) and sits in tension
with the no-timer/no-pressure design CANGUPA-100 already confirmed —
the owner confirmed wanting it anyway, resolving that tension, so it
split out as a properly scoped CANGUPA-143 rather than parked, with
CANGUPA-146 queued behind it to bring the same stat to
apps/web-classic. A longest-day-streak stat still needs a
timezone-robust date-tracking scheme nobody has asked to build yet,
so it stays parked as CANGUPA-144.

Era 65 closes here: Nov 12, one commit, CANGUPA-91 — scoped the stats
page's next five candidates, two going straight into their own
implementation commits next.

---

## Era 66 — Nov 12 (continued): counting hints spent

CANGUPA-142, opened by CANGUPA-91's investigation moments earlier and
built immediately at the owner's request rather than left scoped: a
new hintsUsed field on apps/app's Progress (state/progress.ts),
incremented by spendHint every time it actually takes one off the
balance, shown as a new "Hints used" row on StatsScreen.tsx. Rides
the same recordHintUsed save useProgress.ts already fires on every
hint press, so no new AsyncStorage write frequency. A save from
before this field existed has none, the same non-breaking fallback
bestMoves got when it was added.

Era 66 closes here: Nov 12, one commit, CANGUPA-142 — added the
hints-used stat.

---

## Era 67 — Nov 12 (continued): counting undos taken

CANGUPA-145, opened and built the same way as CANGUPA-142 just
before it: a new undosUsed field on Progress, incremented by a new
recordUndo reducer, shown as a new "Undos used" row on
StatsScreen.tsx. Undo had no save call to ride, unlike hints — so
useBoard.ts's undo() now returns whether a move was actually taken
back (the same shape hint() already had), and BoardScreen.tsx's new
handleUndo, wired to a new onUndoUsed prop threaded through App.tsx,
only counts a real undo, never a press with nothing to undo. This
does add one new AsyncStorage write per undo that did not happen
before, the exact cost CANGUPA-91's investigation had weighed against
undo tracking — accepted here since the owner asked for the stat
directly, outweighing that earlier caution.

Era 67 closes here: Nov 12, one commit, CANGUPA-145 — added the
undos-used stat.

---

## Era 68 — Nov 12 (continued): an in-app store to buy hints

CANGUPA-79 was the other half of CANGUPA-54's hint-balance split, the
IAP side CANGUPA-78 (reward video) left for later — letting players
buy hints with real money rather than only earn them.

Three consumable packs went in (10/25/100 hints at $0.99/$1.99/$4.99,
src/iap/hintProducts.ts's HINT_PRODUCTS), sold through react-native-iap
(v17.3.6, its Nitro rewrite), chosen with the owner since CANGUPA-96's
investigation had flagged that this same SDK choice should also serve
CANGUPA-106's planned pack-unlock purchase, not hints alone.
useHintStore.ts wraps react-native-iap's own useIAP hook down to
exactly what the UI needs: the three products with their live store
price, a buy(sku) call, and an idle/pending/error status, finishing
every purchase (consumable, crediting nothing for a sku outside
HINT_PRODUCTS) before crediting hints, since an unfinished consumable
replays on iOS's next launch and auto-refunds on Android after three
days.

HintStorePopup.tsx is the store screen itself, reachable two ways:
BoardHud's Hint button, which now stays pressable at a 0 balance
instead of disabling — its onPress opens the store there instead of
spending one — and a new "Hints" section in Settings for stocking up
ahead of time. progress.ts gained addHints (uncapped, the same shape
as CANGUPA-124's per-clear hint) and useProgress.ts a
recordHintsPurchased to persist it.

react-native-iap needs a native build, no Expo Go support, so a Jest
manual mock (__mocks__/react-native-iap.ts) stands in for every other
test that merely imports something importing it. Left for the owner,
outside code: registering the three SKUs and prices in App Store
Connect/Play Console, and an actual device/sandbox purchase test once
a dev-client build exists.

Era 68 closes here: Nov 12, one commit, CANGUPA-79 — built the in-app
hint store on react-native-iap, reachable from the Hint button at 0
balance and from a new Settings section.

---

## Era 69 — Nov 13: unblocking the first EAS cloud build

CANGUPA-148 surfaced while setting up a dev-client build for CANGUPA-78
(reward-video hints, still in progress on its own branch, not part of
this commit) — all native-module testing had been happening on Expo
Go, which can't load custom native modules, so a dev-client build was
needed at all. Getting one going hit two infra gaps blocking *any*
first EAS build of apps/app, both unrelated to CANGUPA-78's own
feature.

First, expo-dev-client was never added as a dependency, even though
react-native-iap (already in the project since CANGUPA-79) needs a
native build and has no Expo Go support — a working dev client was
already overdue.

Second, apps/app/package.json depends on a private GitHub repo over
SSH (@joaorodr84/themes, resolved as
git+ssh://git@github.com/joaorodr84/themes.git in the lockfile). EAS
Build's cloud machines have no SSH key for this GitHub account, so
npm ci failed outright with "Permission denied (publickey)" on the
very first build attempt, before even reaching anything task-specific.
Fixed with a dedicated ed25519 deploy keypair: the public half added
as a read-only deploy key on the themes repo (gh api
repos/joaorodr84/themes/keys), the base64-encoded private half stored
as the SSH_KEY_BASE64 EAS secret (project-scoped, development
environment, secret visibility, via eas env:create), and a new
apps/app/eas-build-pre-install.sh wired up via a new
eas-build-pre-install npm script so EAS restores that key into ~/.ssh
and trusts github.com before npm ci runs.

Verified: a full EAS development-profile build for iOS succeeded after
both fixes (build id 0122a9cd-79ec-403a-a70e-48a3e1c91cdd) — before
them it failed on the SSH clone.

Era 69 closes here: Nov 13, one commit, CANGUPA-148 — added
expo-dev-client and an EAS pre-install SSH deploy-key hook, unblocking
the first EAS cloud build of apps/app.

---

## Era 70 — Nov 13 (continued): reward-video hints, and a very real SDK downgrade

CANGUPA-78 was the other half of CANGUPA-54's hint-balance split that
CANGUPA-79 (IAP) already closed — letting players earn a hint for free
by watching a rewarded ad, rather than only buying one or earning one
per level clear.

A new src/ads/useRewardedHint.ts wraps react-native-google-mobile-ads'
useRewardedAd hook down to exactly what HintStorePopup.tsx needs: a
loaded flag, an idle/pending/error status, and a watch() call — the
same shape useHintStore.ts already gives the popup for its purchase
rows, so the popup treats both reward paths alike. HintStorePopup.tsx
gained a reward-video row above the existing purchase rows. Uses
Google's own test ad unit id (TestIds.REWARDED) and AdMob's public
test app ids in app.json's plugin config — there's no real AdMob
account yet, left for the owner outside code, the same way CANGUPA-79's
own closing note left registering real IAP SKUs to the owner. Requests
non-personalized ads only, sidestepping App Tracking
Transparency/consent entirely for now — full EEA/UK consent (Google's
UMP) is its own future follow-up, not decided here.

Getting there surfaced a real upstream incompatibility, not a config
mistake: react-native-google-mobile-ads@17.4.0, the version first
picked, fails at runtime on this project's react-native@0.88.1 with
"Invariant Violation: TurboModuleRegistry.getEnforcing(...):
'RNGoogleMobileAdsModule' could not be found" — despite CocoaPods
compiling the native module in correctly, RCT_NEW_ARCH_ENABLED=1
genuinely reaching its compiler (verified directly in the EAS
xcodebuild log), and Expo's autolinking finding it. Confirmed it was
isolated to this one package, not a broader New-Architecture/dev-client
problem, by temporarily stubbing out every import of it and confirming
the rest of the app — including other classic native modules like
@react-native-async-storage/async-storage — ran fine on a real device.
Downgrading to 17.3.1 fixed it; verified on a real iPhone via an EAS
development-profile build.

Web turned out to need more than a runtime guard:
react-native-google-mobile-ads ships no web implementation at all (no
.web.ts files, no browser field), and one of its spec files statically
imports react-native's native-only codegenNativeComponent, so Metro
can't even bundle the package for web, not just fail to run it — a
Platform.OS === 'web' check inside App.tsx wasn't enough, since Metro
resolves every require() it can see in the module graph regardless of
what guards it at runtime. Fixed with Metro's own
platform-file-resolution convention instead: a new
useRewardedHint.web.ts (a no-op, same "never connects" idle fallback
useHintStore.ts already gets for free from react-native-iap's own web
tolerance) and a new initMobileAds.ts/initMobileAds.web.ts pair that
App.tsx's launch-time mobileAds().initialize() call was pulled into,
so App.tsx itself never has a direct reference to
react-native-google-mobile-ads that Metro could try to resolve for
web. Verified by fetching the actual web bundle (expo start --web,
then curling its index.bundle?platform=web) and confirming it built
clean with no native-only-module errors.

Verified: npx tsc --noEmit clean, full apps/app Jest suite green
(33/33 suites, 885/885 tests), and manually verified on a real iPhone
via an EAS development-profile build (ad loads and credits a hint)
plus a verified-clean expo start --web bundle (ads silently disabled
there, no errors).

Era 70 closes here: Nov 13, one commit, CANGUPA-78 — added a
reward-video hint-earning path to apps/app's hint store, built on
react-native-google-mobile-ads, and found/fixed a version
incompatibility with this project's React Native version along the
way.

---

## Patterns, and what's still open

Two commits in, the clearest structural choice is already paying for
itself: `js/game.js` holds the rules and the solver with no DOM in sight,
which is what let `tools/test.js` check all 20 levels headlessly and is
what made a solver-backed hint button cheap once the UI needed one.

Nothing is open yet — see [TODO.md](TODO.md). This file grows an era at a
time as work continues; see `.claude/agents/commit.md` for how a commit
updates it.
