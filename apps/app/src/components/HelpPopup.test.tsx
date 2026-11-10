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

// CANGUPA-123: Popup's shared content wrapper used to be flex: 1, which
// this scroll view leant on to fill the card — but removing that (it was
// also making every Popup balloon to the card's full maxHeight, not just
// this one) left this scroll view with nothing of its own to size itself
// by. An explicit height, not a cap, gives it a real, concrete box.
test('the scroll view has an explicit, positive height', async () => {
  await render(<HelpPopup palette={DARK} onClose={noop} />);

  const flat = [screen.getByTestId('help-popup-scroll').props.style].flat();
  const height = flat.find((s) => typeof s?.height === 'number')?.height;
  expect(height).toBeGreaterThan(0);
});
