import { render, screen } from '@testing-library/react-native';

import HelpScreen from './HelpScreen';
import { paletteFor } from '../theme/palette';

test('renders the rules heading and every rule', async () => {
  await render(<HelpScreen palette={paletteFor('cosmos')} />);

  expect(screen.getByText('Regras')).toBeTruthy();
  expect(screen.getByText('Passo:')).toBeTruthy();
  expect(screen.getByText('Salto:')).toBeTruthy();
  expect(screen.getByText('Casas duplas')).toBeTruthy();
});
