import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import Board, { type BoardHandle } from './Board';
import { Game } from '../game/board';
import { tilesOf } from '../game/boardView';
import { DARK } from '../theme/palette';

const palette = DARK;

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

test('tapping a hinted tile reports its cell', async () => {
  const g = new Game(['S1.']);
  const tiles = tilesOf(g, { hints: true });
  const onPressTile = jest.fn();

  await render(
    <Board
      w={g.w}
      h={g.h}
      tiles={tiles}
      rooX={g.x}
      rooY={g.y}
      face="front"
      flip={false}
      palette={palette}
      anim={false}
      onPressTile={onPressTile}
    />,
  );

  await fireEvent.press(screen.getByTestId('tile-press-1-0'));

  expect(onPressTile).toHaveBeenCalledWith(1, 0);
});

test('falls back to a 100% width when none is given', async () => {
  const g = new Game(['S1.']);
  const tiles = tilesOf(g, { hints: true });

  await render(
    <Board w={g.w} h={g.h} tiles={tiles} rooX={g.x} rooY={g.y} face="front" flip={false} palette={palette} anim={false} />,
  );

  const flat = [screen.getByTestId('board').props.style].flat();
  expect(flat.some((s) => s?.width === '100%')).toBe(true);
});

test('uses an explicit width when one is given, capping the board (CANGUPA-33)', async () => {
  const g = new Game(['S1.']);
  const tiles = tilesOf(g, { hints: true });

  await render(
    <Board
      w={g.w}
      h={g.h}
      tiles={tiles}
      rooX={g.x}
      rooY={g.y}
      face="front"
      flip={false}
      palette={palette}
      anim={false}
      width={120}
    />,
  );

  const flat = [screen.getByTestId('board').props.style].flat();
  expect(flat.some((s) => s?.width === 120)).toBe(true);
});

test('a tile that is not a legal destination is not pressable', async () => {
  // A 1x3 row with a gap in the middle and jumps off: x=2 is out of reach.
  const g = new Game(['S.1'], { jumps: false });
  const tiles = tilesOf(g, { hints: true });

  await render(
    <Board w={g.w} h={g.h} tiles={tiles} rooX={g.x} rooY={g.y} face="front" flip={false} palette={palette} anim={false} />,
  );

  expect(screen.queryByTestId('tile-press-2-0')).toBeNull();
});
