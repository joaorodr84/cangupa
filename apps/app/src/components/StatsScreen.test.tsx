import { render, screen } from '@testing-library/react-native';

import StatsScreen from './StatsScreen';
import { NO_PROGRESS, type Progress } from '../state/progress';
import { DARK } from '../theme/palette';

const palette = DARK;

test('shows the summary panel when nothing is cleared yet', async () => {
  await render(<StatsScreen totalLevels={50} progress={NO_PROGRESS} palette={palette} />);

  expect(screen.getByText('Levels cleared')).toBeTruthy();
  expect(screen.getByText('0/50')).toBeTruthy();
  expect(screen.getByText('Total moves')).toBeTruthy();
  expect(screen.getByText('0')).toBeTruthy();
});

test('shows the cleared count and total moves, with no per-level breakdown', async () => {
  const progress: Progress = { done: [0, 2], level: 2, bestMoves: { 0: 3, 2: 7 }, hints: 3 };
  await render(<StatsScreen totalLevels={50} progress={progress} palette={palette} />);

  expect(screen.getByText('Levels cleared')).toBeTruthy();
  expect(screen.getByText('2/50')).toBeTruthy();
  expect(screen.getByText('Total moves')).toBeTruthy();
  expect(screen.getByText('10')).toBeTruthy();
  expect(screen.queryByText('Level 1')).toBeNull();
  expect(screen.queryByText('3 moves')).toBeNull();
});
