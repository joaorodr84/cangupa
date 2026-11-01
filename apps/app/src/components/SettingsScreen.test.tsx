import { Alert } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';

import SettingsScreen from './SettingsScreen';
import { DEFAULT_SETTINGS } from '../state/settings';
import { paletteFor } from '../theme/palette';

const palette = paletteFor('cosmos');

function renderScreen(overrides: Partial<Parameters<typeof SettingsScreen>[0]> = {}) {
  const props = {
    settings: DEFAULT_SETTINGS,
    palette,
    onChangeTheme: jest.fn(),
    onChangeJumps: jest.fn(),
    onChangeHints: jest.fn(),
    onChangeAnim: jest.fn(),
    onClearProgress: jest.fn(),
    ...overrides,
  };
  return { props, result: render(<SettingsScreen {...props} />) };
}

test('tapping a theme chip reports it', async () => {
  const onChangeTheme = jest.fn();
  const { result } = renderScreen({ onChangeTheme });
  await result;

  await fireEvent.press(screen.getByTestId('theme-ice'));
  expect(onChangeTheme).toHaveBeenCalledWith('ice');
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

  await fireEvent.press(screen.getByText('Apagar progresso'));

  expect(alertSpy).toHaveBeenCalledWith(
    'Apagar todo o progresso?',
    undefined,
    expect.arrayContaining([expect.objectContaining({ text: 'Cancelar' })]),
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

  await fireEvent.press(screen.getByText('Apagar progresso'));

  expect(onClearProgress).not.toHaveBeenCalled();
  alertSpy.mockRestore();
});
