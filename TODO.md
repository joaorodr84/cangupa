# Cangupa TODO

The active backlog. Every item carries a `CANGUPA-<n>` ID registered in
[TASKS.md](TASKS.md). An item leaves this file in the commit that closes it.

## Priorities

Every item below carries a `[P1]`–`[P4]` tag, assigned the moment the item
is added.

- **P1 — do next.** A known-broken thing that's already diagnosed; the work
  is scoped and the payoff is immediate.
- **P2 — queued.** Real value, but needs a decision made or a self-contained
  chunk of work first.
- **P3 — wanted, not urgent.** Worth building when there's room; nothing
  else depends on it.
- **P4 — parked.** Speculative or large-and-unscoped. Revisit when
  something forces the question.

The priority can change at any time; the ID never does.

## Backlog

- [P3] `TILE-JUMPER-2` — Play a sound effect on a jump.
- [P3] `TILE-JUMPER-3` — Add falling as an opt-in setting, off by default:
  pressing a direction (arrow keys / WASD) with no step or jump that way
  falls instead of doing nothing. When the setting is on, also allow
  falling by clicking/tapping empty space — normally click/tap only ever
  targets a specific legal destination cell (see
  [apps/web-classic/js/ui.js](apps/web-classic/js/ui.js) click handler vs.
  keydown handler), so this is the one case that breaks that pattern and
  needs its own empty-space hit-testing.
- [P3] `TILE-JUMPER-4` — Play a sound effect on finishing a level.
- [P3] `TILE-JUMPER-5` — Play a sound effect on falling. Depends on
  `TILE-JUMPER-3` landing first — there's no fall to cue the sound off until
  that exists.
- [P3] `TILE-JUMPER-6` — Redo the main character's art, and draw a small
  joey riding inside the pouch.
- [P4] `TILE-JUMPER-7` — Design a logo for Cangupa. Unscoped: where it
  would be used (title screen, favicon, README) and the style aren't
  decided yet.
- [P1] `CANGUPA-29` — On the `apps/app` home screen, stack three things top
  to bottom: the logo, the number of the level the Play button is about to
  open, then the button itself. [HomeScreen.tsx](apps/app/src/components/HomeScreen.tsx)
  (from CANGUPA-28) currently only renders the button — no level number is
  shown anywhere on that screen, and the "logo" is the `Cangupa` wordmark
  `App.tsx`'s `Shell` already renders above every panel, home included, so
  it only needs the level number added in between.
- [P2] `CANGUPA-30` — Build a stats screen for `apps/app`. Unscoped: which
  stats to show (levels cleared, moves taken, time, streak, something else)
  isn't decided yet. Exists as a destination for `CANGUPA-31`'s footer
  "Stats" tab.
- [P1] `CANGUPA-31` — Add a reusable bottom-footer nav to `apps/app`: four
  tabs, in order — Home, Levels, Stats, Settings — shown on the home,
  levels, stats and settings screens. It replaces the board screen's
  current inline nav row (`Níveis` / `Regras` / `Definições`, built in
  [App.tsx](apps/app/App.tsx)'s `Shell`) with the same four-tab footer, so
  Regras (the rules/help screen) drops out of the top-level nav and needs a
  new way in — e.g. a link from the settings screen. Blocked on
  `CANGUPA-30`: the Stats tab has nowhere to go until that screen exists.
