import { fireEvent, render, screen } from '@testing-library/react-native';
import { useWindowDimensions } from 'react-native';

import BoardScreen from './BoardScreen';
import { type Level } from '../game/board';
import { DARK } from '../theme/palette';

const palette = DARK;

// A rectangular level is turned to suit the screen (CANGUPA-56, game/orient.ts).
// These tests' levels are wide, written before that existed, so they run on a
// landscape screen where a wide level is drawn as written; the portrait case
// has its own tests below. jest-expo's own default window is portrait.
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: jest.fn(),
}));
const LANDSCAPE = { width: 800, height: 400, scale: 1, fontScale: 1 };
const PORTRAIT = { width: 400, height: 800, scale: 1, fontScale: 1 };
beforeEach(() => {
  jest.mocked(useWindowDimensions).mockReturnValue(LANDSCAPE);
});

function noop() {
  /* not under test */
}

function screenProps(overrides: Partial<Parameters<typeof BoardScreen>[0]> & { level: Level }) {
  return {
    hints: true,
    hintBalance: 3,
    anim: false,
    fall: false,
    palette,
    levelNumber: 1,
    totalLevels: 50,
    hasNext: true,
    onBack: noop,
    onPrevious: noop,
    onNext: noop,
    ...overrides,
  };
}

function renderScreen(overrides: Partial<Parameters<typeof BoardScreen>[0]> & { level: Level }) {
  return render(<BoardScreen {...screenProps(overrides)} />);
}

test('shows the level number and move count while playing', async () => {
  await renderScreen({ level: ['S1.'], levelNumber: 5 });

  expect(screen.getByText('Level 5')).toBeTruthy();
  expect(screen.getByText('Moves 0')).toBeTruthy();
});

test('calls onLevelComplete with the move count exactly once when the level is won, and shows the win popup', async () => {
  const onLevelComplete = jest.fn();

  await renderScreen({ level: ['S1'], onLevelComplete });

  await fireEvent.press(screen.getByTestId('tile-press-1-0'));

  expect(onLevelComplete).toHaveBeenCalledTimes(1);
  expect(onLevelComplete).toHaveBeenCalledWith(1, true);
  expect(screen.getByText('Level complete!')).toBeTruthy();
});

test('pressing a directional-pad button plays the matching move, same as tapping the tile (CANGUPA-152)', async () => {
  const onLevelComplete = jest.fn();

  await renderScreen({ level: ['S1'], onLevelComplete });

  await fireEvent.press(screen.getByTestId('dpad-right'));

  expect(onLevelComplete).toHaveBeenCalledTimes(1);
  expect(onLevelComplete).toHaveBeenCalledWith(1, true);
});

test('a direction with no legal move is disabled on the pad, and pressing it anyway does nothing (CANGUPA-152)', async () => {
  const onLevelComplete = jest.fn();

  await renderScreen({ level: ['S1'], onLevelComplete });

  const left = screen.getByTestId('dpad-left');
  expect(left.props.accessibilityState).toEqual({ disabled: true });

  await fireEvent.press(left);

  expect(onLevelComplete).not.toHaveBeenCalled();
});

test('pressing the back arrow calls onBack', async () => {
  const onBack = jest.fn();

  await renderScreen({ level: ['S1.'], onBack });

  await fireEvent.press(screen.getByLabelText('Back'));
  expect(onBack).toHaveBeenCalledTimes(1);
});

test('pressing the previous-level arrow calls onPrevious (CANGUPA-85)', async () => {
  const onPrevious = jest.fn();

  await renderScreen({ level: ['S1.'], levelNumber: 5, onPrevious });

  await fireEvent.press(screen.getByLabelText('Previous level'));
  expect(onPrevious).toHaveBeenCalledTimes(1);
});

test('the previous-level arrow is disabled on level 1 (CANGUPA-85)', async () => {
  const onPrevious = jest.fn();

  await renderScreen({ level: ['S1.'], levelNumber: 1, onPrevious });

  await fireEvent.press(screen.getByLabelText('Previous level'));
  expect(onPrevious).not.toHaveBeenCalled();
});

test('pressing the next-level arrow calls onNext when a next level is unlocked (CANGUPA-85)', async () => {
  const onNext = jest.fn();

  await renderScreen({ level: ['S1.'], hasNext: true, onNext });

  await fireEvent.press(screen.getByLabelText('Next level'));
  expect(onNext).toHaveBeenCalledTimes(1);
});

test('the next-level arrow is disabled while hasNext is false (CANGUPA-85)', async () => {
  const onNext = jest.fn();

  await renderScreen({ level: ['S1.'], hasNext: false, onNext });

  await fireEvent.press(screen.getByLabelText('Next level'));
  expect(onNext).not.toHaveBeenCalled();
});

// Regression test for CANGUPA-121: pressing Help used to navigate to the
// full HelpScreen, which unmounted BoardScreen (useBoard.ts's Game lives in
// local state) and so silently restarted the level. It's a popup now, so
// the board underneath must survive the round trip untouched.
test('pressing Help opens a popup without resetting the board (CANGUPA-121)', async () => {
  await renderScreen({ level: ['S11'] });

  await fireEvent.press(screen.getByTestId('tile-press-1-0'));
  expect(screen.getByText('Moves 1')).toBeTruthy();

  await fireEvent.press(screen.getByLabelText('Help'));
  expect(screen.getByText('Moves')).toBeTruthy();
  expect(screen.getByText('Tiles')).toBeTruthy();
  expect(screen.queryByText('Buttons')).toBeNull();

  await fireEvent.press(screen.getByText('✕'));
  expect(screen.queryByText('Tiles')).toBeNull();
  expect(screen.getByText('Moves 1')).toBeTruthy();
});

test('undo, reset and hint operate on the same board the HUD reflects', async () => {
  await renderScreen({ level: ['S11'] });

  await fireEvent.press(screen.getByTestId('tile-press-1-0'));
  expect(screen.getByText('Moves 1')).toBeTruthy();

  await fireEvent.press(screen.getByLabelText('Undo'));
  expect(screen.getByText('Moves 0')).toBeTruthy();

  await fireEvent.press(screen.getByLabelText('Hint'));
  expect(screen.getByTestId('tile-1-0').props.style).toBeDefined();

  await fireEvent.press(screen.getByLabelText('Restart'));
  expect(screen.getByText('Moves 0')).toBeTruthy();
});

test('pressing Hint spends one, via onHintUsed, only when it actually finds a move', async () => {
  const onHintUsed = jest.fn();
  await renderScreen({ level: ['S11'], onHintUsed });

  await fireEvent.press(screen.getByLabelText('Hint'));
  expect(onHintUsed).toHaveBeenCalledTimes(1);
});

test('a dead-end hint does not call onHintUsed', async () => {
  // S..1: the remaining tile sits three tiles away, past jump range, so solve() fails.
  const onHintUsed = jest.fn();
  await renderScreen({ level: ['S..1'], onHintUsed });

  await fireEvent.press(screen.getByLabelText('Hint'));
  expect(onHintUsed).not.toHaveBeenCalled();
});

test('pressing Hint at 0 balance opens the hint store instead of spending one (CANGUPA-79)', async () => {
  const onHintUsed = jest.fn();
  const onBuyHints = jest.fn();
  await renderScreen({ level: ['S11'], hintBalance: 0, onHintUsed, onBuyHints });

  await fireEvent.press(screen.getByLabelText('Buy hints'));
  expect(onHintUsed).not.toHaveBeenCalled();
  expect(onBuyHints).toHaveBeenCalledTimes(1);
});

test('pressing Undo after a move calls onUndoUsed (CANGUPA-145)', async () => {
  const onUndoUsed = jest.fn();
  await renderScreen({ level: ['S11'], onUndoUsed });

  await fireEvent.press(screen.getByTestId('tile-press-1-0'));
  await fireEvent.press(screen.getByLabelText('Undo'));

  expect(onUndoUsed).toHaveBeenCalledTimes(1);
});

test('pressing Undo with nothing to undo does not call onUndoUsed', async () => {
  const onUndoUsed = jest.fn();
  await renderScreen({ level: ['S11'], onUndoUsed });

  await fireEvent.press(screen.getByLabelText('Undo'));
  expect(onUndoUsed).not.toHaveBeenCalled();
});

test('a hint used this attempt makes the clear not perfect (CANGUPA-90)', async () => {
  const onLevelComplete = jest.fn();
  await renderScreen({ level: ['S11'], onLevelComplete });

  await fireEvent.press(screen.getByLabelText('Hint'));
  await fireEvent.press(screen.getByTestId('tile-press-1-0'));
  await fireEvent.press(screen.getByTestId('tile-press-2-0'));

  expect(onLevelComplete).toHaveBeenCalledWith(2, false);
});

test('an undo used this attempt makes the clear not perfect (CANGUPA-90)', async () => {
  const onLevelComplete = jest.fn();
  await renderScreen({ level: ['S11'], onLevelComplete });

  await fireEvent.press(screen.getByTestId('tile-press-1-0'));
  await fireEvent.press(screen.getByLabelText('Undo'));
  await fireEvent.press(screen.getByTestId('tile-press-1-0'));
  await fireEvent.press(screen.getByTestId('tile-press-2-0'));

  expect(onLevelComplete).toHaveBeenCalledWith(2, false);
});

test('restarting clears the not-perfect flag, so a clean replay still counts as perfect (CANGUPA-90)', async () => {
  const onLevelComplete = jest.fn();
  await renderScreen({ level: ['S11'], onLevelComplete });

  await fireEvent.press(screen.getByLabelText('Hint'));
  await fireEvent.press(screen.getByLabelText('Restart'));
  await fireEvent.press(screen.getByTestId('tile-press-1-0'));
  await fireEvent.press(screen.getByTestId('tile-press-2-0'));

  expect(onLevelComplete).toHaveBeenCalledWith(2, true);
});

test('pressing the win popup\'s next-level button calls onNext', async () => {
  const onNext = jest.fn();

  await renderScreen({ level: ['S1'], onNext });

  await fireEvent.press(screen.getByTestId('tile-press-1-0'));
  await fireEvent.press(screen.getByText('Next level'));

  expect(onNext).toHaveBeenCalledTimes(1);
});

test('the win popup shows no next-level button on the last level', async () => {
  await renderScreen({ level: ['S1'], hasNext: false });

  await fireEvent.press(screen.getByTestId('tile-press-1-0'));

  expect(screen.queryByText('Next level')).toBeNull();
  expect(screen.getByText("You've finished the game!")).toBeTruthy();
});

test('closing the win popup leaves the board reachable through Reset', async () => {
  await renderScreen({ level: ['S1'] });

  await fireEvent.press(screen.getByTestId('tile-press-1-0'));
  expect(screen.getByText('Level complete!')).toBeTruthy();

  await fireEvent.press(screen.getByText('✕'));
  expect(screen.queryByText('Level complete!')).toBeNull();

  await fireEvent.press(screen.getByLabelText('Restart'));
  expect(screen.getByText('Moves 0')).toBeTruthy();
});

test('turns a wide level tall when the screen is portrait', async () => {
  jest.mocked(useWindowDimensions).mockReturnValue(PORTRAIT);

  await renderScreen({ level: ['S1'] });

  // ['S1'] is two across and one down; turned, the second tile is below the first.
  expect(screen.getByTestId('tile-press-0-1')).toBeTruthy();
  expect(screen.queryByTestId('tile-press-1-0')).toBeNull();
});

test('a turned level is still playable and clears', async () => {
  jest.mocked(useWindowDimensions).mockReturnValue(PORTRAIT);
  const onLevelComplete = jest.fn();

  await renderScreen({ level: ['S1'], onLevelComplete });
  await fireEvent.press(screen.getByTestId('tile-press-0-1'));

  expect(onLevelComplete).toHaveBeenCalledWith(1, true);
});

test('does not turn the board again when the screen rotates mid-level', async () => {
  jest.mocked(useWindowDimensions).mockReturnValue(PORTRAIT);
  const view = await renderScreen({ level: ['S1'] });
  expect(screen.getByTestId('tile-press-0-1')).toBeTruthy();

  jest.mocked(useWindowDimensions).mockReturnValue(LANDSCAPE);
  await view.rerender(<BoardScreen {...screenProps({ level: ['S1'] })} />);

  expect(screen.getByTestId('tile-press-0-1')).toBeTruthy(); // still as it started
});
