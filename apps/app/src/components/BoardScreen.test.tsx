import { fireEvent, render, screen } from '@testing-library/react-native';

import BoardScreen from './BoardScreen';
import { type Level, type Rules } from '../game/board';
import { paletteFor } from '../theme/palette';

const palette = paletteFor('cosmos');

function noop() {
  /* not under test */
}

function renderScreen(overrides: Partial<Parameters<typeof BoardScreen>[0]> & { level: Level; rules: Rules }) {
  const props = {
    hints: true,
    anim: false,
    palette,
    levelNumber: 1,
    totalLevels: 50,
    hasNext: true,
    onNext: noop,
    onPrevLevel: noop,
    canGoPrevLevel: true,
    ...overrides,
  };
  return render(<BoardScreen {...props} />);
}

test('shows the level number and move count while playing', async () => {
  await renderScreen({ level: ['S1.'], rules: { jumps: true }, levelNumber: 5 });

  expect(screen.getByText('Nível 5/50 · Jogadas 0 · Faltam 1')).toBeTruthy();
});

test('calls onLevelComplete exactly once when the level is won', async () => {
  const onLevelComplete = jest.fn();

  await renderScreen({ level: ['S1'], rules: { jumps: true }, onLevelComplete });

  await fireEvent.press(screen.getByTestId('tile-press-1-0'));

  expect(onLevelComplete).toHaveBeenCalledTimes(1);
  expect(screen.getByText('Nível completo!')).toBeTruthy();
});

test('undo, reset and hint operate on the same board the HUD reflects', async () => {
  await renderScreen({ level: ['S11'], rules: { jumps: true } });

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

  await renderScreen({ level: ['S1'], rules: { jumps: true }, onNext });

  await fireEvent.press(screen.getByTestId('tile-press-1-0'));
  await fireEvent.press(screen.getByText('Próximo nível'));

  expect(onNext).toHaveBeenCalledTimes(1);
});

test('pressing the toolbar ‹ button calls onPrevLevel', async () => {
  const onPrevLevel = jest.fn();

  await renderScreen({ level: ['S1.'], rules: { jumps: true }, onPrevLevel, canGoPrevLevel: true });

  await fireEvent.press(screen.getByText('‹'));
  expect(onPrevLevel).toHaveBeenCalledTimes(1);
});

test('the toolbar › button is disabled while hasNext (the level is not yet cleared) is false', async () => {
  const onNext = jest.fn();

  await renderScreen({ level: ['S1.'], rules: { jumps: true }, onNext, hasNext: false });

  await fireEvent.press(screen.getByText('›'));
  expect(onNext).not.toHaveBeenCalled();
});
