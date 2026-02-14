# AGENTS

## 目的

- このリポジトリでエージェントが守る最小ルールを示す。
- 不明点は `README.md` を正とする。

## 基本ルール

- 変更は要求範囲に限定する（不要なリファクタ禁止）。
- 既存スタイルに準拠する（命名・構成・テスト方針）。
- 破壊的操作を行わない（例: `git reset --hard` は使わない）。
- 変更前後で関連テストを実行し、結果を報告する。
- 仕様や実行方法は `README.md` を優先する。

## 作業ディレクトリ

- Backend: `src/ul_packing`
- Frontend: `frontend`
- Tests: `tests/api`, `tests/e2e`

## 主要コマンド

- セットアップ: `uv sync --all-groups`, `npm ci`, `cd frontend && npm ci`
- Backend起動: `uv run uvicorn ul_packing.main:app --host 127.0.0.1 --port 8000 --reload`
- Frontend起動: `cd frontend && VITE_API_BASE_URL=http://127.0.0.1:8000 npm run dev -- --host 127.0.0.1 --port 4173`
- Backendテスト: `uv run pytest`
- Frontendテスト: `cd frontend && npm run test`
- E2E: `npx playwright test`

## 納品時の報告フォーマット（1行ずつ）

- 変更ファイル
- 実行したテスト
- 未実施項目と理由（あれば）
