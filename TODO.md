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
- [P3] `CANGUPA-149` — Implement screen-reader semantics for `apps/app`'s
  board tiles (`Board.tsx`'s `Tile`), per the design `CANGUPA-140`
  worked out without shipping code. Today a tile is wrapped in a
  `Pressable` only when it's a legal destination (`tile.hint`), an
  empty/no-move tile with the fall setting on, or the kangaroo's own
  tile (for peek) — anything else (a used-up "gone" tile, a legal-move
  tile with hints off, any tile once the board's layout order is
  followed) renders as a bare, non-focusable `View`, so a screen reader
  cannot explore the board at all between moves, only land on whatever
  happens to already be interactive.

  The design, worked out against the real shapes in `boardView.ts`'s
  `TileView` and `board.ts`'s `Move`/`moveKind`:
  1. **Every existing tile becomes an accessible element**, not just
     today's pressable ones — `accessibilityRole="button"` on every
     cell with a tile at all (`game.max[i]` truthy, the same check
     `tilesOf` already uses to skip a cell with none), `gone` tiles
     included, so swiping through the board announces every square in
     its real left-to-right, top-to-bottom order (the same order
     `tiles.map` already renders in, which needs no change for this —
     React Native's default accessibility traversal follows render
     order, not on-screen position). `accessibilityState={{ disabled:
     !tile.hint }}` on a non-legal tile, rather than leaving it
     unwrapped, so VoiceOver/TalkBack read it as present but
     unavailable instead of invisible. The existing `onPress` wiring
     needs no change at all: double-tapping an enabled element is the
     platform's own way of "tapping" it, so the same destination-tap
     input model stays exactly as it is for a sighted player — no
     redesign of *how* a move is made, only of what gets exposed to
     explore and target it. (A directional-pad alternative is
     `CANGUPA-98`'s own, separate, motor-accessibility angle — not a
     substitute for this and not revisited here.)
  2. **Label composition**, built from fields `TileView` already
     carries, in this order: position ("Row Y, column X", 1-based,
     matching the 1-based numbering `boardHud.level`/`help` already use
     elsewhere), then one of — `gone`: "Gone, already used"; `worn`:
     "Common/Gold/Steel tile, you are here"; an arrow tile: "Departure
     tile, opens to the {direction}" / "Arrival tile, opens to the
     {direction}" (reusing the exact "opens to"/edge phrasing
     `help.departureRest`/`arrivalRest` already use, not a new
     metaphor); otherwise "Common tile" / "Gold tile, N visits left" /
     "Steel tile, N visits left" (`kind`/`left`). `tile.tip` (the
     solver's suggested move) appends "Suggested move". New `en`/`pt`
     i18n strings for every fragment above, following `packText.test.ts`'s
     own convention of a test that keeps the two locales in step.
  3. **Open decision for whoever picks this up, not resolved here**:
     whether a tile's legal/illegal state (`tile.hint`) is exposed via
     accessibility *regardless* of the `hints` setting. Visually, the
     legal-move outline only shows when `hints` is on (`settings.hints`)
     — a sighted player with hints off plays by trial and error. A
     screen-reader user has no equivalent "find it by eye" fallback, so
     always exposing legality (ignoring the `hints` setting for
     accessibility purposes specifically) is the recommended default,
     but it is a real behavioural choice, not a code-level one, and
     belongs to the owner.
  4. **Unscoped, left for whoever picks this up**: whether `tile.jump`
     (a legal destination reached by a jump rather than a step) is
     worth its own announcement — flagged as a nice-to-have, not
     required for a baseline "the board is explorable and playable"
     fix. No on-device VoiceOver/TalkBack testing has been done against
     this design; it should be verified on a real device once
     implemented, not assumed correct from the shapes above alone.
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
- [P3] `CANGUPA-151` — Two fixed-height text containers in `apps/app`
  don't grow with a larger OS font-scale setting, risking clipped/
  truncated text instead of a layout that simply grows with it — found
  by `CANGUPA-97`'s dynamic-type check, which otherwise confirmed every
  `Text` already respects OS font scaling by default (no
  `allowFontScaling={false}`/`maxFontSizeMultiplier` anywhere in
  `src/`): `StatsScreen.tsx`'s achievement card description
  (`height: 18 * 3`, `numberOfLines={3}`) and `LevelsScreen.tsx`'s grid
  cell label (`height: 38`, `lineHeight: 22`, a level number). Needs an
  on-device check at a large accessibility text size to confirm actual
  clipping before deciding the fix (let the container grow, or cap at a
  `maxFontSizeMultiplier` that still fits).
- [P2] `CANGUPA-152` — Build a directional-pad control scheme for
  `apps/app`, as an addition alongside tap rather than a replacement —
  the same relationship `apps/web-classic`'s existing `WASD`/arrow-key
  mode (`CANGUPA-66`) has to its own tap/click input. Found feasible by
  `CANGUPA-98`'s investigation without new game-logic infrastructure:
  [board.ts](apps/app/src/game/board.ts)'s `legalMoves()` already
  returns axis-aligned `Move[]` (the 4 cardinal directions in `DIRS`),
  so a press of up/down/left/right just needs to pick whichever
  `legalMoves()` entry sits in that direction from the kangaroo's own
  position and feed it through the same `play()`/`onPressTile` path
  [PlayableBoard.tsx](apps/app/src/components/PlayableBoard.tsx) already
  wires up. One real wrinkle to resolve, not a code-level given:
  `legalMoves()` can return both a step (`d===1`) and a jump (`d===2`)
  in the same direction at once, so a directional press needs an
  explicit tie-break — defaulting to the step, as the more conservative
  of the two, is the recommended choice. `CANGUPA-100`'s scoping pass
  had folded a "one-handed use" angle into this same investigation: a
  directional pad covers that too, no separate work needed.
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
  anywhere in `apps/app` today, and Expo/React Native has no first-party
  hardware-keyboard or MFi-controller API of its own, so this needs a
  new native dependency and config plugin — the same shape of lift
  `CANGUPA-78`'s ad SDK was — without a specific library picked or
  researched yet. Surfaced by `CANGUPA-98`'s motor-accessibility
  investigation; still fully unscoped, speculative relative to the two
  items above until there's a concrete library choice to evaluate.
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
