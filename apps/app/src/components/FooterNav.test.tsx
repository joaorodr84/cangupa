import { fireEvent, render, screen } from '@testing-library/react-native';

import FooterNav from './FooterNav';
import { paletteFor } from '../theme/palette';

const palette = paletteFor('cosmos');

test('renders all four tabs, labelled for accessibility rather than as visible text', async () => {
  await render(<FooterNav active="home" palette={palette} onSelect={jest.fn()} />);

  expect(screen.getByLabelText('Início')).toBeTruthy();
  expect(screen.getByLabelText('Níveis')).toBeTruthy();
  expect(screen.getByLabelText('Estatísticas')).toBeTruthy();
  expect(screen.getByLabelText('Definições')).toBeTruthy();
});

test('only the active tab is marked selected', async () => {
  await render(<FooterNav active="stats" palette={palette} onSelect={jest.fn()} />);

  expect(screen.getByTestId('footer-stats').props.accessibilityState).toEqual({ selected: true });
  expect(screen.getByTestId('footer-home').props.accessibilityState).toEqual({ selected: false });
  expect(screen.getByTestId('footer-levels').props.accessibilityState).toEqual({ selected: false });
  expect(screen.getByTestId('footer-settings').props.accessibilityState).toEqual({ selected: false });
});

test('each tab renders its own icon', async () => {
  await render(<FooterNav active="home" palette={palette} onSelect={jest.fn()} />);

  expect(screen.getByTestId('footer-icon-home')).toBeTruthy();
  expect(screen.getByTestId('footer-icon-levels')).toBeTruthy();
  expect(screen.getByTestId('footer-icon-stats')).toBeTruthy();
  expect(screen.getByTestId('footer-icon-settings')).toBeTruthy();
});

test('pressing a tab reports its id', async () => {
  const onSelect = jest.fn();
  await render(<FooterNav active="home" palette={palette} onSelect={onSelect} />);

  await fireEvent.press(screen.getByTestId('footer-levels'));

  expect(onSelect).toHaveBeenCalledWith('levels');
});
