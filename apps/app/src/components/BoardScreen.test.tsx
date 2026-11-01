import { fireEvent, render, screen } from '@testing-library/react-native';

import BoardScreen from './BoardScreen';
import { paletteFor } from '../theme/palette';

const palette = paletteFor('cosmos');

function noop() {
  /* not under test */
}

test('shows the level number and move count while playing', async () => {
  await render(
    <BoardScreen
      level={['S1.']}
      rules={{ jumps: true }}
      hints
      anim={false}
      palette={palette}
      levelNumber={5}
      totalLevels={50}
      hasNext
      onNext={noop}
    />,
  );

  expect(screen.getByText('Nível 5/50 · Jogadas 0 · Faltam 1')).toBeTruthy();
});

test('calls onLevelComplete exactly once when the level is won', async () => {
  const onLevelComplete = jest.fn();

  await render(
    <BoardScreen
      level={['S1']}
      rules={{ jumps: true }}
      hints
      anim={false}
      palette={palette}
      levelNumber={1}
      totalLevels={50}
      hasNext
      onNext={noop}
      onLevelComplete={onLevelComplete}
    />,
  );

  await fireEvent.press(screen.getByTestId('tile-press-1-0'));

  expect(onLevelComplete).toHaveBeenCalledTimes(1);
  expect(screen.getByText('Nível completo!')).toBeTruthy();
});

test('undo, reset and hint operate on the same board the HUD reflects', async () => {
  await render(
    <BoardScreen
      level={['S11']}
      rules={{ jumps: true }}
      hints
      anim={false}
      palette={palette}
      levelNumber={1}
      totalLevels={50}
      hasNext
      onNext={noop}
    />,
  );

  await fireEvent.press(screen.getByTestId('tile-press-1-0'));
  expect(screen.getByText('Nível 1/50 · Jogadas 1 · Faltam 1')).toBeTruthy();

  await fireEvent.press(screen.getByText('Desfazer'));
  expect(screen.getByText('Nível 1/50 · Jogadas 0 · Faltam 2')).toBeTruthy();

  await fireEvent.press(screen.getByText('Dica'));
  expect(screen.getByTestId('tile-1-0').props.style).toBeDefined();

  await fireEvent.press(screen.getByText('Reiniciar'));
  expect(screen.getByText('Nível 1/50 · Jogadas 0 · Faltam 2')).toBeTruthy();
});

test('pressing the next-level button calls onNext', async () => {
  const onNext = jest.fn();

  await render(
    <BoardScreen
      level={['S1']}
      rules={{ jumps: true }}
      hints
      anim={false}
      palette={palette}
      levelNumber={1}
      totalLevels={50}
      hasNext
      onNext={onNext}
    />,
  );

  await fireEvent.press(screen.getByTestId('tile-press-1-0'));
  await fireEvent.press(screen.getByText('Próximo nível'));

  expect(onNext).toHaveBeenCalledTimes(1);
});
