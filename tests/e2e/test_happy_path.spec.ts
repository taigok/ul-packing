import { test, expect } from '@playwright/test';

test('happy path', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: '新規作成' }).click();
  await page.getByLabel('Title').fill('Yarigatake 2 days');
  await page.getByRole('button', { name: 'リストを作成' }).click();

  await page.getByLabel('名前').fill('Tent');
  await page.getByLabel('重量 (g)').fill('800');
  await page.getByLabel('個数').fill('1');
  await page.getByRole('button', { name: 'アイテム追加' }).click();

  await expect(page.locator('text=Tent')).toBeVisible();
  await expect(page.getByRole('button', { name: 'トークン再生成' })).toBeVisible();

  const shareHref = await page.getByRole('link', { name: '共有ページを開く' }).getAttribute('href');
  expect(shareHref).toBeTruthy();
});

test('can browse cross-list gear page', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: '新規作成' }).click();
  await page.getByLabel('Title').fill('Kita 1 day');
  await page.getByRole('button', { name: 'リストを作成' }).click();

  await page.getByLabel('名前').fill('Rain Jacket');
  await page.getByLabel('重量 (g)').fill('280');
  await page.getByLabel('個数').fill('1');
  await page.getByRole('button', { name: 'アイテム追加' }).click();

  await page.getByRole('link', { name: 'マイギア' }).click();

  await expect(page.locator('text=マイギア')).toBeVisible();
  await expect(page.locator('text=Rain Jacket')).toBeVisible();
  await expect(page.locator('text=Kita 1 day')).toBeVisible();

  await page.getByRole('link', { name: 'リストを開く' }).click();
  await expect(page.locator('text=Kita 1 day')).toBeVisible();
});
