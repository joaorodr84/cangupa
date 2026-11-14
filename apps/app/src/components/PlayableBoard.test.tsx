import { createRef, type Ref } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import * as Sound from '../audio/sound';
import PlayableBoard, { type PlayableBoardHandle } from './PlayableBoard';
import { type Level } from '../game/board';
import { useBoard } from '../game/useBoard';
import { DARK } from '../theme/palette';

jest.mock('../audio/sound', () => ({ jump: jest.fn(), win: jest.fn(), fall: jest.fn(), blocked: jest.fn() }));

const palette = DARK;

// PlayableBoard takes an already-constructed useBoard result (so a screen
// can share one Game with its HUD, see BoardScreen.tsx) — this harness is
// the minimal thing that constructs one for these tests.
function Harness({
  level,
  fall = false,
  onMoved,
  maxWidth,
  maxHeight,
  boardRef,
}: {
  level: Level;
  fall?: boolean;
  onMoved?: () => void;
  maxWidth?: number;
  maxHeight?: number;
  boardRef?: Ref<PlayableBoardHandle>;
}) {
  const board = useBoard(level, true);
  return (
    <PlayableBoard
      ref={boardRef}
      board={board}
      anim={false}
      fall={fall}
      palette={palette}
      onMoved={onMoved}
      maxWidth={maxWidth}
      maxHeight={maxHeight}
    />
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

test('pressTile() plays a move exactly like a tap, for the directional pad (CANGUPA-152)', async () => {
  const onMoved = jest.fn();
  const boardRef = createRef<PlayableBoardHandle>();

  await render(<Harness level={['S1']} onMoved={onMoved} boardRef={boardRef} />);

  await act(async () => {
    boardRef.current?.pressTile(1, 0);
  });

  expect(screen.queryByTestId('tile-press-1-0')).toBeNull();
  expect(onMoved).toHaveBeenCalledTimes(1);
  expect(Sound.jump).toHaveBeenCalledTimes(1);
});

test('tapping the only legal tile moves the kangaroo there', async () => {
  const onMoved = jest.fn();

  await render(<Harness level={['S1']} onMoved={onMoved} />);

  await fireEvent.press(screen.getByTestId('tile-press-1-0'));

  // The level is won in one move, so its only tile is now worn (used up,
  // kangaroo standing on it) rather than still hinted.
  expect(screen.queryByTestId('tile-press-1-0')).toBeNull();
  expect(onMoved).toHaveBeenCalledTimes(1);
});

test('plays the jump sound on every move, and the win sound only on one that clears the level (CANGUPA-59)', async () => {
  // 'S11': the first move (to x=1) doesn't clear the level yet (x=2 still
  // needs a visit); the second (to x=2) does.
  await render(<Harness level={['S11']} />);

  await fireEvent.press(screen.getByTestId('tile-press-1-0'));
  expect(Sound.jump).toHaveBeenCalledTimes(1);
  expect(Sound.win).not.toHaveBeenCalled();

  await fireEvent.press(screen.getByTestId('tile-press-2-0'));
  expect(Sound.jump).toHaveBeenCalledTimes(2);
  expect(Sound.win).toHaveBeenCalledTimes(1);
});

test('does not call onMoved for a tap with no legal destination', async () => {
  const onMoved = jest.fn();

  // 'S..1': the only other tile sits three tiles away, past jump range —
  // nothing pressable renders there at all.
  await render(<Harness level={['S..1']} onMoved={onMoved} />);

  expect(screen.queryByTestId('tile-press-3-0')).toBeNull();
  expect(onMoved).not.toHaveBeenCalled();
});

test('falling resets the board, when the fall setting is on (CANGUPA-58)', async () => {
  // 'S1...1': the only move from the start is to x=1 (every other tile is
  // either used, empty, or past jump range). From x=1, the remaining tile
  // (x=5) is four tiles away — out of reach regardless of jumps — leaving a
  // stuck board, not yet won, with empty space to tap.
  await render(<Harness level={['S1...1']} fall />);

  await fireEvent.press(screen.getByTestId('tile-press-1-0'));
  expect(screen.queryByTestId('tile-press-1-0')).toBeNull();

  await act(async () => {
    fireEvent.press(screen.getByTestId('board'));
    await new Promise((resolve) => setTimeout(resolve, 600));
  });

  // Back at the start: the move to x=1 is legal again.
  expect(screen.getByTestId('tile-press-1-0')).toBeTruthy();
  expect(Sound.fall).toHaveBeenCalledTimes(1);
});

test('tapping a tile with no legal move jumps there before falling, facing it (CANGUPA-64)', async () => {
  // 'S11': after stepping to x=1, x=0 is a used/worn tile but still one
  // step away, so tapping it should report its own cell (tile-empty-0-0)
  // rather than falling through to the board's own blanket onPressEmpty.
  await render(<Harness level={['S11']} fall />);

  await fireEvent.press(screen.getByTestId('tile-press-1-0'));

  await act(async () => {
    fireEvent.press(screen.getByTestId('tile-empty-0-0'));
    await new Promise((resolve) => setTimeout(resolve, 600));
  });

  expect(Sound.jump).toHaveBeenCalledTimes(2); // the move, then the fall's own jump
  expect(Sound.fall).toHaveBeenCalledTimes(1);
  // Back at the start: the move to x=1 is legal again.
  expect(screen.getByTestId('tile-press-1-0')).toBeTruthy();
});

test('vacates the tile jumped away from, even though the jump fails and falls instead (CANGUPA-67)', async () => {
  // ['s.1', '.1.']: x0,y0 is a double-visit start tile; x2,y0 ("blue") and
  // x1,y1 (an untouched decoy, so the level isn't won once the other two
  // tiles are both spent) are the level's only other tiles.
  // Step 1: jump from the start to the blue tile (its one visit). Step 2:
  // jump back to the start (its last visit) — now worn, kangaroo standing
  // on it. Step 3: attempt to jump again to the blue tile's spot, now
  // exhausted — not legal, so it falls instead, with that spot (a valid
  // jump distance) as the target. Mid-fall, the start tile — the one just
  // jumped away from — should already look vacated (gone), not still
  // occupied (worn), even though game.pos hasn't actually moved (the jump
  // was never legal, so nothing was really played).
  await render(<Harness level={['s.1', '.1.']} fall />);

  await fireEvent.press(screen.getByTestId('tile-press-2-0')); // start -> blue tile
  await fireEvent.press(screen.getByTestId('tile-press-0-0')); // blue tile -> back to the start

  await act(async () => {
    fireEvent.press(screen.getByTestId('tile-empty-2-0')); // attempt: start -> blue tile's spot (exhausted)
  });

  // Checked right as the state update from the press above flushes — before
  // the sink's own setTimeout/reset() have any chance to run, so this isn't
  // racing against how long that takes.
  const flat = [screen.getByTestId('tile-0-0').props.style].flat(Infinity);
  expect(flat.some((s) => s?.opacity === 0)).toBe(true); // "gone", not "worn" (opacity 0.82)

  // Let the fall actually finish so no timer is left dangling into the next test.
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 700));
  });
});

test('a tile forbidden by a Departure arrow shakes in place instead of falling, even with a live tile there (CANGUPA-129)', async () => {
  // 'S>1' / '.1.': the Departure at (1,0) points right; (1,1) below it is a perfectly live tile,
  // but leaving the Departure downward is forbidden by its own arrow. Before this fix, the fall
  // setting couldn't tell that apart from "nothing to land on" and sank the level instead of
  // just refusing — the bug this test guards against.
  await render(<Harness level={['S>1', '.1.']} fall />);
  await fireEvent.press(screen.getByTestId('tile-press-1-0')); // step onto the Departure

  await act(async () => {
    fireEvent.press(screen.getByTestId('tile-empty-1-1')); // attempt to leave it downward
  });

  expect(Sound.blocked).toHaveBeenCalledTimes(1);
  expect(Sound.fall).not.toHaveBeenCalled();
  // Not reset: the Departure's own exit, not the start's, is still the board's only legal move.
  expect(screen.getByTestId('tile-press-2-0')).toBeTruthy();
  expect(screen.getByTestId('tile-blocked-outline-1-1')).toBeTruthy();
  // The reserved message area below the board explains which rule tripped (CANGUPA-132).
  expect(screen.getByText("Can't leave that way — only through the open edge.")).toBeTruthy();

  // The flash clears on its own after Board's shake() duration, leaving no dangling timer — but
  // the message is not on that same timer, and is still up well past it (see next test).
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));
  });
  expect(screen.queryByTestId('tile-blocked-outline-1-1')).toBeNull();
  expect(screen.getByText("Can't leave that way — only through the open edge.")).toBeTruthy();
});

test('an Arrival blocked the wrong way shows its own, different message (CANGUPA-129)', async () => {
  // 'SL1': the Arrival at (1,0) only opens to leftward entry; stepping onto it moving right is
  // blocked, distinct from a Departure's own exit rule above — this checks the message matches.
  await render(<Harness level={['SL1']} fall />);

  await act(async () => {
    fireEvent.press(screen.getByTestId('tile-empty-1-0'));
  });

  expect(Sound.blocked).toHaveBeenCalledTimes(1);
  expect(screen.getByText("Can't enter that way — only through the open edge.")).toBeTruthy();
});

test('the blocked-move message stays up until the next real action, not on a timeout (CANGUPA-129)', async () => {
  await render(<Harness level={['S>1', '.1.']} fall />);
  await fireEvent.press(screen.getByTestId('tile-press-1-0')); // step onto the Departure

  await act(async () => {
    fireEvent.press(screen.getByTestId('tile-empty-1-1')); // blocked: wrong way off the Departure
    await new Promise((resolve) => setTimeout(resolve, 400)); // past the shake/flash's own timeout
  });
  expect(screen.getByText("Can't leave that way — only through the open edge.")).toBeTruthy();

  // A real move (the Departure's own legal exit) is the next action — the message clears with it.
  await fireEvent.press(screen.getByTestId('tile-press-2-0'));
  expect(screen.queryByText("Can't leave that way — only through the open edge.")).toBeNull();
});

test('shows a message below the board once no legal moves remain', async () => {
  // 'S1...1': the only move from the start is to x=1 (every other tile is either used, empty, or
  // past jump range). From x=1, the remaining tile (x=5) is four tiles away — out of reach
  // regardless of jumps — leaving a stuck board, not yet won.
  await render(<Harness level={['S1...1']} />);

  await fireEvent.press(screen.getByTestId('tile-press-1-0'));

  expect(screen.getByTestId('board-message')).toBeTruthy();
  expect(screen.getByText('No moves left. Undo or restart.')).toBeTruthy();
});

test('tapping a tile off the step/jump line does nothing, even with the fall setting on (CANGUPA-65)', async () => {
  // A full 3x3 grid: (2, 2) is two over and two down from the start — not a
  // step or jump in any of the four cardinal directions, so it should never
  // be treated as a fall target, tile or not.
  await render(<Harness level={['S11', '111', '111']} fall />);

  await fireEvent.press(screen.getByTestId('tile-empty-2-2'));

  expect(Sound.jump).not.toHaveBeenCalled();
  expect(Sound.fall).not.toHaveBeenCalled();
  // Nothing moved or reset: the start's legal moves are unchanged.
  expect(screen.getByTestId('tile-press-1-0')).toBeTruthy();
});

test("tapping the kangaroo's own cell does nothing (CANGUPA-66)", async () => {
  // 'S11': x=0 is the start tile, already worn and exactly where the
  // kangaroo stands — distance zero, never a move attempt.
  await render(<Harness level={['S11']} fall />);

  await fireEvent.press(screen.getByTestId('tile-empty-0-0'));

  expect(Sound.jump).not.toHaveBeenCalled();
  expect(Sound.fall).not.toHaveBeenCalled();
});

test('tapping true background jumps to that cell before falling, once the board is measured (CANGUPA-66)', async () => {
  // 'S.1': x=1 is background with no tile at all, one step away — should
  // jump there and fall, the same as a worn tile would (CANGUPA-64), not
  // fall in place as if nothing specific had been tapped.
  await render(<Harness level={['S.1']} fall />);

  const board = screen.getByTestId('board');
  // A 300x100 px board, 3 columns wide: x=1 spans the middle third, [100, 200).
  await act(async () => {
    fireEvent(board, 'layout', { nativeEvent: { layout: { width: 300, height: 100 } } });
  });

  await act(async () => {
    fireEvent.press(board, { nativeEvent: { locationX: 150, locationY: 50 } });
    await new Promise((resolve) => setTimeout(resolve, 700));
  });

  expect(Sound.jump).toHaveBeenCalledTimes(1);
  expect(Sound.fall).toHaveBeenCalledTimes(1);
});

test('tapping empty space does nothing when the fall setting is off', async () => {
  await render(<Harness level={['S1.1']} fall={false} />);

  await fireEvent.press(screen.getByTestId('tile-press-1-0'));
  expect(screen.queryByTestId('tile-press-1-0')).toBeNull();

  await fireEvent.press(screen.getByTestId('board'));

  // Still stuck at x=1 — no handler was wired up to react to the tap.
  expect(screen.queryByTestId('tile-press-1-0')).toBeNull();
  expect(Sound.fall).not.toHaveBeenCalled();
});

// CANGUPA-132: this area is always the same height, message or no message, which is the whole
// point — the board above is already sized leaving room for it (see the next two tests), so a
// message can never land past the visible screen the way one below an unreserved board could.
test('reserves the same fixed height below the board whether or not a message is showing', async () => {
  // 'S1...1': see the stuck-message test above — one move in, no legal move remains.
  await render(<Harness level={['S1...1']} />);

  const idle = [screen.getByTestId('message-area').props.style].flat();
  expect(idle.some((s) => s?.height === 64)).toBe(true);
  expect(screen.queryByTestId('board-message')).toBeNull();

  await fireEvent.press(screen.getByTestId('tile-press-1-0'));

  const stuck = [screen.getByTestId('message-area').props.style].flat();
  expect(stuck.some((s) => s?.height === 64)).toBe(true);
  expect(screen.getByTestId('board-message')).toBeTruthy();
});

test('without maxWidth/maxHeight the board falls back to 100% (CANGUPA-33)', async () => {
  await render(<Harness level={['S1.']} />);

  const flat = [screen.getByTestId('board').props.style].flat();
  expect(flat.some((s) => s?.width === '100%')).toBe(true);
});

test('caps the board width when the height available is the tighter fit (landscape, CANGUPA-33)', async () => {
  // ['S1.'] is a 3x1 board (w=3, h=1). 200px of height, minus the frame's
  // own padding and the reserved message area below it (CANGUPA-132), still
  // leaves a 3x1 board room to be well past the 150px of width actually on
  // offer, so width stays the binding constraint here — see the next test
  // for the reverse.
  await render(<Harness level={['S1.']} maxWidth={150} maxHeight={200} />);

  const flat = [screen.getByTestId('board').props.style].flat();
  // 150 width minus the frame's 12px padding on each side.
  expect(flat.some((s) => s?.width === 126)).toBe(true);
});

test('caps the board width by the height available when that is the tighter fit', async () => {
  // Same 3x1 board, but now a generous width and a tight height: once the
  // frame's own padding (24px) and the reserved message area (64px,
  // CANGUPA-132) are both held back, 104px of height leaves only 16px for
  // the board itself, so a 3x1 board can only be 48px wide.
  await render(<Harness level={['S1.']} maxWidth={400} maxHeight={104} />);

  const flat = [screen.getByTestId('board').props.style].flat();
  // (104 - 24 - 64) of height available * 3 (w/h) = 48px wide.
  expect(flat.some((s) => s?.width === 48)).toBe(true);
});

// Visit marks and tile kinds (CANGUPA-68, CANGUPA-69)

test('a Gold tile shows one stroke per visit left, and a Steel tile one per visit left too', async () => {
  await render(<Harness level={['S23']} />);

  expect(screen.getByTestId('tile-strokes-1-0').children).toHaveLength(2);
  expect(screen.getByTestId('tile-strokes-2-0').children).toHaveLength(3);
});

test('the strokes count down as a tile is visited, and the last visit keeps one', async () => {
  await render(<Harness level={['S2']} />);
  expect(screen.getByTestId('tile-strokes-1-0').children).toHaveLength(2);

  await fireEvent.press(screen.getByTestId('tile-press-1-0'));
  expect(screen.getByTestId('tile-strokes-1-0').children).toHaveLength(1);
});

test('a Common tile has no strokes', async () => {
  await render(<Harness level={['S1']} />);
  expect(screen.queryByTestId('tile-strokes-1-0')).toBeNull();
});

test('an arrow tile shows a triangle on the edge it can be left by, and no strokes', async () => {
  await render(<Harness level={['S>1']} />);

  expect(screen.getByTestId('tile-arrow-1-0-right')).toBeTruthy();
  expect(screen.queryByTestId('tile-strokes-1-0')).toBeNull();
});

test('an arrow tile only lets the kangaroo leave the way it points', async () => {
  // S steps onto the arrow at (1,0), which points right: the tile below it is out of reach
  await render(<Harness level={['S>1', '.1.']} />);
  await fireEvent.press(screen.getByTestId('tile-press-1-0'));

  expect(screen.getByTestId('tile-press-2-0')).toBeTruthy();
  expect(screen.queryByTestId('tile-press-1-1')).toBeNull();
});

test('an Arrival tile shows a triangle on the edge it can be entered by, and no strokes (CANGUPA-104)', async () => {
  // 'SL1': the arrival tile at (1,0) only opens to leftward entry, so its mark sits on its right edge.
  await render(<Harness level={['SL1']} />);

  expect(screen.getByTestId('tile-arrival-1-0-right')).toBeTruthy();
  expect(screen.queryByTestId('tile-strokes-1-0')).toBeNull();
});

test('an Arrival tile only lets the kangaroo enter the way it names (CANGUPA-104)', async () => {
  // 'SL1': stepping right onto the arrival tile (entering while moving right) is blocked, since
  // it only opens to leftward entry — only the jump past it to (2,0) is legal at first.
  await render(<Harness level={['SL1']} />);

  expect(screen.queryByTestId('tile-press-1-0')).toBeNull();
  expect(screen.getByTestId('tile-press-2-0')).toBeTruthy();
});

test('a jump over a pillar shakes instead of falling, flashes the pillar and says why (CANGUPA-159)', async () => {
  // 'S#1' / '1..': the tile at (2,0) is live and exactly a jump away, but a pillar stands between.
  // Before the Pillar rule knew about moveKind this would have been 'empty' and sunk the level.
  await render(<Harness level={['S#1', '1..']} fall />);

  expect(screen.getByTestId('pillar-1-0')).toBeTruthy();
  expect(screen.queryByTestId('tile-press-2-0')).toBeNull(); // not offered as a move

  await act(async () => {
    fireEvent.press(screen.getByTestId('tile-empty-2-0'));
  });

  expect(Sound.blocked).toHaveBeenCalledTimes(1);
  expect(Sound.fall).not.toHaveBeenCalled();
  expect(screen.getByTestId('pillar-blocked-outline-1-0')).toBeTruthy(); // the pillar, not the tapped tile
  expect(screen.queryByTestId('tile-blocked-outline-2-0')).toBeNull();
  expect(screen.getByText("A pillar is in the way — you can't jump over it.")).toBeTruthy();
  expect(screen.getByTestId('tile-press-0-1')).toBeTruthy(); // not reset: the step down is still there

  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));
  });
  expect(screen.queryByTestId('pillar-blocked-outline-1-0')).toBeNull();
});

test('a jump off mud shakes instead of falling and says why (CANGUPA-160)', async () => {
  // 'Sm1' / '.1.' / '.1.': from the mud at (1,0), the tile at (1,2) is live and a jump away.
  await render(<Harness level={['Sm1', '.1.', '.1.']} fall />);
  await fireEvent.press(screen.getByTestId('tile-press-1-0')); // step onto the mud

  expect(screen.queryByTestId('tile-press-1-2')).toBeNull(); // the jump is not offered
  expect(screen.getByTestId('tile-press-1-1')).toBeTruthy(); // the step is

  await act(async () => {
    fireEvent.press(screen.getByTestId('tile-empty-1-2'));
  });

  expect(Sound.blocked).toHaveBeenCalledTimes(1);
  expect(Sound.fall).not.toHaveBeenCalled();
  expect(screen.getByTestId('tile-blocked-outline-1-2')).toBeTruthy();
  expect(screen.getByText('Stuck in the mud — you can step off it, but not jump.')).toBeTruthy();

  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));
  });
  expect(screen.queryByTestId('tile-blocked-outline-1-2')).toBeNull();
});
