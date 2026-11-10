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

// CANGUPA-123: content used to be flex: 1, so it (and whatever a consumer
// nested inside it, like HelpPopup's ScrollView) could claim space card's
// min/max bounds left available. But a node carrying both a min and a max
// height, with a flex: 1 descendant inside it, is a known native layout
// footgun: instead of auto-sizing to content and clamping between the two,
// it just snapped to whichever single bound was still in play — first
// minHeight (when both were on card), then maxHeight once content's own
// flex: 1 was the only constraint left (every Popup, not just HelpPopup,
// then rendered at ~82% of the screen, confirmed on-device both times).
// content carries no flex now, so card is an ordinary auto-sized box again.
test('content has no flex, so card auto-sizes between its min and max height', async () => {
  await render(
    <Popup palette={palette} heading="A heading">
      <Text>Some content</Text>
    </Popup>,
  );

  const cardStyle = [screen.getByTestId('popup-card').props.style].flat();
  expect(cardStyle.some((s) => s?.minHeight === 220)).toBe(true);
  expect(cardStyle.some((s) => s?.maxHeight !== undefined)).toBe(true);

  const contentStyle = [screen.getByTestId('popup-content').props.style].flat();
  expect(contentStyle.some((s) => s?.flex !== undefined)).toBe(false);
});
