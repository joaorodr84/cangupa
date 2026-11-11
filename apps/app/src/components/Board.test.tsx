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

  const hinted = screen.getByTestId('tile-face-1-0');
  const flat = [hinted.props.style].flat();
  expect(flat.some((s) => s?.borderWidth === 2 && s?.borderColor === palette.ink && s?.borderStyle === 'solid')).toBe(
    true,
  );
});

test('the solver tip keeps its legal-move outline and gains a muted bordered halo outside the tile', async () => {
  // CANGUPA-127: at the owner's request, the tip's outline is a plain bordered View (not SVG) —
  // solid + borderRadius is a combination React Native's native border renderer always handles
  // fine (unlike borderStyle: 'dashed' + borderRadius, confirmed missing entirely on Android),
  // so there's no need to route around the native border system here the way the legal-move
  // outline's own styles.face border doesn't need to either. It's a halo a few percent outside
  // the tile's own footprint (a sibling of the tile, not a child of it, so its percentage
  // geometry is relative to the full cell, not the smaller lip/face boxes) rather than on the
  // tile, so it only ever has to read against the board's one pit colour, never any of the 5
  // tiles' own colours. It uses palette.muted rather than the legal-move outline's own
  // palette.ink — same theme-aware dark-in-light/light-in-dark idea, at a softer shade, so the
  // two outlines read as distinct from each other, not just from the board. The face's own
  // legal-move border no longer turns off for the tip (also at the owner's request): a tip is
  // always a legal move too, and hiding that border used to be a leftover of the border/halo
  // sharing one slot pre-CANGUPA-127, not a deliberate choice — now that the halo is its own
  // element, both can and do show at once.
  const g = new Game(['S1.']);
  const tiles = tilesOf(g, { hints: true, tip: { x: 1, y: 0, jump: false } });

  await render(
    <Board w={g.w} h={g.h} tiles={tiles} rooX={g.x} rooY={g.y} face="front" flip={false} palette={palette} anim={false} />,
  );

  const tipped = screen.getByTestId('tile-face-1-0');
  const flat = [tipped.props.style].flat();
  expect(flat.some((s) => s?.borderWidth === 2 && s?.borderColor === palette.ink && s?.borderStyle === 'solid')).toBe(
    true,
  );

  const halo = screen.getByTestId('tile-tip-outline-1-0');
  // borderColor is set in a separate inline style object from the rest (styles.tipHalo), so
  // merge the array before asserting rather than checking each object individually.
  const haloStyle = Object.assign({}, ...[halo.props.style].flat());
  // top/right/left/bottom: TILE_INSET_SIDE(10)/BOTTOM(14) minus TIP_HALO_GAP(7) = 3/3/3/7.
  expect(haloStyle).toMatchObject({
    borderWidth: 2,
    borderColor: palette.muted,
    borderRadius: 8,
    backgroundColor: 'transparent',
    top: '3%',
    right: '3%',
    bottom: '7%',
    left: '3%',
  });
});

test('a jump destination outlines the same as a step, no dashed treatment', async () => {
  const g = new Game(['S.1']);
  const tiles = tilesOf(g, { hints: true });

  await render(
    <Board w={g.w} h={g.h} tiles={tiles} rooX={g.x} rooY={g.y} face="front" flip={false} palette={palette} anim={false} />,
  );

  const hinted = screen.getByTestId('tile-face-2-0');
  const flat = [hinted.props.style].flat();
  expect(flat.some((s) => s?.borderWidth === 2 && s?.borderStyle === 'solid')).toBe(true);
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
  // A 1x4 row with a two-tile gap: x=3 sits three tiles away, past jump range.
  const g = new Game(['S..1']);
  const tiles = tilesOf(g, { hints: true });

  await render(
    <Board w={g.w} h={g.h} tiles={tiles} rooX={g.x} rooY={g.y} face="front" flip={false} palette={palette} anim={false} />,
  );

  expect(screen.queryByTestId('tile-press-3-0')).toBeNull();
});

test('a tile that is not a legal destination reports its own cell, when a fall handler is given (CANGUPA-64)', async () => {
  // Same shape as the test above, but now with a fall handler: x=3 is out
  // of reach, yet it is still a real tile (unlike x=1/x=2's gap), so a tap
  // there should report its own cell rather than falling through to the
  // board's own blanket onPressEmpty, which has no cell to give.
  const g = new Game(['S..1']);
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

  await fireEvent.press(screen.getByTestId('tile-empty-3-0'));

  expect(onPressEmpty).toHaveBeenCalledWith({ x: 3, y: 0 });
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
  const g = new Game(['S.1']);
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
  // 'S.1': x=1 has no tile at all (tilesOf skips an always-empty cell), so
  // only the board's own blanket Pressable can report it — and now does,
  // from where the tap landed, instead of calling with no target.
  const g = new Game(['S.1']);
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

test('holding on the kangaroo fades it, releasing restores it (CANGUPA-71)', async () => {
  const g = new Game(['S1.']);
  const tiles = tilesOf(g, { hints: true });

  await render(
    <Board w={g.w} h={g.h} tiles={tiles} rooX={g.x} rooY={g.y} face="front" flip={false} palette={palette} anim={false} />,
  );

  const roo = () => [screen.getByTestId('roo').props.style].flat();
  expect(roo().some((s) => s?.opacity === 0.2)).toBe(false);

  await fireEvent(screen.getByTestId('tile-roo-0-0'), 'pressIn');
  expect(roo().some((s) => s?.opacity === 0.2)).toBe(true);

  await fireEvent(screen.getByTestId('tile-roo-0-0'), 'pressOut');
  expect(roo().some((s) => s?.opacity === 0.2)).toBe(false);
});

test('holding elsewhere on the board does not fade the kangaroo', async () => {
  const g = new Game(['S1.']);
  const tiles = tilesOf(g, { hints: true });

  await render(
    <Board w={g.w} h={g.h} tiles={tiles} rooX={g.x} rooY={g.y} face="front" flip={false} palette={palette} anim={false} />,
  );

  await fireEvent(screen.getByTestId('tile-press-1-0'), 'pressIn');

  const flat = [screen.getByTestId('roo').props.style].flat();
  expect(flat.some((s) => s?.opacity === 0.2)).toBe(false);
});

test('holding on the kangaroo still peeks when a fall handler is given (CANGUPA-58 + CANGUPA-71)', async () => {
  const g = new Game(['S1.']);
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

  // With onPressEmpty given, the kangaroo's own cell is wrapped by that
  // Pressable (tile-empty-0-0) rather than the dedicated peek-only one.
  await fireEvent(screen.getByTestId('tile-empty-0-0'), 'pressIn');

  const flat = [screen.getByTestId('roo').props.style].flat();
  expect(flat.some((s) => s?.opacity === 0.2)).toBe(true);
});

test('the kangaroo peek Pressable has no onPress, so a tap there stays a no-op', async () => {
  const g = new Game(['S1.']);
  const tiles = tilesOf(g, { hints: true });

  await render(
    <Board w={g.w} h={g.h} tiles={tiles} rooX={g.x} rooY={g.y} face="front" flip={false} palette={palette} anim={false} />,
  );

  expect(screen.getByTestId('tile-roo-0-0').props.onPress).toBeUndefined();
});
