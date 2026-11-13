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
  };
  readonly tabs: {
    readonly home: string;
    readonly levels: string;
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
    // Shown the same way (CANGUPA-130/132) once no legal moves remain at
    // all — used to swap in above the board, in BoardHud's own status line
    // (CANGUPA-53), as boardHud.stuck/undoOrRestart; moved down here once
    // the message area below the board reserved its own room.
    readonly noMovesLeft: string;
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
