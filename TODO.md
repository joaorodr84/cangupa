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
  packs 7 to 10 around the Arrival tile, with fresh content, so re-checked
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
  level's solution in packs.json. `CANGUPA-112` rebuilt Outback's content
  again (now Common, Gold, Steel, Departure and Arrival together on every
  level) and hit this directly: `Game.solve()` — uncapped, unlike the
  generator's own search — exhausted its `dead` Set rather than return on
  at least one turned, arrow-containing Outback level, caught by
  `orient.test.ts`. That test now excludes Outback outright rather than
  exercising it, so the ~15/50 figure above is stale again and needs
  re-measuring against the new content whenever this is actually picked
  up.
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
- [P2] `CANGUPA-125` — Bring a hint-balance system to `apps/web-classic`,
  which has none today — `hint()` in
  [ui.js](apps/web-classic/js/ui.js) is free and unlimited, gated only by
  the unrelated `settings.hints` toggle that shows/hides the legal-move
  outlines. Starting balance of 3, same as `apps/app`'s `CANGUPA-54`,
  replenished solely by earning one hint, uncapped, per first-time level
  clear — no reward-video/IAP path on web, per `CANGUPA-78`'s own note that
  the web has no rewarded-video SDK. Needs its own save-data field (today's
  web-classic progress/settings live in `localStorage`, shape TBD by
  whoever picks this up) and a balance display near the `#hint` control.
  The "next move" visual itself needs no design work — `.tip`'s pulsing
  yellow outline ([style.css](apps/web-classic/style.css)) already shows
  it, distinct from the plain white `.hint` outline for legal moves.
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
- [P3] `CANGUPA-105` — Check whether DigiSpin's own app shell has the
  same hardcoded-"back always goes home" inconsistency `CANGUPA-86`
  just fixed in `apps/app` (a screen reachable from more than one tab,
  whose back button ignored which one actually launched it), and port
  the same "came from" pointer fix there if so. Lives in DigiSpin's own
  repo, not this one — `CANGUPA-86`'s own note flagged it as worth
  checking once a fix landed here, but doing it is out of this
  session's scope.
- [P4] `CANGUPA-146` — Bring `CANGUPA-143`'s time-played stat to
  `apps/web-classic`, which has no `AppState` equivalent — needs a
  browser-side visibility/focus timer instead, and its own save-data
  field (`localStorage`, shape TBD). Parked until `CANGUPA-143` lands
  on `apps/app` first, the same relationship `CANGUPA-125` has to
  `CANGUPA-54`'s hint balance.
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
  itself. `CANGUPA-79` has now picked the SDK (react-native-iap, serving
  both hints and this) and shows the shape to follow for the purchase
  flow itself; still blocked on the owner confirming the free/paid pack
  cut and pricing `CANGUPA-96` left open. Not blocking `CANGUPA-92`'s
  first submission — ship with every pack free first, add this as a
  fast-follow.
- [P3] `CANGUPA-157` — Generate "Down Under", a second, paid collection of
  500 levels (10 packs of 50, boards 5×5 to 8×7) that is harder than Lay of
  the Land through three new tiles — Pillar, Mud and Tunnel — rather than
  bigger boards. The full plan lives in
  [docs/down-under-collection.md](docs/down-under-collection.md): pack
  names, board sizes and what each pack teaches, the tile rules and design
  ideas, pack icon ideas, and the pack sentences in English and Portuguese.
  This task is the generation itself: the ten plan entries in
  [pack-plan.js](tools/pack-plan.js), running the generator, and wiring the
  packs, names, blurbs, icons and colours into `apps/app`. Blocked on
  `CANGUPA-159`, `CANGUPA-160` and `CANGUPA-161` (the three tiles) and
  `CANGUPA-162` (more than one collection), and on the owner confirming the
  open decisions at the end of that file. `CANGUPA-72` has to land before
  the 7×6 and 8×7 packs ship, and `CANGUPA-106` before the collection can
  be sold.
- [P3] `CANGUPA-158` — Build a review page for the look of the three new
  Down Under tiles (Pillar, Mud, Tunnel), the way
  `tools/visualizers/tile-marks.html` settled Departure and Arrival: each
  design idea from
  [docs/down-under-collection.md](docs/down-under-collection.md)'s "New
  tiles" section drawn side by side, in light and dark, at real board
  sizes down to the smallest a turned 8×7 gives. The outcome is the owner's
  pick of a Pillar shape and colour, a Mud mark, and a way of telling two
  Tunnel pairs apart without colour, recorded back in that file. Comes
  before the drawing half of `CANGUPA-159` to `CANGUPA-161`; their rule
  halves do not wait on it.
- [P3] `CANGUPA-159` — Add the Pillar tile (`#`): a solid block that is
  never landed on and blocks any jump whose middle square it is. Rule and
  design ideas are in
  [docs/down-under-collection.md](docs/down-under-collection.md). Covers
  the rule in both engines (`apps/web-classic/js/game.js`, which the
  generator and solver load, and `apps/app`'s
  [board.ts](apps/app/src/game/board.ts)), rules assertions for it,
  [level-generator.js](tools/level-generator.js)'s walk placing pillars
  without breaking its own solution, a `pillars` column in
  [pack-plan.js](tools/pack-plan.js), board rotation and mirroring in
  [pack-generator.js](tools/pack-generator.js) and the app's `orient.ts`,
  drawing it in `apps/app`, and its how-to-play, blocked-move and
  accessibility strings in `en` and `pt`. First of the three because it is
  the smallest and adds no tile state.
- [P3] `CANGUPA-160` — Add the Mud tile (`m`): one visit, can be stepped off
  but not jumped off. Same scope as `CANGUPA-159` — both engines, rules
  assertions, the generator's walk only stepping from mud, a `mud` column
  and `intro` kind in the plan, drawing, and strings in `en` and `pt` — per
  [docs/down-under-collection.md](docs/down-under-collection.md).
- [P3] `CANGUPA-161` — Add the Tunnel tile (`a`/`a`, `b`/`b`), the
  teleporter pair: landing on one mouth moves you to its twin and uses up
  both. Same scope as `CANGUPA-159`, per
  [docs/down-under-collection.md](docs/down-under-collection.md), and the
  largest of the three: a move's destination is no longer where it lands,
  which reaches undo, the hint solver, the hop animation and the
  generator's walk (which must place both mouths as a pair and never land
  on either again). Needs the two open rule questions in that file answered
  first: may the start be a mouth, may a jump pass over one.
- [P3] `CANGUPA-162` — Support more than one collection, end to end. Today
  [pack-plan.js](tools/pack-plan.js) exports one flat `PACKS` list,
  `packs.json` and the generated
  [packs.ts](apps/app/src/game/packs.ts) hold one list of ten, `collection`
  is a single string in the locale files, and `PackIcon`/`PACK_COLORS`
  index by pack number 0 to 9. Needs: a collection level in the plan and
  the generated files, with `OVERLAP` carrying across from one
  collection's last pack to the next one's first; per-collection names,
  blurbs, icons and colours; the Levels tab listing collections; and saved
  progress that still loads for existing players (a `BREAKING CHANGE` to
  the save shape if pack indices stop being global). Also check anything
  that counts "every pack", such as the Collector achievement. Does not
  include locking or selling a collection, which is `CANGUPA-106`.
- [P3] `CANGUPA-163` — Have the generator write one solution per level to a
  separate file (`tools/solutions.json`, same pack and level order as
  `packs.json`). `search` in [difficulty.js](tools/difficulty.js) already
  finds a solution for every level it scores but keeps only the number of
  choices at each step; it should keep the moves too. The 500 shipped
  levels need no regenerating: run the solver once over `packs.json` as it
  is. Add a test that replays every stored solution and checks it clears
  its level. Opens up `CANGUPA-72`'s third option (hints from a stored
  solution), which stays that task's call; a stored solution only helps
  while the player is still on its path, and a turned level needs its
  moves turned the same way.
- [P4] `CANGUPA-150` — Parked: the owner wants `apps/web-classic` work
  skipped for now, and every part of this task is `apps/web-classic`-only.
  Revisit once that pause lifts. Fix two hardcoded, theme-unaware text
  colours in `apps/web-classic`'s [style.css](apps/web-classic/style.css),
  found by
  `CANGUPA-97`'s contrast audit: the `<select>` element's text
  (`color: #fff` regardless of theme) measures only 2.90:1 against Ice's
  own `--frame`, under even the 3:1 large-text minimum; `#blocked-msg`'s
  text (`rgba(255,120,104,.95)` regardless of theme) measures 1.15-1.84:1
  against Sand and 1.61-2.26:1 against Ice, since it sits directly on the
  page gradient rather than a panel — both effectively unreadable. Fix by
  deriving each from the active theme's own variables (`--ink`, or a new
  per-theme "warning" variable) instead of a fixed hex, the same way
  every other themed element already works. Also nudge `--muted`'s
  near-misses the audit found against one gradient stop in three themes
  — sand vs `--bg2` (3.13:1), ice vs `--bg2` (3.68:1), classic vs `--bg1`
  (4.22:1), all under the 4.5:1 AA line for normal text though still
  above the 3:1 large-text floor — the same kind of small shift
  `@joaorodr84/themes`'s own `LIGHT.textMuted` already took (4.36:1 →
  4.99:1) for exactly this reason.
- [P2] `CANGUPA-153` — Add a minimum-touch-target floor to `apps/app`'s
  board tiles. `CANGUPA-98`'s investigation found there isn't just no
  *setting* for tap-target size — there's no enforced *floor* either:
  [boardLayout.ts](apps/app/src/components/boardLayout.ts)'s
  `fitBoardWidth` has no minimum tile size at all, and no tile anywhere
  sets `hitSlop`, so a large, turned board (`CANGUPA-72`'s own
  portrait-turned Gorge 7×6/Outback 8×7, becoming 6×7/7×8) on a small
  phone, or any height-constrained layout, can render a tile well under
  Apple HIG's 44×44pt recommended minimum touch target with nothing to
  compensate. Most likely fix: a minimum `hitSlop` so the tappable area
  stays at least 44×44pt even once the rendered tile face shrinks below
  it, rather than forcing the board itself to stay larger than the
  screen allows. A user-facing size *preference* on top of this floor
  stays unscoped, parked behind this landing first.
- [P4] `CANGUPA-154` — External keyboard/MFi controller
  support for `apps/app`: no keyboard or gamepad handling exists
  anywhere in `apps/app` today. Surfaced by `CANGUPA-98`'s
  motor-accessibility investigation. Now actually researched (2026-11-13),
  and still parked — no concrete library clears a reasonable bar yet:
  - **MFi/gamepad bridge**: nothing found. Every `react-native-game*`/
    `react-native-gamepad*`/`react-native-joystick` package on npm turned
    out to be an on-screen virtual control (or a browser Gamepad API
    wrapper), not a bridge to Apple's native `GCController`/MFi framework
    — there is no React Native wrapper for it at all, native-module or
    otherwise. Building one from scratch (a new native module, roughly
    the lift `CANGUPA-78`'s ad SDK was) is the only path, with nothing
    picked.
  - **Hardware keyboard (arrow keys)**: React Native 0.84 (apps/app is on
    0.88) added built-in `onKeyDown`/`onKeyUp` — but **Android only**,
    per React Native's own 0.84 release notes, with no mention of which
    component exposes it, no documented event shape, and no iOS
    coverage at all — not something to build a cross-platform feature on
    today, and iOS is this app's primary target (the open `CANGUPA-92`
    App Store submission). The small third-party packages that do cover
    iOS (`expo-key-event`, `react-native-external-keyboard`,
    `react-native-nitro-keyevent`) are all low-adoption (tens to a few
    hundred weekly downloads, single-digit GitHub stars, one needs
    hand-written native `MainActivity` edits anyway, defeating the point
    of depending on it) — exactly the profile of package the 2026
    "Shai-Hulud" npm supply-chain worm targeted. Not worth the trust
    exposure for a P4, nobody-asked-for-it-yet feature.
  Conclusion: still parked, not for lack of looking now but because
  nothing found is worth shipping. Revisit if RN's Android keyboard
  support gains iOS parity, a maintained MFi wrapper appears, or a
  concrete player request changes the P4 priority enough to justify the
  smaller libraries' trust trade-off anyway.
- [P4] `CANGUPA-134` — Add a cleared/mastered indicator icon to each pack
  row and the collection header on `apps/app`'s Levels tab
  ([LevelPacksScreen.tsx](apps/app/src/components/LevelPacksScreen.tsx),
  `CANGUPA-133`): a check mark once every level in the item is solved,
  and — if level mastery is ever built (`CANGUPA-84`'s multi-variant
  idea is one possible source of what "mastered" would mean) — a star
  in that same slot instead of the check, not alongside it, so one icon
  always answers "is this done, and is it done the best way" without a
  second slot crowding a count as wide as "500/500". Sits to the *left*
  of the x/y count, not the right: the count already sits flush against
  the item's own right edge (the chevron, for the collection header),
  and an icon there would either leave an empty gap in every unfinished
  row or walk the count toward the middle as packs clear — left of the
  count keeps every count in one column regardless of which rows have
  earned an icon yet. Draw it in the item's own accent colour (the
  pack's swatch colour), matching how `LevelsScreen`'s grid already
  marks a cleared cell in that colour. Parked: no mastery concept exists
  yet to drive the star, and a check mark for "fully cleared" alone may
  not be worth it either — revisit once one of those becomes real.
