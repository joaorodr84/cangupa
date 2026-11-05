import { render, screen } from '@testing-library/react-native';

import HelpScreen from './HelpScreen';
import { DARK } from '../theme/palette';

test('renders the rules heading and every rule', async () => {
  await render(<HelpScreen palette={DARK} />);

  expect(screen.getByText('Rules')).toBeTruthy();
  expect(screen.getByText('Step:')).toBeTruthy();
  expect(screen.getByText('Jump:')).toBeTruthy();
  expect(screen.getByText('Gold tiles')).toBeTruthy();
  expect(screen.getByText('Steel tiles')).toBeTruthy();
  expect(screen.getByText('Signpost tiles')).toBeTruthy();
  expect(screen.getByText('Gate tiles')).toBeTruthy();
});
