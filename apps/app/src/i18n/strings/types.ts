// Every user-facing string in Cangupa (CANGUPA-38), grouped by the screen or
// module that owns it. A templated string is a function instead of a plain
// one, so each locale can order its words, and pluralise, however its own
// grammar needs.
export interface Strings {
  readonly common: {
    readonly back: string;
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
    readonly backToHome: string;
    readonly undo: string;
    readonly restart: string;
    readonly hint: string;
    readonly deadEnd: string;
    readonly undoSomeMoves: string;
    readonly status: (levelNumber: number, totalLevels: number, moves: number, remaining: number) => string;
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
    readonly jumps: string;
    readonly hints: string;
    readonly anim: string;
    readonly clearProgress: string;
    readonly clearProgressTitle: string;
    readonly cancel: string;
    readonly confirmClear: string;
    readonly language: string;
    readonly followDevice: string;
  };
}
