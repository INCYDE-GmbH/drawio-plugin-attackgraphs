import { expect } from '@playwright/test';
import { test } from './base';

test.describe('sensitivity analysis', () => {
  test('enables sensitivity analysis via menu option', async ({ page }) => {
    await page.click('text=Attack Graphs');
    await page.click('text="Enable Sensitivity Analysis"');

    await page.click('text=Attack Graphs');
    // Menu entry contains tick mark
    expect((await page.locator('text="Enable Sensitivity Analysis"').getAttribute('style')).match(/background-image/).length).toBeGreaterThan(0);
  });

  test('tracks changes to node attributes', async ({ page, drawio }) => {
    await drawio.addActivityNode();
    await drawio.openDataDialogOnActivityNode();
    await drawio.addEntryToDataDialog('Knowledge', '5');

    await page.click('text=Attack Graphs');
    await page.click('text="Enable Sensitivity Analysis"');

    await drawio.openDataDialogOnActivityNode();
    await page.fill('textarea', '8');
    await drawio.applyDialog();

    await drawio.expectToFindCellAttributeWithStrikethrough('5');
    await drawio.expectToFindCellAttribute('8');
  });

  test('shows changes to node attributes in edit data dialog', async ({ page, drawio }) => {
    await drawio.addActivityNode();
    await drawio.openDataDialogOnActivityNode();
    await drawio.addEntryToDataDialog('Knowledge', '5');

    await page.click('text=Attack Graphs');
    await page.click('text="Enable Sensitivity Analysis"');

    await drawio.openDataDialogOnActivityNode();
    await page.fill('textarea', '8');
    await drawio.applyDialog();

    await drawio.openDataDialogOnActivityNode();
    expect(await page.inputValue('text="Knowledge:" >> xpath=.. >> textarea')).toBe('8');
  });

  test('tracks changes to edge weights', async ({ page, drawio }) => {
    const graph =
      `<mxGraphModel>
        <root>
          <object id="0">
            <mxCell />
          </object>
          <object id="1">
            <mxCell parent="0" />
          </object>
          <object label="Consequence" id="NRvaHTUMJR8sC2KhB2nQ-1">
            <mxCell style="shape=attackgraphs.node;" vertex="1" parent="1">
              <mxGeometry x="200" y="140" width="150" height="75" as="geometry" />
            </mxCell>
          </object>
          <mxCell id="NRvaHTUMJR8sC2KhB2nQ-3" value="5" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeWidth=2;exitX=0.5;exitY=0;exitDx=0;exitDy=0;" edge="1" parent="1" source="NRvaHTUMJR8sC2KhB2nQ-2" target="NRvaHTUMJR8sC2KhB2nQ-1">
            <mxGeometry relative="1" as="geometry" />
          </mxCell>
          <object label="Activity" id="NRvaHTUMJR8sC2KhB2nQ-2">
            <mxCell style="shape=attackgraphs.node;" vertex="1" parent="1">
              <mxGeometry x="200" y="300" width="150" height="75" as="geometry" />
            </mxCell>
          </object>
        </root>
      </mxGraphModel>`;

    await drawio.loadGraph(graph);

    await page.click('text=Attack Graphs');
    await page.click('text="Enable Sensitivity Analysis"');

    await page.locator('.geDiagramContainer').locator('text=5').dblclick();
    await page.keyboard.press('8');
    await drawio.focusCellInDiagramContainer();

    await drawio.expectToFindCellAttribute('8');
    await expect(page.locator('.geDiagramContainer').locator('text=5')).toHaveCount(0, { timeout: 100 });
  });

  test('applies changes to edge weights', async ({ page, drawio }) => {
    // Setup
    const graph =
      `<mxGraphModel>
        <root>
          <object id="0">
            <mxCell />
          </object>
          <object id="1">
            <mxCell parent="0" />
          </object>
          <object label="Consequence" id="NRvaHTUMJR8sC2KhB2nQ-1">
            <mxCell style="shape=attackgraphs.node;" vertex="1" parent="1">
              <mxGeometry x="200" y="140" width="150" height="75" as="geometry" />
            </mxCell>
          </object>
          <mxCell id="NRvaHTUMJR8sC2KhB2nQ-3" value="5" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeWidth=2;exitX=0.5;exitY=0;exitDx=0;exitDy=0;" edge="1" parent="1" source="NRvaHTUMJR8sC2KhB2nQ-2" target="NRvaHTUMJR8sC2KhB2nQ-1">
            <mxGeometry relative="1" as="geometry" />
          </mxCell>
          <object label="Activity" id="NRvaHTUMJR8sC2KhB2nQ-2">
            <mxCell style="shape=attackgraphs.node;" vertex="1" parent="1">
              <mxGeometry x="200" y="300" width="150" height="75" as="geometry" />
            </mxCell>
          </object>
        </root>
      </mxGraphModel>`;

    await drawio.loadGraph(graph);

    // Enable
    await page.click('text=Attack Graphs');
    await page.click('text="Enable Sensitivity Analysis"');

    // Update
    await page.locator('.geDiagramContainer').locator('text=5').dblclick();
    await page.keyboard.press('8');
    await drawio.focusCellInDiagramContainer();

    // Disable
    await page.click('text=Attack Graphs');
    await page.click('text="Enable Sensitivity Analysis"');
    await drawio.clickDialogButton('Yes');

    await drawio.expectToFindCellAttribute('8');
    await expect(page.locator('.geDiagramContainer').locator('text=5')).toHaveCount(0, { timeout: 100 });
  });

  test('reverts changes to edge weights', async ({ page, drawio }) => {
    // Setup
    const graph =
      `<mxGraphModel>
        <root>
          <object id="0">
            <mxCell />
          </object>
          <object id="1">
            <mxCell parent="0" />
          </object>
          <object label="Consequence" id="NRvaHTUMJR8sC2KhB2nQ-1">
            <mxCell style="shape=attackgraphs.node;" vertex="1" parent="1">
              <mxGeometry x="200" y="140" width="150" height="75" as="geometry" />
            </mxCell>
          </object>
          <mxCell id="NRvaHTUMJR8sC2KhB2nQ-3" value="5" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeWidth=2;exitX=0.5;exitY=0;exitDx=0;exitDy=0;" edge="1" parent="1" source="NRvaHTUMJR8sC2KhB2nQ-2" target="NRvaHTUMJR8sC2KhB2nQ-1">
            <mxGeometry relative="1" as="geometry" />
          </mxCell>
          <object label="Activity" id="NRvaHTUMJR8sC2KhB2nQ-2">
            <mxCell style="shape=attackgraphs.node;" vertex="1" parent="1">
              <mxGeometry x="200" y="300" width="150" height="75" as="geometry" />
            </mxCell>
          </object>
        </root>
      </mxGraphModel>`;

    await drawio.loadGraph(graph);

    // Enable
    await page.click('text=Attack Graphs');
    await page.click('text="Enable Sensitivity Analysis"');

    // Update
    await page.locator('.geDiagramContainer').locator('text=5').dblclick();
    await page.keyboard.press('8');
    await drawio.focusCellInDiagramContainer();

    // Disable
    await page.click('text=Attack Graphs');
    await page.click('text="Enable Sensitivity Analysis"');
    await drawio.clickDialogButton('No');

    await drawio.expectToFindCellAttribute('5');
    await expect(page.locator('.geDiagramContainer').locator('text=8')).toHaveCount(0, { timeout: 100 });
  });

  test('applies changes to node attributes', async ({ page, drawio }) => {
    // Setup
    await drawio.addActivityNode();
    await drawio.openDataDialogOnActivityNode();
    await drawio.addEntryToDataDialog('Knowledge', '5');

    // Enable
    await page.click('text=Attack Graphs');
    await page.click('text="Enable Sensitivity Analysis"');

    // Update
    await drawio.openDataDialogOnActivityNode();
    await page.fill('textarea', '8');
    await drawio.applyDialog();

    // Disable
    await page.click('text=Attack Graphs');
    await page.click('text="Enable Sensitivity Analysis"');
    await drawio.clickDialogButton('Yes');

    await drawio.expectToFindCellAttribute('8');
    await expect(page.locator('.geDiagramContainer').locator('text=5')).toHaveCount(0, { timeout: 100 });
  });

  test('reverts changes to node attributes', async ({ page, drawio }) => {
    // Setup
    await drawio.addActivityNode();
    await drawio.openDataDialogOnActivityNode();
    await drawio.addEntryToDataDialog('Knowledge', '5');

    // Enable
    await page.click('text=Attack Graphs');
    await page.click('text="Enable Sensitivity Analysis"');

    // Update
    await drawio.openDataDialogOnActivityNode();
    await page.fill('textarea', '8');
    await drawio.applyDialog();

    // Disable
    await page.click('text=Attack Graphs');
    await page.click('text="Enable Sensitivity Analysis"');
    await drawio.clickDialogButton('No');

    await drawio.expectToFindCellAttribute('5');
    await expect(page.locator('.geDiagramContainer').locator('text=8')).toHaveCount(0, { timeout: 100 });
  });

  test('tracks changes to aggregation functions', async ({ page, drawio }) => {
    await drawio.addActivityNode();
    await drawio.openAggregationFunctionDialogOnActivityNode();
    await page.locator('span').locator('text=Custom').locator('xpath=..').click();
    await drawio.applyStringToAceEditor('function() { return { Knowledge: 5 } }');

    await page.click('text=Attack Graphs');
    await page.click('text="Enable Sensitivity Analysis"');

    await drawio.openAggregationFunctionDialogOnActivityNode();
    await drawio.applyStringToAceEditor('function() { return { Knowledge: 8 } }');

    await drawio.expectToFindCellAttributeWithStrikethrough('5');
    await drawio.expectToFindCellAttribute('8');
  });

  test('applies changes to aggregation functions', async ({ page, drawio }) => {
    // Setup
    await drawio.addActivityNode();
    await drawio.openAggregationFunctionDialogOnActivityNode();
    await page.locator('span').locator('text=Custom').locator('xpath=..').click();
    await drawio.applyStringToAceEditor('function() { return { Knowledge: 5 } }');

    // Enable
    await page.click('text=Attack Graphs');
    await page.click('text="Enable Sensitivity Analysis"');

    // Update
    await drawio.openAggregationFunctionDialogOnActivityNode();
    await drawio.applyStringToAceEditor('function() { return { Knowledge: 8 } }');

    // Disable
    await page.click('text=Attack Graphs');
    await page.click('text="Enable Sensitivity Analysis"');
    await drawio.clickDialogButton('Yes');

    // Wait a second...
    await drawio.expectSensitivityAnalysisDisabled();

    await drawio.expectToFindCellAttribute('8');
    await expect(page.locator('.geDiagramContainer').locator('text=5')).toHaveCount(0, { timeout: 100 });
  });

  test('reverts changes to aggregation functions', async ({ page, drawio }) => {
    // Setup
    await drawio.addActivityNode();
    await drawio.openAggregationFunctionDialogOnActivityNode();
    await page.locator('span').locator('text=Custom').locator('xpath=..').click();
    await drawio.applyStringToAceEditor('function() { return { Knowledge: 5 } }');

    // Enable
    await page.click('text=Attack Graphs');
    await page.click('text="Enable Sensitivity Analysis"');

    // Update
    await drawio.openAggregationFunctionDialogOnActivityNode();
    await drawio.applyStringToAceEditor('function() { return { Knowledge: 8 } }');

    // Disable
    await page.click('text=Attack Graphs');
    await page.click('text="Enable Sensitivity Analysis"');
    await drawio.clickDialogButton('No');

    // Wait a second...
    await drawio.expectSensitivityAnalysisDisabled();

    await drawio.expectToFindCellAttribute('5');
    await expect(page.locator('.geDiagramContainer').locator('text=8')).toHaveCount(0, { timeout: 100 });
  });

  test('tracks changes to global aggregation functions', async ({ page, drawio }) => {
    await drawio.openGlobalAggregationFunctionDialog();
    await page.locator('text=Add...').click();
    await drawio.fillEditFunctionDialog('default', 'function() { return { Knowledge: 5 } }');
    await drawio.applyDialog();
    await drawio.addActivityNode();

    await page.click('text=Attack Graphs');
    await page.click('text="Enable Sensitivity Analysis"');

    await drawio.openGlobalAggregationFunctionDialog();
    await page.click('text=default >> :nth-match(span, 2)');
    await drawio.applyStringToAceEditor('function() { return { Knowledge: 8 } }');
    await drawio.applyDialog();

    await drawio.expectToFindCellAttributeWithStrikethrough('5');
    await drawio.expectToFindCellAttribute('8');
  });

  test('reverts changes to global aggregation functions', async ({ page, drawio }) => {
    // Setup
    await drawio.openGlobalAggregationFunctionDialog();
    await page.locator('text=Add...').click();
    await drawio.fillEditFunctionDialog('default', 'function() { return { Knowledge: 5 } }');
    await drawio.applyDialog();
    await drawio.addActivityNode();

    // Enable
    await page.click('text=Attack Graphs');
    await page.click('text="Enable Sensitivity Analysis"');

    // Update
    await drawio.openGlobalAggregationFunctionDialog();
    await page.click('text=default >> :nth-match(span, 2)');
    await drawio.applyStringToAceEditor('function() { return { Knowledge: 8 } }');
    await drawio.applyDialog();

    // Disable
    await page.click('text=Attack Graphs');
    await page.click('text="Enable Sensitivity Analysis"');
    await drawio.clickDialogButton('No');

    // Wait a second...
    await drawio.expectSensitivityAnalysisDisabled();

    await drawio.expectToFindCellAttribute('5');
    await expect(page.locator('.geDiagramContainer').locator('text=8')).toHaveCount(0, { timeout: 100 });
  });

  test('allows to delete attributes', async ({ page, drawio }) => {
    await drawio.addActivityNode();
    await drawio.openDataDialogOnActivityNode();
    await drawio.addEntryToDataDialog('Knowledge', '5');

    await page.click('text=Attack Graphs');
    await page.click('text="Enable Sensitivity Analysis"');

    await drawio.openDataDialogOnActivityNode();
    await page.locator('text="Knowledge:" >> xpath=.. >> a[title=Delete]').click();
    await drawio.applyDialog();

    await drawio.expectToFindCellAttributeWithStrikethrough('5');
    await expect(page.locator('.geDiagramContainer').locator('text=5')).toHaveCount(1, { timeout: 100 });
  });

  test('reverts deleted attributes', async ({ page, drawio }) => {
    // Setup
    await drawio.addActivityNode();
    await drawio.openDataDialogOnActivityNode();
    await drawio.addEntryToDataDialog('Knowledge', '5');

    // Enable
    await page.click('text=Attack Graphs');
    await page.click('text="Enable Sensitivity Analysis"');

    // Update
    await drawio.openDataDialogOnActivityNode();
    await page.locator('text="Knowledge:" >> xpath=.. >> a[title=Delete]').click();
    await drawio.applyDialog();

    // Disable
    await page.click('text=Attack Graphs');
    await page.click('text="Enable Sensitivity Analysis"');
    await drawio.clickDialogButton('No');

    await drawio.expectToFindCellAttribute('5'); // todo: without strikethrough
  });

  test('propagates changes to aggregation functions', async ({ page, drawio }) => {
    const graph =
      `<mxGraphModel dx="1422" dy="832" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="850" pageHeight="1100" math="0" shadow="0">
  <root>
    <object tooltip="" id="0">
      <ag_global_attributes>
        <ag_global_attribute name="Knowledge" value="" iconName="lightbulb" min="0" max="10" />
      </ag_global_attributes>
      <ag_attributes />
      <ag_computed_attributes />
      <mxCell />
    </object>
    <object tooltip="" id="1">
      <ag_attributes />
      <ag_computed_attributes />
      <mxCell parent="0" />
    </object>
    <object label="11" tooltip="" id="ZU1b3PCk7r7y1FS9eVJ9-1">
      <ag_attributes />
      <ag_computed_attributes />
      <mxCell style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeWidth=2;exitX=0.5;exitY=1;exitDx=0;exitDy=0;" parent="1" source="NRvaHTUMJR8sC2KhB2nQ-1" target="NRvaHTUMJR8sC2KhB2nQ-2" edge="1">
        <mxGeometry relative="1" as="geometry" />
      </mxCell>
    </object>
    <object label="Consequence" Knowledge="4" tooltip="Knowledge:37  " id="NRvaHTUMJR8sC2KhB2nQ-1">
      <ag_aggregation_custom_function ag_aggregation_custom_function="function(collection) { &#xa;    var localKnowledge = parseInt(collection.localAttributes[&#39;Knowledge&#39;]);&#xa;    var sum = 0;&#xa;    collection.childAttributes.forEach(function(child) {&#xa;        var edgeWeight = child.edgeWeight;&#xa;        var childKnowledge = parseInt(child.attributes[&#39;Knowledge&#39;]);&#xa;        var childLabel = parseInt(child.computedAttribute);&#xa;        sum += edgeWeight * (childKnowledge + childLabel)&#xa;    })&#xa;    &#xa;    return { Knowledge : localKnowledge + sum }&#xa;}" />
      <ag_attributes Knowledge="37" />
      <ag_computed_attributes />
      <mxCell style="shape=attackgraphs.node;" parent="1" vertex="1">
        <mxGeometry x="200" y="140" width="150" height="75" as="geometry" />
      </mxCell>
    </object>
    <object label="Activity" Knowledge="1" tooltip="" id="NRvaHTUMJR8sC2KhB2nQ-2">
      <ag_computed_attributes_custom_function ag_computed_attributes_custom_function="function() { return 2 }" />
      <ag_attributes />
      <ag_computed_attributes custom="2" />
      <mxCell style="shape=attackgraphs.node;" parent="1" vertex="1">
        <mxGeometry x="200" y="300" width="150" height="75" as="geometry" />
      </mxCell>
    </object>
  </root>
</mxGraphModel>`;

    await drawio.loadGraph(graph);

    await page.click('text=Attack Graphs');
    await page.click('text="Enable Sensitivity Analysis"');

    // Child Knowledge 1 -> 10
    await drawio.openDataDialogOnActivityNode();
    await page.fill('textarea', '10');
    await drawio.applyDialog();

    // Child Label 2 -> 20
    await drawio.openComputedAttributesFunctionDialogOnActivityNode();
    await drawio.applyStringToAceEditor('function() { return 20 }');

    // Edge Label 5 -> 30
    await page.locator('.geDiagramContainer').locator('text=11').dblclick();
    await page.keyboard.press('3');
    await page.keyboard.press('0');
    await drawio.focusCellInDiagramContainer();

    // Parent Knowledge 4 -> 40
    await page.locator('.geDiagramContainer').locator('text=Consequence').click();
    await page.press('body', 'Control+m');
    await page.fill('textarea', '40');
    await drawio.applyDialog();

    // New Result: 40 + (30 * (10+20)) = 940
    await drawio.expectToFindCellAttributeWithStrikethrough('37');
    await drawio.expectToFindCellAttribute('940');
  });

  test('reverts changes to various attributes', async ({ page, drawio }) => {
    const graph =
      `<mxGraphModel dx="1422" dy="832" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="850" pageHeight="1100" math="0" shadow="0">
  <root>
    <object tooltip="" id="0">
      <ag_global_attributes>
        <ag_global_attribute name="Knowledge" value="" iconName="lightbulb" min="0" max="10" />
      </ag_global_attributes>
      <ag_attributes />
      <ag_computed_attributes />
      <mxCell />
    </object>
    <object tooltip="" id="1">
      <ag_attributes />
      <ag_computed_attributes />
      <mxCell parent="0" />
    </object>
    <object label="11" tooltip="" id="ZU1b3PCk7r7y1FS9eVJ9-1">
      <ag_attributes />
      <ag_computed_attributes />
      <mxCell style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeWidth=2;exitX=0.5;exitY=1;exitDx=0;exitDy=0;" parent="1" source="NRvaHTUMJR8sC2KhB2nQ-1" target="NRvaHTUMJR8sC2KhB2nQ-2" edge="1">
        <mxGeometry relative="1" as="geometry" />
      </mxCell>
    </object>
    <object label="Consequence" Knowledge="4" tooltip="Knowledge:37  " id="NRvaHTUMJR8sC2KhB2nQ-1">
      <ag_aggregation_custom_function ag_aggregation_custom_function="function(collection) { &#xa;    var localKnowledge = parseInt(collection.localAttributes[&#39;Knowledge&#39;]);&#xa;    var sum = 0;&#xa;    collection.childAttributes.forEach(function(child) {&#xa;        var edgeWeight = child.edgeWeight;&#xa;        var childKnowledge = parseInt(child.attributes[&#39;Knowledge&#39;]);&#xa;        var childLabel = parseInt(child.computedAttribute);&#xa;        sum += edgeWeight * (childKnowledge + childLabel)&#xa;    })&#xa;    &#xa;    return { Knowledge : localKnowledge + sum }&#xa;}" />
      <ag_attributes Knowledge="37" />
      <ag_computed_attributes />
      <mxCell style="shape=attackgraphs.node;" parent="1" vertex="1">
        <mxGeometry x="200" y="140" width="150" height="75" as="geometry" />
      </mxCell>
    </object>
    <object label="Activity" Knowledge="1" tooltip="" id="NRvaHTUMJR8sC2KhB2nQ-2">
      <ag_computed_attributes_custom_function ag_computed_attributes_custom_function="function() { return 2 }" />
      <ag_attributes />
      <ag_computed_attributes custom="2" />
      <mxCell style="shape=attackgraphs.node;" parent="1" vertex="1">
        <mxGeometry x="200" y="300" width="150" height="75" as="geometry" />
      </mxCell>
    </object>
  </root>
</mxGraphModel>`;

    await drawio.loadGraph(graph);

    await page.click('text=Attack Graphs');
    await page.click('text="Enable Sensitivity Analysis"');

    // Child Knowledge 1 -> 10
    await drawio.openDataDialogOnActivityNode();
    await page.fill('textarea', '10');
    await drawio.applyDialog();

    // Child Label 2 -> 20
    await drawio.openComputedAttributesFunctionDialogOnActivityNode();
    await drawio.applyStringToAceEditor('function() { return 20 }');

    // Edge Label 5 -> 30
    await page.locator('.geDiagramContainer').locator('text=11').dblclick();
    await page.keyboard.press('3');
    await page.keyboard.press('0');
    await drawio.focusCellInDiagramContainer();

    // Parent Knowledge 4 -> 40
    await page.locator('.geDiagramContainer').locator('text=Consequence').click();
    await page.press('body', 'Control+m');
    await page.fill('textarea', '40');
    await drawio.applyDialog();

    // Disable
    await page.click('text=Attack Graphs');
    await page.click('text="Enable Sensitivity Analysis"');
    await drawio.clickDialogButton('No');

    // Wait a second...
    await drawio.expectSensitivityAnalysisDisabled();

    await drawio.expectToFindCellAttribute('37');
    await expect(page.locator('.geDiagramContainer').locator('text=940')).toHaveCount(0, { timeout: 100 });
  });
});
