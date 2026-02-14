# UL Packing Frontend

このディレクトリは UL Packing の SPA フロントエンドです。

## Stack

- React + Vite + TypeScript
- React Router
- TanStack Query
- shadcn/ui

## 開発

```bash
npm ci
VITE_API_BASE_URL=http://127.0.0.1:8000 npm run dev -- --host 127.0.0.1 --port 4173
```

## テスト

```bash
npm run test
```

## ビルド

```bash
npm run build
```

## 環境変数

- `VITE_API_BASE_URL` Backend APIのベースURL
