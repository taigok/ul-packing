# UL Packing

FastAPI + Jinja2 + htmx + SQLite で作った、UL向けパッキングリスト管理アプリです。

## 主な機能

- パッキングリストの作成
- 装備アイテムの追加/更新/削除
- 重量サマリーの自動計算（ベース重量/消耗品/着用/合計）
- g / oz の表示切り替え
- 共有リンクの閲覧とトークン再生成（旧URL無効化）
- 共有URLのコピー

## 技術スタック

- Python 3.13
- FastAPI
- SQLAlchemy
- Jinja2
- htmx
- SQLite
- pytest
- Playwright

## 前提

- Python 3.13 (`.python-version`)
- `uv`
- Node.js（E2E実行時）

## セットアップ

```bash
uv sync --all-groups
npm ci
```

Playwright を初回セットアップする場合:

```bash
npx playwright install --with-deps chromium
```

## 起動

```bash
uv run uvicorn ul_packing.main:app --reload
```

ブラウザで [http://127.0.0.1:8000](http://127.0.0.1:8000) を開いてください。

`DATABASE_URL` を指定するとDBを切り替えられます。

```bash
DATABASE_URL=sqlite+pysqlite:///./data/app.db uv run uvicorn ul_packing.main:app --reload
```

## テスト

ユニット/統合テスト:

```bash
uv run pytest
```

E2E:

```bash
npx playwright test
```

## DBマイグレーション

```bash
uv run alembic upgrade head
```

## 主要ルート

- `GET /` リスト一覧
- `POST /lists` リスト作成
- `GET /lists/{list_id}` リスト詳細
- `POST /lists/{list_id}/items` アイテム追加
- `POST /lists/{list_id}/items/{item_id}` アイテム更新
- `POST /lists/{list_id}/items/{item_id}/delete` アイテム削除
- `POST /lists/{list_id}/unit` 単位切替
- `GET /s/{share_token}` 共有ビュー
- `POST /lists/{list_id}/share/regenerate` 共有トークン再生成

## Dev Container

`.devcontainer/devcontainer.json` を用意しています。VS Code / Codex で `Reopen in Container` を実行すると、依存関係とPlaywright環境を自動セットアップできます。
