import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen } from '@testing-library/react-native';

import App from './App';
import { PROGRESS_KEY } from './src/state/progress';
import { DEFAULT_SETTINGS, SETTINGS_KEY } from './src/state/settings';

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
  expect(screen.queryByText(/Level \d+\/50/)).toBeNull();

  await fireEvent.press(screen.getByText('Play'));
  expect(await screen.findByText(/Level 1\/50/)).toBeTruthy();
  expect(screen.queryByText('Play')).toBeNull();

  await fireEvent.press(screen.getByLabelText('Back to home'));
  expect(await screen.findByText('Play')).toBeTruthy();
});

test('resumes the last-played level', async () => {
  await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify({ done: [0], level: 2 }));

  await render(<App />);
  await fireEvent.press(await screen.findByText('Play'));

  expect(await screen.findByText(/Level 3\/50/)).toBeTruthy();
});

test('the footer nav opens the levels screen, and picking a level opens the board', async () => {
  await render(<App />);

  await fireEvent.press(await screen.findByTestId('footer-levels'));
  expect(screen.getByTestId('level-2')).toBeTruthy();

  await fireEvent.press(screen.getByTestId('level-1'));
  expect(await screen.findByText(/Level 1\/50/)).toBeTruthy();
});

test('the home screen\'s Rules button opens the rules screen, and Back returns to the board', async () => {
  await render(<App />);

  await fireEvent.press(await screen.findByText('Rules'));
  expect(screen.getByText('Rules')).toBeTruthy();

  await fireEvent.press(screen.getByText('‹ Back'));
  expect(await screen.findByText(/Level 1\/50/)).toBeTruthy();
});

test('the footer nav opens the settings screen, and changing the theme is reflected on return', async () => {
  await render(<App />);

  await fireEvent.press(await screen.findByTestId('footer-settings'));
  await fireEvent.press(screen.getByTestId('theme-ice'));

  const saved = await AsyncStorage.getItem(SETTINGS_KEY);
  expect(JSON.parse(saved ?? '{}').theme).toBe('ice');
});

test('changing the language is reflected at once and saved', async () => {
  await render(<App />);

  await fireEvent.press(await screen.findByTestId('footer-settings'));
  await fireEvent.press(screen.getByTestId('language-pt'));

  expect(await screen.findByText('Definições')).toBeTruthy();

  const saved = await AsyncStorage.getItem(SETTINGS_KEY);
  expect(JSON.parse(saved ?? '{}').language).toBe('pt');
});

test('the settings screen has no back button of its own, unlike the rules screen', async () => {
  await render(<App />);

  await fireEvent.press(await screen.findByTestId('footer-settings'));
  expect(await screen.findByText('Settings')).toBeTruthy();
  expect(screen.queryByText('‹ Back')).toBeNull();
});

test('the footer nav opens the stats screen, which reflects a cleared level', async () => {
  await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify({ done: [0], level: 1, bestMoves: { 0: 3 } }));

  await render(<App />);
  await fireEvent.press(await screen.findByTestId('footer-stats'));

  expect(screen.getByText(/Levels cleared: 1\/50/)).toBeTruthy();
  expect(screen.getByText('Level 1')).toBeTruthy();
  expect(screen.getByText('3 moves')).toBeTruthy();
});

test('the footer nav\'s Home tab returns to the home screen from levels, stats and settings', async () => {
  await render(<App />);

  await fireEvent.press(await screen.findByTestId('footer-levels'));
  expect(screen.getByTestId('level-1')).toBeTruthy();

  await fireEvent.press(screen.getByTestId('footer-home'));
  expect(await screen.findByText('Play')).toBeTruthy();
});

test('the board screen has no footer nav of its own', async () => {
  await render(<App />);

  await fireEvent.press(await screen.findByText('Play'));
  await screen.findByText(/Level 1\/50/);

  expect(screen.queryByTestId('footer-home')).toBeNull();
  expect(screen.queryByTestId('footer-levels')).toBeNull();
  expect(screen.queryByTestId('footer-stats')).toBeNull();
  expect(screen.queryByTestId('footer-settings')).toBeNull();
});

test('shows the starfield for the space theme and not for the default theme', async () => {
  await render(<App />);
  expect(screen.queryByTestId('starfield')).toBeNull();

  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...DEFAULT_SETTINGS, theme: 'space' }));
  await render(<App />);
  expect(await screen.findByTestId('starfield')).toBeTruthy();
});
