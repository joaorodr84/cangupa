import { act, renderHook } from '@testing-library/react-native';

import { useBoard } from './useBoard';

test('starts at the level start, facing front', async () => {
  const { result } = await renderHook(() => useBoard(['S1.'], { jumps: true }, true));
  expect(result.current.game.x).toBe(0);
  expect(result.current.game.y).toBe(0);
  expect(result.current.facing).toEqual({ face: 'front', flip: false });
});

test('a tap on a legal destination plays the move and updates facing', async () => {
  const { result } = await renderHook(() => useBoard(['S1.'], { jumps: true }, true));

  let played = false;
  await act(async () => {
    played = result.current.move(1, 0);
  });

  expect(played).toBe(true);
  expect(result.current.game.x).toBe(1);
  expect(result.current.facing).toEqual({ face: 'side', flip: false });
});

test('a tap outside the legal destinations is a no-op', async () => {
  const { result } = await renderHook(() => useBoard(['S1.'], { jumps: false }, true));

  let played = false;
  await act(async () => {
    played = result.current.move(2, 0);
  });

  expect(played).toBe(false);
  expect(result.current.game.x).toBe(0);
});

test('no move plays once the level is won', async () => {
  const { result } = await renderHook(() => useBoard(['S1'], { jumps: true }, true));

  await act(async () => {
    result.current.move(1, 0);
  });
  expect(result.current.won).toBe(true);

  let played = true;
  await act(async () => {
    played = result.current.move(0, 0);
  });
  expect(played).toBe(false);
});

test('hints off reports no hinted tiles even though moves are legal', async () => {
  const { result } = await renderHook(() => useBoard(['S1.'], { jumps: true }, false));
  expect(result.current.tiles.every((t) => !t.hint)).toBe(true);
});

test('tracks moves played and tiles remaining', async () => {
  const { result } = await renderHook(() => useBoard(['S11'], { jumps: true }, true));
  expect(result.current.moves).toBe(0);
  expect(result.current.remaining).toBe(2);

  await act(async () => {
    result.current.move(1, 0);
  });
  expect(result.current.moves).toBe(1);
  expect(result.current.remaining).toBe(1);
});

test('undo restores the previous position and can undo reports false once exhausted', async () => {
  const { result } = await renderHook(() => useBoard(['S11'], { jumps: true }, true));
  expect(result.current.canUndo).toBe(false);

  await act(async () => {
    result.current.move(1, 0);
  });
  expect(result.current.canUndo).toBe(true);

  await act(async () => {
    result.current.undo();
  });
  expect(result.current.game.x).toBe(0);
  expect(result.current.canUndo).toBe(false);
});

test('reset returns to the start with an empty history', async () => {
  const { result } = await renderHook(() => useBoard(['S11'], { jumps: true }, true));

  await act(async () => {
    result.current.move(1, 0);
    result.current.reset();
  });

  expect(result.current.game.x).toBe(0);
  expect(result.current.canUndo).toBe(false);
});

test('hint sets the tip to the solver\'s first move', async () => {
  const { result } = await renderHook(() => useBoard(['S11'], { jumps: true }, true));

  await act(async () => {
    result.current.hint();
  });

  expect(result.current.tip).toEqual({ x: 1, y: 0, jump: false });
  expect(result.current.hintFailed).toBe(false);
  expect(result.current.tiles.find((t) => t.x === 1)?.tip).toBe(true);
});

test('hint reports a dead end when no solution remains, and a move clears it', async () => {
  // S.1 with jumps off: the only tile left is unreachable, so solve() fails.
  const { result } = await renderHook(() => useBoard(['S.1'], { jumps: false }, true));

  await act(async () => {
    result.current.hint();
  });
  expect(result.current.hintFailed).toBe(true);
  expect(result.current.tip).toBeNull();
});

test('a played move clears a pending hint and hintFailed', async () => {
  const { result } = await renderHook(() => useBoard(['S11'], { jumps: true }, true));

  await act(async () => {
    result.current.hint();
  });
  expect(result.current.tip).not.toBeNull();

  await act(async () => {
    result.current.move(1, 0);
  });
  expect(result.current.tip).toBeNull();
  expect(result.current.hintFailed).toBe(false);
});
