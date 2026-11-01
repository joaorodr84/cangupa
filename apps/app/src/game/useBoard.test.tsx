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
