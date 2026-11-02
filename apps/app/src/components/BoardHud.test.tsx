import { fireEvent, render, screen } from '@testing-library/react-native';

import BoardHud from './BoardHud';
import { type Status } from '../game/boardView';
import { paletteFor } from '../theme/palette';

const palette = paletteFor('cosmos');

function noop() {
  /* not under test */
}

function renderHud(overrides: Partial<Parameters<typeof BoardHud>[0]> & { status: Status }) {
  const props = {
    canUndo: true,
    palette,
    onBack: noop,
    onUndo: noop,
    onReset: noop,
    onHint: noop,
    ...overrides,
  };
  return render(<BoardHud {...props} />);
}

test('shows the playing status line', async () => {
  const status: Status = { kind: 'playing', levelNumber: 3, totalLevels: 50, moves: 4, remaining: 2 };
  await renderHud({ status });

  expect(screen.getByText('Nível 3/50 · Jogadas 4 · Faltam 2')).toBeTruthy();
});

test('shows nothing in the status line once won — WinPopup carries that message', async () => {
  const status: Status = { kind: 'won', moves: 7, hasNext: true };
  await renderHud({ status });

  expect(screen.queryByText(/Nível completo/)).toBeNull();
});

test('disables undo when canUndo is false', async () => {
  const status: Status = { kind: 'playing', levelNumber: 1, totalLevels: 50, moves: 0, remaining: 3 };
  const onUndo = jest.fn();
  await renderHud({ status, canUndo: false, onUndo });

  await fireEvent.press(screen.getByText('Desfazer'));
  expect(onUndo).not.toHaveBeenCalled();
});

test('disables hint once won', async () => {
  const status: Status = { kind: 'won', moves: 5, hasNext: false };
  const onHint = jest.fn();
  await renderHud({ status, onHint });

  await fireEvent.press(screen.getByText('Dica'));
  expect(onHint).not.toHaveBeenCalled();
});

test('pressing the back arrow calls onBack', async () => {
  const status: Status = { kind: 'playing', levelNumber: 1, totalLevels: 50, moves: 0, remaining: 3 };
  const onBack = jest.fn();
  await renderHud({ status, onBack });

  await fireEvent.press(screen.getByLabelText('Voltar ao início'));
  expect(onBack).toHaveBeenCalledTimes(1);
});

test('reset is always enabled', async () => {
  const status: Status = { kind: 'won', moves: 5, hasNext: false };
  const onReset = jest.fn();
  await renderHud({ status, canUndo: false, onReset });

  await fireEvent.press(screen.getByText('Reiniciar'));
  expect(onReset).toHaveBeenCalledTimes(1);
});

test('shows the stuck message', async () => {
  const status: Status = { kind: 'stuck', levelNumber: 2, totalLevels: 50, moves: 3, remaining: 1 };
  await renderHud({ status });

  expect(screen.getByText('Sem jogadas.')).toBeTruthy();
});

test('shows the dead-end hint message', async () => {
  const status: Status = { kind: 'hintFailed' };
  await renderHud({ status });

  expect(screen.getByText('Beco sem saída.')).toBeTruthy();
});
