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

  expect(await screen.findByText('Jogar')).toBeTruthy();
  expect(screen.queryByText(/Nível \d+\/50/)).toBeNull();

  await fireEvent.press(screen.getByText('Jogar'));
  expect(await screen.findByText(/Nível 1\/50/)).toBeTruthy();
  expect(screen.queryByText('Jogar')).toBeNull();

  await fireEvent.press(screen.getByLabelText('Voltar ao início'));
  expect(await screen.findByText('Jogar')).toBeTruthy();
});

test('resumes the last-played level', async () => {
  await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify({ done: [0], level: 2 }));

  await render(<App />);
  await fireEvent.press(await screen.findByText('Jogar'));

  expect(await screen.findByText(/Nível 3\/50/)).toBeTruthy();
});

test('the footer nav opens the levels screen, and picking a level opens the board', async () => {
  await render(<App />);

  await fireEvent.press(await screen.findByTestId('footer-levels'));
  expect(screen.getByTestId('level-2')).toBeTruthy();

  await fireEvent.press(screen.getByTestId('level-1'));
  expect(await screen.findByText(/Nível 1\/50/)).toBeTruthy();
});

test('the home screen\'s Rules button opens the rules screen, and Voltar returns to the board', async () => {
  await render(<App />);

  await fireEvent.press(await screen.findByText('Regras'));
  expect(screen.getByText('Regras')).toBeTruthy();

  await fireEvent.press(screen.getByText('‹ Voltar'));
  expect(await screen.findByText(/Nível 1\/50/)).toBeTruthy();
});

test('the footer nav opens the settings screen, and changing the theme is reflected on return', async () => {
  await render(<App />);

  await fireEvent.press(await screen.findByTestId('footer-settings'));
  await fireEvent.press(screen.getByTestId('theme-ice'));

  const saved = await AsyncStorage.getItem(SETTINGS_KEY);
  expect(JSON.parse(saved ?? '{}').theme).toBe('ice');
});

test('the settings screen has no back button of its own, unlike the rules screen', async () => {
  await render(<App />);

  await fireEvent.press(await screen.findByTestId('footer-settings'));
  expect(await screen.findByText('Definições')).toBeTruthy();
  expect(screen.queryByText('‹ Voltar')).toBeNull();
});

test('the footer nav opens the stats screen, which reflects a cleared level', async () => {
  await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify({ done: [0], level: 1, bestMoves: { 0: 3 } }));

  await render(<App />);
  await fireEvent.press(await screen.findByTestId('footer-stats'));

  expect(screen.getByText(/Níveis limpos: 1\/50/)).toBeTruthy();
  expect(screen.getByText('Nível 1')).toBeTruthy();
  expect(screen.getByText('3 jogadas')).toBeTruthy();
});

test('the footer nav\'s Home tab returns to the home screen from levels, stats and settings', async () => {
  await render(<App />);

  await fireEvent.press(await screen.findByTestId('footer-levels'));
  expect(screen.getByTestId('level-1')).toBeTruthy();

  await fireEvent.press(screen.getByTestId('footer-home'));
  expect(await screen.findByText('Jogar')).toBeTruthy();
});

test('the board screen has no footer nav of its own', async () => {
  await render(<App />);

  await fireEvent.press(await screen.findByText('Jogar'));
  await screen.findByText(/Nível 1\/50/);

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
