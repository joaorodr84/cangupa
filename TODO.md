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

- [P2] `CANGUPA-72` — The hint solver (`Game.solve`) can run out of memory or
  take many seconds on some big levels turned for a portrait screen, so
  pressing Hint could hang the app. Packs 8 to 10 (frozen) are the problem:
  50 of their 100 turned levels pass 400,000 positions, one run ended in
  `Set maximum size exceeded`. Trying the move with the fewest onward options
  first solves 95 of them, 5 still fail and the slowest takes 14 seconds.
  Needs a better search, solving off the UI thread, or storing each
  level's solution in packs.json.
- [P2] `CANGUPA-54` — Add a hint-balance system to `apps/app`: a spendable
  hint count, shown as a badge on the hint control
  ([ControlIcon.tsx](apps/app/src/components/ControlIcon.tsx) /
  [BoardHud.tsx](apps/app/src/components/BoardHud.tsx), CANGUPA-53 —
  DigiSpin already has this badge, Cangupa doesn't), earned once each time
  a level is finished, and spent each time the hint button is used. No
  "perfect clear" check is needed: every move always consumes exactly one
  unit of `remaining()` regardless of which legal target is chosen
  (`play()` in [board.ts](apps/app/src/game/board.ts)), so every winning
  sequence has the same length — there's no fewer-steps clear to compare
  against. The hint itself doesn't change —
  [useBoard.ts](apps/app/src/game/useBoard.ts)'s `hint()` / `game.solve()`
  already reveals a next step via the tip highlight; this only gates that
  behind a balance instead of it being free and unlimited. No longer
  blocked on `CANGUPA-55`.
- [P2] `CANGUPA-55` — Guarantee every level has more than one solution
  (distinct paths through the same fixed move count — see `CANGUPA-54`'s
  note on why that count can't vary). Today the level generator
  ([level-generator.js](tools/level-generator.js)'s
  `generateLevel`/`countSolutions`) only selects for the *fewest*
  solutions among random walks (for difficulty), with no floor requiring
  more than one — some of the 50 generated levels could already have
  just one. Touches the generator (re-verifying/regenerating levels as
  needed) and the ported level data
  ([levels.ts](apps/app/src/game/levels.ts)). Dropped: a shortest-path
  solver alongside `solve()` — moot, since `solve()`'s DFS result is
  already optimal-length by construction.
