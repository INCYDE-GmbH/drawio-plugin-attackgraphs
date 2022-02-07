import { expect } from '@playwright/test';
import { test } from './base';

test.describe('plugin registration', () => {
  test('contains Attack Graphs sidebar panel', async ({ page }) => {
    await expect(page.locator('text=Attack Graphs').first()).toBeVisible();
  });
});
