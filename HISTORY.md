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

---

## Patterns, and what's still open

Two commits in, the clearest structural choice is already paying for
itself: `js/game.js` holds the rules and the solver with no DOM in sight,
which is what let `tools/test.js` check all 20 levels headlessly and is
what made a solver-backed hint button cheap once the UI needed one.

Nothing is open yet — see [TODO.md](TODO.md). This file grows an era at a
time as work continues; see `.claude/agents/commit.md` for how a commit
updates it.
