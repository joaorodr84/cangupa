import { fireEvent, render, screen } from '@testing-library/react-native';

import LevelsScreen from './LevelsScreen';
import { NO_PROGRESS, type Progress } from '../state/progress';
import { DARK } from '../theme/palette';
import { PACK_COLORS, packLabelColorFor } from '../theme/packColors';

const palette = DARK;

test('renders one button per level in the given pack', async () => {
  await render(
    <LevelsScreen
      packIndex={0}
      packSizes={[5]}
      progress={NO_PROGRESS}
      currentLevel={0}
      palette={palette}
      onSelectLevel={jest.fn()}
      onBack={jest.fn()}
    />,
  );

  for (let n = 1; n <= 5; n++) {
    expect(screen.getByText(String(n))).toBeTruthy();
  }
});

test('only the first level is unlocked with no progress', async () => {
  const onSelectLevel = jest.fn();
  await render(
    <LevelsScreen
      packIndex={0}
      packSizes={[3]}
      progress={NO_PROGRESS}
      currentLevel={0}
      palette={palette}
      onSelectLevel={onSelectLevel}
      onBack={jest.fn()}
    />,
  );

  await fireEvent.press(screen.getByTestId('level-1'));
  expect(onSelectLevel).toHaveBeenCalledWith(0);

  onSelectLevel.mockClear();
  await fireEvent.press(screen.getByTestId('level-2'));
  expect(onSelectLevel).not.toHaveBeenCalled();
});

test('a level unlocks once the one before it is cleared', async () => {
  const progress: Progress = { done: [0], level: 0, bestMoves: {}, hints: 3 };
  const onSelectLevel = jest.fn();
  await render(
    <LevelsScreen
      packIndex={0}
      packSizes={[3]}
      progress={progress}
      currentLevel={0}
      palette={palette}
      onSelectLevel={onSelectLevel}
      onBack={jest.fn()}
    />,
  );

  await fireEvent.press(screen.getByTestId('level-2'));
  expect(onSelectLevel).toHaveBeenCalledWith(1);
});

test('a cleared level is marked done in the pack colour, with a contrast-safe number', async () => {
  const progress: Progress = { done: [0], level: 1, bestMoves: {}, hints: 3 };
  await render(
    <LevelsScreen
      packIndex={0}
      packSizes={[2]}
      progress={progress}
      currentLevel={1}
      palette={palette}
      onSelectLevel={jest.fn()}
      onBack={jest.fn()}
    />,
  );

  const done = screen.getByTestId('level-1');
  const flat = [done.props.style].flat();
  expect(flat.some((s) => s?.backgroundColor === PACK_COLORS[0])).toBe(true);
  expect(screen.getByText('1').props.style[1].color).toBe(packLabelColorFor(0));
});

test('a locked level has a solid background and dimmed text, not a faded cell', async () => {
  await render(
    <LevelsScreen
      packIndex={0}
      packSizes={[2]}
      progress={NO_PROGRESS}
      currentLevel={0}
      palette={palette}
      onSelectLevel={jest.fn()}
      onBack={jest.fn()}
    />,
  );

  const locked = screen.getByTestId('level-2');
  const flat = [locked.props.style].flat();
  expect(flat.some((s) => s?.opacity !== undefined)).toBe(false);
  expect(flat.some((s) => s?.backgroundColor === palette.panel)).toBe(true);
  expect(screen.getByText('2').props.style[1].color).toBe(palette.muted);
});

test('the current level is outlined in the theme ink colour', async () => {
  const progress: Progress = { done: [0], level: 1, bestMoves: {}, hints: 3 };
  await render(
    <LevelsScreen
      packIndex={0}
      packSizes={[2]}
      progress={progress}
      currentLevel={1}
      palette={palette}
      onSelectLevel={jest.fn()}
      onBack={jest.fn()}
    />,
  );

  const current = screen.getByTestId('level-2');
  const flat = [current.props.style].flat();
  expect(flat.some((s) => s?.borderColor === palette.ink)).toBe(true);
  expect(flat.some((s) => s?.borderWidth === 2)).toBe(true);
});

// Pack scoping and the drill-down header (CANGUPA-73)

test('level numbers reflect the pack offset, and only that pack shows', async () => {
  await render(
    <LevelsScreen
      packIndex={1}
      packSizes={[2, 3]}
      progress={NO_PROGRESS}
      currentLevel={0}
      palette={palette}
      onSelectLevel={jest.fn()}
      onBack={jest.fn()}
    />,
  );

  // Pack 1 holds levels 1-2 and pack 2 (index 1) holds 3-5.
  expect(screen.queryByTestId('level-1')).toBeNull();
  expect(screen.queryByTestId('level-2')).toBeNull();
  for (let n = 3; n <= 5; n++) {
    expect(screen.getByTestId(`level-${n}`)).toBeTruthy();
  }
});

test("a pack's first level is unlocked with no progress at all (CANGUPA-77)", async () => {
  const onSelectLevel = jest.fn();
  await render(
    <LevelsScreen
      packIndex={1}
      packSizes={[2, 3]}
      progress={NO_PROGRESS}
      currentLevel={0}
      palette={palette}
      onSelectLevel={onSelectLevel}
      onBack={jest.fn()}
    />,
  );

  // Pack 2 (index 1) starts at level 3 — its own first level, unlocked
  // without pack 1 being touched at all.
  await fireEvent.press(screen.getByTestId('level-3'));
  expect(onSelectLevel).toHaveBeenCalledWith(2);

  onSelectLevel.mockClear();
  await fireEvent.press(screen.getByTestId('level-4'));
  expect(onSelectLevel).not.toHaveBeenCalled();
});

test("shows the pack's own name, in its own colour, and its blurb in its header", async () => {
  const progress: Progress = { done: [2], level: 0, bestMoves: {}, hints: 3 };
  await render(
    <LevelsScreen
      packIndex={1}
      packSizes={[2, 3]}
      progress={progress}
      currentLevel={0}
      palette={palette}
      onSelectLevel={jest.fn()}
      onBack={jest.fn()}
    />,
  );

  expect(screen.getByTestId('pack-header')).toBeTruthy();
  const name = screen.getByText('Creek');
  expect(name).toBeTruthy();
  expect([name.props.style].flat().some((s) => s?.color === PACK_COLORS[1])).toBe(true);
  expect(
    screen.getByText("A streambed of golden stones, slick till you've stood on them twice, and one washed clean through."),
  ).toBeTruthy();
});

test('the back button in the header calls onBack', async () => {
  const onBack = jest.fn();
  await render(
    <LevelsScreen
      packIndex={0}
      packSizes={[2]}
      progress={NO_PROGRESS}
      currentLevel={0}
      palette={palette}
      onSelectLevel={jest.fn()}
      onBack={onBack}
    />,
  );

  await fireEvent.press(screen.getByRole('button', { name: /back/i }));
  expect(onBack).toHaveBeenCalled();
});
