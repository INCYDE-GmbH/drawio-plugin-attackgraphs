import { expect } from '@playwright/test';
import { test } from './base';

test.describe('the sidebar', () => {
    test('sidebar contains a consequence template', async ({ page }) => {
        // Create a consequence node in the drawing area by double clicking the sidebar element
        await page.locator('.geSidebarContainer').locator('text=Consequence').click();
        // Find the element in the drawing area
        await expect(page.locator('.geDiagramContainer').locator('text=Consequence')).toBeVisible();
    });

    test('sidebar contains a white activity template', async ({ page }) => {

        // Create a consequence node in the drawing area by double clicking the sidebar element
        await page.locator('.geSidebarContainer').locator('text=Attack Step').first().click();

        // Find the element in the drawing area
        const activity = page.locator('.geDiagramContainer').locator('text=Attack Step');
        await expect(activity).toBeVisible();

        const backgroundRect = activity.locator('../../..').locator('g rect');
        const fill = await backgroundRect.getAttribute('fill');
        expect(fill).toEqual('rgb(255, 255, 255)');
    });

    test('sidebar contains a green activity template', async ({ page }) => {

        // Create a consequence node in the drawing area by double clicking the sidebar element
        await page.locator('.geSidebarContainer').locator('text=Attack Step').nth(1).click();

        // Find the element in the drawing area
        const activity = page.locator('.geDiagramContainer').locator('text=Attack Step');
        await expect(activity).toBeVisible();

        const backgroundRect = activity.locator('../../..').locator('g rect');
        const fill = await backgroundRect.getAttribute('fill');
        expect(fill).toEqual('#d7e3bf');
    });
});
