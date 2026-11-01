import { fireEvent, render, screen } from '@testing-library/react-native';

import BoardHud from './BoardHud';
import { type Status } from '../game/boardView';
import { paletteFor } from '../theme/palette';

const palette = paletteFor('cosmos');

function noop() {
  /* not under test */
}

test('shows the playing status line', async () => {
  const status: Status = { kind: 'playing', levelNumber: 3, totalLevels: 50, moves: 4, remaining: 2 };
  await render(
    <BoardHud status={status} canUndo palette={palette} onUndo={noop} onReset={noop} onHint={noop} onNext={noop} />,
  );

  expect(screen.getByText('Nível 3/50 · Jogadas 4 · Faltam 2')).toBeTruthy();
});

test('shows a next-level button once won, and calls onNext when pressed', async () => {
  const status: Status = { kind: 'won', moves: 7, hasNext: true };
  const onNext = jest.fn();
  await render(
    <BoardHud status={status} canUndo palette={palette} onUndo={noop} onReset={noop} onHint={noop} onNext={onNext} />,
  );

  const next = screen.getByText('Próximo nível');
  await fireEvent.press(next);
  expect(onNext).toHaveBeenCalledTimes(1);
});

test('shows no next-level button on the last level', async () => {
  const status: Status = { kind: 'won', moves: 7, hasNext: false };
  await render(
    <BoardHud status={status} canUndo palette={palette} onUndo={noop} onReset={noop} onHint={noop} onNext={noop} />,
  );

  expect(screen.queryByText('Próximo nível')).toBeNull();
  expect(screen.getByText(/Acabaste o jogo!/)).toBeTruthy();
});

test('disables undo when canUndo is false', async () => {
  const status: Status = { kind: 'playing', levelNumber: 1, totalLevels: 50, moves: 0, remaining: 3 };
  const onUndo = jest.fn();
  await render(
    <BoardHud
      status={status}
      canUndo={false}
      palette={palette}
      onUndo={onUndo}
      onReset={noop}
      onHint={noop}
      onNext={noop}
    />,
  );

  await fireEvent.press(screen.getByText('Desfazer'));
  expect(onUndo).not.toHaveBeenCalled();
});

test('disables hint once won', async () => {
  const status: Status = { kind: 'won', moves: 5, hasNext: false };
  const onHint = jest.fn();
  await render(
    <BoardHud
      status={status}
      canUndo
      palette={palette}
      onUndo={noop}
      onReset={noop}
      onHint={onHint}
      onNext={noop}
    />,
  );

  await fireEvent.press(screen.getByText('Dica'));
  expect(onHint).not.toHaveBeenCalled();
});

test('reset is always enabled', async () => {
  const status: Status = { kind: 'won', moves: 5, hasNext: false };
  const onReset = jest.fn();
  await render(
    <BoardHud
      status={status}
      canUndo={false}
      palette={palette}
      onUndo={noop}
      onReset={onReset}
      onHint={noop}
      onNext={noop}
    />,
  );

  await fireEvent.press(screen.getByText('Reiniciar'));
  expect(onReset).toHaveBeenCalledTimes(1);
});

test('shows the stuck message', async () => {
  const status: Status = { kind: 'stuck', levelNumber: 2, totalLevels: 50, moves: 3, remaining: 1 };
  await render(
    <BoardHud status={status} canUndo palette={palette} onUndo={noop} onReset={noop} onHint={noop} onNext={noop} />,
  );

  expect(screen.getByText('Sem jogadas.')).toBeTruthy();
});

test('shows the dead-end hint message', async () => {
  const status: Status = { kind: 'hintFailed' };
  await render(
    <BoardHud status={status} canUndo palette={palette} onUndo={noop} onReset={noop} onHint={noop} onNext={noop} />,
  );

  expect(screen.getByText('Beco sem saída.')).toBeTruthy();
});
