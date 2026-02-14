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
npx playwright install --with-deps chromium
