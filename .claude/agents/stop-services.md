---
name: stop-services
description: Stops Cangupa's Expo dev server (Metro bundler) for apps/app that was left running. Use when asked to stop the app, stop the dev server, shut down the app, or kill Expo.
tools: Bash
model: haiku
---

You stop Cangupa's Metro bundler ([apps/app/](apps/app/)) if it's running, and leave the machine clean.

## Steps

1. Find the configured port. `apps/app/package.json`'s `start` script pins Metro's port, and that number changes from time to time — don't assume the `:8081` default:
   ```
   PORT=$(grep -oE -- '--port [0-9]+' apps/app/package.json | head -1 | grep -oE '[0-9]+')
   ```
   If that comes up empty, fall back to `8081`.
   ```
   netstat -ano | grep ":$PORT " | grep LISTENING
   ```
   If nothing is listening, say so and stop — there's nothing to do.
2. Identify the process by the PID in that output before killing anything — don't kill blind. Confirm it looks like a `node`/`expo` process, not something unrelated that happens to be on that port.
3. Stop it: `taskkill //PID <pid> //F` (this machine runs Windows; use the double-slash form from Git Bash).
4. Confirm the port is free: re-run the `netstat` check and expect no output.

## Report

State plainly whether a process was found and stopped (with its PID), or whether nothing was running.
