import { expect, Page } from '@playwright/test';
import { test } from './base';

test.describe('aggregation functions', () => {

    test('allows to specify an aggregation function', async ({ page, drawio }) => {
        await drawio.addActivityNode();
        await drawio.openAggregationFunctionDialogOnActivityNode();

        await page.click('span:has-text("custom")');
        await page.locator('.ace_text-input').fill(`foo bar`);
        await page.click('text=Apply');
    });

    test('renders aggregation function results', async ({ page, drawio }) => {
        await drawio.addActivityNode();
        await drawio.openAggregationFunctionDialogOnActivityNode();

        await page.click('span:has-text("custom")');
        await drawio.applyStringToAceEditor(`function (childNodes) {return {Knowledge:\'1\',Ressourcen:\'2\',Ort:\'3\'};}`);

        // Knowledge
        await expect(page.locator('.geDiagramContainer').locator('text=1')).toBeVisible();
        // Ressourcen
        await expect(page.locator('.geDiagramContainer').locator('text=2')).toBeVisible();
        // Ort
        await expect(page.locator('.geDiagramContainer').locator('text=3')).toBeVisible();
    });

    test('can access global min/max values ', async ({ page, drawio }) => {
        await drawio.openDefaultAttributesDialog();
        await drawio.addPropertyInDefaultDialog('Knowledge');
        await page.click('text=Apply');
        await drawio.addActivityNode();
        await drawio.openAggregationFunctionDialogOnActivityNode();
        await page.click('span:has-text("custom")');
        await drawio.applyStringToAceEditor(`function(collection){return{'Knowledge': collection.globalAttributes['Knowledge'].max};}`);
        await expect(page.locator('.geDiagramContainer').locator('text=100')).toBeVisible();
    });

    test('can access childrens computed attributes ', async ({ page, drawio }) => {
        const graph = `<mxGraphModel dx="1422" dy="834" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0">
  <root>
    <mxCell id="0" />
    <mxCell id="1" parent="0" />
    <mxCell id="ExoI5DOS8JcdbeK90SCF-4" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeWidth=2;entryX=0.75;entryY=0;entryDx=0;entryDy=0;" edge="1" parent="1" source="ExoI5DOS8JcdbeK90SCF-1" target="ExoI5DOS8JcdbeK90SCF-3">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>
    <mxCell id="ExoI5DOS8JcdbeK90SCF-7" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeWidth=2;" edge="1" parent="1" source="ExoI5DOS8JcdbeK90SCF-1" target="ExoI5DOS8JcdbeK90SCF-5">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>
    <mxCell id="ExoI5DOS8JcdbeK90SCF-8" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeWidth=2;" edge="1" parent="1" source="ExoI5DOS8JcdbeK90SCF-1" target="ExoI5DOS8JcdbeK90SCF-6">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>
    <object label="Auswirkung" tooltip="" id="ExoI5DOS8JcdbeK90SCF-1">
      <ag_attributes />
      <ag_computed_attributes />
      <mxCell style="shape=attackgraphs.node;rounded=1" vertex="1" parent="1">
        <mxGeometry x="390" y="190" width="150" height="75" as="geometry" />
      </mxCell>
    </object>
    <object label="Aktivität" tooltip="" id="ExoI5DOS8JcdbeK90SCF-3">
      <ag_attributes />
      <ag_computed_attributes value="1" />
      <ag_computed_attributes_custom_function ag_computed_attributes_custom_function="function(){&#xa;    return { &#39;value&#39;: 1 };&#xa;}" />
      <mxCell style="shape=attackgraphs.node;" vertex="1" parent="1">
        <mxGeometry x="240" y="340" width="150" height="75" as="geometry" />
      </mxCell>
    </object>
    <object label="Aktivität" tooltip="" id="ExoI5DOS8JcdbeK90SCF-5">
      <ag_attributes />
      <ag_computed_attributes value="2" />
      <ag_computed_attributes_custom_function ag_computed_attributes_custom_function="function(){&#xa;    return { &#39;value&#39;: 2 };&#xa;}" />
      <mxCell style="shape=attackgraphs.node;" vertex="1" parent="1">
        <mxGeometry x="400" y="340" width="150" height="75" as="geometry" />
      </mxCell>
    </object>
    <object label="Aktivität" tooltip="" id="ExoI5DOS8JcdbeK90SCF-6">
      <ag_attributes />
      <ag_computed_attributes value="3" />
      <ag_computed_attributes_custom_function ag_computed_attributes_custom_function="function(){&#xa;    return { &#39;value&#39;: 3 };&#xa;}" />
      <mxCell style="shape=attackgraphs.node;" vertex="1" parent="1">
        <mxGeometry x="570" y="340" width="150" height="75" as="geometry" />
      </mxCell>
    </object>
  </root>
</mxGraphModel>
`;
        await drawio.loadGraph(graph);
        await drawio.openAggregationFunctionDialogOnLocator(page.locator('.geDiagramContainer').locator('text=Auswirkung'));
        await page.click('span:has-text("custom")');
        await drawio.applyStringToAceEditor(`function(collection) {
    var sum = 0;
    collection.childAttributes.forEach(function (child) {
        var childLabel = parseInt(child.computedAttribute["value"]);
        sum += childLabel;
    })

    return { ComputedAttributes: sum }
}`);
        await drawio.expectToFindCellAttribute('6');
    });

    test('stores a custom function\'s content', async ({ page, drawio }) => {
        await drawio.addActivityNode();
        await drawio.openAggregationFunctionDialogOnActivityNode();
        await page.click('span:has-text("custom")');
        await drawio.applyStringToAceEditor('A');
        await page.locator('.geDiagramContainer').locator('text=Attack Step').click();
        await page.locator('img.ag_function_handle').last().click();
        await expect(page.locator('.ace_content').locator('text=A')).toBeVisible();
    });

});
