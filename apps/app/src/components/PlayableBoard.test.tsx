import { fireEvent, render, screen } from '@testing-library/react-native';

import PlayableBoard from './PlayableBoard';
import { type Level, type Rules } from '../game/board';
import { useBoard } from '../game/useBoard';
import { DARK } from '../theme/palette';

const palette = DARK;

// PlayableBoard takes an already-constructed useBoard result (so a screen
// can share one Game with its HUD, see BoardScreen.tsx) — this harness is
// the minimal thing that constructs one for these tests.
function Harness({
  level,
  rules,
  onMoved,
  maxWidth,
  maxHeight,
}: {
  level: Level;
  rules: Rules;
  onMoved?: () => void;
  maxWidth?: number;
  maxHeight?: number;
}) {
  const board = useBoard(level, rules, true);
  return (
    <PlayableBoard
      board={board}
      anim={false}
      palette={palette}
      onMoved={onMoved}
      maxWidth={maxWidth}
      maxHeight={maxHeight}
    />
  );
}

test('tapping the only legal tile moves the kangaroo there', async () => {
  const onMoved = jest.fn();

  await render(<Harness level={['S1']} rules={{ jumps: true }} onMoved={onMoved} />);

  await fireEvent.press(screen.getByTestId('tile-press-1-0'));

  // The level is won in one move, so its only tile is now worn (used up,
  // kangaroo standing on it) rather than still hinted.
  expect(screen.queryByTestId('tile-press-1-0')).toBeNull();
  expect(onMoved).toHaveBeenCalledTimes(1);
});

test('does not call onMoved for a tap with no legal destination', async () => {
  const onMoved = jest.fn();

  await render(<Harness level={['S.1']} rules={{ jumps: false }} onMoved={onMoved} />);

  // With jumps off there is nothing pressable at all — the far tile never renders a Pressable.
  expect(screen.queryByTestId('tile-press-2-0')).toBeNull();
  expect(onMoved).not.toHaveBeenCalled();
});

test('without maxWidth/maxHeight the board falls back to 100% (CANGUPA-33)', async () => {
  await render(<Harness level={['S1.']} rules={{ jumps: true }} />);

  const flat = [screen.getByTestId('board').props.style].flat();
  expect(flat.some((s) => s?.width === '100%')).toBe(true);
});

test('caps the board width when the height available is the tighter fit (landscape, CANGUPA-33)', async () => {
  // ['S1.'] is a 3x1 board (w=3, h=1). 90px of height would let a 3x1 board
  // be 270px wide, well past the 150px of width actually on offer, so width
  // stays the binding constraint here — see the next test for the reverse.
  await render(<Harness level={['S1.']} rules={{ jumps: true }} maxWidth={150} maxHeight={90} />);

  const flat = [screen.getByTestId('board').props.style].flat();
  // 150 width minus the frame's 12px padding on each side.
  expect(flat.some((s) => s?.width === 126)).toBe(true);
});

test('caps the board width by the height available when that is the tighter fit', async () => {
  // Same 3x1 board, but now a generous width and a tight height: a 3x1
  // board as tall as 16px of height can only be 48px wide.
  await render(<Harness level={['S1.']} rules={{ jumps: true }} maxWidth={400} maxHeight={40} />);

  const flat = [screen.getByTestId('board').props.style].flat();
  // (40 - 24) of height available * 3 (w/h) = 48px wide.
  expect(flat.some((s) => s?.width === 48)).toBe(true);
});
