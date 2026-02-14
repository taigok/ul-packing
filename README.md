# UL Packing

UL向けパッキングリスト管理アプリです。  
現在は **FastAPI Backend API + React(Vite) SPA + shadcn/ui** 構成です。

## 機能

- パッキングリスト作成
- 装備アイテム CRUD
- 重量サマリー（Base / Consumable / Worn / Total）
- 単位切替（g / oz）
- 共有ビュー
- 共有トークン再生成（旧URL無効化）

## 技術スタック

### Backend
- Python 3.13
- FastAPI
- SQLAlchemy
- SQLite

### Frontend
- React 19
- Vite
- React Router
- TanStack Query
- shadcn/ui
- Tailwind CSS v4

### Test
- pytest
- Vitest + Testing Library
- Playwright

## ディレクトリ

- `src/ul_packing` Backend実装
- `frontend` SPA実装
- `tests/api` APIテスト
- `tests/e2e` E2Eテスト

## セットアップ

前提:
- Python 3.13
- `uv`
- Node.js

```bash
uv sync --all-groups
npm ci
cd frontend && npm ci
```

Playwright初回セットアップ:

```bash
npx playwright install --with-deps chromium
```

## 起動

### 1) Backend API

```bash
uv run uvicorn ul_packing.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2) Frontend SPA

別ターミナルで:

```bash
cd frontend
VITE_API_BASE_URL=http://127.0.0.1:8000 npm run dev -- --host 127.0.0.1 --port 4173
```

アクセス先:
- SPA: `http://127.0.0.1:4173`
- Backend(OpenAPI含む): `http://127.0.0.1:8000`

## 環境変数

- `DATABASE_URL` (optional)
  - 例: `sqlite+pysqlite:///./data/app.db`
- `ALLOWED_ORIGINS` (optional, comma separated)
  - 例: `http://127.0.0.1:4173,http://localhost:4173`
- `VITE_API_BASE_URL` (frontend)
  - 例: `http://127.0.0.1:8000`

## APIエンドポイント（`/api/v1`）

- `GET /api/v1/lists`
- `POST /api/v1/lists`
- `PATCH /api/v1/lists/{list_id}`
- `GET /api/v1/lists/{list_id}`
- `POST /api/v1/lists/{list_id}/items`
- `PATCH /api/v1/lists/{list_id}/items/{item_id}`
- `DELETE /api/v1/lists/{list_id}/items/{item_id}`
- `PATCH /api/v1/lists/{list_id}/unit`
- `GET /api/v1/shared/{share_token}`
- `POST /api/v1/lists/{list_id}/share/regenerate`

## テスト

### Backend/API

```bash
uv run pytest
```

### Frontend unit

```bash
cd frontend
npm run test
```

### Frontend build

```bash
cd frontend
npm run build
```

### E2E

```bash
npx playwright test
```

## 補足

- SPA導線は `http://127.0.0.1:4173` を利用してください。
