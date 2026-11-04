import { fireEvent, render, screen } from '@testing-library/react-native';

import LevelsScreen from './LevelsScreen';
import { NO_PROGRESS, type Progress } from '../state/progress';
import { DARK } from '../theme/palette';

const palette = DARK;

test('renders one button per level', async () => {
  await render(
    <LevelsScreen packSizes={[5]} progress={NO_PROGRESS} currentLevel={0} palette={palette} onSelectLevel={jest.fn()} />,
  );

  for (let n = 1; n <= 5; n++) {
    expect(screen.getByText(String(n))).toBeTruthy();
  }
});

test('only the first level is unlocked with no progress', async () => {
  const onSelectLevel = jest.fn();
  await render(
    <LevelsScreen packSizes={[3]} progress={NO_PROGRESS} currentLevel={0} palette={palette} onSelectLevel={onSelectLevel} />,
  );

  await fireEvent.press(screen.getByTestId('level-1'));
  expect(onSelectLevel).toHaveBeenCalledWith(0);

  onSelectLevel.mockClear();
  await fireEvent.press(screen.getByTestId('level-2'));
  expect(onSelectLevel).not.toHaveBeenCalled();
});

test('a level unlocks once the one before it is cleared', async () => {
  const progress: Progress = { done: [0], level: 0, bestMoves: {} };
  const onSelectLevel = jest.fn();
  await render(
    <LevelsScreen packSizes={[3]} progress={progress} currentLevel={0} palette={palette} onSelectLevel={onSelectLevel} />,
  );

  await fireEvent.press(screen.getByTestId('level-2'));
  expect(onSelectLevel).toHaveBeenCalledWith(1);
});

test('a cleared level is marked done', async () => {
  const progress: Progress = { done: [0], level: 1, bestMoves: {} };
  await render(
    <LevelsScreen packSizes={[2]} progress={progress} currentLevel={1} palette={palette} onSelectLevel={jest.fn()} />,
  );

  const done = screen.getByTestId('level-1');
  const flat = [done.props.style].flat();
  expect(flat.some((s) => s?.backgroundColor === palette.control)).toBe(true);
});

test('a locked level has a solid background and dimmed text, not a faded cell', async () => {
  await render(
    <LevelsScreen packSizes={[2]} progress={NO_PROGRESS} currentLevel={0} palette={palette} onSelectLevel={jest.fn()} />,
  );

  const locked = screen.getByTestId('level-2');
  const flat = [locked.props.style].flat();
  expect(flat.some((s) => s?.opacity !== undefined)).toBe(false);
  expect(flat.some((s) => s?.backgroundColor === palette.panel)).toBe(true);
  expect(screen.getByText('2').props.style.color).toBe(palette.muted);
});

test('the current level is outlined in the theme ink colour', async () => {
  const progress: Progress = { done: [0], level: 1, bestMoves: {} };
  await render(
    <LevelsScreen packSizes={[2]} progress={progress} currentLevel={1} palette={palette} onSelectLevel={jest.fn()} />,
  );

  const current = screen.getByTestId('level-2');
  const flat = [current.props.style].flat();
  expect(flat.some((s) => s?.borderColor === palette.ink)).toBe(true);
  expect(flat.some((s) => s?.borderWidth === 2)).toBe(true);
});

// Packs (CANGUPA-56)

test('shows the collection label and one section per pack, with its name', async () => {
  await render(
    <LevelsScreen packSizes={[2, 3]} progress={NO_PROGRESS} currentLevel={0} palette={palette} onSelectLevel={jest.fn()} />,
  );

  expect(screen.getByText('Base')).toBeTruthy();
  expect(screen.getByTestId('pack-1')).toBeTruthy();
  expect(screen.getByTestId('pack-2')).toBeTruthy();
  expect(screen.getByText('Meadow')).toBeTruthy();
  expect(screen.getByText('Creek')).toBeTruthy();
});

test('level numbers run on from one pack to the next', async () => {
  await render(
    <LevelsScreen packSizes={[2, 3]} progress={NO_PROGRESS} currentLevel={0} palette={palette} onSelectLevel={jest.fn()} />,
  );

  // Pack 1 holds levels 1-2 and pack 2 holds 3-5, so the cell for index 2 reads "3", not "1".
  for (let n = 1; n <= 5; n++) {
    expect(screen.getByTestId(`level-${n}`)).toBeTruthy();
  }
  expect(screen.queryByTestId('level-6')).toBeNull();
});

test("each pack counts only its own cleared levels", async () => {
  const progress: Progress = { done: [0, 2], level: 0, bestMoves: {} };
  await render(
    <LevelsScreen packSizes={[2, 3]} progress={progress} currentLevel={0} palette={palette} onSelectLevel={jest.fn()} />,
  );

  expect(screen.getByText('1/2')).toBeTruthy(); // pack 1: level 1 done, level 2 not
  expect(screen.getByText('1/3')).toBeTruthy(); // pack 2: its first level (3) done
});

test("a pack's first level opens once the previous pack's last level is cleared", async () => {
  const onSelectLevel = jest.fn();
  const locked: Progress = { done: [0], level: 0, bestMoves: {} };
  const { rerender } = await render(
    <LevelsScreen packSizes={[2, 3]} progress={locked} currentLevel={0} palette={palette} onSelectLevel={onSelectLevel} />,
  );

  await fireEvent.press(screen.getByTestId('level-3'));
  expect(onSelectLevel).not.toHaveBeenCalled(); // level 2, the last of pack 1, is not cleared yet

  const open: Progress = { done: [0, 1], level: 0, bestMoves: {} };
  await rerender(
    <LevelsScreen packSizes={[2, 3]} progress={open} currentLevel={0} palette={palette} onSelectLevel={onSelectLevel} />,
  );
  await fireEvent.press(screen.getByTestId('level-3'));
  expect(onSelectLevel).toHaveBeenCalledWith(2);
});
