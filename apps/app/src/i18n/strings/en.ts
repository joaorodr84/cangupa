import { type Strings } from './types';

// The English translation (CANGUPA-38), the base language the game was
// translated from Portuguese into and the default locale for a device
// whose own language is neither (see locale.ts's FALLBACK_LOCALE). Unlike
// the Portuguese original, moves are pluralised properly, since English
// grammar needs it where Portuguese's "jogadas" doesn't change by count.
export const en: Strings = {
  common: {
    back: '‹ Back',
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
    stepBold: 'Step:',
    stepRest: ' move one tile up, down, left or right.',
    jumpBold: 'Jump:',
    jumpRest: ' two tiles in a straight line, over a gap or over another tile.',
    onlyUnused: 'You can only land on a tile that still has visits left. A tile disappears as soon as you leave it.',
    doubleBold: 'Double tiles',
    doubleRest: ' (gold) need two visits: they crack on the first and vanish on the second.',
    outOfMoves: 'If you run out of moves, undo or restart.',
    note: 'Tap a highlighted tile to play.',
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
    backToHome: 'Back to home',
    undo: 'Undo',
    restart: 'Restart',
    hint: 'Hint',
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
    jumps: 'Two-tile jumps',
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
};
