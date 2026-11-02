import { fireEvent, render, screen } from '@testing-library/react-native';

import FooterNav from './FooterNav';
import { paletteFor } from '../theme/palette';

const palette = paletteFor('cosmos');

test('renders all four tabs', async () => {
  await render(<FooterNav active="home" palette={palette} onSelect={jest.fn()} />);

  expect(screen.getByText('Início')).toBeTruthy();
  expect(screen.getByText('Níveis')).toBeTruthy();
  expect(screen.getByText('Estatísticas')).toBeTruthy();
  expect(screen.getByText('Definições')).toBeTruthy();
});

test('the active tab is outlined', async () => {
  await render(<FooterNav active="stats" palette={palette} onSelect={jest.fn()} />);

  const flat = [screen.getByTestId('footer-stats').props.style].flat();
  expect(flat.some((s) => s?.borderColor === 'rgba(255,214,90,0.9)')).toBe(true);
});

test('pressing a tab reports its id', async () => {
  const onSelect = jest.fn();
  await render(<FooterNav active="home" palette={palette} onSelect={onSelect} />);

  await fireEvent.press(screen.getByTestId('footer-levels'));

  expect(onSelect).toHaveBeenCalledWith('levels');
});
