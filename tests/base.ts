import { Page, test as base } from '@playwright/test';
import { DrawioPage } from './drawio-page';

export const test = base.extend<{drawio: DrawioPage}>({
  drawio: async ({ page }, use) => {
    const drawio = new DrawioPage(page);
    await use(drawio);
  },
  page: async ({ page }, use) => {

    // Go to the starting url before each test.
    await page.goto('/');

    // Perform configuration
    await page.evaluate(() => {
      // Delete previous diagram state
      indexedDB.deleteDatabase("database");

      // Initialize the application config with
      // - our plugin set
      // - start screen disabled
      const appConfig = {
        "language": "",
        "configVersion": null,
        "customFonts": [],
        "libraries": "general;uml;er;bpmn;flowchart;basic;arrows2",
        "customLibraries": ["L.scratchpad"],
        "plugins": ["plugins/attackgraphs.js"],
        "recentColors": [],
        "formatWidth": "240",
        "createTarget": false,
        "pageFormat": { "x": 0, "y": 0, "width": 850, "height": 1100 },
        "search": true,
        "showStartScreen": false,
        "gridColor": "#d0d0d0",
        "darkGridColor": "#6e6e6e",
        "autosave": true,
        "resizeImages": null,
        "openCounter": 1,
        "version": 18,
        "unit": 1,
        "isRulerOn": false,
        "ui": ""
      };
      localStorage.setItem('.drawio-config', JSON.stringify(appConfig));
    });

    // Reload
    await page.goto('/');

    await page.locator('text="File"').first().waitFor();

    await use(page);
  },
});
