import { createRef } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

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

test('a tile that is not a legal destination reports its own cell, when a fall handler is given (CANGUPA-64)', async () => {
  // Same shape as the test above, but now with a fall handler: x=2 is out
  // of reach, yet it is still a real tile (unlike x=1's gap), so a tap
  // there should report its own cell rather than falling through to the
  // board's own blanket onPressEmpty, which has no cell to give.
  const g = new Game(['S.1'], { jumps: false });
  const tiles = tilesOf(g, { hints: true });
  const onPressEmpty = jest.fn();

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
      onPressEmpty={onPressEmpty}
    />,
  );

  await fireEvent.press(screen.getByTestId('tile-empty-2-0'));

  expect(onPressEmpty).toHaveBeenCalledWith({ x: 2, y: 0 });
});

test('fall() does not throw and calls onComplete (CANGUPA-58)', async () => {
  const g = new Game(['S1.']);
  const tiles = tilesOf(g, { hints: true });
  const ref = createRef<BoardHandle>();
  const onComplete = jest.fn();

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

  await act(async () => {
    expect(() => ref.current?.fall(onComplete)).not.toThrow();
    await new Promise((resolve) => setTimeout(resolve, 600));
  });
  expect(onComplete).toHaveBeenCalledTimes(1);
});

test('tapping empty board space reports it, when a handler is given (CANGUPA-58)', async () => {
  // A 1x3 row with a gap in the middle and jumps off: x=2 has no element at
  // all (tilesOf skips an always-empty cell), so a tap there only reaches
  // the board's own Pressable, not a tile's.
  const g = new Game(['S.1'], { jumps: false });
  const tiles = tilesOf(g, { hints: true });
  const onPressEmpty = jest.fn();

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
      onPressEmpty={onPressEmpty}
    />,
  );

  await fireEvent.press(screen.getByTestId('board'));

  expect(onPressEmpty).toHaveBeenCalledTimes(1);
});

test('a tap on true background reports the cell under it, once the board is measured (CANGUPA-66)', async () => {
  // 'S.1', jumps on: x=1 has no tile at all (tilesOf skips an always-empty
  // cell), so only the board's own blanket Pressable can report it — and
  // now does, from where the tap landed, instead of calling with no target.
  const g = new Game(['S.1'], { jumps: true });
  const tiles = tilesOf(g, { hints: true });
  const onPressEmpty = jest.fn();

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
      onPressEmpty={onPressEmpty}
    />,
  );

  const board = screen.getByTestId('board');
  // A 300x100 px board, 3 columns wide: x=1 spans the middle third, [100, 200).
  await act(async () => {
    fireEvent(board, 'layout', { nativeEvent: { layout: { width: 300, height: 100 } } });
  });
  await fireEvent.press(board, { nativeEvent: { locationX: 150, locationY: 50 } });

  expect(onPressEmpty).toHaveBeenCalledWith({ x: 1, y: 0 });
});

test('tapping a hinted tile does not also report an empty-space press', async () => {
  const g = new Game(['S1.']);
  const tiles = tilesOf(g, { hints: true });
  const onPressTile = jest.fn();
  const onPressEmpty = jest.fn();

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
      onPressEmpty={onPressEmpty}
    />,
  );

  await fireEvent.press(screen.getByTestId('tile-press-1-0'));

  expect(onPressTile).toHaveBeenCalledWith(1, 0);
  expect(onPressEmpty).not.toHaveBeenCalled();
});
