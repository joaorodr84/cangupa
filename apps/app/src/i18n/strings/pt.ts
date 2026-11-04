import { type Strings } from './types';

// The app's original wording (CANGUPA-38), unchanged by the move to a
// strings table.
export const pt: Strings = {
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
    levelsCleared: 'Níveis limpos',
    levelsClearedValue: (cleared, total) => `${cleared}/${total}`,
    totalMoves: 'Jogadas totais',
    totalMovesValue: (moves) => `${moves}`,
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
    level: (levelNumber) => `Nível ${levelNumber}`,
    moves: (moves) => `Jogadas ${moves}`,
    stuck: 'Sem jogadas.',
    undoOrRestart: 'Desfaz ou reinicia.',
  },
  settings: {
    appearance: 'Aparência',
    light: 'Claro',
    dark: 'Escuro',
    gameplay: 'Jogabilidade',
    jumps: 'Saltos de duas casas',
    hints: 'Destacar jogadas possíveis',
    anim: 'Animações',
    sound: 'Som',
    data: 'Dados',
    clearProgress: 'Apagar progresso',
    clearProgressTitle: 'Tens a certeza de que queres apagar o teu progresso?',
    no: 'Não',
    yes: 'Sim',
    language: 'Idioma',
    followDevice: 'Seguir o dispositivo',
  },
};
