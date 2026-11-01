# Cangupa task ledger

Every task carries an ID of the form `CANGUPA-<n>`. IDs are assigned
once, never reused, and never renumbered.

**Next ID to assign: `CANGUPA-27`**

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
| CANGUPA-23 | P3 | Design and wire the Expo icon, splash and adaptive-icon set for `apps/app` | open | — |
| CANGUPA-24 | P2 | Full parity pass on iOS/Android/web before calling the port done | open | — |
| CANGUPA-25 | P4 | Configure EAS build profiles and store metadata for `apps/app` — unscoped until publishing it is actually decided | open | — |

## Done

| ID | Pri | Task | Status | Date | Commit |
| --- | --- | --- | --- | --- | --- |
| TILE-JUMPER-1 | P2 | Set up the project's process docs: `CLAUDE.md`, this ledger, `TODO.md`, the `commit` and `changelog-updater` agents, `CHANGELOG.md` and `HISTORY.md` — replicated from Watchr's and DigiSpin's house rules and scaled down to a dependency-free static page | done | 2026-10-30 | — |
| CANGUPA-8 | P2 | Rename the project from Tile Jumper to Cangupa everywhere: agents, process docs, code, storage keys and bookkeeping | done | 2026-11-01 | — |
| CANGUPA-9 | P1 | Move the web game into `apps/web-classic/`, to leave the repo root free for the planned Expo/React Native app | done | 2026-11-01 | — |
| CANGUPA-10 | P1 | Scaffold a React Native + Expo (TypeScript) app at `apps/app`, on DigiSpin's and Sphinx's toolchain, and install its dependencies | done | 2026-11-01 | — |
| CANGUPA-11 | P2 | Port the move rules and solver (`game.js`'s `Game` class) to `apps/app`, with `tools/test.js`'s rules assertions ported alongside | done | 2026-11-01 | — |
| CANGUPA-12 | P2 | Port the 50 generated levels (`levels.js`) into `apps/app` as typed data, with the solvability check ported against them | done | 2026-11-01 | — |
| CANGUPA-13 | P2 | Port settings persistence (`config.js`'s `Settings`) to an AsyncStorage-backed hook | done | 2026-11-01 | — |
| CANGUPA-14 | P2 | Port progress persistence (`config.js`'s `Progress`) to an AsyncStorage-backed hook | done | 2026-11-01 | — |
| CANGUPA-15 | P2 | Port the five board themes (`style.css`) to React Native style tokens, including the starfield background | done | 2026-11-01 | — |
| CANGUPA-16 | P2 | Port the kangaroo sprite (`sprites.js`'s three inline SVGs) to a `react-native-svg` component | done | 2026-11-01 | — |
| CANGUPA-17 | P2 | Build the board screen: tile grid, tile states, hint highlighting, hop animation and facing | done | 2026-11-01 | — |
| CANGUPA-18 | P2 | Wire touch input: tapping a highlighted tile plays that move | done | 2026-11-01 | — |
| CANGUPA-19 | P2 | Add the HUD controls (Undo, Restart, Hint, Next level) and the status line | done | 2026-11-01 | — |
| CANGUPA-20 | P2 | Build the levels screen: 50-level grid with cleared/current/locked state | done | 2026-11-01 | — |
| CANGUPA-21 | P2 | Build the settings screen: theme picker, rule toggles, clear-progress action | done | 2026-11-01 | — |
| CANGUPA-22 | P2 | Wire the app shell: board, levels and settings screens together, resuming the last-played level | done | 2026-11-01 | — |
| CANGUPA-26 | P2 | Port the "Regras" (rules/help) screen to `apps/app`, a fourth reachable panel the CANGUPA-10..25 backlog never accounted for | done | 2026-11-01 | — |
