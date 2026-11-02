import { render, screen } from '@testing-library/react-native';

import Starfield from './Starfield';
import { DARK, LIGHT } from '../theme/palette';

test('renders nothing for a theme with no stars', async () => {
  await render(<Starfield stars={LIGHT.stars} />);
  expect(screen.queryByTestId('starfield')).toBeNull();
});

test('tiles the dark theme stars across the screen', async () => {
  await render(<Starfield stars={DARK.stars} />);
  expect(screen.getByTestId('starfield')).toBeTruthy();
});
