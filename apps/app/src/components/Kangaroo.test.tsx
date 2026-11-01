import { render, screen } from '@testing-library/react-native';

import Kangaroo, { type Face } from './Kangaroo';

test.each<Face>(['side', 'front', 'back'])('renders the %s face without crashing', async (face) => {
  const { toJSON } = await render(<Kangaroo face={face} />);
  expect(toJSON()).not.toBeNull();
});

test('mirrors the side face when flip is set', async () => {
  await render(<Kangaroo face="side" flip />);
  const hopper = screen.getByTestId('kangaroo-hopper');
  expect(hopper.props.style).toEqual(
    expect.arrayContaining([expect.objectContaining({ transform: [{ scaleX: -1 }] })]),
  );
});

test('does not mirror by default', async () => {
  await render(<Kangaroo face="side" />);
  const hopper = screen.getByTestId('kangaroo-hopper');
  const flat = [hopper.props.style].flat();
  expect(flat.every((s) => !s || !s.transform)).toBe(true);
});
