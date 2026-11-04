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

- [P2] `CANGUPA-62` — Define level evaluation and difficulty metrics in
  [difficulty.js](tools/difficulty.js): an exact
  random-play score (`bits`) where the state space fits, plus cheap
  estimators that scale to all levels (search effort, random-play survival,
  branching along the solution). Validate against the existing 50-level
  curve, then feed the score into the generator/plan so difficulty rises
  gradually. Feeds `CANGUPA-55` and `CANGUPA-56`.
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
  ([level-generator.js](tools/level-generator.js)'s
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
  ([level-generator.js](tools/level-generator.js)'s
  `randomWalk`/`generateLevel`, which currently allows empty
  rows/columns and has no notion of packs), the ported level data
  (reshaped from one flat list into pack-grouped data), the levels
  screen ([LevelsScreen.tsx](apps/app/src/components/LevelsScreen.tsx),
  CANGUPA-20/46, built around one flat 50-level grid and needs pack
  selection), and the board/rotation rendering
  ([Board.tsx](apps/app/src/components/Board.tsx) /
  [BoardScreen.tsx](apps/app/src/components/BoardScreen.tsx)).

  **Progress (branch `cangupa-56-level-packs`):** the owner set the pack
  shape at 10 packs of 30 levels (not 50 in total), boards growing every
  pack. Done: the plan ([pack-plan.js](tools/pack-plan.js)), the generator
  ([pack-generator.js](tools/pack-generator.js), `gen-packs.js`), designed
  layouts ([pack-designs.js](tools/pack-designs.js)), the generated data
  ([packs.json](tools/packs.json), [packs.ts](apps/app/src/game/packs.ts))
  and the pack checks in `tools/test.js`. Still to do: swap `LEVELS` for
  `PACKS` in `apps/app`, a pack picker in `LevelsScreen.tsx`, the saved
  `Progress` shape, and the portrait/landscape rotation. Those need the
  app's jest suite, which cannot be installed in a cloud session (it
  depends on a private `themes` repository).
- [P2] `CANGUPA-58` — Port falling as an opt-in setting (`TILE-JUMPER-3`)
  to `apps/app`: add `Settings.fall: boolean` (default `false`, same
  parsing/default pattern as `CANGUPA-57`'s `sound`), a toggle row in
  `SettingsScreen.tsx`, and a `fall()` action in
  [useBoard.ts](apps/app/src/game/useBoard.ts) (mirroring `ui.js`'s
  `fall()`: sink-and-fade the kangaroo, then `game.reset()`). Touch-only,
  so only the "tap empty space" half of the web version's behaviour
  applies here — there's no keyboard.
  [Board.tsx](apps/app/src/components/Board.tsx)'s outer board container
  needs to catch taps that land on no tile's own `Pressable` (today only
  a tile with a legal move — `tile.hint` — is wrapped in one; see its
  `Tile` component), the same empty-space hit-testing problem
  `TILE-JUMPER-3` called out for the web version, solved there by
  falling through `ui.js`'s click handler when no `.cell`/legal move
  matches.
- [P2] `CANGUPA-59` — Port the finish-level sound effect
  (`TILE-JUMPER-4`) to `apps/app`: a `win()` tone/melody added to
  `src/audio/sound.ts` (`CANGUPA-57`) and its matching WAV asset
  generated the same way, played from
  [BoardScreen.tsx](apps/app/src/components/BoardScreen.tsx) when the
  board's won state newly becomes true (its existing `onLevelComplete`
  effect already detects exactly this transition). Blocked on
  `CANGUPA-57` for the `Sound` module and asset pipeline.
- [P2] `CANGUPA-60` — Port the falling sound effect (`TILE-JUMPER-5`) to
  `apps/app`: a `fall()` tone added to `src/audio/sound.ts`
  (`CANGUPA-57`) and its WAV asset, played from `useBoard.ts`'s `fall()`
  action (`CANGUPA-58`) alongside the sink-and-fade animation. Blocked on
  both `CANGUPA-57` (the `Sound` module) and `CANGUPA-58` (the `fall()`
  action it hooks into).
- [P2] `CANGUPA-61` — Port the joey-in-pouch art (`TILE-JUMPER-6`) to
  `apps/app`: add the same joey (two ears, a round head, two eyes, a
  nose) to [Kangaroo.tsx](apps/app/src/components/Kangaroo.tsx)'s
  `SideSprite` and `FrontSprite`, ported 1:1 from the SVG paths
  `apps/web-classic/js/sprites.js` carries after `TILE-JUMPER-6` —
  `react-native-svg`'s `<G>`/`<Path>`/`<Ellipse>`/`<Circle>` mirror the
  plain SVG elements directly. `BackSprite` stays untouched, same
  reasoning as the web version: no pouch is visible from behind a
  kangaroo.
