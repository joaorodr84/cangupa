import { render, screen } from '@testing-library/react-native';

import HelpScreen from './HelpScreen';
import { paletteFor } from '../theme/palette';

test('renders the rules heading and every rule', async () => {
  await render(<HelpScreen palette={paletteFor('cosmos')} />);

  expect(screen.getByText('Rules')).toBeTruthy();
  expect(screen.getByText('Step:')).toBeTruthy();
  expect(screen.getByText('Jump:')).toBeTruthy();
  expect(screen.getByText('Double tiles')).toBeTruthy();
});
