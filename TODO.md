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
- [P2] `CANGUPA-30` — Build a stats screen for `apps/app`. Unscoped: which
  stats to show (levels cleared, moves taken, time, streak, something else)
  isn't decided yet. Exists as a destination for `CANGUPA-31`'s footer
  "Stats" tab.
- [P1] `CANGUPA-31` — Add a reusable bottom-footer nav to `apps/app`: four
  tabs, in order — Home, Levels, Stats, Settings — shown on the home,
  levels, stats and settings screens. The Levels tab opens the existing
  levels screen unchanged
  ([LevelsScreen.tsx](apps/app/src/components/LevelsScreen.tsx),
  CANGUPA-20) — everything already reachable from today's `Níveis` button.
  The Settings tab opens the existing settings screen unchanged
  (CANGUPA-21). Once Levels, Rules (`CANGUPA-29`'s home-screen button) and
  Settings all work through these new entry points, remove the board
  screen's now-redundant inline nav row (`Níveis` / `Regras` /
  `Definições`, built in [App.tsx](apps/app/App.tsx)'s `Shell`) as this
  task's finishing step — Regras has no footer tab of its own, so
  `CANGUPA-29`'s home-screen button becomes its only entry point. Blocked
  on `CANGUPA-30`: the Stats tab has nowhere to go until that screen
  exists.
- [P1] `CANGUPA-32` — Rework the `apps/app` game (board) screen's HUD,
  similarly to DigiSpin:
  - Move the Undo/Restart/Hint buttons
    ([BoardHud.tsx](apps/app/src/components/BoardHud.tsx)'s
    "Desfazer"/"Reiniciar"/"Dica") to the screen's upper-right corner.
  - Remove the previous-level `‹` toolbar button entirely.
  - Remove the next-level `›` toolbar button and the win-triggered
    "Próximo nível" button, replacing both with a pop-up shown on level
    completion.
  - Remove the "Cangupa" title from the top of this screen specifically.
    [App.tsx](apps/app/App.tsx)'s `Shell` currently renders that title
    unconditionally above every panel, so this needs it hidden only when
    `panel === 'board'`, keeping it on the other screens — including the
    home screen, where it doubles as the logo (`CANGUPA-29`).
- [P2] `CANGUPA-33` — Similarly to DigiSpin, shrink the board when the
  screen is wider than it is tall (landscape), so it fits inside the
  screen instead of overflowing.
  [Board.tsx](apps/app/src/components/Board.tsx) currently sizes itself
  purely off container width (`width: '100%'` plus `aspectRatio: w / h`),
  with nothing capping it by the available height.
