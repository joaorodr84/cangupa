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
    onUndo: noop,
    onReset: noop,
    onHint: noop,
    onNext: noop,
    onPrevLevel: noop,
    canGoPrevLevel: true,
    canGoNextLevel: true,
    ...overrides,
  };
  return render(<BoardHud {...props} />);
}

test('shows the playing status line', async () => {
  const status: Status = { kind: 'playing', levelNumber: 3, totalLevels: 50, moves: 4, remaining: 2 };
  await renderHud({ status });

  expect(screen.getByText('Nível 3/50 · Jogadas 4 · Faltam 2')).toBeTruthy();
});

test('shows a next-level button once won, and calls onNext when pressed', async () => {
  const status: Status = { kind: 'won', moves: 7, hasNext: true };
  const onNext = jest.fn();
  await renderHud({ status, onNext });

  const next = screen.getByText('Próximo nível');
  await fireEvent.press(next);
  expect(onNext).toHaveBeenCalledTimes(1);
});

test('shows no next-level button on the last level', async () => {
  const status: Status = { kind: 'won', moves: 7, hasNext: false };
  await renderHud({ status });

  expect(screen.queryByText('Próximo nível')).toBeNull();
  expect(screen.getByText(/Acabaste o jogo!/)).toBeTruthy();
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

const PLAYING: Status = { kind: 'playing', levelNumber: 2, totalLevels: 50, moves: 0, remaining: 3 };

test('the ‹ toolbar button calls onPrevLevel when enabled', async () => {
  const onPrevLevel = jest.fn();
  await renderHud({ status: PLAYING, onPrevLevel, canGoPrevLevel: true });

  await fireEvent.press(screen.getByText('‹'));
  expect(onPrevLevel).toHaveBeenCalledTimes(1);
});

test('the ‹ toolbar button is disabled on the first level', async () => {
  const onPrevLevel = jest.fn();
  await renderHud({ status: PLAYING, onPrevLevel, canGoPrevLevel: false });

  await fireEvent.press(screen.getByText('‹'));
  expect(onPrevLevel).not.toHaveBeenCalled();
});

test('the › toolbar button reuses onNext when enabled', async () => {
  const onNext = jest.fn();
  await renderHud({ status: PLAYING, onNext, canGoNextLevel: true });

  await fireEvent.press(screen.getByText('›'));
  expect(onNext).toHaveBeenCalledTimes(1);
});

test('the › toolbar button is disabled until the current level is cleared', async () => {
  const onNext = jest.fn();
  await renderHud({ status: PLAYING, onNext, canGoNextLevel: false });

  await fireEvent.press(screen.getByText('›'));
  expect(onNext).not.toHaveBeenCalled();
});
