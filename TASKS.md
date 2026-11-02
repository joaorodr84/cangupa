# Cangupa task ledger

Every task carries an ID of the form `CANGUPA-<n>`. IDs are assigned
once, never reused, and never renumbered.

**Next ID to assign: `CANGUPA-34`**

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
| CANGUPA-23 | P3 | Design and wire the Expo icon, splash and adaptive-icon set for `apps/app` | done | 2026-11-01 | — |
| CANGUPA-24 | P2 | Full parity pass on iOS/Android/web before calling the port done | done | 2026-11-01 | — |
| CANGUPA-25 | P4 | Configure EAS build profiles and store metadata for `apps/app` | done | 2026-11-02 | — |
| CANGUPA-27 | P2 | Add `start-services`/`stop-services` agents for `apps/app`'s Expo dev server, on Sphinx's and DigiSpin's pattern | done | 2026-11-02 | — |
| CANGUPA-28 | P1 | Add a home screen to `apps/app`, shown on launch instead of dropping straight into the board: the Cangupa logo plus a single button that jumps into the next level to play (first undone level, same resume logic `App.tsx` already tracks via `progress.level`) | done | 2026-11-02 | — |
| CANGUPA-29 | P1 | On the `apps/app` home screen (`HomeScreen.tsx`, CANGUPA-28), stack four things top to bottom: the logo; the number of the level the Play button points at; the Play button; and a Rules button underneath it that opens the existing Regras/rules screen (`HelpScreen.tsx`, CANGUPA-26) | done | 2026-11-02 | — |
| CANGUPA-32 | P1 | Rework the `apps/app` game (board) screen's HUD, similarly to DigiSpin: move the Undo/Restart/Hint buttons (`BoardHud.tsx`'s "Desfazer"/"Reiniciar"/"Dica") to the screen's upper-right corner; remove the previous-level `‹` toolbar button entirely; remove the next-level `›` toolbar button and the win-triggered "Próximo nível" button, replacing both with a dismissable pop-up shown on level completion; and remove the "Cangupa" title from the top of this screen specifically, keeping it on the other screens including the home screen's logo (CANGUPA-29) | done | 2026-11-02 | — |
| CANGUPA-33 | P2 | On `apps/app`, similarly to DigiSpin, shrink the board when the screen is wider than it is tall (landscape): `Board.tsx` currently sizes itself purely off container width (`width: '100%'` + `aspectRatio: w/h`), with nothing capping it by available height, so on a wide/short window it can overflow vertically instead of fitting inside the screen | done | 2026-11-02 | — |
| CANGUPA-30 | P2 | Build a stats screen for `apps/app`, scoped to what the saved `Progress` record already tracks: levels cleared (X/total), the fewest moves each cleared level has ever taken, and a total-moves summary. Needed as a destination for CANGUPA-31's footer "Stats" tab — not yet wired into any navigation, which CANGUPA-31 adds | done | 2026-11-02 | — |
| CANGUPA-31 | P1 | Add a reusable bottom-footer nav component to `apps/app` with four tabs — Home, Levels, Stats, Settings — shown on the home, levels, stats and settings screens. The Levels tab opens the existing levels screen unchanged (`LevelsScreen.tsx`, CANGUPA-20); the Settings tab opens the existing settings screen unchanged (CANGUPA-21); the Stats tab opens the new stats screen (`StatsScreen.tsx`, CANGUPA-30). Once the Levels, Rules (CANGUPA-29) and Settings destinations all work through their new entry points, remove the board screen's now-redundant inline nav row (`App.tsx`'s `Níveis`/`Regras`/`Definições` row) as the finishing step of this task — Regras has no footer tab of its own; CANGUPA-29's home-screen button is its only remaining entry point | done | 2026-11-02 | — |
