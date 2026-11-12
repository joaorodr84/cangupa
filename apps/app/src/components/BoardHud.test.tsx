import { fireEvent, render, screen } from '@testing-library/react-native';

import BoardHud from './BoardHud';
import { type Status } from '../game/boardView';
import { DARK } from '../theme/palette';

const palette = DARK;

function noop() {
  /* not under test */
}

function renderHud(overrides: Partial<Parameters<typeof BoardHud>[0]> & { status: Status }) {
  const props = {
    canUndo: true,
    hintBalance: 3,
    palette,
    onBack: noop,
    onUndo: noop,
    onReset: noop,
    onHint: noop,
    onHelp: noop,
    ...overrides,
  };
  return render(<BoardHud {...props} />);
}

test('shows the level and move count while playing', async () => {
  const status: Status = { kind: 'playing', levelNumber: 3, totalLevels: 50, moves: 4, remaining: 2 };
  await renderHud({ status });

  expect(screen.getByText('Level 3')).toBeTruthy();
  expect(screen.getByText('Moves 4')).toBeTruthy();
});

test('shows nothing in the centre once won — WinPopup carries that message', async () => {
  const status: Status = { kind: 'won', moves: 7, hasNext: true };
  await renderHud({ status });

  expect(screen.queryByText(/Level complete/)).toBeNull();
  expect(screen.queryByText(/Level /)).toBeNull();
});

test('disables undo when canUndo is false', async () => {
  const status: Status = { kind: 'playing', levelNumber: 1, totalLevels: 50, moves: 0, remaining: 3 };
  const onUndo = jest.fn();
  await renderHud({ status, canUndo: false, onUndo });

  await fireEvent.press(screen.getByLabelText('Undo'));
  expect(onUndo).not.toHaveBeenCalled();
});

test('disables hint once won', async () => {
  const status: Status = { kind: 'won', moves: 5, hasNext: false };
  const onHint = jest.fn();
  await renderHud({ status, onHint });

  await fireEvent.press(screen.getByLabelText('Hint'));
  expect(onHint).not.toHaveBeenCalled();
});

test('hint stays pressable at 0 balance, mid-level — opens the store instead (CANGUPA-79)', async () => {
  const status: Status = { kind: 'playing', levelNumber: 1, totalLevels: 50, moves: 2, remaining: 1 };
  const onHint = jest.fn();
  await renderHud({ status, hintBalance: 0, onHint });

  await fireEvent.press(screen.getByLabelText('Buy hints'));
  expect(onHint).toHaveBeenCalledTimes(1);
});

test('shows the hint balance as a badge on the hint icon', async () => {
  const status: Status = { kind: 'playing', levelNumber: 1, totalLevels: 50, moves: 0, remaining: 3 };
  await renderHud({ status, hintBalance: 2 });

  expect(screen.getByText('2')).toBeTruthy();
});

test('pressing the back arrow calls onBack', async () => {
  const status: Status = { kind: 'playing', levelNumber: 1, totalLevels: 50, moves: 0, remaining: 3 };
  const onBack = jest.fn();
  await renderHud({ status, onBack });

  await fireEvent.press(screen.getByLabelText('Back'));
  expect(onBack).toHaveBeenCalledTimes(1);
});

test('pressing Help calls onHelp, even once won (CANGUPA-103)', async () => {
  const status: Status = { kind: 'won', moves: 5, hasNext: false };
  const onHelp = jest.fn();
  await renderHud({ status, onHelp });

  await fireEvent.press(screen.getByLabelText('Help'));
  expect(onHelp).toHaveBeenCalledTimes(1);
});

test('reset is always enabled', async () => {
  const status: Status = { kind: 'won', moves: 5, hasNext: false };
  const onReset = jest.fn();
  await renderHud({ status, canUndo: false, onReset });

  await fireEvent.press(screen.getByLabelText('Restart'));
  expect(onReset).toHaveBeenCalledTimes(1);
});

test('shows the level and the dead-end hint message in place of the move count', async () => {
  const status: Status = { kind: 'hintFailed', levelNumber: 2, totalLevels: 50, moves: 3, remaining: 1 };
  await renderHud({ status });

  expect(screen.getByText('Level 2')).toBeTruthy();
  expect(screen.getByText('Dead end.')).toBeTruthy();
});
