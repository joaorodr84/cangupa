import { fireEvent, render, screen } from '@testing-library/react-native';

import WinPopup from './WinPopup';
import { paletteFor } from '../theme/palette';

const palette = paletteFor('cosmos');

function noop() {
  /* not under test */
}

test('shows the move count', async () => {
  await render(<WinPopup moves={9} hasNext={true} palette={palette} onNext={noop} onClose={noop} />);

  expect(screen.getByText('in 9 moves')).toBeTruthy();
});

test('shows a next-level button when there is a next level, and calls onNext when pressed', async () => {
  const onNext = jest.fn();
  await render(<WinPopup moves={1} hasNext={true} palette={palette} onNext={onNext} onClose={noop} />);

  await fireEvent.press(screen.getByText('Next level'));
  expect(onNext).toHaveBeenCalledTimes(1);
});

test('shows the end-of-game message instead, on the last level', async () => {
  await render(<WinPopup moves={1} hasNext={false} palette={palette} onNext={noop} onClose={noop} />);

  expect(screen.queryByText('Next level')).toBeNull();
  expect(screen.getByText("You've finished the game!")).toBeTruthy();
});

test('pressing the close button calls onClose', async () => {
  const onClose = jest.fn();
  await render(<WinPopup moves={1} hasNext={true} palette={palette} onNext={noop} onClose={onClose} />);

  await fireEvent.press(screen.getByText('✕'));
  expect(onClose).toHaveBeenCalledTimes(1);
});
