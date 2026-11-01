import { fireEvent, render, screen } from '@testing-library/react-native';

import PlayableBoard from './PlayableBoard';
import { type Level, type Rules } from '../game/board';
import { useBoard } from '../game/useBoard';
import { paletteFor } from '../theme/palette';

const palette = paletteFor('cosmos');

// PlayableBoard takes an already-constructed useBoard result (so a screen
// can share one Game with its HUD, see BoardScreen.tsx) — this harness is
// the minimal thing that constructs one for these tests.
function Harness({ level, rules, onMoved }: { level: Level; rules: Rules; onMoved?: () => void }) {
  const board = useBoard(level, rules, true);
  return <PlayableBoard board={board} anim={false} palette={palette} onMoved={onMoved} />;
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
