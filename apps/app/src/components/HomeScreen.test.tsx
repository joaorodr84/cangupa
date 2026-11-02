import { fireEvent, render, screen } from '@testing-library/react-native';

import HomeScreen from './HomeScreen';
import { DARK } from '../theme/palette';

function noop() {
  /* not under test */
}

test('shows the level Play is about to open', async () => {
  await render(
    <HomeScreen palette={DARK} levelNumber={7} onPlay={noop} onRules={noop} />,
  );

  expect(screen.getByText('Level 7')).toBeTruthy();
});

test('pressing Play fires onPlay', async () => {
  const onPlay = jest.fn();
  await render(
    <HomeScreen palette={DARK} levelNumber={1} onPlay={onPlay} onRules={noop} />,
  );

  await fireEvent.press(screen.getByText('Play'));

  expect(onPlay).toHaveBeenCalledTimes(1);
});

test('pressing Rules fires onRules', async () => {
  const onRules = jest.fn();
  await render(
    <HomeScreen palette={DARK} levelNumber={1} onPlay={noop} onRules={onRules} />,
  );

  await fireEvent.press(screen.getByText('Rules'));

  expect(onRules).toHaveBeenCalledTimes(1);
});
