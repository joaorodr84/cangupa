import { type Strings } from './types';

// The app's original wording (CANGUPA-38), unchanged by the move to a
// strings table.
export const pt: Strings = {
  appTitle: 'Cangupa',
  common: {
    back: '‹ Voltar',
  },
  tabs: {
    home: 'Início',
    levels: 'Níveis',
    stats: 'Estatísticas',
    settings: 'Definições',
  },
  home: {
    level: (number) => `Nível ${number}`,
    play: 'Jogar',
    rules: 'Regras',
  },
  help: {
    heading: 'Regras',
    intro: 'Pisa todas as casas para limpar o nível. Começas na casa marcada com o canguru.',
    stepBold: 'Passo:',
    stepRest: ' move-te uma casa para cima, baixo, esquerda ou direita.',
    jumpBold: 'Salto:',
    jumpRest: ' duas casas em linha reta, por cima de um buraco ou de outra casa.',
    onlyUnused: 'Só podes cair numa casa que ainda não foi usada. Ao saíres de uma casa, ela desaparece.',
    doubleBold: 'Casas duplas',
    doubleRest: ' (douradas) têm de ser pisadas duas vezes: racham à primeira e desaparecem à segunda.',
    outOfMoves: 'Se ficares sem jogadas, desfaz ou reinicia.',
    note: 'Toca numa casa destacada para jogar.',
  },
  stats: {
    heading: 'Estatísticas',
    levelsCleared: (cleared, total) => `Níveis limpos: ${cleared}/${total}`,
    totalMoves: (moves) => `Jogadas totais: ${moves}`,
    empty: 'Ainda sem estatísticas. Joga um nível para começares.',
    level: (number) => `Nível ${number}`,
    moves: (count) => `${count} jogadas`,
  },
  winPopup: {
    levelComplete: 'Nível completo!',
    inMoves: (moves) => `em ${moves} jogadas`,
    nextLevel: 'Próximo nível',
    gameComplete: 'Acabaste o jogo!',
  },
  boardHud: {
    backToHome: 'Voltar ao início',
    undo: 'Desfazer',
    restart: 'Reiniciar',
    hint: 'Dica',
    deadEnd: 'Beco sem saída.',
    undoSomeMoves: 'Desfaz algumas jogadas.',
    status: (levelNumber, totalLevels, moves, remaining) =>
      `Nível ${levelNumber}/${totalLevels} · Jogadas ${moves} · Faltam ${remaining}`,
    stuck: 'Sem jogadas.',
    undoOrRestart: 'Desfaz ou reinicia.',
  },
  settings: {
    heading: 'Definições',
    themeLabels: {
      cosmos: 'Cosmos',
      space: 'Espaço (verde)',
      sand: 'Areia',
      ice: 'Gelo',
      classic: 'Clássico',
    },
    theme: 'Tema',
    gameplay: 'Jogabilidade',
    jumps: 'Saltos de duas casas',
    hints: 'Destacar jogadas possíveis',
    anim: 'Animações',
    clearProgress: 'Apagar progresso',
    clearProgressTitle: 'Apagar todo o progresso?',
    cancel: 'Cancelar',
    confirmClear: 'Apagar',
    language: 'Idioma',
    followDevice: 'Seguir o dispositivo',
  },
};
