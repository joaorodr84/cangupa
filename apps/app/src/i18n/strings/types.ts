// Every user-facing string in Cangupa (CANGUPA-38), grouped by the screen or
// module that owns it. A templated string is a function instead of a plain
// one, so each locale can order its words, and pluralise, however its own
// grammar needs.
export interface Strings {
  readonly common: {
    readonly back: string;
    // The level packs screen's own back arrow (CANGUPA-73), returning from
    // one pack's level grid to the pack list — distinct from `back` above,
    // which always exits to the board.
    readonly backToList: string;
    // Popup.tsx's own ✕ close button (CANGUPA-137): shared by every popup
    // (WinPopup, HelpPopup, the clear-progress confirmation), so a screen
    // reader has a word for it instead of announcing the glyph itself.
    readonly close: string;
  };
  readonly tabs: {
    readonly home: string;
    readonly levels: string;
    // The Store tab (CANGUPA-147), sitting between Levels and Stats in the
    // footer tray — a single consolidated entry point for every in-app
    // purchase, rather than hints and (eventually) packs each getting their
    // own.
    readonly store: string;
    readonly stats: string;
    readonly settings: string;
  };
  readonly home: {
    readonly level: (number: number) => string;
    readonly play: string;
    readonly rules: string;
  };
  readonly help: {
    readonly heading: string;
    readonly intro: string;
    // Section labels (CANGUPA-101): grouping the flat rule list the way
    // SettingsScreen.tsx groups its own rows, so new tile types keep adding
    // their own line under "Tiles" instead of growing one undifferentiated list.
    readonly movesSection: string;
    readonly tilesSection: string;
    readonly stepBold: string;
    readonly stepRest: string;
    readonly jumpBold: string;
    readonly jumpRest: string;
    readonly onlyUnused: string;
    readonly doubleBold: string;
    readonly doubleRest: string;
    readonly steelBold: string;
    readonly steelRest: string;
    readonly departureBold: string;
    readonly departureRest: string;
    readonly arrivalBold: string;
    readonly arrivalRest: string;
    readonly note: string;
    // Captions under the Step/Jump mini-boards (CANGUPA-109) — built from the
    // board's own Tile rendering rather than described in stepRest/jumpRest
    // alone, which stay as the one combined explanation of the jump rule.
    readonly stepCaption: string;
    readonly jumpGapCaption: string;
    readonly jumpTileCaption: string;
    // The board screen's own controls (CANGUPA-109), explained here with
    // their real icons — boardHud.undo/restart/hint/help already name them,
    // these are just what each one does and when it's disabled. Back
    // (CANGUPA-118 dropped it from this list) isn't one of them.
    readonly buttonsSection: string;
    readonly undoDesc: string;
    readonly restartDesc: string;
    readonly hintDesc: string;
    readonly helpDesc: string;
  };
  readonly stats: {
    readonly levelsCleared: string;
    readonly levelsClearedValue: (cleared: number, total: number) => string;
    readonly totalMoves: string;
    readonly totalMovesValue: (moves: number) => string;
    readonly hintsUsed: string;
    readonly hintsUsedValue: (hints: number) => string;
    readonly undosUsed: string;
    readonly undosUsedValue: (undos: number) => string;
    // Lifetime time played (CANGUPA-143), shown as whole hours and minutes
    // rather than anything finer — nobody needs this stat to the second.
    readonly timePlayed: string;
    readonly timePlayedValue: (hours: number, minutes: number) => string;
    // The per-pack cleared/best-moves breakdown (CANGUPA-141), below the
    // summary rows above — one row per entry in packs below, in the same
    // order.
    readonly perPack: string;
    readonly perPackValue: (cleared: number, total: number, moves: number) => string;
    // The longest run of consecutive days with at least one level cleared
    // (CANGUPA-144).
    readonly longestStreak: string;
    readonly longestStreakValue: (days: number) => string;
  };
  // The achievement card grid shown on the Stats screen (CANGUPA-90),
  // displayed the same way as DigiSpin's own (StatsScreen.tsx,
  // achievementGrid.ts) — `items` has one entry per
  // src/state/achievements.ts's own ACHIEVEMENTS array, in the same order;
  // an achievementsText.test.ts keeps the two in step, the same convention
  // packText.test.ts already holds en/pt.packs to against game/packs.ts.
  readonly achievements: {
    readonly heading: string;
    // A card's own accessibility label (DigiSpin's own
    // t.stats.achievementStatus): one element covering its icon, title and
    // description, rather than a screen reader landing on each in turn.
    readonly achievementStatus: (title: string, earned: boolean) => string;
    // "Earned on dd/mm/yyyy" under an earned card's description — empty,
    // not shown at all, for an unearned one, or an earned one from before
    // CANGUPA-90's earnedDates existed.
    readonly earnedOn: (date: string) => string;
    readonly items: readonly {
      readonly title: string;
      readonly description: string;
    }[];
  };
  readonly winPopup: {
    readonly levelComplete: string;
    readonly inMoves: (moves: number) => string;
    readonly nextLevel: string;
    readonly gameComplete: string;
  };
  readonly boardHud: {
    readonly back: string;
    readonly undo: string;
    readonly restart: string;
    readonly hint: string;
    // Opens a Help popup over the board (CANGUPA-121, replacing the
    // navigation CANGUPA-103 wired here, which unmounted BoardScreen and so
    // restarted the level). Distinct from the home screen's own Rules
    // button (CANGUPA-29), which still opens the full rules screen.
    readonly help: string;
    readonly deadEnd: string;
    readonly undoSomeMoves: string;
    readonly level: (levelNumber: number) => string;
    readonly moves: (moves: number) => string;
    // The small ‹/› arrows below the board (CANGUPA-85), porting
    // apps/web-classic's own prev/next toolbar buttons — distinct from
    // winPopup.nextLevel, which labels a full-width button rather than an
    // icon-only one.
    readonly previousLevel: string;
    readonly nextLevel: string;
    // The hint button's own accessibility label once the balance is 0
    // (CANGUPA-79): the icon itself doesn't change, only what pressing it
    // does — opens the store instead of spending a hint — so a screen
    // reader needs the label to say so.
    readonly buyHints: string;
    // The directional pad (CANGUPA-152), an addition alongside tap rather
    // than a replacement for it — the same relationship apps/web-classic's
    // own WASD/arrow-key mode (CANGUPA-66) has to its tap/click input.
    readonly moveUp: string;
    readonly moveDown: string;
    readonly moveLeft: string;
    readonly moveRight: string;
  };
  readonly board: {
    // Shown in the board's own reserved message area below it (CANGUPA-129,
    // CANGUPA-132), not in boardHud's own status line above it, when a
    // tapped move is blocked by a Departure/Arrival arrow rule rather than
    // falling — the fall setting's own fall-through only applies when
    // there's genuinely nothing to land on. Phrasing matches
    // help.departureRest/arrivalRest's "the edge the bracket opens on", the
    // same term the Rules screen already uses for this.
    readonly blockedDeparture: string;
    readonly blockedArrival: string;
    // A Pillar (CANGUPA-159) is in the way: the tap was on the pillar itself, or on a jump
    // that would pass over one.
    readonly blockedPillar: string;
    // A jump was tried from a Mud tile (CANGUPA-160), which can only be stepped off.
    readonly blockedMud: string;
    // Shown the same way (CANGUPA-130/132) once no legal moves remain at
    // all — used to swap in above the board, in BoardHud's own status line
    // (CANGUPA-53), as boardHud.stuck/undoOrRestart; moved down here once
    // the message area below the board reserved its own room.
    readonly noMovesLeft: string;
    // Per-tile accessibility label pieces (CANGUPA-149, design from
    // CANGUPA-140), composed by boardView.ts's tileAccessibilityLabel from a
    // TileView — these are fragments, never spoken on their own. Position
    // first, then exactly one of tileGone/tileHere*/tileDeparture/
    // tileArrival/tileCommon/tileGold/tileSteel, then tileSuggestedMove when
    // the tile is the solver's own tip.
    readonly tilePosition: (row: number, column: number) => string;
    readonly tileGone: string;
    readonly tileHereCommon: string;
    readonly tileHereGold: string;
    readonly tileHereSteel: string;
    readonly tileCommon: string;
    readonly tileGold: (left: number) => string;
    readonly tileSteel: (left: number) => string;
    // Phrasing matches help.departureRest/arrivalRest's own "opens"/edge
    // language, naming the specific edge this one tile opens on rather than
    // the Rules screen's generic "the edge the bracket opens on".
    readonly tileDeparture: (direction: string) => string;
    readonly tileArrival: (direction: string) => string;
    // A Pillar's own label (CANGUPA-159), after the same tilePosition lead-in a tile gets.
    // A Mud tile (CANGUPA-160) and the same tile while the kangaroo stands on it. Both say the
    // rule, since the mark on the tile (two wavy lines) only says "wet ground".
    readonly tileMud: string;
    readonly tileHereMud: string;
    readonly pillar: string;
    readonly tileSuggestedMove: string;
    readonly directionTop: string;
    readonly directionBottom: string;
    readonly directionLeft: string;
    readonly directionRight: string;
  };
  readonly settings: {
    // The light/dark/system choice (CANGUPA-40), matching DigiSpin's own
    // naming for the same three-way appearance setting.
    readonly appearance: string;
    readonly light: string;
    readonly dark: string;
    readonly gameplay: string;
    readonly hints: string;
    readonly anim: string;
    readonly sound: string;
    readonly fall: string;
    readonly directionalPad: string;
    readonly data: string;
    readonly clearProgress: string;
    readonly clearProgressTitle: string;
    readonly no: string;
    readonly yes: string;
    readonly language: string;
    readonly followDevice: string;
    // The store entry point under its own section (CANGUPA-79), alongside
    // the one already reachable from BoardHud's hint button at 0 balance —
    // this one for stocking up ahead of time rather than only when stuck.
    readonly hintStoreSection: string;
    readonly buyHints: string;
  };
  // The hint-pack popup (CANGUPA-79), reachable from BoardHud's hint button
  // once the balance is 0 and from its own Settings section.
  readonly hintStore: {
    readonly heading: string;
    // Shown in place of the product rows until react-native-iap's
    // connection comes up — on a device with no native IAP build (Expo Go)
    // this never resolves, which is expected, not an error state.
    readonly connecting: string;
    readonly buy: string;
    // Pluralised (CANGUPA-79 reuses winPopup.inMoves' "1 move"/"N moves"
    // pattern) since the product list always shows a count, not just "Buy".
    readonly hintsLabel: (count: number) => string;
    readonly error: string;
    // The reward-video row (CANGUPA-78), alongside the purchase rows above —
    // its own loaded/not-yet-loaded button label and its own error, since a
    // failed ad load isn't "the purchase" the shared `error` string names.
    readonly watchAd: string;
    readonly watchAdLoading: string;
    readonly adError: string;
  };
  // The level packs (CANGUPA-56), in play order: entry n is pack n + 1 in
  // src/game/packs.ts, whose own English name and blurb are the same text as
  // en.ts. A test keeps the two lists the same length.
  //
  // `collection` is the label shown above the pack grid. A collection is only a
  // name for the packs under it: no list of packs, no stored state, and packs
  // carry no field pointing at it. It exists so a second collection (a paid
  // expansion, say) has a name to show without restructuring how packs work.
  readonly collection: string;
  readonly packs: readonly {
    readonly name: string;
    readonly blurb: string;
  }[];
  // The pack row's own range line on LevelPacksScreen (CANGUPA-73): "Levels
  // 1–25". It carried the progress too ("· 5/25 solved", DigiSpin's own
  // packs.range wording) until CANGUPA-133 moved that to a bare "5/25" on
  // the row's right-hand side, which needs no translated word at all.
  readonly packRange: (first: number, last: number) => string;
}
