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
  pressing Hint could hang the app. Originally found on packs 8 to 10 while
  they were still frozen (from `CANGUPA-56`); `CANGUPA-88` later rebuilt
  packs 7 to 10 around the Gate tile, with fresh content, so re-checked
  against what actually ships today: the *rectangular* packs — 8 Gorge
  (7×6) and 10 Outback (8×7) — still hit it for real, about 15 of each
  pack's 50 levels failing a 400,000-position capped search when turned to
  portrait. The *square* packs — 7 Mesa (6×6) and 9 Plateau (7×7) — are
  never turned at all (`orient.ts` only turns a rectangular level), so they
  were never actually at risk, in this round or the original one. Trying
  the move with the fewest onward options first (tested against the old
  content, not applied) solved 95 of 100 turned levels then, 5 still
  failing with the slowest at 14 seconds — not re-verified against today's
  levels. Needs a better search, solving off the UI thread, or storing each
  level's solution in packs.json.
- [P2] `CANGUPA-54` — Add a hint-balance system to `apps/app`: the game
  starts with a fixed balance of 3 hints, shown as a badge on the hint
  control ([ControlIcon.tsx](apps/app/src/components/ControlIcon.tsx) /
  [BoardHud.tsx](apps/app/src/components/BoardHud.tsx), CANGUPA-53 —
  DigiSpin already has this badge, Cangupa doesn't), spent each time the
  hint button is used. Scoped to just that starting balance, its display
  and its spend — replenishing it (earning by watching a reward video,
  buying in a store) is split out as `CANGUPA-78`/`CANGUPA-79`. Every move
  always consumes exactly one unit of `remaining()` regardless of which
  legal target is chosen (`play()` in
  [board.ts](apps/app/src/game/board.ts)), so every winning sequence has
  the same move length — `CANGUPA-55`'s note on why that count can't vary
  refers to this. The hint itself doesn't change —
  [useBoard.ts](apps/app/src/game/useBoard.ts)'s `hint()` / `game.solve()`
  already reveals a next step via the tip highlight; this only gates that
  behind a balance instead of it being free and unlimited.
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
- [P4] `CANGUPA-78` — Let players earn an extra hint by watching a reward
  video, building on `CANGUPA-54`'s hint balance. Unscoped: which ad
  network/SDK, platform availability (the web has no rewarded-video SDK),
  and app-store review requirements aren't decided yet.
- [P4] `CANGUPA-79` — Let players buy hints in an in-app store, building
  on `CANGUPA-54`'s hint balance. Unscoped: store listing, pricing, and
  which in-app-purchase SDK (App Store/Play Store) to use aren't decided
  yet. `CANGUPA-96`'s investigation flagged that this same SDK choice
  should also serve the pack-unlock purchase it recommends
  (`CANGUPA-106`), so decide it with both consumers in mind, not hints
  alone.
- [P4] `CANGUPA-84` — Let some levels be completed in more than one
  distinct, named way, instead of today's single solved/unsolved state —
  e.g. a level offering "finish using the spiral path" and "finish
  without using the spiral path" as two separate challenges on the same
  board. Inspired by DigiSpin, which has levels completable through
  multiple layouts. Pieces needed:
  1. A named reference path to match or avoid.
     [pack-designs.js](tools/pack-designs.js)'s `snake`/`spiral` walk
     builders already generate exactly this (the same shapes used for
     "designed" levels mixed into packs), so the shape data isn't new —
     only using it as a *constraint* is.
  2. A solver that can search for a solution that includes or excludes a
     given path. Today `Game.solve` (hint lookup) and the generator's
     `countSolutions` ([level-generator.js](tools/level-generator.js))
     only ask "does *any* solution exist" / "how many" — neither is
     constrained to a specific path, and an exclusion search (find *a*
     solution, any solution, that never matches the named one) is a
     different, likely more expensive, search than today's.
  3. A way to grade a finished run against the chosen variant. No new
     tracking is needed for this part: `Game.history`
     ([game.js](apps/web-classic/js/game.js)) already records
     `{pos, cells}` for every move in order, so the kangaroo's actual
     path is already there — grading means comparing that recorded order
     to the named path, not adding new instrumentation.
  4. Per-level, per-variant progress and save data. Today a level is one
     solved/unsolved bit; this needs that bit to become one per variant,
     in both apps' save formats.
  5. UI to present the available variants for a level and show which are
     already completed.
  Unscoped: which levels get this (all, or a curated few like a
  milestone level 40), how many variants per level, whether it ships to
  `apps/web-classic`, `apps/app`, or both, and how an exclusion-constraint
  search stays fast on larger boards without just brute-forcing every
  path. Parked until there's a concrete level and variant pair to
  prototype against. Could also be a good fit for a daily-puzzle
  feature — one shared level/variant per day, the same way `docs/tile-
  ideas.md`'s "Daily level" idea already imagines (seeded from the
  date).
- [P3] `CANGUPA-85` — Add small previous/next level arrows below the
  board on `apps/app`'s `BoardScreen`
  ([BoardScreen.tsx](apps/app/src/components/BoardScreen.tsx)), porting
  `apps/web-classic`'s existing `‹`/`›` toolbar buttons
  ([index.html](apps/web-classic/index.html),
  [ui.js](apps/web-classic/js/ui.js)). Previous is available except at
  level 1; next is only available once the current level is done —
  otherwise the next level is locked and the arrow is disabled or
  hidden, same as web-classic's `next.disabled` check. `apps/app` already
  has the lock logic (`isUnlocked`/`isDone` in
  [progress.ts](apps/app/src/state/progress.ts)), used today only by
  `LevelsScreen`'s grid; `BoardScreen` itself currently has no
  "previous level" control at all, and "next" only appears inside the
  win popup ([WinPopup.tsx](apps/app/src/components/WinPopup.tsx)) after
  clearing the level, not as a persistent control.
- [P3] `CANGUPA-105` — Check whether DigiSpin's own app shell has the
  same hardcoded-"back always goes home" inconsistency `CANGUPA-86`
  just fixed in `apps/app` (a screen reachable from more than one tab,
  whose back button ignored which one actually launched it), and port
  the same "came from" pointer fix there if so. Lives in DigiSpin's own
  repo, not this one — `CANGUPA-86`'s own note flagged it as worth
  checking once a fix landed here, but doing it is out of this
  session's scope.
- [P4] `CANGUPA-89` — Full audit of `apps/app` (the Expo/React Native
  app) for bugs, improvements, and performance issues. Deliberately
  broad and unscoped: the existing Jest suite (796 tests) and `tsc
  --noEmit` already cover correctness of what's tested, so this is
  about what those don't catch — real-device performance (board
  render/animation cost on a big board, like packs 7-10's, bundle size,
  startup time), UX rough edges, and anything else that isn't already
  covered by a narrower, existing task. Should not duplicate `CANGUPA-72`
  (hint-solver hangs on big levels) or `CANGUPA-80` (level-pack content
  review) — those stay their own tasks. Expect this to get split into
  concrete, scoped follow-ups once it actually runs, the way `CANGUPA-54`
  was split into `CANGUPA-78`/`CANGUPA-79`.
- [P4] `CANGUPA-90` — Add achievements. Nothing like this exists yet —
  no engine or UI support, no tracked data beyond `apps/app`'s
  `Progress` (`done`, `level`, `bestMoves` in
  [progress.ts](apps/app/src/state/progress.ts)). Unscoped: what counts
  as an achievement (level/pack milestones, no-hint/no-undo clears,
  move-count records?), whether it's in-app only or wired to platform
  services (Game Center on iOS, Google Play Games on Android), and
  whether `apps/web-classic` gets it too or this is app-only.
- [P3] `CANGUPA-91` — Think about what additional statistics the stats
  page could show. Today
  [StatsScreen.tsx](apps/app/src/components/StatsScreen.tsx) shows
  exactly two rows — levels cleared and total (best) moves — backed by
  `Progress`'s `done`/`bestMoves`
  ([progress.ts](apps/app/src/state/progress.ts)). Most other candidate
  stats aren't tracked yet and would need new fields: hints used (ties
  to the parked `CANGUPA-54` hint balance), undos used, time played,
  per-pack breakdown (cleared/best per pack rather than one global
  total), longest streak of days played. Investigation only — figure
  out which are worth tracking before adding fields to the saved
  `Progress` shape.
- [P1] `CANGUPA-92` — Set up App Store Connect submission for
  `apps/app`: register/confirm the `com.joaorodr84.cangupa` bundle ID,
  create the App Store Connect app record, and fill in
  [eas.json](apps/app/eas.json)'s `submit.production` (today `{}` — no
  Apple ID/ASC App ID/team ID set), so `eas submit` can run
  non-interactively. Run at least one TestFlight build through
  `eas build`'s existing `production` profile before attempting a
  public submission.
- [P1] `CANGUPA-93` — Write a privacy policy and host it at a public
  URL, and fill in the App Store Connect "App Privacy" data-collection
  questionnaire — both required by Apple before submission, and neither
  exists yet (no privacy policy anywhere in the repo). Likely a short
  policy: `apps/app` only stores progress/settings locally via
  AsyncStorage ([storage.ts](apps/app/src/state/storage.ts)), nothing is
  sent anywhere today, so the questionnaire should mostly come out
  "data not collected" — but confirm against the actual code before
  filing it, not from assumption.
- [P2] `CANGUPA-94` — Produce the App Store listing content:
  screenshots for each required device size, app description/subtitle/
  keywords, support URL, category, and the age rating questionnaire.
  Needs copy and screenshots decided before it's just execution — in
  both Portuguese and English, matching the app's existing `en`/`pt`
  localisation.
- [P3] `CANGUPA-106` — Build the actual pack-purchase entitlement flow
  `CANGUPA-96`'s investigation scaffolded but deliberately didn't build:
  a single "unlock all remaining packs" one-time purchase (the
  recommended structure, over per-pack SKUs), an `Entitlements` record
  alongside `Progress`/`Settings` in AsyncStorage
  ([storage.ts](apps/app/src/state/storage.ts)'s existing pattern),
  `isUnlocked` ([progress.ts](apps/app/src/state/progress.ts)) gated on
  it past the free packs, restore-purchase handling, and the store UI
  itself. Blocked on `CANGUPA-79` picking an in-app-purchase SDK (now
  serving both hints and this) and on the owner confirming the
  free/paid pack cut and pricing `CANGUPA-96` left open. Not blocking
  `CANGUPA-92`'s first submission — ship with every pack free first,
  add this as a fast-follow once the SDK is chosen.
- [P2] `CANGUPA-97` — Analyze visual accessibility. Concrete issue
  already found: `CANGUPA-87`'s proposed tile colours (Signpost green,
  Gate raspberry red) are exactly the pair hardest to tell apart under
  red-green colour blindness (~8% of men) — tiles need to stay
  distinguishable by shape too, the way Gold/Steel already are via a
  dot-count overlay (`.tile.two::before`/`::after` in
  [style.css](apps/web-classic/style.css)), not colour alone. Also
  check: contrast across every theme (`style.css`'s per-`data-theme`
  `--ink`/`--muted`/`--tile` sets, some combinations untested for
  contrast), and whether `apps/app`'s text respects OS
  dynamic-type/font-scaling settings (unconfirmed). Investigation only
  — didn't land before `CANGUPA-87`/`CANGUPA-88` after all (no owner
  decision blocked on it, so the batch moved ahead), but the specific
  colour-pair issue is already mitigated in practice: `apps/app`'s
  `Board.tsx` draws the same triangle mark on both Signpost and Gate
  tiles that Gold/Steel already get from their dot-count overlay, so
  neither depends on colour alone. The contrast and dynamic-type
  questions are still open.
- [P3] `CANGUPA-98` — Analyze motor accessibility — maybe add multiple
  ways of controlling the kangaroo. `apps/web-classic` already has two
  input modes (tap/click a tile, and keyboard — `WASD`/arrow keys,
  `KEYDIR` in [ui.js](apps/web-classic/js/ui.js), from `CANGUPA-66`);
  `apps/app` has only one — tapping the exact destination tile
  (`onPressTile` in
  [PlayableBoard.tsx](apps/app/src/components/PlayableBoard.tsx)), no
  keyboard, external game-controller, or directional-pad alternative.
  Investigate: a directional-pad control scheme (pick a direction, let
  it resolve via `legalMoves` rather than requiring a precise tap),
  external keyboard/MFi controller support on iOS, and adjustable
  tap-target size.
- [P3] `CANGUPA-99` — Analyze auditory accessibility/impairments.
  [sound.js](apps/web-classic/js/sound.js) has three effects (`jump`,
  `win`, `fall`), all gated by a `settings.sound` toggle that can mute
  them entirely, and `fall()`'s tone is already timed to a `.falling`
  CSS animation rather than standing alone — so the baseline (nothing
  is sound-only) looks likely already met, given sound can already be
  switched off completely in both apps. Verify that's actually true for
  every cue in both apps (confirm `apps/app`'s sound settings behave
  the same), rather than assuming it from the toggle existing.
- [P3] `CANGUPA-100` — Investigate which other disability types are
  worth a dedicated accessibility analysis, beyond the visual
  (`CANGUPA-97`), motor (`CANGUPA-98`), and auditory (`CANGUPA-99`) ones
  already opened. Candidates to consider: cognitive/learning load (the
  game already has no timer or fail state, which likely helps by
  default — confirm), photosensitivity/seizure risk (check board/tile
  animations for flashing or strobing), and situational constraints
  (one-handed use, glare/bright-sunlight contrast — may already be
  covered by `CANGUPA-97`). Scoping only — decide which deserve their
  own task.
