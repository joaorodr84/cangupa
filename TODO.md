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

### Expo/React Native port

Replicates `apps/web-classic` as a React Native + Expo (TypeScript) app at
`apps/app`, on the same toolchain DigiSpin and Sphinx use. Ordered so each
task's dependencies land first: scaffold, then game logic/data, then
persistence, then visuals, then screens, then the shell, then assets, then
a parity pass.

- [P2] `CANGUPA-21` — Build the settings screen: theme picker,
  jumps/hints/anim toggles, and a clear-progress action.
- [P2] `CANGUPA-22` — Wire the app shell: board, levels and settings
  screens together, resuming the last-played level on launch the way the
  web version does.
- [P3] `CANGUPA-23` — Design and wire the Expo icon, splash screen and
  adaptive-icon set for `apps/app`, adapted from the existing logo assets
  (`TILE-JUMPER-7`).
- [P2] `CANGUPA-24` — Full parity pass: run the app on iOS/Android/web
  (`expo start`) and check every `apps/web-classic` feature side by side
  before calling the port done.
- [P4] `CANGUPA-25` — Configure EAS build profiles and store metadata
  (bundle identifier, EAS project, `app.json` store fields) for
  `apps/app`. Parked: publishing it hasn't been decided yet.
