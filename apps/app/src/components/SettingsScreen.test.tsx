import { Alert } from 'react-native';
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
    onChangeJumps: jest.fn(),
    onChangeHints: jest.fn(),
    onChangeAnim: jest.fn(),
    onChangeLanguage: jest.fn(),
    onClearProgress: jest.fn(),
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
  const onChangeJumps = jest.fn();
  const { result } = renderScreen({ onChangeJumps, settings: { ...DEFAULT_SETTINGS, jumps: true } });
  await result;

  fireEvent(screen.getByTestId('toggle-jumps'), 'valueChange', false);
  expect(onChangeJumps).toHaveBeenCalledWith(false);
});

test.each([
  ['toggle-jumps', 'jumps'] as const,
  ['toggle-hints', 'hints'] as const,
  ['toggle-anim', 'anim'] as const,
])('each switch reflects its own setting (%s)', async (testID, key) => {
  await renderScreen({ settings: { ...DEFAULT_SETTINGS, [key]: false } }).result;
  expect(screen.getByTestId(testID).props.value).toBe(false);
});

test('clearing progress asks for confirmation first', async () => {
  const onClearProgress = jest.fn();
  const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation((_title, _msg, buttons) => {
    const destructive = buttons?.find((b) => b.style === 'destructive');
    destructive?.onPress?.();
  });

  const { result } = renderScreen({ onClearProgress });
  await result;

  await fireEvent.press(screen.getByText('Clear progress'));

  expect(alertSpy).toHaveBeenCalledWith(
    'Clear all progress?',
    undefined,
    expect.arrayContaining([expect.objectContaining({ text: 'Cancel' })]),
  );
  expect(onClearProgress).toHaveBeenCalledTimes(1);

  alertSpy.mockRestore();
});

test('cancelling the confirmation does not clear progress', async () => {
  const onClearProgress = jest.fn();
  const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {
    // Cancelled: no button's onPress is invoked.
  });

  const { result } = renderScreen({ onClearProgress });
  await result;

  await fireEvent.press(screen.getByText('Clear progress'));

  expect(onClearProgress).not.toHaveBeenCalled();
  alertSpy.mockRestore();
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
