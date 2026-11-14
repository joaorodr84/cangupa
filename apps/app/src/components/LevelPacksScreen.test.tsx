import { fireEvent, render, screen } from '@testing-library/react-native';

import LevelPacksScreen from './LevelPacksScreen';
import { type Collection } from '../game/packs';
import { NO_PROGRESS, type Progress } from '../state/progress';
import { DARK } from '../theme/palette';
import { PACK_COLORS } from '../theme/packColors';

const palette = DARK;
// One collection covering both test packs, matching every real pack today sitting in Lay of
// the Land alone — the shape every test below but the "two collections" ones at the end uses.
const oneCollection: readonly Collection[] = [{ name: 'Lay of the Land', packCount: 2 }];
// The card expanded, as App.tsx starts every card; the collapse tests below pass their own.
const open = { collapsed: new Set<number>(), onToggleCollapsed: jest.fn() };

function progress(overrides: Partial<Progress>): Progress {
  return {
    done: [],
    level: 0,
    bestMoves: {},
    hints: 3,
    hintsUsed: 0,
    undosUsed: 0,
    perfectClears: 0,
    perfectStreak: 0,
    bestPerfectStreak: 0,
    timePlayedMs: 0,
    lastPlayedDate: null,
    playStreak: 0,
    bestPlayStreak: 0,
    ...overrides,
  };
}

test('shows the collection label and one row per pack, with its name', async () => {
  await render(
    <LevelPacksScreen collections={oneCollection} packSizes={[2, 3]} progress={NO_PROGRESS} palette={palette} {...open} onOpenPack={jest.fn()} />,
  );

  expect(screen.getByText('Lay of the Land')).toBeTruthy();
  expect(screen.getByTestId('pack-1')).toBeTruthy();
  expect(screen.getByTestId('pack-2')).toBeTruthy();
  expect(screen.getByText('Meadow')).toBeTruthy();
  expect(screen.getByText('Creek')).toBeTruthy();
});

test('each pack shows its own level range and cleared count', async () => {
  const packsProgress = progress({ done: [0, 2], level: 0 });
  await render(
    <LevelPacksScreen collections={oneCollection} packSizes={[2, 3]} progress={packsProgress} palette={palette} {...open} onOpenPack={jest.fn()} />,
  );

  // Pack 1 holds levels 1-2 (level 1 done), pack 2 holds levels 3-5 (level 3 done).
  expect(screen.getByText('Levels 1–2')).toBeTruthy();
  expect(screen.getByText('Levels 3–5')).toBeTruthy();
  expect(screen.getByTestId('pack-count-1')).toHaveTextContent('1/2');
  expect(screen.getByTestId('pack-count-2')).toHaveTextContent('1/3');
  expect(screen.queryByText(/solved/)).toBeNull();
});

test("each pack's swatch is tinted in that pack's own colour", async () => {
  await render(
    <LevelPacksScreen collections={oneCollection} packSizes={[2, 3]} progress={NO_PROGRESS} palette={palette} {...open} onOpenPack={jest.fn()} />,
  );

  const first = screen.getByTestId('pack-swatch-1');
  const second = screen.getByTestId('pack-swatch-2');
  expect([first.props.style].flat().some((s) => s?.backgroundColor === PACK_COLORS[0])).toBe(true);
  expect([second.props.style].flat().some((s) => s?.backgroundColor === PACK_COLORS[1])).toBe(true);
});

test('tapping a pack opens it', async () => {
  const onOpenPack = jest.fn();
  await render(
    <LevelPacksScreen collections={oneCollection} packSizes={[2, 3]} progress={NO_PROGRESS} palette={palette} {...open} onOpenPack={onOpenPack} />,
  );

  await fireEvent.press(screen.getByTestId('pack-2'));
  expect(onOpenPack).toHaveBeenCalledWith(1);
});

test('every pack row draws its own icon, not the same one for all', async () => {
  await render(
    <LevelPacksScreen
      collections={[{ name: 'Lay of the Land', packCount: 10 }]}
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
  const packsProgress = progress({ done: [0, 2, 3], level: 0 });
  await render(
    <LevelPacksScreen collections={oneCollection} packSizes={[2, 3]} progress={packsProgress} palette={palette} {...open} onOpenPack={jest.fn()} />,
  );

  // 1 of pack 1's two levels plus 2 of pack 2's three.
  expect(screen.getByTestId('collection-count-0')).toHaveTextContent('3/5');
});

test('a collapsed collection keeps its header and hides every pack row', async () => {
  const packsProgress = progress({ done: [0], level: 0 });
  await render(
    <LevelPacksScreen
      collections={oneCollection}
      packSizes={[2, 3]}
      progress={packsProgress}
      palette={palette}
      collapsed={new Set([0])}
      onToggleCollapsed={jest.fn()}
      onOpenPack={jest.fn()}
    />,
  );

  expect(screen.getByText('Lay of the Land')).toBeTruthy();
  expect(screen.getByTestId('collection-count-0')).toHaveTextContent('1/5');
  expect(screen.queryByTestId('pack-1')).toBeNull();
  expect(screen.queryByTestId('pack-2')).toBeNull();
  expect(screen.getByTestId('collection-toggle-0').props.accessibilityState).toEqual({ expanded: false });
  expect(screen.getByTestId('collection-chevron-down-0')).toBeTruthy();
});

test('tapping the collection header asks to toggle it, by its own index, and reports itself expanded while open', async () => {
  const onToggleCollapsed = jest.fn();
  await render(
    <LevelPacksScreen
      collections={oneCollection}
      packSizes={[2, 3]}
      progress={NO_PROGRESS}
      palette={palette}
      collapsed={new Set<number>()}
      onToggleCollapsed={onToggleCollapsed}
      onOpenPack={jest.fn()}
    />,
  );

  expect(screen.getByTestId('collection-toggle-0').props.accessibilityState).toEqual({ expanded: true });
  expect(screen.getByTestId('collection-chevron-up-0')).toBeTruthy();
  await fireEvent.press(screen.getByTestId('collection-toggle-0'));
  expect(onToggleCollapsed).toHaveBeenCalledWith(0);
});

describe('more than one collection (CANGUPA-162)', () => {
  const twoCollections: readonly Collection[] = [
    { name: 'Lay of the Land', packCount: 1 },
    { name: 'Down Under', packCount: 2 },
  ];

  test('renders one card per collection, each with its own packs and pack-index range', async () => {
    // The collection prop here is synthetic (two collections); the real en strings table
    // (useStrings(), not overridden in this render) still only has one name in it, so the
    // second card's own title renders empty rather than a made-up "Down Under" — the title
    // text itself is packText.test.ts's job to keep in step with packs.ts's real COLLECTIONS,
    // not this component's. What this test is actually proving is structural: two cards, pack
    // indices staying global across them, not the display text of a collection that doesn't
    // exist in the real strings yet.
    await render(
      <LevelPacksScreen
        collections={twoCollections}
        packSizes={[2, 3, 4]}
        progress={NO_PROGRESS}
        palette={palette}
        collapsed={new Set<number>()}
        onToggleCollapsed={jest.fn()}
        onOpenPack={jest.fn()}
      />,
    );

    expect(screen.getByText('Lay of the Land')).toBeTruthy();
    expect(screen.getByTestId('collection-toggle-0')).toBeTruthy();
    expect(screen.getByTestId('collection-toggle-1')).toBeTruthy();
    // pack indices stay global across both cards: 1 in the first, 2 and 3 in the second.
    expect(screen.getByTestId('pack-1')).toBeTruthy();
    expect(screen.getByTestId('pack-2')).toBeTruthy();
    expect(screen.getByTestId('pack-3')).toBeTruthy();
    // level ranges keep running on from the first card's last pack into the second's first.
    expect(screen.getByText('Levels 1–2')).toBeTruthy();
    expect(screen.getByText('Levels 3–5')).toBeTruthy();
    expect(screen.getByText('Levels 6–9')).toBeTruthy();
  });

  test("each card's own count covers only its own packs, not the other collection's", async () => {
    // Pack 1 (Lay of the Land, levels 0-1): level 0 done. Pack 2 (Down Under, levels 2-4): level
    // 2 done. Pack 3 (Down Under, levels 5-8): none done.
    const packsProgress = progress({ done: [0, 2] });
    await render(
      <LevelPacksScreen
        collections={twoCollections}
        packSizes={[2, 3, 4]}
        progress={packsProgress}
        palette={palette}
        collapsed={new Set<number>()}
        onToggleCollapsed={jest.fn()}
        onOpenPack={jest.fn()}
      />,
    );

    expect(screen.getByTestId('collection-count-0')).toHaveTextContent('1/2');
    expect(screen.getByTestId('collection-count-1')).toHaveTextContent('1/7');
  });

  test('each card collapses independently', async () => {
    await render(
      <LevelPacksScreen
        collections={twoCollections}
        packSizes={[2, 3, 4]}
        progress={NO_PROGRESS}
        palette={palette}
        collapsed={new Set([1])}
        onToggleCollapsed={jest.fn()}
        onOpenPack={jest.fn()}
      />,
    );

    // The first card (index 0) stays open: its one pack still shows.
    expect(screen.getByTestId('pack-1')).toBeTruthy();
    // The second (index 1) is collapsed: neither of its packs shows.
    expect(screen.queryByTestId('pack-2')).toBeNull();
    expect(screen.queryByTestId('pack-3')).toBeNull();
    expect(screen.getByTestId('collection-toggle-0').props.accessibilityState).toEqual({ expanded: true });
    expect(screen.getByTestId('collection-toggle-1').props.accessibilityState).toEqual({ expanded: false });
  });

  test('tapping a card asks to toggle its own index, not the other card\'s', async () => {
    const onToggleCollapsed = jest.fn();
    await render(
      <LevelPacksScreen
        collections={twoCollections}
        packSizes={[2, 3, 4]}
        progress={NO_PROGRESS}
        palette={palette}
        collapsed={new Set<number>()}
        onToggleCollapsed={onToggleCollapsed}
        onOpenPack={jest.fn()}
      />,
    );

    await fireEvent.press(screen.getByTestId('collection-toggle-1'));
    expect(onToggleCollapsed).toHaveBeenCalledWith(1);
  });
});
