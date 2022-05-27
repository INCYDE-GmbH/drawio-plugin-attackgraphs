import { expect } from '@playwright/test';
import { test } from './base';

test.describe('computed attributes', () => {

  test('allows to define a global computed attributes function', async ({ page, drawio }) => {

    await drawio.openGlobalComputedAttributesFunctionDialog();

    await page.click('text=Add...');
    await drawio.fillEditFunctionDialog('default', `function (attrs) {
      return Math.max(Math.max(11 - attrs["Knowledge"], 11 - attrs["Ressourcen"]) - attrs["Ort"], 0);`);

    await drawio.applyDialog();
  });

  test('uses a global computed label function correctly', async ({ page, drawio }) => {
    await drawio.openGlobalComputedAttributesFunctionDialog();

    await page.click('text=Add...');

    await drawio.fillEditFunctionDialog('default', `function (attrs) {
      return 100;}`);
    await drawio.selectFirstFunctionAsDefaultForVertexType('activity_y');
    await drawio.applyDialog();

    await drawio.addActivityNode();
    await drawio.focusCellInDiagramContainer();
    await drawio.expectToFindCellAttribute('100');
  });

  test('uses a global computed label function correctly after rename', async ({ page, drawio }) => {
    await drawio.openGlobalComputedAttributesFunctionDialog();

    await page.click('text=Add...');
    await drawio.fillEditFunctionDialog('Test', `function (attrs) {
      return 100;}`);

    await drawio.applyDialog();

    await drawio.addActivityNode();
    await drawio.openComputedAttributesFunctionDialogOnActivityNode();
    await drawio.selectDialogRadioButton('Test');
    await drawio.applyDialog();

    await drawio.openGlobalComputedAttributesFunctionDialog();

    await page.locator('.geDialog').last().locator('.geSprite').last().click();
    await page.locator('.geDialog').last().locator('input').type('2');
    await drawio.applyDialog();

    await drawio.applyDialog();

    await drawio.focusCellInDiagramContainer();
    await drawio.focusCellInDiagramContainer();
    await drawio.expectToFindCellAttribute('100');
  });

  test('renders a correctly computed derived label', async ({ page, drawio }) => {
    await drawio.openGlobalDefaultAttributesDialog();

    await drawio.addAttributeToInGlobaAttributesDialog('Knowledge', '2', '100');

    await drawio.addAttributeToInGlobaAttributesDialog('Ressourcen', '3', '100');

    await drawio.addAttributeToInGlobaAttributesDialog('Ort', '1', '100');

    await drawio.applyDialog();

    await drawio.openGlobalComputedAttributesFunctionDialog();

    await page.click('text=Add...');

    await drawio.fillEditFunctionDialog('default', `function (collection) {
          return Math.max(Math.max(11 - collection.cellAttributes["Knowledge"], 11 - collection.cellAttributes["Ressourcen"]) - collection.cellAttributes["Ort"], 0);}`);
    await drawio.selectFirstFunctionAsDefaultForVertexType('activity_y');
    await drawio.applyDialog();

    await drawio.addActivityNode();
    await drawio.expectToFindCellAttribute('Attack Step');

    // Knowledge
    await drawio.expectToFindCellAttribute('2');
    // Ressourcen
    await drawio.expectToFindCellAttribute('3');
    // Ort
    await drawio.expectToFindCellAttribute('1');
    // Computed Attribute
    await drawio.expectToFindCellAttribute('8');
  });

  test('stores a custom function\'s content', async ({ page, drawio }) => {
    await drawio.addActivityNode();
    await drawio.focusCellInDiagramContainer();
    await drawio.openComputedAttributesFunctionDialogOnActivityNode();

    await drawio.selectDialogRadioButton('custom');
    await drawio.applyStringToAceEditor('A');

    await drawio.openComputedAttributesFunctionDialogOnActivityNode();
    await expect(page.locator('.ace_content').locator('text=A')).toBeVisible();
  });

  test('stores a function selection after rename', async ({ page, drawio }) => {
    await drawio.addActivityNode();
    await drawio.focusCellInDiagramContainer();
    await drawio.openGlobalComputedAttributesFunctionDialog();

    await page.click('text=Add...');

    await drawio.fillEditFunctionDialog('default', `function (childNodes) {return 1;}`);

    await page.click('text=Add...');

    await drawio.fillEditFunctionDialog('Another', 'Another');

    await drawio.applyDialog();

    await drawio.openComputedAttributesFunctionDialogOnActivityNode();
    await drawio.selectDialogRadioButton('Another');

    await drawio.applyDialog();

    await drawio.openGlobalComputedAttributesFunctionDialog();

    await page.locator('.geDialog').last().locator('.geSprite').last().click();
    await page.locator('.geDialog').last().locator('input').type('2');
    await drawio.applyDialog();

    await drawio.applyDialog();
    await drawio.openComputedAttributesFunctionDialogOnActivityNode();
    await expect(page.locator('span.ace_identifier:has-text=Another')).toBeTruthy();
  });

  test('renders a correctly computed derived label with a custom name', async ({ page, drawio }) => {
    await drawio.openDefaultAttributesDialog();

    await drawio.addAttributeToInGlobaAttributesDialog('Knowledge', '2', '100');
    await drawio.addAttributeToInGlobaAttributesDialog('Ressourcen', '3', '100');
    await drawio.addAttributeToInGlobaAttributesDialog('Ort', '1', '100');
    await drawio.applyDialog();

    await drawio.openGlobalComputedAttributesFunctionDialog();

    await page.click('text=Add...');
    await drawio.fillEditFunctionDialog('Feasibility1', `function (collection) {
          return Math.max(Math.max(11 - collection.cellAttributes["Knowledge"], 11 - collection.cellAttributes["Ressourcen"]) - collection.cellAttributes["Ort"], 0);}`);
    await drawio.applyDialog();

    await drawio.addActivityNode();
    await drawio.expectToFindCellAttribute('Attack Step');

    await drawio.openComputedAttributesFunctionDialogOnActivityNode();
    await drawio.selectDialogRadioButton('Feasibility1');
    await drawio.applyDialog();

    // Knowledge
    await drawio.expectToFindCellAttribute('2');
    // Ressourcen
    await drawio.expectToFindCellAttribute('3');
    // Ort
    await drawio.expectToFindCellAttribute('1');
    // Computed Attribute
    await drawio.expectToFindCellAttribute('8');
  });

  test('calculates the computed attribute based on the aggregated values of a cell', async ({ page, drawio }) => {
    const graph = `<mxGraphModel dx="1248" dy="741" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="827" math="0" shadow="0">
      <root>
        <object id="0">
          <ag_global_attributes>
            <ag_global_attribute name="Ressources" value="" iconName="hammer" />
            <ag_global_attribute name="Knowledge" value="" iconName="lightbulb" />
            <ag_global_attribute name="Location" value="" iconName="map_pin_ellipse" />
          </ag_global_attributes>
          <ag_computed_attributes_functions>
            <ag_computed_attributes_function name="Feasibility" fn="function (attrs) { &#xa;    return Math.max( &#xa;        Math.max( &#xa;            11-attrs[&quot;Knowledge&quot;], &#xa;            11-attrs[&quot;Ressources&quot;] &#xa;        ) - attrs[&quot;Location&quot;], 0); &#xa;}" />
          </ag_computed_attributes_functions>
          <ag_aggregation_functions>
            <ag_aggregation_function name="AND" fn="function (collection) { &#xa;    var result = {}; &#xa;    collection.childAttributes.forEach(function(child) { &#xa;        for (var attribute in child.attributes) { &#xa;            if (attribute in result) { &#xa;                result[attribute] += parseInt(child.attributes[attribute]); &#xa;            } else { &#xa;                result[attribute] = parseInt(child.attributes[attribute]); &#xa;            } &#xa;        } &#xa;    }); &#xa;    if (&quot;Location&quot; in result) { &#xa;        result[&quot;Location&quot;] = Math.min(1, result[&quot;Location&quot;]) &#xa;    } &#xa;    return result; &#xa;}" />
            <ag_aggregation_function name="OR" fn="function (collection) { &#xa;    var result = {}; &#xa;    collection.childAttributes.forEach(function(child) { &#xa;        for (var attribute in child.attributes) { &#xa;            if (attribute in result) { &#xa;                result[attribute] = Math.min(result[attribute], parseInt(child.attributes[attribute])) &#xa;            } else { &#xa;                result[attribute] = parseInt(child.attributes[attribute]); &#xa;            } &#xa;        } &#xa;    }); &#xa;    return result; &#xa;}" />
            <ag_aggregation_function name="default" fn="function (collection) { &#xa;    var result = {}; &#xa;    collection.childAttributes.forEach(function(child) { &#xa;        for (var attribute in child.attributes) { &#xa;            if (attribute in result) { &#xa;                result[attribute] = Math.min(result[attribute], parseInt(child.attributes[attribute])) &#xa;            } else { &#xa;                result[attribute] = parseInt(child.attributes[attribute]); &#xa;            } &#xa;        } &#xa;    }); &#xa;    return result; &#xa;}" />
          </ag_aggregation_functions>
          <ag_attributes />
          <ag_computed_attributes />
          <mxCell />
        </object>
        <object label="undefined" id="1">
          <ag_attributes />
          <ag_computed_attributes />
          <mxCell parent="0" />
        </object>
        <object label="Attack Step" Ressources="5" Knowledge="5" Location="1" id="5Ll6MHg5bFQaW9sslJ5G-1">
          <ag_attributes />
          <ag_computed_attributes_custom_function ag_computed_attributes_custom_function="function (attrs) { &#xa;    return Math.max( &#xa;        Math.max( &#xa;            11-attrs[&quot;Knowledge&quot;], &#xa;            11-attrs[&quot;Ressources&quot;] &#xa;        ) - attrs[&quot;Location&quot;], 0); &#xa;}" />
          <ag_computed_attributes custom="5" />
          <mxCell style="shape=attackgraphs.node;fillColor=#D7E3BF" parent="1" vertex="1">
            <mxGeometry x="300" y="414" width="150" height="75" as="geometry" />
          </mxCell>
        </object>
        <object label="undefined" id="5Ll6MHg5bFQaW9sslJ5G-4">
          <ag_attributes />
          <ag_computed_attributes />
          <mxCell style="edgeStyle=none;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" parent="1" source="5Ll6MHg5bFQaW9sslJ5G-2" target="5Ll6MHg5bFQaW9sslJ5G-1" edge="1">
            <mxGeometry relative="1" as="geometry" />
          </mxCell>
        </object>
        <object label="Attack Step" Ressources="" Knowledge="" Location="" id="5Ll6MHg5bFQaW9sslJ5G-2">
          <ag_attributes />
          <ag_computed_attributes_custom_function ag_computed_attributes_custom_function="function (attrs) { &#xa;    return Math.max( &#xa;        Math.max( &#xa;            11-attrs[&quot;Knowledge&quot;], &#xa;            11-attrs[&quot;Ressources&quot;] &#xa;        ) - attrs[&quot;Location&quot;], 0); &#xa;}" />
          <ag_aggregation_function_reference ag_aggregation_function_reference="AND" />
          <ag_computed_attributes custom="11" />
          <mxCell style="shape=attackgraphs.node;" parent="1" vertex="1">
            <mxGeometry x="300" y="220" width="150" height="75" as="geometry" />
          </mxCell>
        </object>
      </root>
    </mxGraphModel>
      `;

    await drawio.loadGraph(graph);
    expect(page.locator('.geDiagramContainer').locator('[fill=\'#d7e3bf\']:has-text=5')).toBeTruthy();
  });

  test('can access global attributes', async ({ page, drawio }) => {
    await drawio.openDefaultAttributesDialog();

    await drawio.addAttributeToInGlobaAttributesDialog('Knowledge', '2', '11');
    await drawio.addAttributeToInGlobaAttributesDialog('Ressourcen', '3', '11');
    await drawio.addAttributeToInGlobaAttributesDialog('Ort', '1', '11');
    await drawio.applyDialog();

    await drawio.openGlobalComputedAttributesFunctionDialog();

    await page.click('text=Add...');
    await drawio.fillEditFunctionDialog('Feasibility1', `function (collection) {
          return parseInt(collection.globalAttributes["Knowledge"].max) + parseInt(collection.globalAttributes["Ressourcen"].max) + parseInt(collection.globalAttributes["Ort"].max);}`);
    await drawio.applyDialog();

    await drawio.addActivityNode();
    await drawio.expectToFindCellAttribute('Attack Step');

    await drawio.openComputedAttributesFunctionDialogOnActivityNode();
    await drawio.selectDialogRadioButton('Feasibility1');
    await drawio.applyDialog();

    await drawio.expectToFindCellAttribute('33');
  });
});
