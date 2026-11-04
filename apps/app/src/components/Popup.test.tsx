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
