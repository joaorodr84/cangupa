import { type Strings } from './types';

// The app's original wording (CANGUPA-38), unchanged by the move to a
// strings table.
export const pt: Strings = {
  common: {
    back: '‹ Voltar',
    backToList: 'Voltar à lista',
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
    doubleBold: 'Casas de ouro',
    doubleRest: ' (amarelas) precisam de duas visitas. Os riscos numa casa mostram quantas visitas ainda lhe restam.',
    steelBold: 'Casas de aço',
    steelRest: ' (azul-acinzentadas) precisam de três visitas.',
    arrowBold: 'Casas com seta',
    arrowRest: ' (cor de framboesa) só se podem deixar pelo lado onde está o triângulo.',
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
    hints: 'Destacar jogadas possíveis',
    anim: 'Animações',
    sound: 'Som',
    fall: 'Cair ao não haver jogada',
    data: 'Dados',
    clearProgress: 'Apagar progresso',
    clearProgressTitle: 'Tens a certeza de que queres apagar o teu progresso?',
    no: 'Não',
    yes: 'Sim',
    language: 'Idioma',
    followDevice: 'Seguir o dispositivo',
  },
  collection: 'O Relevo',
  packs: [
    {
      name: 'Prado',
      blurb: 'Salta de casa em casa e pisa cada uma só uma vez.',
    },
    {
      name: 'Ribeiro',
      blurb: 'Salta por cima de uma casa em falta. As casas de ouro pedem duas visitas.',
    },
    {
      name: 'Barranco',
      blurb: 'As casas de aço aguentam três visitas.',
    },
    {
      name: 'Afloramento',
      blurb: 'Casas de ouro e de aço no mesmo tabuleiro.',
    },
    {
      name: 'Lagoa',
      blurb: 'As casas com seta só se deixam no sentido para onde apontam.',
    },
    {
      name: 'Crista',
      blurb: 'Setas e metais, ouro num nível e aço no seguinte.',
    },
    {
      name: 'Mesa',
      blurb: 'Tabuleiros largos onde um salto errado te deixa preso.',
    },
    {
      name: 'Desfiladeiro',
      blurb: 'Caminhos estreitos e muitas casas de ouro.',
    },
    {
      name: 'Planalto',
      blurb: 'Um tabuleiro grande e percursos longos para planear.',
    },
    {
      name: 'Ermo',
      blurb: 'O maior tabuleiro e os percursos mais longos de todos.',
    },
  ],
  packRange: (first, last, solved, total) => `Níveis ${first}–${last} · ${solved}/${total} resolvidos`,
};
