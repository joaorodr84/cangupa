# Cangupa

A puzzle game in plain HTML, CSS and JavaScript — no build step, no backend,
no dependencies. It lives in [apps/web-classic/](apps/web-classic/), set
apart from the repo root to leave room for the Expo/React Native app planned
alongside it. What the game does and how the pieces fit together lives in
[README.md](README.md); this file is about process.

## Branch before you work

Create the branch before the first edit, not after. When a request will
change files here (code, levels, tests, `TODO.md`, docs), the first action is
`git checkout -b <name>` off `develop` — checking out and pulling `develop`
first if `HEAD` isn't already there — so no work lands in the working tree
while `HEAD` is on `develop` or `main`.

- `<name>` is a plain `kebab-case-summary` of the change, prefixed with the
  task ID: `cangupa-3-double-tile-fix`.
- Already on a feature branch (anything other than `develop` or `main`): stay
  on it, don't branch off a branch.
- Skip branching for read-only work: answering questions, reading code,
  running `node apps/web-classic/tools/test.js`, investigating a bug without
  fixing it. Branch the moment an investigation becomes a fix.
- Don't ask permission — this rule *is* the standing authorization.

`develop` and `main` are the two long-lived branches. `develop` is where
everything in progress lands; `main` is what's actually shared and played,
and it only moves on a deliberate release (see "Releases" below). The
`commit` agent ([.claude/agents/commit.md](.claude/agents/commit.md)) picks
up from a feature branch: commit → land on `develop` (fast-forward or
squash) → delete the branch.

## Releases

`main` only changes when we're cutting a new version, never as a side effect
of closing an ordinary task. To release:

1. Bump `apps/web-classic/package.json`'s `version` if this version hasn't
   already been bumped on `develop`.
2. Fast-forward `main` to `develop` (`git checkout main && git merge
   --ff-only develop`) and push it. If `main` can't fast-forward, stop and
   ask — don't force or rebase `main` to make it fit.
3. Tag the release (`vX.Y.Z`, matching `apps/web-classic/package.json`'s
   `version`) and push the tag.
4. `develop` keeps going unchanged; it's never reset or rebased onto `main`.

This is a deliberate, owner-requested action ("release", "ship", "cut
version X") — unlike the rest of this file, it is not standing authorization
to merge to `main` on your own judgment.

## Hotfixes

A hotfix is an urgent fix to something already tagged and shared with
players — the one case where work branches off `main` instead of `develop`,
because waiting for everything else on `develop` to also ship isn't
acceptable.

- Branch name starts with `hotfix-`, not just the task ID, so it's
  unmistakable at a glance: `hotfix-9-save-corruption`.
- Cut from `main`, fixed, then landed on **both** `main` (with a patch
  version bump in `apps/web-classic/package.json` and a `vX.Y.Z` tag, same
  as a release) and `develop` (so the fix survives the next regular
  release) — never just one side.
- Reserved for genuinely urgent fixes. Anything that can wait for the normal
  cycle goes through `develop` like everything else in "Branch before you
  work" above.

## Task completion workflow

1. **Make code changes** and commit them, with the task ID in the subject.
2. **Do bookkeeping in the same commit** — move the task to Done in
   `TASKS.md` (status `done`, today's date) and delete its `TODO.md` entry.
3. **Then provide the summary** — the task is finished only when that commit
   exists.

## Task IDs

Every task carries an ID `CANGUPA-<n>`, registered in
[TASKS.md](TASKS.md), which holds the next free number at the top — take it
and increment it in the same commit that uses it.

**Claim the ID when the task is written down, not when it ships.** A new
`TODO.md` entry gets one immediately; the commit that closes it reuses that
same ID. One ID per *task*.

- Commit subject: `feat: Add a third visit to triple tiles (CANGUPA-3)`.
- Branch name: `cangupa-3-triple-tiles`.
- Bookkeeping (typo fixes, formatting, `TODO.md` tidying) may go unnumbered.
- Never renumber, never reuse, never rewrite an ID into an existing commit.

Tasks opened before the project was renamed from Tile Jumper to Cangupa keep
their original `TILE-JUMPER-<n>` ID — the counter continues under the new
prefix, it doesn't restart.

If `TASKS.md` and history disagree, history wins:

```sh
git log --oneline | grep -oE 'CANGUPA-[0-9]+' | sort -t- -k2 -n | tail -1
```

## Commit messages

Cangupa follows [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/):

```text
<type>[optional scope][!]: <description> (CANGUPA-<n>)

[body]

[footers]
```

- **Type** is required and lowercase. `feat` and `fix` first; `docs`,
  `refactor`, `perf`, `test`, `build`, `ci`, `chore` for changes that ship no
  behaviour.
- **Scope** names the area of the code (`feat(solver):`), never the task.
  Leave it off when the change is broad.
- **Description**: plain-language imperative, capitalised, no trailing full
  stop.
- **Body** says what was wrong or missing, why this approach, what was
  rejected, and how it was verified. Not a one-line commit.
- **Breaking changes** take a `!` before the colon *and* a `BREAKING
  CHANGE:` footer saying what to migrate — relevant mainly to the saved
  localStorage shape (settings, progress).
- `Co-Authored-By:` is a footer like any other.

## Versions

`apps/web-classic/package.json`'s `version` is the source of truth. Cangupa
(as Tile Jumper) started at `0.1.0` and stays `0.x` until the first tagged
release.

## Tests

| Suite | Command | What it is |
| --- | --- | --- |
| Rules + levels | `node apps/web-classic/tools/test.js` | Plain Node, no dependencies — checks the move rules behave and that every level in `js/levels.js` is solvable |

What a change owes it:

- **A rule change gets a rules assertion.** `apps/web-classic/js/game.js`
  has no DOM, so the move legality, jumps, double tiles and undo/stuck
  detection are testable directly.
- **A new or edited level gets re-checked for solvability** before it ships
  — `tools/test.js` already does this for every level in `js/levels.js`, so
  a change just has to not skip running it.
- **A bug fix gets the test that would have caught it**, failing against the
  unfixed code and passing after.
- **A UI or rendering change is also looked at in a browser** before it
  lands — `apps/web-classic/tools/test.js` never touches `js/ui.js`.

## Comments

Comments here record *why*, name the alternative that was rejected, and
carry the numbers behind the decision — not a restatement of the line below
them. Put them above the constant, the check or the guard they explain.

## Where decisions live

Commit bodies and code comments. `TODO.md`, `TASKS.md`, `CHANGELOG.md` and
`HISTORY.md` are the exceptions: what is planned, which ID names it, what
shipped, and the engineering story behind it.
