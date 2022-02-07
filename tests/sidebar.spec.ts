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
        await page.locator('.geSidebarContainer').locator('text=Activity').first().click();

        // Find the element in the drawing area
        const activity = page.locator('.geDiagramContainer').locator('text=Activity');
        await expect(activity).toBeVisible();

        const backgroundRect = activity.locator('../../..').locator('g rect');
        const fill = await backgroundRect.getAttribute('fill');
        expect(fill).toEqual('rgb(255, 255, 255)');
    });

    test('sidebar contains a green activity template', async ({ page }) => {

        // Create a consequence node in the drawing area by double clicking the sidebar element
        await page.locator('.geSidebarContainer').locator('text=Activity').nth(1).click();

        // Find the element in the drawing area
        const activity = page.locator('.geDiagramContainer').locator('text=Activity');
        await expect(activity).toBeVisible();

        const backgroundRect = activity.locator('../../..').locator('g rect');
        const fill = await backgroundRect.getAttribute('fill');
        expect(fill).toEqual('#d7e3bf');
    });

    test('sidebar contains an AND shape if aggregation function was defined', async ({ page, drawio }) => {
        const templateCountBefore = await page.locator('.geSidebarContainer').locator('.geSidebar').first().locator('a').count();

        // Click text=Attack Graphs
        await page.click('text=Attack Graphs');

        await page.click('text="Aggregation Functions..."');
        await page.click('text=Add...');

        await drawio.fillEditFunctionDialog('AND', 'AND');

        await page.click('text=Apply');

        const templateCountAfter = await page.locator('.geSidebarContainer').locator('.geSidebar').first().locator('a').count();
        expect(templateCountAfter).toBeGreaterThan(templateCountBefore);
    });

    test('sidebar contains an OR shape if aggregation function was defined', async ({ page, drawio }) => {
        const templateCountBefore = await page.locator('.geSidebarContainer').locator('.geSidebar').first().locator('a').count();

        // Click text=Attack Graphs
        await page.click('text=Attack Graphs');

        await page.click('text="Aggregation Functions..."');
        await page.click('text=Add...');

        await drawio.fillEditFunctionDialog('OR', 'OR');

        await page.click('text=Apply');

        const templateCountAfter = await page.locator('.geSidebarContainer').locator('.geSidebar').first().locator('a').count();
        expect(templateCountAfter).toBeGreaterThan(templateCountBefore);
    });
});
