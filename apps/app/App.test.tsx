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

test('starts on the home screen, with no way back to it once past it', async () => {
  await render(<App />);

  expect(await screen.findByText('Jogar')).toBeTruthy();
  expect(screen.queryByText(/Nível \d+\/50/)).toBeNull();

  await fireEvent.press(screen.getByText('Jogar'));
  expect(await screen.findByText(/Nível 1\/50/)).toBeTruthy();
  expect(screen.queryByText('Jogar')).toBeNull();
  expect(screen.queryByText('‹ Voltar')).toBeNull();
});

test('resumes the last-played level', async () => {
  await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify({ done: [0], level: 2 }));

  await render(<App />);
  await fireEvent.press(await screen.findByText('Jogar'));

  expect(await screen.findByText(/Nível 3\/50/)).toBeTruthy();
});

test('opens the levels screen and picking a level returns to the board', async () => {
  await render(<App />);
  await fireEvent.press(await screen.findByText('Jogar'));

  await fireEvent.press(await screen.findByText('Níveis'));
  expect(screen.getByTestId('level-2')).toBeTruthy();

  await fireEvent.press(screen.getByTestId('level-1'));
  expect(await screen.findByText(/Nível 1\/50/)).toBeTruthy();
});

test('opens the rules screen and returns to the board', async () => {
  await render(<App />);
  await fireEvent.press(await screen.findByText('Jogar'));

  await fireEvent.press(await screen.findByText('Regras'));
  expect(screen.getByText('Regras')).toBeTruthy();

  await fireEvent.press(screen.getByText('‹ Voltar'));
  expect(await screen.findByText(/Nível 1\/50/)).toBeTruthy();
});

test('opens the settings screen and changing the theme is reflected on return', async () => {
  await render(<App />);
  await fireEvent.press(await screen.findByText('Jogar'));

  await fireEvent.press(await screen.findByText('Definições'));
  await fireEvent.press(screen.getByTestId('theme-ice'));

  const saved = await AsyncStorage.getItem(SETTINGS_KEY);
  expect(JSON.parse(saved ?? '{}').theme).toBe('ice');
});

test('shows the starfield for the space theme and not for the default theme', async () => {
  await render(<App />);
  expect(screen.queryByTestId('starfield')).toBeNull();

  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...DEFAULT_SETTINGS, theme: 'space' }));
  await render(<App />);
  expect(await screen.findByTestId('starfield')).toBeTruthy();
});
