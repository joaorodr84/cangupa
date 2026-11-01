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

---

## Patterns, and what's still open

Two commits in, the clearest structural choice is already paying for
itself: `js/game.js` holds the rules and the solver with no DOM in sight,
which is what let `tools/test.js` check all 20 levels headlessly and is
what made a solver-backed hint button cheap once the UI needed one.

Nothing is open yet — see [TODO.md](TODO.md). This file grows an era at a
time as work continues; see `.claude/agents/commit.md` for how a commit
updates it.
