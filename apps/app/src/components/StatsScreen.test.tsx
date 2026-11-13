import { render, screen } from '@testing-library/react-native';

import StatsScreen from './StatsScreen';
import { NO_ACHIEVEMENTS, withEarned, type AchievementRecord } from '../state/achievements';
import { NO_PROGRESS, type Progress } from '../state/progress';
import { DARK } from '../theme/palette';

// @expo/vector-icons' Icon checks expo-font's loadAsync on mount and sets
// state when it resolves, after this file's render() has already returned,
// which warns that the update was not wrapped in act(). The real font never
// loads in this test environment anyway, and no test here asserts on the
// icon itself, so a trivial stub avoids the warning instead of awaiting it
// in every test — the same stub DigiSpin's own StatsScreen.test.tsx uses.
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

const palette = DARK;

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
    ...overrides,
  };
}

test('shows the summary panel when nothing is cleared yet', async () => {
  await render(
    <StatsScreen totalLevels={50} progress={NO_PROGRESS} achievements={NO_ACHIEVEMENTS} palette={palette} />,
  );

  expect(screen.getByText('Levels cleared')).toBeTruthy();
  expect(screen.getByText('0/50')).toBeTruthy();
  expect(screen.getByText('Total moves')).toBeTruthy();
  expect(screen.getByText('Hints used')).toBeTruthy();
  expect(screen.getByText('Undos used')).toBeTruthy();
  expect(screen.getAllByText('0')).toHaveLength(3);
});

test('shows the cleared count, total moves, hints used and undos used, with no per-level breakdown', async () => {
  const statsProgress = progress({ done: [0, 2], level: 2, bestMoves: { 0: 3, 2: 7 }, hintsUsed: 4, undosUsed: 6 });
  await render(
    <StatsScreen totalLevels={50} progress={statsProgress} achievements={NO_ACHIEVEMENTS} palette={palette} />,
  );

  expect(screen.getByText('Levels cleared')).toBeTruthy();
  expect(screen.getByText('2/50')).toBeTruthy();
  expect(screen.getByText('Total moves')).toBeTruthy();
  expect(screen.getByText('10')).toBeTruthy();
  expect(screen.getByText('Hints used')).toBeTruthy();
  expect(screen.getByText('4')).toBeTruthy();
  expect(screen.getByText('Undos used')).toBeTruthy();
  expect(screen.getByText('6')).toBeTruthy();
  expect(screen.queryByText('Level 1')).toBeNull();
  expect(screen.queryByText('3 moves')).toBeNull();
});

// CANGUPA-143: whole hours and minutes, floored, not rounded or shown to
// the second.
test('shows time played as whole hours and minutes', async () => {
  const statsProgress = progress({ timePlayedMs: (2 * 60 + 15) * 60 * 1000 + 59_000 });
  await render(
    <StatsScreen totalLevels={50} progress={statsProgress} achievements={NO_ACHIEVEMENTS} palette={palette} />,
  );

  expect(screen.getByText('Time played')).toBeTruthy();
  expect(screen.getByText('2h 15m')).toBeTruthy();
});

// CANGUPA-90: the achievements card grid, displayed the same way as
// DigiSpin's own — see StatsScreen.tsx's header comment.

test('shows the achievements heading and a hidden-title card for every unearned achievement', async () => {
  await render(
    <StatsScreen totalLevels={50} progress={NO_PROGRESS} achievements={NO_ACHIEVEMENTS} palette={palette} />,
  );

  expect(screen.getByText('Achievements')).toBeTruthy();
  // The real name stays a surprise until earned (CANGUPA-90) — every one of
  // the 12 achievements shows "???" instead of its own title.
  expect(screen.getAllByText('???')).toHaveLength(12);
  expect(screen.queryByText('First Steps')).toBeNull();
  expect(screen.queryByText('Collector')).toBeNull();
  expect(screen.getByLabelText('First Steps: not yet earned')).toBeTruthy();
});

test('an earned achievement shows its real title, earned date and a different accessibility label', async () => {
  const earned: AchievementRecord = withEarned(NO_ACHIEVEMENTS, ['first-level'], '2026-03-05');
  await render(<StatsScreen totalLevels={50} progress={NO_PROGRESS} achievements={earned} palette={palette} />);

  expect(screen.getByText('First Steps')).toBeTruthy();
  expect(screen.getByLabelText('First Steps: earned')).toBeTruthy();
  expect(screen.getByText('Earned on 05/03/2026')).toBeTruthy();
  // The other 11 are still unearned, so their titles stay hidden.
  expect(screen.getAllByText('???')).toHaveLength(11);
});

test('an achievement earned before a date was ever recorded shows no date line', async () => {
  const earned: AchievementRecord = { earned: ['first-level'], earnedDates: {} };
  await render(<StatsScreen totalLevels={50} progress={NO_PROGRESS} achievements={earned} palette={palette} />);

  expect(screen.getByLabelText('First Steps: earned')).toBeTruthy();
  expect(screen.queryByText(/Earned on/)).toBeNull();
});

test('every achievement gets its own card, not just the first row', async () => {
  await render(
    <StatsScreen totalLevels={50} progress={NO_PROGRESS} achievements={NO_ACHIEVEMENTS} palette={palette} />,
  );

  // The last achievement in the array (ACHIEVEMENTS.length is 12, more than
  // one row at any grid width) still renders, not just the first row's worth
  // — its title is hidden while unearned, so this checks the accessibility
  // label (which still names it) rather than visible text.
  expect(screen.getByLabelText('Road Warrior: not yet earned')).toBeTruthy();
});
