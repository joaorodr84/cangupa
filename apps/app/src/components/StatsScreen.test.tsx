import { render, screen } from '@testing-library/react-native';

import StatsScreen from './StatsScreen';
import { NO_PROGRESS, type Progress } from '../state/progress';
import { paletteFor } from '../theme/palette';

const palette = paletteFor('cosmos');

test('shows the empty state when nothing is cleared yet', async () => {
  await render(<StatsScreen totalLevels={50} progress={NO_PROGRESS} palette={palette} />);

  expect(screen.getByText('Níveis limpos: 0/50')).toBeTruthy();
  expect(screen.getByText('Jogadas totais: 0')).toBeTruthy();
  expect(screen.getByText(/Ainda sem estatísticas/)).toBeTruthy();
});

test('shows the cleared count and the per-level best move counts', async () => {
  const progress: Progress = { done: [0, 2], level: 2, bestMoves: { 0: 3, 2: 7 } };
  await render(<StatsScreen totalLevels={50} progress={progress} palette={palette} />);

  expect(screen.getByText('Níveis limpos: 2/50')).toBeTruthy();
  expect(screen.getByText('Jogadas totais: 10')).toBeTruthy();
  expect(screen.getByText('Nível 1')).toBeTruthy();
  expect(screen.getByText('3 jogadas')).toBeTruthy();
  expect(screen.getByText('Nível 3')).toBeTruthy();
  expect(screen.getByText('7 jogadas')).toBeTruthy();
  expect(screen.queryByText(/Ainda sem estatísticas/)).toBeNull();
});
