import { fireEvent, render, screen } from '@testing-library/react-native';

import SettingsScreen from './SettingsScreen';
import { DEFAULT_SETTINGS } from '../state/settings';
import { DARK } from '../theme/palette';

const palette = DARK;

function renderScreen(overrides: Partial<Parameters<typeof SettingsScreen>[0]> = {}) {
  const props = {
    settings: DEFAULT_SETTINGS,
    palette,
    onChangeThemeMode: jest.fn(),
    onChangeHints: jest.fn(),
    onChangeAnim: jest.fn(),
    onChangeSound: jest.fn(),
    onChangeFall: jest.fn(),
    onChangeDirectionalPad: jest.fn(),
    onChangeLanguage: jest.fn(),
    onClearProgress: jest.fn(),
    onOpenHintStore: jest.fn(),
    ...overrides,
  };
  return { props, result: render(<SettingsScreen {...props} />) };
}

test('tapping a theme mode chip reports it', async () => {
  const onChangeThemeMode = jest.fn();
  const { result } = renderScreen({ onChangeThemeMode });
  await result;

  await fireEvent.press(screen.getByTestId('theme-mode-light'));
  expect(onChangeThemeMode).toHaveBeenCalledWith('light');
});

test('marks the current theme mode choice as selected', async () => {
  await renderScreen({ settings: { ...DEFAULT_SETTINGS, themeMode: 'dark' } }).result;

  expect(screen.getByTestId('theme-mode-dark').props.accessibilityState).toEqual({ checked: true });
  expect(screen.getByTestId('theme-mode-system').props.accessibilityState).toEqual({ checked: false });
});

test('toggling a switch reports its new value', async () => {
  const onChangeHints = jest.fn();
  const { result } = renderScreen({ onChangeHints, settings: { ...DEFAULT_SETTINGS, hints: true } });
  await result;

  fireEvent(screen.getByTestId('toggle-hints'), 'valueChange', false);
  expect(onChangeHints).toHaveBeenCalledWith(false);
});

test('toggling the directional-pad switch reports its new value (CANGUPA-156)', async () => {
  const onChangeDirectionalPad = jest.fn();
  const { result } = renderScreen({ onChangeDirectionalPad, settings: { ...DEFAULT_SETTINGS, directionalPad: false } });
  await result;

  fireEvent(screen.getByTestId('toggle-directional-pad'), 'valueChange', true);
  expect(onChangeDirectionalPad).toHaveBeenCalledWith(true);
});

test.each([
  ['toggle-hints', 'hints'] as const,
  ['toggle-anim', 'anim'] as const,
  ['toggle-sound', 'sound'] as const,
  ['toggle-fall', 'fall'] as const,
  ['toggle-directional-pad', 'directionalPad'] as const,
])('each switch reflects its own setting (%s)', async (testID, key) => {
  await renderScreen({ settings: { ...DEFAULT_SETTINGS, [key]: false } }).result;
  expect(screen.getByTestId(testID).props.value).toBe(false);
});

test('clearing progress asks for confirmation first, in its own popup', async () => {
  const onClearProgress = jest.fn();
  const { result } = renderScreen({ onClearProgress });
  await result;

  await fireEvent.press(screen.getByText('Clear progress'));
  expect(screen.getByText('Are you sure you want to clear your progress?')).toBeTruthy();
  expect(onClearProgress).not.toHaveBeenCalled();

  await fireEvent.press(screen.getByText('Yes'));
  expect(onClearProgress).toHaveBeenCalledTimes(1);
});

test('answering No does not clear progress', async () => {
  const onClearProgress = jest.fn();
  const { result } = renderScreen({ onClearProgress });
  await result;

  await fireEvent.press(screen.getByText('Clear progress'));
  await fireEvent.press(screen.getByText('No'));

  expect(onClearProgress).not.toHaveBeenCalled();
  expect(screen.queryByText('Are you sure you want to clear your progress?')).toBeNull();
});

test('tapping a language row reports it', async () => {
  const onChangeLanguage = jest.fn();
  const { result } = renderScreen({ onChangeLanguage });
  await result;

  await fireEvent.press(screen.getByTestId('language-pt'));
  expect(onChangeLanguage).toHaveBeenCalledWith('pt');
});

test('marks the current language choice as selected', async () => {
  await renderScreen({ settings: { ...DEFAULT_SETTINGS, language: 'pt' } }).result;

  expect(screen.getByTestId('language-pt').props.accessibilityState).toEqual({ checked: true });
  expect(screen.getByTestId('language-system').props.accessibilityState).toEqual({ checked: false });
});

test('tapping Buy hints opens the hint store (CANGUPA-79)', async () => {
  const onOpenHintStore = jest.fn();
  const { result } = renderScreen({ onOpenHintStore });
  await result;

  await fireEvent.press(screen.getByText('Buy hints'));
  expect(onOpenHintStore).toHaveBeenCalledTimes(1);
});
