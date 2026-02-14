import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://127.0.0.1:4173'
  },
  webServer: [
    {
      command:
        'ALLOWED_ORIGINS=http://127.0.0.1:4173 uv run uvicorn ul_packing.main:app --host 127.0.0.1 --port 8000',
      url: 'http://127.0.0.1:8000',
      reuseExistingServer: true,
      timeout: 120000,
    },
    {
      command: 'cd frontend && VITE_API_BASE_URL=http://127.0.0.1:8000 npm run dev -- --host 127.0.0.1 --port 4173',
      url: 'http://127.0.0.1:4173',
      reuseExistingServer: true,
      timeout: 120000,
    },
  ],
});
