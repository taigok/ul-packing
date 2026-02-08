import { test, expect } from '@playwright/test';

test('happy path', async ({ page }) => {
  await page.goto('http://127.0.0.1:8000/');

  await page.getByLabel('リスト名').fill('槍ヶ岳 1泊2日');
  await page.getByRole('button', { name: 'リスト作成' }).click();

  await page.getByLabel('装備名').fill('テント');
  await page.getByLabel('重量(g)').fill('800');
  await page.getByLabel('個数').fill('1');
  await page.getByRole('button', { name: '追加' }).click();

  await expect(page.locator('text=テント')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'ベース重量' })).toBeVisible();

  const shareHref = await page.getByRole('link', { name: '共有リンクを開く' }).getAttribute('href');
  expect(shareHref).toBeTruthy();
});
