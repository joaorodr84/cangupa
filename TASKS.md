# Cangupa task ledger

Every task carries an ID of the form `CANGUPA-<n>`. IDs are assigned
once, never reused, and never renumbered.

**Next ID to assign: `CANGUPA-9`**

Tasks opened while the project was still called Tile Jumper keep their
original `TILE-JUMPER-<n>` ID — the counter continues under the new prefix
from `CANGUPA-8` onward, it doesn't restart at 1.

If this file and history ever disagree, history wins:

```sh
git log --oneline | grep -oE 'CANGUPA-[0-9]+' | sort -t- -k2 -n | tail -1
```

The two commits before this ledger existed (the initial build and the
kangaroo sprite) predate the task-ID system and carry no ID; see `git log`.

## Open

| ID | Pri | Task | Status | Commit |
| --- | --- | --- | --- | --- |
| TILE-JUMPER-2 | P3 | Play a sound effect on a jump | open | — |
| TILE-JUMPER-3 | P3 | Add falling, as an opt-in setting (off by default): pressing a direction (arrow keys / WASD) with no step or jump that way falls instead of doing nothing. When the setting is on, falling is also reachable by clicking/tapping empty space — the one case where click/tap stops being purely destination-based | open | — |
| TILE-JUMPER-4 | P3 | Play a sound effect on finishing a level | open | — |
| TILE-JUMPER-5 | P3 | Play a sound effect on falling. Depends on `TILE-JUMPER-3` — there's nothing to cue a sound off until falling itself exists | open | — |
| TILE-JUMPER-6 | P3 | Redo the main character's art, and draw a small joey riding inside the pouch | open | — |
| TILE-JUMPER-7 | P4 | Design a logo for Cangupa — unscoped: where it's used (title screen, favicon, README) and style aren't decided yet | open | — |

## Done

| ID | Pri | Task | Status | Date | Commit |
| --- | --- | --- | --- | --- | --- |
| TILE-JUMPER-1 | P2 | Set up the project's process docs: `CLAUDE.md`, this ledger, `TODO.md`, the `commit` and `changelog-updater` agents, `CHANGELOG.md` and `HISTORY.md` — replicated from Watchr's and DigiSpin's house rules and scaled down to a dependency-free static page | done | 2026-10-30 | — |
| CANGUPA-8 | P2 | Rename the project from Tile Jumper to Cangupa everywhere: agents, process docs, code, storage keys and bookkeeping | done | 2026-11-01 | — |
