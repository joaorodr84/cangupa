import { fireEvent, render, screen } from '@testing-library/react-native';

import LevelPacksScreen from './LevelPacksScreen';
import { NO_PROGRESS, type Progress } from '../state/progress';
import { DARK } from '../theme/palette';
import { PACK_COLORS } from '../theme/packColors';

const palette = DARK;

test('shows the collection label and one row per pack, with its name', async () => {
  await render(
    <LevelPacksScreen packSizes={[2, 3]} progress={NO_PROGRESS} palette={palette} onOpenPack={jest.fn()} />,
  );

  expect(screen.getByText('Australia')).toBeTruthy();
  expect(screen.getByTestId('pack-1')).toBeTruthy();
  expect(screen.getByTestId('pack-2')).toBeTruthy();
  expect(screen.getByText('Meadow')).toBeTruthy();
  expect(screen.getByText('Creek')).toBeTruthy();
});

test('each pack shows its own level range and cleared count', async () => {
  const progress: Progress = { done: [0, 2], level: 0, bestMoves: {} };
  await render(<LevelPacksScreen packSizes={[2, 3]} progress={progress} palette={palette} onOpenPack={jest.fn()} />);

  // Pack 1 holds levels 1-2 (level 1 done), pack 2 holds levels 3-5 (level 3 done).
  expect(screen.getByText('Levels 1–2 · 1/2 solved')).toBeTruthy();
  expect(screen.getByText('Levels 3–5 · 1/3 solved')).toBeTruthy();
});

test("each pack's swatch is tinted in that pack's own colour", async () => {
  await render(
    <LevelPacksScreen packSizes={[2, 3]} progress={NO_PROGRESS} palette={palette} onOpenPack={jest.fn()} />,
  );

  const first = screen.getByTestId('pack-swatch-1');
  const second = screen.getByTestId('pack-swatch-2');
  expect([first.props.style].flat().some((s) => s?.backgroundColor === PACK_COLORS[0])).toBe(true);
  expect([second.props.style].flat().some((s) => s?.backgroundColor === PACK_COLORS[1])).toBe(true);
});

test('tapping a pack opens it', async () => {
  const onOpenPack = jest.fn();
  await render(
    <LevelPacksScreen packSizes={[2, 3]} progress={NO_PROGRESS} palette={palette} onOpenPack={onOpenPack} />,
  );

  await fireEvent.press(screen.getByTestId('pack-2'));
  expect(onOpenPack).toHaveBeenCalledWith(1);
});
