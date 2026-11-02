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
    onBack: noop,
    onNext: noop,
    ...overrides,
  };
  return render(<BoardScreen {...props} />);
}

test('shows the level number and move count while playing', async () => {
  await renderScreen({ level: ['S1.'], rules: { jumps: true }, levelNumber: 5 });

  expect(screen.getByText('Level 5/50 · Moves 0 · 1 left')).toBeTruthy();
});

test('calls onLevelComplete with the move count exactly once when the level is won, and shows the win popup', async () => {
  const onLevelComplete = jest.fn();

  await renderScreen({ level: ['S1'], rules: { jumps: true }, onLevelComplete });

  await fireEvent.press(screen.getByTestId('tile-press-1-0'));

  expect(onLevelComplete).toHaveBeenCalledTimes(1);
  expect(onLevelComplete).toHaveBeenCalledWith(1);
  expect(screen.getByText('Level complete!')).toBeTruthy();
});

test('pressing the back arrow calls onBack', async () => {
  const onBack = jest.fn();

  await renderScreen({ level: ['S1.'], rules: { jumps: true }, onBack });

  await fireEvent.press(screen.getByLabelText('Back to home'));
  expect(onBack).toHaveBeenCalledTimes(1);
});

test('undo, reset and hint operate on the same board the HUD reflects', async () => {
  await renderScreen({ level: ['S11'], rules: { jumps: true } });

  await fireEvent.press(screen.getByTestId('tile-press-1-0'));
  expect(screen.getByText('Level 1/50 · Moves 1 · 1 left')).toBeTruthy();

  await fireEvent.press(screen.getByText('Undo'));
  expect(screen.getByText('Level 1/50 · Moves 0 · 2 left')).toBeTruthy();

  await fireEvent.press(screen.getByText('Hint'));
  expect(screen.getByTestId('tile-1-0').props.style).toBeDefined();

  await fireEvent.press(screen.getByText('Restart'));
  expect(screen.getByText('Level 1/50 · Moves 0 · 2 left')).toBeTruthy();
});

test('pressing the win popup\'s next-level button calls onNext', async () => {
  const onNext = jest.fn();

  await renderScreen({ level: ['S1'], rules: { jumps: true }, onNext });

  await fireEvent.press(screen.getByTestId('tile-press-1-0'));
  await fireEvent.press(screen.getByText('Next level'));

  expect(onNext).toHaveBeenCalledTimes(1);
});

test('the win popup shows no next-level button on the last level', async () => {
  await renderScreen({ level: ['S1'], rules: { jumps: true }, hasNext: false });

  await fireEvent.press(screen.getByTestId('tile-press-1-0'));

  expect(screen.queryByText('Next level')).toBeNull();
  expect(screen.getByText("You've finished the game!")).toBeTruthy();
});

test('closing the win popup leaves the board reachable through Reset', async () => {
  await renderScreen({ level: ['S1'], rules: { jumps: true } });

  await fireEvent.press(screen.getByTestId('tile-press-1-0'));
  expect(screen.getByText('Level complete!')).toBeTruthy();

  await fireEvent.press(screen.getByText('✕'));
  expect(screen.queryByText('Level complete!')).toBeNull();

  await fireEvent.press(screen.getByText('Restart'));
  expect(screen.getByText('Level 1/50 · Moves 0 · 1 left')).toBeTruthy();
});
