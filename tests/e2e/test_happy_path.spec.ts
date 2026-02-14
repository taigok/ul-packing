import { test, expect } from '@playwright/test';

test('happy path', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Title').fill('Yarigatake 2 days');
  await page.getByRole('button', { name: 'Create List' }).click();

  await page.getByLabel('Name').fill('Tent');
  await page.getByLabel('Weight (g)').fill('800');
  await page.getByLabel('Qty').fill('1');
  await page.getByRole('button', { name: 'Add Item' }).click();

  await expect(page.locator('text=Tent')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Regenerate token' })).toBeVisible();

  const shareHref = await page.getByRole('link', { name: 'Open shared page' }).getAttribute('href');
  expect(shareHref).toBeTruthy();
});

test('can browse cross-list gear page', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Title').fill('Kita 1 day');
  await page.getByRole('button', { name: 'Create List' }).click();

  await page.getByLabel('Name').fill('Rain Jacket');
  await page.getByLabel('Weight (g)').fill('280');
  await page.getByLabel('Qty').fill('1');
  await page.getByRole('button', { name: 'Add Item' }).click();

  await page.getByRole('link', { name: 'My Gear' }).click();

  await expect(page.locator('text=My Gear')).toBeVisible();
  await expect(page.locator('text=Rain Jacket')).toBeVisible();
  await expect(page.locator('text=Kita 1 day')).toBeVisible();

  await page.getByRole('link', { name: 'Open List' }).click();
  await expect(page.locator('text=Kita 1 day')).toBeVisible();
});
