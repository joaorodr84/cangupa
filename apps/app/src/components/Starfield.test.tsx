import { render, screen } from '@testing-library/react-native';

import Starfield from './Starfield';
import { paletteFor } from '../theme/palette';

test('renders nothing for a theme with no stars', async () => {
  await render(<Starfield stars={paletteFor('cosmos').stars} />);
  expect(screen.queryByTestId('starfield')).toBeNull();
});

test('tiles the space theme stars across the screen', async () => {
  await render(<Starfield stars={paletteFor('space').stars} />);
  expect(screen.getByTestId('starfield')).toBeTruthy();
});
