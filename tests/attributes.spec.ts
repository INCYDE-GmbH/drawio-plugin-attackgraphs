import { expect } from '@playwright/test';
import { test } from './base';

test.describe('attributes and default attributes', () => {

  test('allows to specify global attributes', async ({ page }) => {

    await page.click('text=Attack Graphs');
    await page.click('text="Default Attributes..."');

    await page.fill('[placeholder="Attribute Name"]', 'Attribute1');

    await page.fill('[placeholder="Value"]', '10');

    await page.click('text=Add Property');

    await page.fill('input[name="max"]', '100');

    await page.click('text=Apply');
  });

  test('sets default attributes on new diagram nodes', async ({ page }) => {
    await page.click('text=Attack Graphs');
    await page.click('text="Default Attributes..."');
    await page.fill('[placeholder="Attribute Name"]', 'Attribute1');
    await page.fill('[placeholder="Value"]', '10');
    await page.click('text=Add Property');
    await page.fill('input[name="max"]', '100');
    await page.click('text=Apply');

    // First activity vertex (white node) shall not have a default value
    await page.locator('.geSidebarContainer').locator('text=Attack Step').nth(2).click();
    const activity = page.locator('.geDiagramContainer').locator('text=Attack Step');
    await expect(activity).toBeVisible();
    await page.press('body', 'Control+m');

    const newFnDialog = page.locator('.geDialog').last();
    await expect(newFnDialog.locator('text=Attribute1')).toBeVisible();
    expect(await newFnDialog.locator('textarea').first().inputValue()).toEqual('10');
  });

  test('sets default attributes on new diagram nodes after loading', async ({ page }) => {
    await page.click('text=Attack Graphs');
    await page.click('text="Default Attributes..."');
    await page.fill('[placeholder="Attribute Name"]', 'Attribute1');
    await page.fill('[placeholder="Value"]', '10');
    await page.click('text=Add Property');
    await page.fill('input[name="max"]', '100');
    await page.click('text=Apply');

    await page.locator('.geMenubar').locator('text=File').click();
    await page.locator('.mxPopupMenu').locator('text="Save"').click();
    await page.locator('text=Browser').click();

    // Wait to be sure that the file was saved in the browser
    // TODO: Replace with wait for selector (spinning wheel) to be hidden
    await page.waitForTimeout(3000);

    await page.goto('/');
    await page.locator('text="File"').first().waitFor();

    await page.locator('.geMenubar').locator('text=File').click();
    await page.locator('.mxPopupMenu').locator('text=Open Recent').click();
    await page.locator('.mxPopupMenu').locator('text="Untitled Diagram (Browser)"').click();
    await page.locator('text="Open in This Window"').click();

    // First activity vertex (white node) shall not have a default value
    await page.locator('.geSidebarContainer').locator('text=Attack Step').nth(2).click();
    const activity = page.locator('.geDiagramContainer').locator('text=Attack Step');
    await expect(activity).toBeVisible();
    await page.press('body', 'Control+m');

    const newFnDialog = page.locator('.geDialog').last();
    await expect(newFnDialog.locator('text=Attribute1')).toBeVisible();
    expect(await newFnDialog.locator('textarea').first().inputValue()).toEqual('10');
  });

  test('renders attributes of diagram nodes', async ({ page }) => {

    await page.locator('.geSidebarContainer').locator('text=Attack Step').first().click();
    const activity = page.locator('.geDiagramContainer').locator('text=Attack Step');
    await expect(activity).toBeVisible();
    await page.press('body', 'Control+m');

    const dialog = page.locator('.geDialog').last();
    await dialog.locator('[placeholder="Enter Property Name"]').fill('Attribute1');
    await dialog.locator('[placeholder="Enter Property Name"]').press('Tab');
    await dialog.locator('text=Add Property').click();
    await dialog.locator('textarea').last().fill('5');
    await dialog.locator('text=Apply').click();

    const attributeLabel = page.locator('.geDiagramContainer').locator('text=5');
    await expect(attributeLabel).toBeVisible();
  });

  test('uses predefined nodes with their functions', async ({ page, drawio }) => {
    const aggFunc = `test_function_content`;
    await drawio.openGlobalAggregationFunctionDialog();

    await page.locator('text=Add...').click();
    await drawio.fillEditFunctionDialog('activity', aggFunc);
    await drawio.selectFirstFunctionAsDefaultForVertexType('activity_w');

    await page.locator('text=Add...').click();
    await drawio.fillEditFunctionDialog('default', 'A');

    await drawio.applyDialog();

    // Instantiate an attack step shape
    await page.locator('.geSidebarContainer').locator('.geSidebar').first().locator('text=Attack Step').first().click();
    await page.locator('img.ag_function_handle').last().click();

    await expect(page.locator(`.ace_content`)).toHaveText(aggFunc);
    await drawio.applyDialog();
  });

  test('uses the selected icon in the DefaultAttributesDialog', async ({ page, drawio }) => {
    await drawio.openDefaultAttributesDialog();
    await drawio.addPropertyInDefaultDialog('Knowledge');

    //open IconPickerDialog for first attribute
    await page.locator('table.properties').locator('tr').locator('td').locator('span').click();
    const icon = page.locator('tbody').locator('tr').last().locator('td').last();
    const path = await icon.locator('path').getAttribute('d');
    icon.click();
    await drawio.applyDialog();
    expect(path).toEqual(
      await page.locator('table.properties').locator('tr').locator('td[name="icon_picker"]').locator('path').getAttribute('d')
    );
  });

  test('can remove attributes from DefaultAttributesDialog', async ({ page, drawio }) => {
    await drawio.openDefaultAttributesDialog();
    await drawio.addPropertyInDefaultDialog('Knowledge');
    await drawio.addPropertyInDefaultDialog('Ressourcen');
    await drawio.addPropertyInDefaultDialog('Ort');

    await drawio.removePropertyFromDefaultDialog('Ressourcen');
    await drawio.removePropertyFromDefaultDialog('Knowledge');
    await drawio.removePropertyFromDefaultDialog('Ort');

    const dialog = page.locator('.geDialog');

    await expect(dialog.locator('text=Knowledge')).toHaveCount(0, { timeout: 100 });
    await expect(dialog.locator('text=Ressourcen')).toHaveCount(0, { timeout: 100 });
    await expect(dialog.locator('text=Ort')).toHaveCount(0, { timeout: 100 });
    await drawio.applyDialog();
  });

  test('renders the selected icon in cells', async ({ page, drawio }) => {
    await drawio.openDefaultAttributesDialog();
    await drawio.addPropertyInDefaultDialog('Knowledge');

    await page.locator('table.properties').locator('tr').locator('td').locator('span').click();
    const icon = page.locator('tbody').locator('tr').last().locator('td').last();
    icon.click();
    const path = await icon.locator('path').getAttribute('d');

    await page.locator('.geDialog').last().locator('text=Apply').click();
    await page.locator('.geDialog').last().locator('text=Apply').click();
    // First activity vertex (white node) shall not have default attributes
    await page.locator('.geSidebarContainer').locator('text=Attack Step').nth(2).click();
    const href = await page.locator('.geDiagramContainer').locator('text=Attack Step')
      .locator('xpath=..').locator('xpath=..').locator('xpath=..').locator('image').getAttribute('xlink:href');

    const regex = RegExp(path, 'gm');
    const result = regex.exec(href);
    expect(result.length).toBeGreaterThan(0);
  });

  test('can change selected icon of an attribute in the DefaultAttributesDialog', async ({ page, drawio }) => {
    await drawio.openDefaultAttributesDialog();
    await drawio.addPropertyInDefaultDialog('Knowledge');

    await page.locator('table.properties').locator('tr').locator('td').locator('span').click();
    drawio.selectLastIconFromIconPickerDialog();

    await page.locator('table.properties').locator('tr').locator('td').locator('span').click();
    const icon2 = await page.locator('tbody').locator('tr').last().locator('td').last();
    icon2.click();
    const path = await icon2.locator('path').getAttribute('d');
    await drawio.applyDialog();
    expect(path).toEqual(await page.locator('td[name="icon_picker"]').locator('path').getAttribute('d'));

  });

  test('will update an attributes icon', async ({ page, drawio }) => {
    await drawio.openDefaultAttributesDialog();
    await drawio.addPropertyInDefaultDialog('Knowledge');

    await page.locator('table.properties').locator('tr').locator('td').locator('span').click();
    await drawio.selectLastIconFromIconPickerDialog();

    await drawio.applyDialog();
    await drawio.addActivityNode();

    await drawio.openDefaultAttributesDialog();

    await page.locator('table.properties').locator('tr').locator('td').locator('span').click();
    const icon = page.locator('tbody').locator('tr').last().locator('td').last();
    icon.click();
    const path = await icon.locator('path').getAttribute('d');

    await drawio.applyDialog();
    await drawio.applyDialog();

    await drawio.addActivityNode();
    const href = await page.locator('.geDiagramContainer').locator('text=Attack Step')
      .locator('xpath=..').locator('xpath=..').locator('xpath=..').locator('image').first().getAttribute('xlink:href');

    const regex = RegExp(path, 'gm');
    const result = regex.exec(href);
    expect(result.length).toBeGreaterThan(0);
  });

  test('will not render hidden attributes', async ({ page, drawio }) => {
    await drawio.openDefaultAttributesDialog();
    await drawio.addPropertyInDefaultDialog('Knowledge');

    await page.locator('table.properties').locator('tr').locator('td').locator('span').click();
    await drawio.selectLastIconFromIconPickerDialog();

    await drawio.addPropertyInDefaultDialog('_Test');

    await page.locator('table.properties').locator('tr').locator('td').locator('span').last().click();
    await drawio.selectLastIconFromIconPickerDialog();

    await drawio.applyDialog();
    await drawio.addActivityNode();


    await expect(page.locator('.geDiagramContainer').locator(`text=_Test`)).not.toBeVisible();
  });

});
