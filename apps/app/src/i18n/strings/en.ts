import { type Strings } from './types';

// The English translation (CANGUPA-38), the base language the game was
// translated from Portuguese into and the default locale for a device
// whose own language is neither (see locale.ts's FALLBACK_LOCALE). Unlike
// the Portuguese original, moves are pluralised properly, since English
// grammar needs it where Portuguese's "jogadas" doesn't change by count.
export const en: Strings = {
  common: {
    back: '‹ Back',
    backToList: 'Back to the list',
  },
  tabs: {
    home: 'Home',
    levels: 'Levels',
    stats: 'Stats',
    settings: 'Settings',
  },
  home: {
    level: (number) => `Level ${number}`,
    play: 'Play',
    rules: 'Rules',
  },
  help: {
    heading: 'Rules',
    intro: 'Step on every tile to clear the level. You start on the tile marked with the kangaroo.',
    movesSection: 'Moves',
    tilesSection: 'Tiles',
    stepBold: 'Step:',
    stepRest: ' move one tile up, down, left or right.',
    jumpBold: 'Jump:',
    jumpRest: ' two tiles in a straight line, over a gap or over another tile.',
    onlyUnused: 'You can only land on a tile that still has visits left. A tile disappears as soon as you leave it.',
    stuckSection: "When you're stuck",
    doubleBold: 'Gold tiles',
    doubleRest: ' (yellow) need two visits. The strokes on a tile show how many visits it has left.',
    steelBold: 'Steel tiles',
    steelRest: ' (grey-blue) need three visits.',
    signpostBold: 'Signpost tiles',
    signpostRest: ' (green) can only be left through the edge where the triangle is.',
    gateBold: 'Gate tiles',
    gateRest: ' (raspberry) can only be entered through the edge where the triangle is.',
    outOfMoves: 'If you run out of moves, undo or restart.',
    note: 'Tap a highlighted tile to play.',
    stepCaption: 'Solid outline: one step away.',
    jumpGapCaption: 'Dashed outline, over a gap: the middle tile is already gone.',
    jumpTileCaption: 'Dashed outline, over a tile: the middle tile is untouched.',
    buttonsSection: 'Buttons',
    backDesc: 'Leaves the board and returns to wherever you came from.',
    undoDesc: "Takes back your last move. Greyed out until you've made at least one.",
    restartDesc: 'Resets the level to its starting position, no confirmation needed.',
    hintDesc: "Highlights the solver's suggested next move. Greyed out once the level is won.",
    helpDesc: 'Opens this screen without leaving the level — always available, even after winning.',
  },
  stats: {
    levelsCleared: 'Levels cleared',
    levelsClearedValue: (cleared, total) => `${cleared}/${total}`,
    totalMoves: 'Total moves',
    totalMovesValue: (moves) => `${moves}`,
  },
  winPopup: {
    levelComplete: 'Level complete!',
    inMoves: (moves) => `in ${moves} ${moves === 1 ? 'move' : 'moves'}`,
    nextLevel: 'Next level',
    gameComplete: "You've finished the game!",
  },
  boardHud: {
    back: 'Back',
    undo: 'Undo',
    restart: 'Restart',
    hint: 'Hint',
    help: 'Help',
    deadEnd: 'Dead end.',
    undoSomeMoves: 'Undo a few moves.',
    level: (levelNumber) => `Level ${levelNumber}`,
    moves: (moves) => `Moves ${moves}`,
    stuck: 'No moves left.',
    undoOrRestart: 'Undo or restart.',
  },
  settings: {
    appearance: 'Appearance',
    light: 'Light',
    dark: 'Dark',
    gameplay: 'Gameplay',
    hints: 'Highlight possible moves',
    anim: 'Animations',
    sound: 'Sound',
    fall: 'Fall when there is no move',
    data: 'Data',
    clearProgress: 'Clear progress',
    clearProgressTitle: 'Are you sure you want to clear your progress?',
    no: 'No',
    yes: 'Yes',
    language: 'Language',
    followDevice: 'Follow the device',
  },
  collection: 'Lay of the Land',
  packs: [
    {
      name: 'Meadow',
      blurb: 'Hop from tile to tile and visit each one once.',
    },
    {
      name: 'Creek',
      blurb: 'Jump over a missing tile. Gold tiles need two visits.',
    },
    {
      name: 'Gully',
      blurb: 'Steel tiles hold on for three visits.',
    },
    {
      name: 'Outcrop',
      blurb: 'Gold and steel tiles share the board.',
    },
    {
      name: 'Billabong',
      blurb: 'Signpost tiles can only be left the way they point.',
    },
    {
      name: 'Ridge',
      blurb: 'Signposts and metals, gold on one level and steel on the next.',
    },
    {
      name: 'Mesa',
      blurb: 'Gate tiles can only be entered from one side.',
    },
    {
      name: 'Gorge',
      blurb: 'Gates and metals, gold on one level and steel on the next.',
    },
    {
      name: 'Plateau',
      blurb: 'A bigger board with gold and steel tiles throughout.',
    },
    {
      name: 'Outback',
      blurb: 'The biggest board and the longest walks of all, with gold and steel throughout.',
    },
  ],
  packRange: (first, last, solved, total) => `Levels ${first}–${last} · ${solved}/${total} solved`,
};
