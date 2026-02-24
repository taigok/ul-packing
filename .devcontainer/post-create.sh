#!/usr/bin/env bash
set -euo pipefail

if ! command -v uv >/dev/null 2>&1; then
  curl -LsSf https://astral.sh/uv/install.sh | sh
fi

if [ -x "$HOME/.local/bin/uv" ] && ! command -v uv >/dev/null 2>&1; then
  sudo ln -sf "$HOME/.local/bin/uv" /usr/local/bin/uv
fi

uv sync --all-groups
npm ci

# Playwright's --with-deps runs apt; stale Yarn apt entries can break apt update in devcontainers.
mapfile -t YARN_APT_LISTS < <(grep -Rsl "dl.yarnpkg.com/debian" /etc/apt/sources.list /etc/apt/sources.list.d 2>/dev/null || true)
if [ "${#YARN_APT_LISTS[@]}" -gt 0 ]; then
  sudo rm -f "${YARN_APT_LISTS[@]}"
fi

npx playwright install --with-deps chromium
curl -fsSL https://claude.ai/install.sh | bash
