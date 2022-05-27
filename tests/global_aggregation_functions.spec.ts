import { expect, Page } from '@playwright/test';
import { test } from './base';

test.describe('global aggregation functions', () => {

  test('allows to define a global aggregation function', async ({ page }) => {
    await page.click('text=Attack Graphs');
    await page.click('text=Aggregation Functions...');

    await page.click('text=Add...');

    await page.locator('text=Name').locator('xpath=..').locator('input').fill('default');
    await page.fill('textarea.ace_text-input', `foo bar`);
    await page.locator('.gePrimaryBtn').last().click();
    await page.locator('.gePrimaryBtn').last().click();
  });

  test('uses the default aggregation function for new activities', async ({ page, drawio }) => {
    await drawio.openGlobalAggregationFunctionDialog();

    await page.click('text=Add...');

    await drawio.fillEditFunctionDialog('default', `function (childNodes) {return {Knowledge:\'2\',Ressourcen:\'3\',Ort:\'4\'};}`);
    await drawio.selectFirstFunctionAsDefaultForVertexType('activity_y');
    await drawio.applyDialog();

    await drawio.addActivityNode();

    // Knowledge
    await expect(page.locator('.geDiagramContainer').locator('text=2')).toBeVisible();
    // Ressourcen
    await expect(page.locator('.geDiagramContainer').locator('text=3')).toBeVisible();
    // Ort
    await expect(page.locator('.geDiagramContainer').locator('text=4')).toBeVisible();
  });

  test('list all available aggregation functions', async ({ page, drawio }) => {
    await drawio.addActivityNode();
    await drawio.openGlobalAggregationFunctionDialog();

    await page.locator('text=Add...').click();

    await drawio.fillEditFunctionDialog('default', `function (childNodes) {return {Knowledge:\'2\',Ressourcen:\'2\',Ort:\'2\'};}`);

    await page.locator('text=Add...').click();

    await drawio.fillEditFunctionDialog('Another', 'Another');

    await page.locator('text=Add...').click();

    await drawio.fillEditFunctionDialog('A third', 'A third');

    await drawio.applyDialog();

    await drawio.openAggregationFunctionDialogOnActivityNode();

    // Knowledge
    await expect(page.locator('span').locator('text=default')).toBeVisible();
    // Ressourcen
    await expect(page.locator('span').locator('text=Another')).toBeVisible();
    // Ort
    await expect(page.locator('span').locator('text=A third')).toBeVisible();
  });



  test('stores a function selection after rename', async ({ page, drawio }) => {
    await drawio.addActivityNode();

    await drawio.openGlobalAggregationFunctionDialog();

    await page.locator('text=Add...').click();

    await drawio.fillEditFunctionDialog('default', `function (childNodes) {return {Knowledge:\'2\',Ressourcen:\'2\',Ort:\'2\'};}`);

    await page.locator('text=Add...').click();

    await drawio.fillEditFunctionDialog('Another', 'Another');

    await drawio.applyDialog();

    await drawio.openAggregationFunctionDialogOnActivityNode();
    await page.locator('span').locator('text=Another').locator('xpath=..').click();
    await drawio.applyDialog();

    await drawio.openGlobalAggregationFunctionDialog();
    await page.click('text=Another >> :nth-match(span, 2)');
    await drawio.enterFunctionName('Another2');
    await drawio.applyDialog();
    await drawio.applyDialog();

    await drawio.openAggregationFunctionDialogOnActivityNode();
    expect(await page.locator('text=Another2').locator('xpath=..').locator('input').isChecked()).toBeTruthy();
  });

  test('uses selected function', async ({ page, drawio }) => {
    await drawio.addActivityNode();

    await drawio.openGlobalAggregationFunctionDialog();

    await page.locator('text=Add...').click();

    await drawio.fillEditFunctionDialog('default', `function (childNodes) {return {Knowledge:\'2\',Ressourcen:\'2\',Ort:\'2\'};}`);

    await page.locator('text=Add...').click();

    await drawio.fillEditFunctionDialog('Another', `function (childNodes) {return {Knowledge:\'-1\',Ressourcen:\'-2\',Ort:\'-3\'};}`);

    await drawio.applyDialog();

    await drawio.openAggregationFunctionDialogOnActivityNode();

    await page.locator('span').locator('text=Another').locator('xpath=..').click();

    await drawio.applyDialog();

    await expect(page.locator('.geDiagramContainer').locator('text=-1')).toBeVisible();
    await expect(page.locator('.geDiagramContainer').locator('text=-2')).toBeVisible();
    await expect(page.locator('.geDiagramContainer').locator('text=-3')).toBeVisible();
  });

  test('keeps reference to renamed function', async ({ page, drawio }) => {
    await drawio.addActivityNode();
    await drawio.openGlobalAggregationFunctionDialog();
    await page.locator('text=Add...').click();

    await drawio.fillEditFunctionDialog('Function 1', `function (collection) {return {Knowledge:\'1\',Ressourcen:\'2\',Ort:\'3\'};}`);

    await drawio.applyDialog();

    await drawio.openAggregationFunctionDialogOnActivityNode();
    await page.locator('span').locator('text=Function 1').click();
    await drawio.applyDialog();

    await drawio.openGlobalAggregationFunctionDialog();

    await page.locator('.geDialog').last().locator('.geSprite').last().click();
    await page.locator('.geDialog').last().locator('input').type('2');

    await drawio.applyDialog();
    await drawio.applyDialog();

    await expect(page.locator('.geDiagramContainer').locator('text=1')).toBeVisible();
    await expect(page.locator('.geDiagramContainer').locator('text=2')).toBeVisible();
    await expect(page.locator('.geDiagramContainer').locator('text=3')).toBeVisible();
  });

});
