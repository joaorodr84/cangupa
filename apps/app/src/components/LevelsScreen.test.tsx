import { fireEvent, render, screen } from '@testing-library/react-native';

import LevelsScreen from './LevelsScreen';
import { NO_PROGRESS, type Progress } from '../state/progress';
import { DARK } from '../theme/palette';

const palette = DARK;

test('renders one button per level', async () => {
  await render(
    <LevelsScreen totalLevels={5} progress={NO_PROGRESS} currentLevel={0} palette={palette} onSelectLevel={jest.fn()} />,
  );

  for (let n = 1; n <= 5; n++) {
    expect(screen.getByText(String(n))).toBeTruthy();
  }
});

test('only the first level is unlocked with no progress', async () => {
  const onSelectLevel = jest.fn();
  await render(
    <LevelsScreen totalLevels={3} progress={NO_PROGRESS} currentLevel={0} palette={palette} onSelectLevel={onSelectLevel} />,
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
    <LevelsScreen totalLevels={3} progress={progress} currentLevel={0} palette={palette} onSelectLevel={onSelectLevel} />,
  );

  await fireEvent.press(screen.getByTestId('level-2'));
  expect(onSelectLevel).toHaveBeenCalledWith(1);
});

test('a cleared level is marked done', async () => {
  const progress: Progress = { done: [0], level: 1, bestMoves: {} };
  await render(
    <LevelsScreen totalLevels={2} progress={progress} currentLevel={1} palette={palette} onSelectLevel={jest.fn()} />,
  );

  const done = screen.getByTestId('level-1');
  const flat = [done.props.style].flat();
  expect(flat.some((s) => s?.backgroundColor === 'rgba(120,220,140,0.22)')).toBe(true);
});

test('the current level is outlined', async () => {
  const progress: Progress = { done: [0], level: 1, bestMoves: {} };
  await render(
    <LevelsScreen totalLevels={2} progress={progress} currentLevel={1} palette={palette} onSelectLevel={jest.fn()} />,
  );

  const current = screen.getByTestId('level-2');
  const flat = [current.props.style].flat();
  expect(flat.some((s) => s?.borderColor === 'rgba(255,214,90,0.9)')).toBe(true);
});
