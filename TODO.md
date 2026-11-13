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
- [P2] `CANGUPA-137` — Add an accessibility label to `apps/app`'s shared
  `Popup.tsx` close button (the "✕" `Pressable`, ~lines 38-40), used by
  `WinPopup`, `HelpPopup`, and the clear-progress confirmation — every
  popup in the app shares this one component, so it's a single fix.
  Today it has no `accessibilityLabel`/`accessibilityRole`, so a screen
  reader announces it by the glyph rather than "Close." Needs a new
  i18n string (`en`/`pt`) plus `accessibilityRole="button"`. Surfaced
  by `CANGUPA-89`'s audit.
- [P2] `CANGUPA-138` — Investigate, and likely fix, a possible
  splash-to-content flash on `apps/app` startup, most visible in dark
  mode. `App.tsx`'s loading view (rendered while `useSettings`/
  `useProgress` await their first AsyncStorage read) has no
  `backgroundColor`, and no `SplashScreen.preventAutoHideAsync()` call
  exists anywhere in the app, so Expo's splash auto-hides on first
  paint — a transparent/white frame can show before the first themed
  paint. `useColorScheme()` is already imported and used later in the
  same file; a candidate fix is giving the loading view a background
  approximated from the OS scheme before `settings` resolves. Surfaced
  by `CANGUPA-89`'s audit but not confirmed on a real device — verify
  the flash actually happens before fixing it blind.
- [P4] `CANGUPA-139` — Theoretical save-write race in `apps/app`'s
  `useProgress`/`useSettings` (`state/useProgress.ts`,
  `state/useSettings.ts`): both hooks fire-and-forget
  `AsyncStorage.setItem` on every change with no write queue, so two
  rapid updates to the same key could, if their promises resolve out of
  order, let a stale write land last and silently clobber a newer
  value. Low real-world likelihood — AsyncStorage calls on the same key
  are typically processed in call order, though that's not a
  documented guarantee. Surfaced by `CANGUPA-89`'s audit; parked since
  no concrete failure has been observed — revisit if a lost-setting or
  lost-progress report ever comes in.
- [P4] `CANGUPA-140` — Give `apps/app`'s board tiles real screen-reader
  semantics (position, legality, tile kind). Today's board
  (`Board.tsx`) has no `accessibilityLabel` per tile, so a screen-reader
  user gets no information about the board at all — distinct from
  `CANGUPA-97`'s visual/contrast concerns (which don't help a blind
  user) and `CANGUPA-98`'s motor/control-scheme ones. Surfaced by
  `CANGUPA-89`'s audit as a real gap, but flagged there as a
  substantial design problem — what each tile should announce
  (coordinates? direction? legal-move state?) and how a move is
  actually performed via a screen reader, given the input model is
  tapping the exact destination tile — rather than a quick fix, so
  parked rather than scoped yet.
- [P4] `CANGUPA-90` — Add achievements. Nothing like this exists yet —
  no engine or UI support, no tracked data beyond `apps/app`'s
  `Progress` (`done`, `level`, `bestMoves` in
  [progress.ts](apps/app/src/state/progress.ts)). Unscoped: what counts
  as an achievement (level/pack milestones, no-hint/no-undo clears,
  move-count records?), whether it's in-app only or wired to platform
  services (Game Center on iOS, Google Play Games on Android), and
  whether `apps/web-classic` gets it too or this is app-only.
- [P3] `CANGUPA-141` — Show a per-pack cleared/best-moves breakdown on
  `apps/app`'s
  [StatsScreen.tsx](apps/app/src/components/StatsScreen.tsx), alongside
  today's two global rows. Needs no new saved field: `done`/`bestMoves`
  ([progress.ts](apps/app/src/state/progress.ts)) plus the existing
  `PACK_SIZES` ([levels.ts](apps/app/src/game/levels.ts)) already
  derive each pack's cleared count and summed best moves. Surfaced by
  `CANGUPA-91`'s investigation.
- [P2] `CANGUPA-143` — Track total time played on `apps/app` (an
  `AppState`-based session timer, accumulated into a new persisted
  lifetime field) and show it on
  [StatsScreen.tsx](apps/app/src/components/StatsScreen.tsx). Surfaced
  by `CANGUPA-91`'s investigation as sitting in tension with the
  deliberate no-timer/no-pressure design `CANGUPA-100` already
  confirmed (no timer, countdown, or move-limit mechanic anywhere in
  either app) — the owner confirmed wanting it anyway, so that tension
  is resolved; what's left is the `AppState` plumbing itself, not a
  decision. `CANGUPA-146` tracks the same stat for `apps/web-classic`
  once this lands.
- [P4] `CANGUPA-144` — Show a longest-streak-of-days-played stat on
  `apps/app`'s `StatsScreen.tsx`. Needs a new, timezone-robust
  date-tracking scheme (today nothing records *when* a level was
  played, only *that* it was) and a decision on what counts as "a day
  played" — any session, or a cleared level. Surfaced and parked by
  `CANGUPA-91`'s investigation.
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
- [P2] `CANGUPA-97` — Analyze visual accessibility. Concrete issue
  already found: `CANGUPA-87`'s proposed tile colours (Departure green,
  Arrival raspberry red) are exactly the pair hardest to tell apart under
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
  `Board.tsx` draws the same triangle mark on both Departure and Arrival
  tiles that Gold/Steel already get from their dot-count overlay, so
  neither depends on colour alone. The contrast and dynamic-type
  questions are still open. `CANGUPA-100`'s scoping pass folded its
  "glare/bright-sunlight contrast" situational candidate in here rather
  than opening a new task: it's the same per-theme contrast question
  this task already owns, just under harsher outdoor lighting rather
  than indoor viewing — no separate investigation needed, just test
  outdoors (or with the screen brightness lowered to approximate it)
  when this is picked up.
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
  tap-target size. `CANGUPA-100`'s scoping pass folded its "one-handed
  use" situational candidate in here rather than opening a new task:
  a directional-pad scheme (already on this list) would be the same
  fix for both one-handed reachability and precise-tap difficulty, so
  it doesn't need separate investigation.
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
- [P2] `CANGUPA-147` — Build a single Store screen for `apps/app`, instead
  of hints and (eventually) packs each getting their own separate entry
  point. Adds a fifth tab to
  [FooterNav.tsx](apps/app/src/components/FooterNav.tsx), placed in the
  *middle* of the tray — Home, Levels, Store, Stats, Settings — alongside
  a new `TabIcon` case: a line-drawn shopping bag (trapezoid body, two
  short arc handles), matching the existing hand-drawn `react-native-svg`
  glyphs (house outline, three bars, two sliders with dot-knobs) and kept
  visually distinct from all four. Needs `FooterTab`
  ([FooterNav.tsx](apps/app/src/components/FooterNav.tsx)) and `Panel`
  ([App.tsx](apps/app/App.tsx), plus `isFooterTab`) extended with
  `'store'`, a new `tabs.store` string in `en.ts`/`pt.ts`/`types.ts`
  ([src/i18n/strings/](apps/app/src/i18n/strings/)), and a new
  `StoreScreen.tsx` wired into `App.tsx`'s panel switch.
  Content: a Hints section reusing `CANGUPA-79`'s existing IAP plumbing
  (`src/iap/hintProducts.ts`, `useHintStore.ts`) — whether
  `HintStorePopup.tsx`'s content moves into the new screen outright or
  the popup stays as a shortcut that opens it is unscoped — and a Packs
  section for `CANGUPA-106`'s not-yet-built pack-unlock purchase, with
  room left for other bundles later. `CANGUPA-106` is still blocked on
  the owner's free/paid pack cut and pricing, so this task's Packs
  section is blocked on the same decision; ship the screen with Hints
  only first, add Packs once that lands.
