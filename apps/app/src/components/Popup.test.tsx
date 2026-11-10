import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';

import Popup from './Popup';
import { DARK } from '../theme/palette';

const palette = DARK;

test('shows the heading and children', async () => {
  await render(
    <Popup palette={palette} heading="A heading">
      <Text>Some content</Text>
    </Popup>,
  );

  expect(screen.getByText('A heading')).toBeTruthy();
  expect(screen.getByText('Some content')).toBeTruthy();
});

test('omits the close button when onClose is not given', async () => {
  await render(<Popup palette={palette} heading="No close" />);

  expect(screen.queryByText('✕')).toBeNull();
});

test('pressing the close button calls onClose', async () => {
  const onClose = jest.fn();
  await render(<Popup palette={palette} onClose={onClose} />);

  await fireEvent.press(screen.getByText('✕'));
  expect(onClose).toHaveBeenCalledTimes(1);
});

test('shows actions separately from children', async () => {
  await render(
    <Popup palette={palette} heading="A heading" actions={<Text>Do it</Text>}>
      <Text>Some content</Text>
    </Popup>,
  );

  expect(screen.getByText('Some content')).toBeTruthy();
  expect(screen.getByText('Do it')).toBeTruthy();
});

test('omits the actions area when no actions are given', async () => {
  await render(<Popup palette={palette} heading="No actions" />);

  expect(screen.queryByText('Do it')).toBeNull();
});

// CANGUPA-122: the overlay used to be pointerEvents="box-none", so a tap
// anywhere outside the card passed straight through to whatever the popup
// was covering (a board tile behind WinPopup/HelpPopup, another settings row
// behind the clear-progress confirmation). A dimmed, opaque-to-touches
// overlay makes "covered" and "unavailable" mean the same thing again.
test('dims the backdrop it covers', async () => {
  await render(<Popup palette={palette} heading="A heading" />);

  const flat = [screen.getByTestId('popup-overlay').props.style].flat();
  expect(flat.some((s) => s?.backgroundColor === 'rgba(0, 0, 0, 0.5)')).toBe(true);
});

test('does not let touches outside the card pass through to what it covers', async () => {
  await render(<Popup palette={palette} heading="A heading" />);

  // Default (auto) pointerEvents, not "box-none" — the overlay itself
  // absorbs touches instead of letting them reach what's behind it.
  expect(screen.getByTestId('popup-overlay').props.pointerEvents).toBeUndefined();
});
