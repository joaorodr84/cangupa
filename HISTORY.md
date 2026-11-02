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

---

## Patterns, and what's still open

Two commits in, the clearest structural choice is already paying for
itself: `js/game.js` holds the rules and the solver with no DOM in sight,
which is what let `tools/test.js` check all 20 levels headlessly and is
what made a solver-backed hint button cheap once the UI needed one.

Nothing is open yet — see [TODO.md](TODO.md). This file grows an era at a
time as work continues; see `.claude/agents/commit.md` for how a commit
updates it.
