import { render, screen, within } from '@testing-library/react-native';

import HelpScreen from './HelpScreen';
import { DARK } from '../theme/palette';

test('renders the rules heading and every rule', async () => {
  await render(<HelpScreen palette={DARK} />);

  expect(screen.getByText('Rules')).toBeTruthy();
  expect(screen.getByText('Step:')).toBeTruthy();
  expect(screen.getByText('Jump:')).toBeTruthy();
  expect(screen.getByText('Gold tiles')).toBeTruthy();
  expect(screen.getByText('Steel tiles')).toBeTruthy();
  expect(screen.getByText('Departure tiles')).toBeTruthy();
  expect(screen.getByText('Arrival tiles')).toBeTruthy();
});

test('groups the rules into a Moves section and a Tiles section (CANGUPA-101)', async () => {
  await render(<HelpScreen palette={DARK} />);

  expect(screen.getByText('Moves')).toBeTruthy();
  expect(screen.getByText('Tiles')).toBeTruthy();
});

// CANGUPA-109: a bordered rectangle per section, matching rules.html's panel
// layout and this app's own StatsScreen.tsx pattern — and "When you're
// stuck" promoted to its own section rather than a bullet folded into Moves.
test('wraps each section in its own bordered card, including a new "When you\'re stuck" section (CANGUPA-109)', async () => {
  await render(<HelpScreen palette={DARK} />);

  expect(screen.getByText("When you're stuck")).toBeTruthy();
  expect(screen.getByText(/undo or restart/)).toBeTruthy();

  for (const heading of ['Moves', 'Tiles', "When you're stuck", 'Buttons']) {
    const card = screen.getByText(heading).parent;
    const style = [card?.props.style].flat();
    expect(style.some((s) => s?.borderWidth === 1 && s?.borderRadius === 12)).toBe(true);
  }
});

test('each tile kind shows a colour swatch taken from the live palette', async () => {
  await render(<HelpScreen palette={DARK} />);

  const flat = (testId: string) => [screen.getByTestId(testId).props.style].flat();

  expect(flat('help-swatch-gold').some((s) => s?.backgroundColor === DARK.tile2)).toBe(true);
  expect(flat('help-swatch-steel').some((s) => s?.backgroundColor === DARK.tile3)).toBe(true);
  expect(flat('help-swatch-departure').some((s) => s?.backgroundColor === DARK.tileDeparture)).toBe(true);
  expect(flat('help-swatch-arrival').some((s) => s?.backgroundColor === DARK.tileArrival)).toBe(true);
});

// CANGUPA-109: the Step/Jump mini-boards render real board tiles rather than
// a drawing, so asserting on them means checking the actual board output —
// Board.tsx's own tile-x-y testIDs — not a separate diagram component.
// Each diagram is its own small coordinate space starting at (0,0), so
// queries are scoped through the wrapping testID (help-diagram-*) rather
// than a bare getByTestId('tile-0-0'), which would match all three at once.
test('the Step diagram shows a kangaroo tile and one highlighted destination (CANGUPA-109)', async () => {
  await render(<HelpScreen palette={DARK} />);

  const step = within(screen.getByTestId('help-diagram-step'));
  expect(step.getByTestId('tile-0-0')).toBeTruthy();
  expect(step.getByTestId('tile-press-1-0')).toBeTruthy();
  expect(screen.getByText(/one step away/)).toBeTruthy();
});

test('the two Jump diagrams distinguish a gap from an untouched tile (CANGUPA-109)', async () => {
  await render(<HelpScreen palette={DARK} />);

  const gap = within(screen.getByTestId('help-diagram-jump-gap'));
  const tile = within(screen.getByTestId('help-diagram-jump-tile'));

  // Jump-over-a-gap: no tile at all renders for the middle cell.
  expect(gap.queryByTestId('tile-1-0')).toBeNull();
  // Jump-over-a-tile: the middle tile is still there, just not highlighted.
  expect(tile.getByTestId('tile-1-0')).toBeTruthy();
  expect(tile.queryByTestId('tile-press-1-0')).toBeNull();

  expect(screen.getByText(/already gone/)).toBeTruthy();
  expect(screen.getByText(/untouched/)).toBeTruthy();
});

// CANGUPA-109: the Tiles section's swatches are now real tile renders
// (Board.tsx's exported TileSwatch), not a flat colour square — asserting on
// the strokes/mark testIDs those tiles actually draw, not just the colour.
test('the Tiles section swatches show real strokes and marks, not just colour (CANGUPA-109)', async () => {
  await render(<HelpScreen palette={DARK} />);

  expect(screen.getByTestId('tile-strokes-0-0')).toBeTruthy(); // Gold
  expect(screen.getByTestId('tile-strokes-0-1')).toBeTruthy(); // Steel
  expect(screen.getByTestId('tile-arrow-0-2-right')).toBeTruthy(); // Departure
  expect(screen.getByTestId('tile-arrival-0-3-right')).toBeTruthy(); // Arrival
});

test('groups the board screen controls into a Buttons section with their real icons (CANGUPA-109)', async () => {
  await render(<HelpScreen palette={DARK} />);

  expect(screen.getByText('Buttons')).toBeTruthy();
  for (const id of ['undo', 'restart', 'hint', 'help']) {
    expect(screen.getByTestId(`help-button-${id}`)).toBeTruthy();
  }
  expect(screen.getByText(/Greyed out until you've made at least one/)).toBeTruthy();
  expect(screen.getByText(/Greyed out once the level is won/)).toBeTruthy();
});
