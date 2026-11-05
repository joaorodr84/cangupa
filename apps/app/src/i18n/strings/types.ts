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
    readonly stepBold: string;
    readonly stepRest: string;
    readonly jumpBold: string;
    readonly jumpRest: string;
    readonly onlyUnused: string;
    readonly doubleBold: string;
    readonly doubleRest: string;
    readonly steelBold: string;
    readonly steelRest: string;
    readonly signpostBold: string;
    readonly signpostRest: string;
    readonly gateBold: string;
    readonly gateRest: string;
    readonly outOfMoves: string;
    readonly note: string;
  };
  readonly stats: {
    readonly levelsCleared: string;
    readonly levelsClearedValue: (cleared: number, total: number) => string;
    readonly totalMoves: string;
    readonly totalMovesValue: (moves: number) => string;
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
    readonly deadEnd: string;
    readonly undoSomeMoves: string;
    readonly level: (levelNumber: number) => string;
    readonly moves: (moves: number) => string;
    readonly stuck: string;
    readonly undoOrRestart: string;
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
  // The pack row's own range/progress line on LevelPacksScreen (CANGUPA-73),
  // matching DigiSpin's own packs.range wording: "Levels 1–25 · 5/25 solved".
  readonly packRange: (first: number, last: number, solved: number, total: number) => string;
}
