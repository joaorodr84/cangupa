import { fireEvent, render, screen } from '@testing-library/react-native';

import DirectionalPad from './DirectionalPad';
import { type ArrowDirection } from '../game/boardView';
import { DARK } from '../theme/palette';

const palette = DARK;

test('an enabled direction is pressable and reports which one was pressed', async () => {
  const onPress = jest.fn();

  await render(<DirectionalPad palette={palette} canMove={() => true} onPress={onPress} />);

  await fireEvent.press(screen.getByTestId('dpad-up'));

  expect(onPress).toHaveBeenCalledWith('up');
});

test('a disabled direction is marked so for accessibility and does not fire a press', async () => {
  const onPress = jest.fn();

  await render(<DirectionalPad palette={palette} canMove={() => false} onPress={onPress} />);

  const button = screen.getByTestId('dpad-down');
  expect(button.props.accessibilityState).toEqual({ disabled: true });

  await fireEvent.press(button);

  expect(onPress).not.toHaveBeenCalled();
});

test('each button is labelled for its own direction', async () => {
  await render(<DirectionalPad palette={palette} canMove={() => true} onPress={jest.fn()} />);

  const expected: Record<ArrowDirection, string> = {
    up: 'Move up',
    down: 'Move down',
    left: 'Move left',
    right: 'Move right',
  };
  for (const [direction, label] of Object.entries(expected)) {
    expect(screen.getByTestId(`dpad-${direction}`).props.accessibilityLabel).toBe(label);
  }
});
