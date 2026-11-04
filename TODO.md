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

- [P3] `TILE-JUMPER-4` — Play a sound effect on finishing a level.
- [P3] `TILE-JUMPER-5` — Play a sound effect on falling. Depends on
  `TILE-JUMPER-3` landing first — there's no fall to cue the sound off until
  that exists.
- [P3] `TILE-JUMPER-6` — Redo the main character's art, and draw a small
  joey riding inside the pouch.
- [P4] `TILE-JUMPER-7` — Design a logo for Cangupa. Unscoped: where it
  would be used (title screen, favicon, README) and the style aren't
  decided yet.
- [P2] `CANGUPA-54` — Add a hint-balance system to `apps/app`: a spendable
  hint count, shown as a badge on the hint control
  ([ControlIcon.tsx](apps/app/src/components/ControlIcon.tsx) /
  [BoardHud.tsx](apps/app/src/components/BoardHud.tsx), CANGUPA-53 —
  DigiSpin already has this badge, Cangupa doesn't), earned once each time
  a level is finished perfectly — defined as clearing it in the fewest
  possible steps, one step being one tile-to-tile move (one tap) — and
  spent each time the hint button is used. The hint itself doesn't
  change — [useBoard.ts](apps/app/src/game/useBoard.ts)'s `hint()` /
  `game.solve()` already reveals a next step via the tip highlight; this
  only gates that behind a balance instead of it being free and
  unlimited. Needs each level's optimal (fewest-step) solution length to
  compare the player's own move count against. Blocked on `CANGUPA-55`,
  which is what makes that number available.
- [P2] `CANGUPA-55` — Guarantee every level has more than one solution,
  and make each level's optimal (fewest-step) solution length available
  at runtime — needed by `CANGUPA-54` to judge a "perfect" clear. Today
  [board.ts](apps/app/src/game/board.ts)'s `Game.solve()` is a DFS that
  returns the first solution it finds, not necessarily the shortest one,
  and the level generator
  ([level-generator.js](apps/web-classic/tools/level-generator.js)'s
  `generateLevel`/`countSolutions`) only selects for the *fewest*
  solutions among random walks (for difficulty), with no floor requiring
  more than one — some of the 50 generated levels could already have
  just one. Touches the generator (re-verifying/regenerating levels as
  needed), the solver (a shortest-path method alongside `solve()`), and
  the ported level data ([levels.ts](apps/app/src/game/levels.ts)).
- [P2] `CANGUPA-56` — Replace the `apps/app` level set (CANGUPA-12,
  [levels.ts](apps/app/src/game/levels.ts)) with 50 newly-generated
  levels organized into size-based packs:
  - Square packs (3×3, 4×4, 5×5, 6×6, and up).
  - Rectangular packs (3×4, 4×5, and up).
  - Exact size list and levels-per-pack still TBD.
  - Every level must fill its full bounding box — no entirely empty row
    or column.
  - A rectangular level's board auto-rotates to whichever orientation
    (portrait/landscape) best fits the device's current orientation,
    rather than being generated in one fixed shape. Owner-confirmed:
    this is part of the same task, not a follow-on.

  Owner-confirmed: this replaces the existing 50 levels outright — a
  breaking change to the saved `Progress` shape, since it's keyed by
  level index into the old list — rather than adding a second set
  alongside it. Touches the generator
  ([level-generator.js](apps/web-classic/tools/level-generator.js)'s
  `randomWalk`/`generateLevel`, which currently allows empty
  rows/columns and has no notion of packs), the ported level data
  (reshaped from one flat list into pack-grouped data), the levels
  screen ([LevelsScreen.tsx](apps/app/src/components/LevelsScreen.tsx),
  CANGUPA-20/46, built around one flat 50-level grid and needs pack
  selection), and the board/rotation rendering
  ([Board.tsx](apps/app/src/components/Board.tsx) /
  [BoardScreen.tsx](apps/app/src/components/BoardScreen.tsx)).
