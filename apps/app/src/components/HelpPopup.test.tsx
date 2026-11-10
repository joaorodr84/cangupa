import { fireEvent, render, screen, within } from '@testing-library/react-native';

import HelpPopup from './HelpPopup';
import { DARK } from '../theme/palette';

function noop() {
  /* not under test */
}

test('shows the Moves and Tiles sections, but not Buttons (CANGUPA-121)', async () => {
  await render(<HelpPopup palette={DARK} onClose={noop} />);

  expect(screen.getByText('Moves')).toBeTruthy();
  expect(screen.getByText('Tiles')).toBeTruthy();
  expect(screen.queryByText('Buttons')).toBeNull();
});

test('the Step/Jump diagrams and tile swatches render the same content as HelpScreen', async () => {
  await render(<HelpPopup palette={DARK} onClose={noop} />);

  const step = within(screen.getByTestId('help-diagram-step'));
  expect(step.getByTestId('tile-0-0')).toBeTruthy();
  expect(step.getByTestId('tile-press-1-0')).toBeTruthy();

  expect(screen.getByTestId('help-swatch-gold')).toBeTruthy();
  expect(screen.getByTestId('help-swatch-steel')).toBeTruthy();
  expect(screen.getByTestId('help-swatch-departure')).toBeTruthy();
  expect(screen.getByTestId('help-swatch-arrival')).toBeTruthy();
});

test('pressing close calls onClose', async () => {
  const onClose = jest.fn();
  await render(<HelpPopup palette={DARK} onClose={onClose} />);

  await fireEvent.press(screen.getByText('✕'));
  expect(onClose).toHaveBeenCalledTimes(1);
});
