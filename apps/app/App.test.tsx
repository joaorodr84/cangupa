import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen } from '@testing-library/react-native';

import App from './App';
import { PROGRESS_KEY } from './src/state/progress';
import { SETTINGS_KEY } from './src/state/settings';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// The safe-area provider waits for native metrics Jest does not have, so
// the library's own mock supplies them (insets of zero).
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

// The mock's in-memory store is one shared module-level object, so a value
// set in one test is still there for the next one unless cleared.
afterEach(async () => {
  await AsyncStorage.clear();
});

test('renders without crashing', async () => {
  const { toJSON } = await render(<App />);
  expect(toJSON()).not.toBeNull();
});

test('starts on the home screen, and the board screen has its own way back to it', async () => {
  await render(<App />);

  expect(await screen.findByText('Play')).toBeTruthy();
  expect(screen.queryByText(/Moves \d+/)).toBeNull();

  await fireEvent.press(screen.getByText('Play'));
  expect(await screen.findByText('Moves 0')).toBeTruthy();
  expect(screen.queryByText('Play')).toBeNull();

  await fireEvent.press(screen.getByLabelText('Back'));
  expect(await screen.findByText('Play')).toBeTruthy();
});

test('Play opens the first unsolved level, not just the last one played (CANGUPA-77)', async () => {
  // Level 2 (index 1) is skipped, not cleared — Play should go there, not
  // to level 3 just because it's where progress.level last left off.
  await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify({ done: [0], level: 2 }));

  await render(<App />);
  expect(await screen.findByText('Level 2')).toBeTruthy();

  await fireEvent.press(screen.getByText('Play'));
  expect(await screen.findByText('Level 2')).toBeTruthy();
});

test('the footer nav opens the pack list, opening a pack opens its levels, and picking one opens the board', async () => {
  await render(<App />);

  await fireEvent.press(await screen.findByTestId('footer-levels'));
  expect(screen.getByTestId('pack-1')).toBeTruthy();
  expect(screen.queryByTestId('level-1')).toBeNull();

  await fireEvent.press(screen.getByTestId('pack-1'));
  expect(screen.getByTestId('level-2')).toBeTruthy();

  await fireEvent.press(screen.getByTestId('level-1'));
  expect(await screen.findByText('Level 1')).toBeTruthy();
});

test('the pack list has no back button of its own, unlike a pack\'s own level grid', async () => {
  await render(<App />);

  await fireEvent.press(await screen.findByTestId('footer-levels'));
  expect(screen.getByTestId('pack-1')).toBeTruthy();
  expect(screen.queryByLabelText('‹ Back')).toBeNull();
  expect(screen.queryByLabelText('Back to the list')).toBeNull();

  await fireEvent.press(screen.getByTestId('pack-1'));
  expect(screen.getByLabelText('Back to the list')).toBeTruthy();
});

test("a pack's own back arrow returns to the pack list, and reopening the Levels tab closes it the same way", async () => {
  await render(<App />);

  await fireEvent.press(await screen.findByTestId('footer-levels'));
  await fireEvent.press(screen.getByTestId('pack-1'));
  expect(screen.getByTestId('level-1')).toBeTruthy();

  await fireEvent.press(screen.getByLabelText('Back to the list'));
  expect(screen.getByTestId('pack-1')).toBeTruthy();
  expect(screen.queryByTestId('level-1')).toBeNull();

  await fireEvent.press(screen.getByTestId('pack-1'));
  expect(screen.getByTestId('level-1')).toBeTruthy();

  await fireEvent.press(screen.getByTestId('footer-levels'));
  expect(screen.getByTestId('pack-1')).toBeTruthy();
  expect(screen.queryByTestId('level-1')).toBeNull();
});

test('the home screen\'s Rules button opens the rules screen, and Back returns to home (CANGUPA-86)', async () => {
  await render(<App />);

  await fireEvent.press(await screen.findByText('Rules'));
  expect(screen.getByText('Rules')).toBeTruthy();

  await fireEvent.press(screen.getByLabelText('‹ Back'));
  expect(await screen.findByText('Play')).toBeTruthy();
});

test('opening a level from the Levels tab and pressing Back returns there, not home (CANGUPA-86)', async () => {
  await render(<App />);

  await fireEvent.press(await screen.findByTestId('footer-levels'));
  await fireEvent.press(screen.getByTestId('pack-1'));
  await fireEvent.press(screen.getByTestId('level-1'));
  expect(await screen.findByText('Level 1')).toBeTruthy();

  await fireEvent.press(screen.getByLabelText('Back'));
  expect(screen.getByTestId('level-1')).toBeTruthy();
  expect(screen.queryByText('Play')).toBeNull();
});

test('clearing progress from settings opens the board, and Back returns to settings (CANGUPA-86)', async () => {
  await render(<App />);

  await fireEvent.press(await screen.findByTestId('footer-settings'));
  await fireEvent.press(screen.getByText('Clear progress'));
  await fireEvent.press(screen.getByText('Yes'));
  expect(await screen.findByText('Level 1')).toBeTruthy();

  await fireEvent.press(screen.getByLabelText('Back'));
  expect(await screen.findByText('Appearance')).toBeTruthy();
});

test('the footer nav opens the settings screen, and changing the theme mode is reflected on return', async () => {
  await render(<App />);

  await fireEvent.press(await screen.findByTestId('footer-settings'));
  await fireEvent.press(screen.getByTestId('theme-mode-dark'));

  const saved = await AsyncStorage.getItem(SETTINGS_KEY);
  expect(JSON.parse(saved ?? '{}').themeMode).toBe('dark');
});

test('changing the language is reflected at once and saved', async () => {
  await render(<App />);

  await fireEvent.press(await screen.findByTestId('footer-settings'));
  await fireEvent.press(screen.getByTestId('language-pt'));

  expect(await screen.findByText('Aparência')).toBeTruthy();

  const saved = await AsyncStorage.getItem(SETTINGS_KEY);
  expect(JSON.parse(saved ?? '{}').language).toBe('pt');
});

test('the settings screen has no back button of its own, unlike the rules screen', async () => {
  await render(<App />);

  await fireEvent.press(await screen.findByTestId('footer-settings'));
  expect(await screen.findByText('Appearance')).toBeTruthy();
  expect(screen.queryByLabelText('‹ Back')).toBeNull();
});

test('the footer nav opens the stats screen, which reflects a cleared level', async () => {
  await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify({ done: [0], level: 1, bestMoves: { 0: 3 } }));

  await render(<App />);
  await fireEvent.press(await screen.findByTestId('footer-stats'));

  expect(screen.getByText('Levels cleared')).toBeTruthy();
  expect(screen.getByText('1/500')).toBeTruthy();
  expect(screen.getByText('Total moves')).toBeTruthy();
  expect(screen.getByText('3')).toBeTruthy();
});

test('the footer nav\'s Home tab returns to the home screen from levels, stats and settings', async () => {
  await render(<App />);

  await fireEvent.press(await screen.findByTestId('footer-levels'));
  await fireEvent.press(screen.getByTestId('pack-1'));
  expect(screen.getByTestId('level-1')).toBeTruthy();

  await fireEvent.press(screen.getByTestId('footer-home'));
  expect(await screen.findByText('Play')).toBeTruthy();
});

test('the board screen has no footer nav of its own', async () => {
  await render(<App />);

  await fireEvent.press(await screen.findByText('Play'));
  await screen.findByText('Level 1');

  expect(screen.queryByTestId('footer-home')).toBeNull();
  expect(screen.queryByTestId('footer-levels')).toBeNull();
  expect(screen.queryByTestId('footer-stats')).toBeNull();
  expect(screen.queryByTestId('footer-settings')).toBeNull();
});
