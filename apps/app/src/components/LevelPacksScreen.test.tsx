import { fireEvent, render, screen } from '@testing-library/react-native';

import LevelPacksScreen from './LevelPacksScreen';
import { NO_PROGRESS, type Progress } from '../state/progress';
import { DARK } from '../theme/palette';
import { PACK_COLORS } from '../theme/packColors';

const palette = DARK;
// The card expanded, as App.tsx starts it; the collapse tests below pass
// their own.
const open = { collapsed: false, onToggleCollapsed: jest.fn() };

test('shows the collection label and one row per pack, with its name', async () => {
  await render(
    <LevelPacksScreen packSizes={[2, 3]} progress={NO_PROGRESS} palette={palette} {...open} onOpenPack={jest.fn()} />,
  );

  expect(screen.getByText('Lay of the Land')).toBeTruthy();
  expect(screen.getByTestId('pack-1')).toBeTruthy();
  expect(screen.getByTestId('pack-2')).toBeTruthy();
  expect(screen.getByText('Meadow')).toBeTruthy();
  expect(screen.getByText('Creek')).toBeTruthy();
});

test('each pack shows its own level range and cleared count', async () => {
  const progress: Progress = { done: [0, 2], level: 0, bestMoves: {}, hints: 3, hintsUsed: 0, undosUsed: 0 };
  await render(<LevelPacksScreen packSizes={[2, 3]} progress={progress} palette={palette} {...open} onOpenPack={jest.fn()} />);

  // Pack 1 holds levels 1-2 (level 1 done), pack 2 holds levels 3-5 (level 3 done).
  expect(screen.getByText('Levels 1–2')).toBeTruthy();
  expect(screen.getByText('Levels 3–5')).toBeTruthy();
  expect(screen.getByTestId('pack-count-1')).toHaveTextContent('1/2');
  expect(screen.getByTestId('pack-count-2')).toHaveTextContent('1/3');
  expect(screen.queryByText(/solved/)).toBeNull();
});

test("each pack's swatch is tinted in that pack's own colour", async () => {
  await render(
    <LevelPacksScreen packSizes={[2, 3]} progress={NO_PROGRESS} palette={palette} {...open} onOpenPack={jest.fn()} />,
  );

  const first = screen.getByTestId('pack-swatch-1');
  const second = screen.getByTestId('pack-swatch-2');
  expect([first.props.style].flat().some((s) => s?.backgroundColor === PACK_COLORS[0])).toBe(true);
  expect([second.props.style].flat().some((s) => s?.backgroundColor === PACK_COLORS[1])).toBe(true);
});

test('tapping a pack opens it', async () => {
  const onOpenPack = jest.fn();
  await render(
    <LevelPacksScreen packSizes={[2, 3]} progress={NO_PROGRESS} palette={palette} {...open} onOpenPack={onOpenPack} />,
  );

  await fireEvent.press(screen.getByTestId('pack-2'));
  expect(onOpenPack).toHaveBeenCalledWith(1);
});

test('every pack row draws its own icon, not the same one for all', async () => {
  await render(
    <LevelPacksScreen
      packSizes={[1, 1, 1, 1, 1, 1, 1, 1, 1, 1]}
      progress={NO_PROGRESS}
      palette={palette}
      {...open}
      onOpenPack={jest.fn()}
    />,
  );

  for (let n = 1; n <= 10; n++) expect(screen.getByTestId(`pack-icon-${n}`)).toBeTruthy();
});

test("the collection's header shows how many levels are solved across all of its packs", async () => {
  const progress: Progress = { done: [0, 2, 3], level: 0, bestMoves: {}, hints: 3, hintsUsed: 0, undosUsed: 0 };
  await render(
    <LevelPacksScreen packSizes={[2, 3]} progress={progress} palette={palette} {...open} onOpenPack={jest.fn()} />,
  );

  // 1 of pack 1's two levels plus 2 of pack 2's three.
  expect(screen.getByTestId('collection-count')).toHaveTextContent('3/5');
});

test('a collapsed collection keeps its header and hides every pack row', async () => {
  const progress: Progress = { done: [0], level: 0, bestMoves: {}, hints: 3, hintsUsed: 0, undosUsed: 0 };
  await render(
    <LevelPacksScreen
      packSizes={[2, 3]}
      progress={progress}
      palette={palette}
      collapsed
      onToggleCollapsed={jest.fn()}
      onOpenPack={jest.fn()}
    />,
  );

  expect(screen.getByText('Lay of the Land')).toBeTruthy();
  expect(screen.getByTestId('collection-count')).toHaveTextContent('1/5');
  expect(screen.queryByTestId('pack-1')).toBeNull();
  expect(screen.queryByTestId('pack-2')).toBeNull();
  expect(screen.getByTestId('collection-toggle').props.accessibilityState).toEqual({ expanded: false });
  expect(screen.getByTestId('collection-chevron-down')).toBeTruthy();
});

test('tapping the collection header asks to toggle it, and reports itself expanded while open', async () => {
  const onToggleCollapsed = jest.fn();
  await render(
    <LevelPacksScreen
      packSizes={[2, 3]}
      progress={NO_PROGRESS}
      palette={palette}
      collapsed={false}
      onToggleCollapsed={onToggleCollapsed}
      onOpenPack={jest.fn()}
    />,
  );

  expect(screen.getByTestId('collection-toggle').props.accessibilityState).toEqual({ expanded: true });
  expect(screen.getByTestId('collection-chevron-up')).toBeTruthy();
  await fireEvent.press(screen.getByTestId('collection-toggle'));
  expect(onToggleCollapsed).toHaveBeenCalledTimes(1);
});
