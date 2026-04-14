import { test, expect } from '@playwright/test';

test.describe('Pet dog Smoke Tests', () => {
  test('Homepage loads', async ({ page }) => {
    await page.goto('http://localhost:8000');
    const locator = page.locator('.max-w-2xl a');
    await expect(locator).toContainText('Browse All Dogs →');
  });
});