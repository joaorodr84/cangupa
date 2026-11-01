import { createRef } from 'react';
import { render, screen } from '@testing-library/react-native';

import Board, { type BoardHandle } from './Board';
import { Game } from '../game/board';
import { tilesOf } from '../game/boardView';
import { paletteFor } from '../theme/palette';

const palette = paletteFor('cosmos');

test('renders one tile view per existing cell', async () => {
  const g = new Game(['S1.']);
  const tiles = tilesOf(g, { hints: true });

  await render(
    <Board w={g.w} h={g.h} tiles={tiles} rooX={g.x} rooY={g.y} face="front" flip={false} palette={palette} anim={false} />,
  );

  expect(screen.getByTestId('tile-0-0')).toBeTruthy();
  expect(screen.getByTestId('tile-1-0')).toBeTruthy();
});

test('a legal destination is outlined as a hint', async () => {
  const g = new Game(['S1.']);
  const tiles = tilesOf(g, { hints: true });

  await render(
    <Board w={g.w} h={g.h} tiles={tiles} rooX={g.x} rooY={g.y} face="front" flip={false} palette={palette} anim={false} />,
  );

  const hinted = screen.getByTestId('tile-1-0');
  const flat = [hinted.props.style].flat();
  expect(flat.some((s) => s?.borderWidth === 3)).toBe(true);
});

test('a used tile left behind is faded out', async () => {
  const g = new Game(['S1']);
  g.play({ x: 1, y: 0 });
  const tiles = tilesOf(g, { hints: true });

  await render(
    <Board w={g.w} h={g.h} tiles={tiles} rooX={g.x} rooY={g.y} face="front" flip={false} palette={palette} anim={false} />,
  );

  const left = screen.getByTestId('tile-0-0');
  const flat = [left.props.style].flat();
  expect(flat.some((s) => s?.opacity === 0)).toBe(true);
});

test('hop() does not throw when animations are off', async () => {
  const g = new Game(['S1.']);
  const tiles = tilesOf(g, { hints: true });
  const ref = createRef<BoardHandle>();

  await render(
    <Board
      ref={ref}
      w={g.w}
      h={g.h}
      tiles={tiles}
      rooX={g.x}
      rooY={g.y}
      face="front"
      flip={false}
      palette={palette}
      anim={false}
    />,
  );

  expect(() => ref.current?.hop()).not.toThrow();
});
