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

function collectByType(node: unknown, type: string, found: { props: Record<string, unknown> }[] = []) {
  if (!node) return found;
  if (Array.isArray(node)) {
    node.forEach((child) => collectByType(child, type, found));
    return found;
  }
  const n = node as { type?: string; props?: Record<string, unknown>; children?: unknown };
  if (n.type === type && n.props) found.push({ props: n.props });
  if (n.children) collectByType(n.children, type, found);
  return found;
}

test('the side face draws the joey in profile facing the same way as the parent', async () => {
  const { toJSON } = await render(<Kangaroo face="side" />);
  const tree = toJSON();
  const ellipses = collectByType(tree, 'RNSVGEllipse');
  const circles = collectByType(tree, 'RNSVGCircle');

  // Identify each face part by its shape, not its position, so the test
  // keeps meaning if the sprite is redrawn: the parent's pupil (r 1.3) and
  // nose (rx 2.4, ry 1.8), the joey's eye (r 1, distinct from the parent's)
  // and its own, smaller nose (rx 1.3, ry 0.9).
  const parentEye = circles.find((c) => c.props.r === 1.3);
  const parentNose = ellipses.find((e) => e.props.rx === 2.4 && e.props.ry === 1.8);
  const joeyEyes = circles.filter((c) => c.props.r === 1);
  const joeyNose = ellipses.find((e) => e.props.rx === 1.3 && e.props.ry === 0.9);
  expect(parentEye).toBeDefined();
  expect(parentNose).toBeDefined();
  expect(joeyNose).toBeDefined();

  // A profile view shows only one eye — a second one, mirrored on the
  // other side of the nose, is what makes a face read as facing the viewer.
  expect(joeyEyes).toHaveLength(1);
  const joeyEye = joeyEyes[0];

  // A side profile needs the nose ahead of the eye, on the same side the
  // parent's own nose sits relative to its eye — a centered nose between
  // two symmetric eyes reads as facing the viewer instead (CANGUPA-128).
  const parentFacing = Math.sign((parentNose!.props.cx as number) - (parentEye!.props.cx as number));
  const joeyFacing = Math.sign((joeyNose!.props.cx as number) - (joeyEye!.props.cx as number));
  expect(joeyFacing).toBe(parentFacing);
});
