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

test('groups the rules into a Moves section and a Tiles section (CANGUPA-101)', async () => {
  await render(<HelpScreen palette={DARK} />);

  expect(screen.getByText('Moves')).toBeTruthy();
  expect(screen.getByText('Tiles')).toBeTruthy();
});

test('each tile kind shows a colour swatch taken from the live palette', async () => {
  await render(<HelpScreen palette={DARK} />);

  const flat = (testId: string) => [screen.getByTestId(testId).props.style].flat();

  expect(flat('help-swatch-gold').some((s) => s?.backgroundColor === DARK.tile2)).toBe(true);
  expect(flat('help-swatch-steel').some((s) => s?.backgroundColor === DARK.tile3)).toBe(true);
  expect(flat('help-swatch-signpost').some((s) => s?.backgroundColor === DARK.tileSignpost)).toBe(true);
  expect(flat('help-swatch-gate').some((s) => s?.backgroundColor === DARK.tileGate)).toBe(true);
});
