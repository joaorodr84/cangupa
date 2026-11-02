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
- [P1] `CANGUPA-28` — Add a home screen to `apps/app`. Launching the app
  currently drops straight into the board (`App.tsx`'s `panel` state starts
  at `'board'`); instead it should start on a new screen with the Cangupa
  logo and one button that jumps straight into the next level to play,
  reusing the resume level the app already tracks (`progress.level`, read
  in [App.tsx](apps/app/App.tsx)). Only the launch screen changes — the
  existing in-board nav (Níveis / Regras / Definições) and the board screen
  itself are unaffected; there's no way back to this new screen once past
  it, same as the existing "Voltar" only ever returning to the board.
