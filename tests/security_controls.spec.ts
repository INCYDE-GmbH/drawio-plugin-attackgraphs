import { expect } from '@playwright/test';
import { test } from './base';

test.describe('security controls', () => {

  test('renders overwritten attributes of diagram nodes', async ({ page }) => {

    await page.locator('.geSidebarContainer').locator('text=Attack Step').first().click();
    const activity = page.locator('.geDiagramContainer').locator('text=Attack Step');
    await expect(activity).toBeVisible();

    // Fill in some data
    await page.press('body', 'Control+m');
    const dialog = page.locator('.geDialog').last();
    await dialog.locator('[placeholder="Enter Property Name"]').fill('Attribute1');
    await dialog.locator('[placeholder="Enter Property Name"]').press('Tab');
    await dialog.locator('text=Add Property').click();
    await dialog.locator('textarea').last().fill('5');
    await dialog.locator('text=Apply').click();

    // Overwrite the data using an aggregation function
    const activityLabel = page.locator('.geDiagramContainer').locator('text=Attack Step');
    activityLabel.click();
    await page.locator('img.ag_function_handle').last().click();
    await page.click('span:has-text("custom")');
    await page.locator('.ace_text-input').fill(`function() { return {Attribute1: 123}}`);
    await page.click('text=Apply');

    const attributeLabel = page.locator('.geDiagramContainer').locator('text=123');
    await expect(attributeLabel).toBeVisible();
    const oldAttributeLabel = page.locator('.geDiagramContainer').locator('text=5');
    await expect(oldAttributeLabel).toBeVisible();
  });

  test('renders diff for attributes influenced by security controls', async ({ page, drawio }) => {
    const graph =
      `<mxGraphModel dx="1018" dy="621" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="850" pageHeight="1100" math="0" shadow="0">
      <root>
        <object id="0">
          <mxCell />
        </object>
        <object id="1">
          <mxCell parent="0" />
        </object>
        <mxCell id="5TitfXBCX5atIBFB_Qtg-6" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeWidth=2;exitX=0.5;exitY=1;exitDx=0;exitDy=0;" edge="1" parent="1" source="5TitfXBCX5atIBFB_Qtg-4" target="5TitfXBCX5atIBFB_Qtg-5">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <object label="Attack Step" Knowledge="5" id="5TitfXBCX5atIBFB_Qtg-4">
          <mxCell style="shape=attackgraphs.node;" vertex="1" parent="1">
            <mxGeometry x="260" y="200" width="150" height="75" as="geometry" />
          </mxCell>
        </object>
        <object label="Security Control" Knowledge="3" id="5TitfXBCX5atIBFB_Qtg-5">
          <mxCell style="shape=attackgraphs.node;fillColor=#DAE8FC" vertex="1" parent="1">
            <mxGeometry x="260" y="380" width="150" height="75" as="geometry" />
          </mxCell>
        </object>
      </root>
      </mxGraphModel>`;

    await drawio.loadGraph(graph);
    await drawio.openAggregationFunctionDialogOnActivityNode();
    await page.click('span:has-text("custom")');
    await drawio.applyStringToAceEditor(`
    function (collection) {
        var result = collection.localAttributes;
        collection.childAttributes.forEach(function(child) {
            for (var attribute in child.attributes) {
                var securityControlValue = parseInt(child.attributes[attribute]);
                var resultValue = parseInt(result[attribute]);
                if (securityControlValue !== NaN && resultValue !== NaN) {
                    result[attribute] = resultValue + securityControlValue;
                }
            }
        });
        return result;
    }`);

    // Control value
    await drawio.expectToFindCellAttribute('3');
    // Original activity value
    await drawio.expectToFindCellAttribute('5');
    // New activity value
    await drawio.expectToFindCellAttribute('8');
  });
});
