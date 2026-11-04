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

- [P2] `CANGUPA-70` — The hint solver (`Game.solve`) can run out of memory or
  take many seconds on some big levels turned for a portrait screen, so
  pressing Hint could hang the app. Packs 8 to 10 (frozen) are the problem:
  50 of their 100 turned levels pass 400,000 positions, one run ended in
  `Set maximum size exceeded`. Trying the move with the fewest onward options
  first solves 95 of them, 5 still fail and the slowest takes 14 seconds.
  Needs a better search, solving off the UI thread, or storing each
  level's solution in packs.json.
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
