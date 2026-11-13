#!/usr/bin/env bash
set -euo pipefail

# EAS Build has no SSH access to private repos by default. @joaorodr84/themes
# is installed over git+ssh, so npm ci needs a key with read access to it —
# restored here from the SSH_KEY_BASE64 EAS secret (a deploy key scoped
# read-only to that one repo).
mkdir -p ~/.ssh
umask 0177
echo "$SSH_KEY_BASE64" | base64 -d > ~/.ssh/id_ed25519
umask 0022
ssh-keygen -y -f ~/.ssh/id_ed25519 > ~/.ssh/id_ed25519.pub

ssh-keyscan github.com >> ~/.ssh/known_hosts
