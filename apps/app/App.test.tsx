import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as SplashScreen from 'expo-splash-screen';

import App from './App';
import { PROGRESS_KEY } from './src/state/progress';
import { SETTINGS_KEY } from './src/state/settings';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// The safe-area provider waits for native metrics Jest does not have, so
// the library's own mock supplies them (insets of zero).
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

// The real module's exports aren't writable, so hideAsync can't be spied on
// directly (CANGUPA-138) — a manual mock stands in instead, the same
// approach the async-storage mock above takes.
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve(true)),
  hideAsync: jest.fn(() => Promise.resolve(true)),
}));

// @expo/vector-icons' Icon checks expo-font's loadAsync on mount, which
// never resolves in this test environment and warns that the update was
// not wrapped in act() — the same stub StatsScreen.test.tsx uses, needed
// here too since the Stats panel this file opens renders real achievement
// cards (CANGUPA-90).
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

// The mock's in-memory store is one shared module-level object, so a value
// set in one test is still there for the next one unless cleared.
afterEach(async () => {
  await AsyncStorage.clear();
});

test('renders without crashing', async () => {
  const { toJSON } = await render(<App />);
  expect(toJSON()).not.toBeNull();
});

// CANGUPA-138: the native splash is held open (preventAutoHideAsync, called
// as soon as App.tsx's module loads) until settings/progress have actually
// finished their first AsyncStorage read, instead of auto-hiding on the
// first JS paint and exposing the loading view's unstyled background for a
// frame. This only checks the release half — that it doesn't get stuck open
// once data is ready — since the hold itself happens before any spy set up
// inside a test could observe it.
test('releases the splash once settings and progress have loaded', async () => {
  expect(SplashScreen.preventAutoHideAsync).toHaveBeenCalled();

  await render(<App />);

  await waitFor(() => expect(SplashScreen.hideAsync).toHaveBeenCalled());
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

test('the collection card collapses and expands, and reopening the Levels tab finds it as it was left', async () => {
  await render(<App />);

  await fireEvent.press(await screen.findByTestId('footer-levels'));
  expect(screen.getByTestId('pack-1')).toBeTruthy();

  await fireEvent.press(screen.getByTestId('collection-toggle-0'));
  expect(screen.queryByTestId('pack-1')).toBeNull();

  // Held in App, not in the pack list itself, so leaving the tab keeps it.
  await fireEvent.press(screen.getByTestId('footer-home'));
  await fireEvent.press(screen.getByTestId('footer-levels'));
  expect(screen.queryByTestId('pack-1')).toBeNull();

  await fireEvent.press(screen.getByTestId('collection-toggle-0'));
  expect(screen.getByTestId('pack-1')).toBeTruthy();
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

test("the board screen's Help button opens a popup over the board, not the rules screen (CANGUPA-121)", async () => {
  await render(<App />);

  await fireEvent.press(await screen.findByText('Play'));
  expect(await screen.findByText('Level 1')).toBeTruthy();

  await fireEvent.press(screen.getByLabelText('Help'));
  // The popup's own Moves section, not a navigation to the full Rules
  // screen (which has an "Rules" heading and a "‹ Back" button neither of
  // which exist here) — the board stays mounted and visible underneath.
  expect(screen.getByText('Moves')).toBeTruthy();
  expect(screen.queryByText('Rules')).toBeNull();
  expect(screen.getByText('Level 1')).toBeTruthy();

  await fireEvent.press(screen.getByText('✕'));
  expect(screen.queryByText('Moves')).toBeNull();
  expect(screen.getByText('Level 1')).toBeTruthy();
});

test('pressing Hint spends one from the balance and counts it, persisted to storage (CANGUPA-54/CANGUPA-142)', async () => {
  await render(<App />);

  await fireEvent.press(await screen.findByText('Play'));
  expect(await screen.findByText('Level 1')).toBeTruthy();

  await fireEvent.press(screen.getByLabelText('Hint'));

  const saved = await AsyncStorage.getItem(PROGRESS_KEY);
  expect(JSON.parse(saved ?? '{}').hints).toBe(2);
  expect(JSON.parse(saved ?? '{}').hintsUsed).toBe(1);
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

test('the footer nav opens the store screen with its Hints section', async () => {
  await render(<App />);
  await fireEvent.press(await screen.findByTestId('footer-store'));

  expect(await screen.findByText('Hints')).toBeTruthy();
  // react-native-iap's own manual mock (__mocks__/react-native-iap.ts)
  // reports connected: false by default, so the store falls back to the
  // same "connecting" row HintStorePopup shows rather than real products.
  expect(screen.getByText('Connecting to the store…')).toBeTruthy();
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
  expect(screen.queryByTestId('footer-store')).toBeNull();
  expect(screen.queryByTestId('footer-stats')).toBeNull();
  expect(screen.queryByTestId('footer-settings')).toBeNull();
});
