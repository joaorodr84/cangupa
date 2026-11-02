import { render, screen } from '@testing-library/react-native';

import StatsScreen from './StatsScreen';
import { NO_PROGRESS, type Progress } from '../state/progress';
import { DARK } from '../theme/palette';

const palette = DARK;

test('shows the empty state when nothing is cleared yet', async () => {
  await render(<StatsScreen totalLevels={50} progress={NO_PROGRESS} palette={palette} />);

  expect(screen.getByText('Levels cleared: 0/50')).toBeTruthy();
  expect(screen.getByText('Total moves: 0')).toBeTruthy();
  expect(screen.getByText(/No stats yet/)).toBeTruthy();
});

test('shows the cleared count and the per-level best move counts', async () => {
  const progress: Progress = { done: [0, 2], level: 2, bestMoves: { 0: 3, 2: 7 } };
  await render(<StatsScreen totalLevels={50} progress={progress} palette={palette} />);

  expect(screen.getByText('Levels cleared: 2/50')).toBeTruthy();
  expect(screen.getByText('Total moves: 10')).toBeTruthy();
  expect(screen.getByText('Level 1')).toBeTruthy();
  expect(screen.getByText('3 moves')).toBeTruthy();
  expect(screen.getByText('Level 3')).toBeTruthy();
  expect(screen.getByText('7 moves')).toBeTruthy();
  expect(screen.queryByText(/No stats yet/)).toBeNull();
});
