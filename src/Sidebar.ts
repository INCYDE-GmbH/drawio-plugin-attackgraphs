import { RootAttributeProvider } from './Analysis/RootAttributeProvider';
import { AttackGraphIconLegendShape } from './AttackGraphIconLegendShape';
import { AttackGraphLinkShape } from './AttackGraphLinkShape';
import { AttackGraphNodeShape } from './AttackGraphNodeShape';
import { AttributeRenderer } from './AttributeRenderer';
import { STORAGE_NAME_AGGREGATION_FUNCTION_REFERENCE, STORAGE_NAME_COMPUTED_ATTRIBUTES_FUNCTION_REFERENCE } from './CellUtils';
import { AttackgraphFunction, GlobalAttribute } from './Model';

export class Sidebar {
  private sidebar: Draw.Sidebar | null = null;
  private ui: Draw.UI | null = null;

  constructor(ui: Draw.UI) {
    if (ui !== null) {
      this.ui = ui;
      this.sidebar = ui.sidebar;
    }
  }

  private createIconLegendShape(sidebar: Draw.Sidebar): HTMLAnchorElement {
    const doc = mxUtils.createXmlDocument();
    const value = doc.createElement('object');
    let height = 75;

    if (this.ui !== null && this.ui.editor.graph !== null) {
      const count = RootAttributeProvider.getRenderableAttributes(AttributeRenderer.rootAttributes().getGlobalAttributes() || []).length;
      AttackGraphIconLegendShape.updateHeight(count);
      height = AttackGraphIconLegendShape.getHeight();
    }

    const attributes = this.getGlobalAttributes();
    if (attributes !== null) {
      RootAttributeProvider.storeGlobalAttributesInElement(value, attributes);
    }

    return sidebar.createVertexTemplate(`shape=${AttackGraphIconLegendShape.ID};`, 150, height, value);
  }

  private createConsequenceVertexTemplate(
    sidebar: Draw.Sidebar,
    aggregationFunction: AttackgraphFunction | null,
    computedAttributeFunction: AttackgraphFunction | null
    ) {
    const doc = mxUtils.createXmlDocument();
    const value = doc.createElement('object');
    value.setAttribute('label', mxResources.get('attackGraphs.consequence'));

    if (aggregationFunction) {
      const newElement = doc.createElement(STORAGE_NAME_AGGREGATION_FUNCTION_REFERENCE);
      newElement.setAttribute(STORAGE_NAME_AGGREGATION_FUNCTION_REFERENCE, aggregationFunction.id);
      value.appendChild(newElement);
    }

    if (computedAttributeFunction) {
      const newElement = doc.createElement(STORAGE_NAME_COMPUTED_ATTRIBUTES_FUNCTION_REFERENCE);
      newElement.setAttribute(STORAGE_NAME_COMPUTED_ATTRIBUTES_FUNCTION_REFERENCE, computedAttributeFunction.id);
      value.appendChild(newElement);
    }

    return sidebar.createVertexTemplate(`shape=${AttackGraphNodeShape.ID};rounded=1`, 150, 75, value);
  }

  private createActivityVertexTemplateOfShape(
    sidebar: Draw.Sidebar,
    style: string,
    defaultValues: boolean,
    aggregationFunction: AttackgraphFunction | null,
    computedAttributeFunction: AttackgraphFunction | null
    ): HTMLAnchorElement {
    const doc = mxUtils.createXmlDocument();
    const value = doc.createElement('object');
    value.setAttribute('label', mxResources.get('attackGraphs.activity'));

    const attributes = this.getGlobalAttributes();

    if (defaultValues && attributes !== null) {
      for (const attribute of attributes) {
        value.setAttribute(attribute['name'], attribute['value']);
      }
    }

    if (aggregationFunction) {
      const newElement = doc.createElement(STORAGE_NAME_AGGREGATION_FUNCTION_REFERENCE);
      newElement.setAttribute(STORAGE_NAME_AGGREGATION_FUNCTION_REFERENCE, aggregationFunction.id);
      value.appendChild(newElement);
    }

    if (computedAttributeFunction) {
      const newElement = doc.createElement(STORAGE_NAME_COMPUTED_ATTRIBUTES_FUNCTION_REFERENCE);
      newElement.setAttribute(STORAGE_NAME_COMPUTED_ATTRIBUTES_FUNCTION_REFERENCE, computedAttributeFunction.id);
      value.appendChild(newElement);
    }

    return sidebar.createVertexTemplate(`shape=${AttackGraphNodeShape.ID};` + style, 150, 75, value);
  }

  private createLinkVertexTemplate(
    sidebar: Draw.Sidebar,
    aggregationFunction: AttackgraphFunction | null
  ): HTMLAnchorElement {
    const doc = mxUtils.createXmlDocument();
    const value = doc.createElement('object');
    value.setAttribute('label', 'A');

    if (aggregationFunction) {
      const newElement = doc.createElement(STORAGE_NAME_AGGREGATION_FUNCTION_REFERENCE);
      newElement.setAttribute(STORAGE_NAME_AGGREGATION_FUNCTION_REFERENCE, aggregationFunction.id);
      value.appendChild(newElement);
    }

    return sidebar.createVertexTemplate(`shape=${AttackGraphLinkShape.ID};aspect=fixed;`, 40, 40, value);
  }

  private createVertexTemplate(
    sidebar: Draw.Sidebar,
    style: string,
    width: number, height: number,
    label: string | null,
    aggregationFunction: AttackgraphFunction | null,
    computedAttributeFunction: AttackgraphFunction | null
    ): HTMLAnchorElement {
    const doc = mxUtils.createXmlDocument();
    const value = doc.createElement('object');

    if (label) {
      value.setAttribute('label', label);
    }

    if (aggregationFunction) {
      const newElement = doc.createElement(STORAGE_NAME_AGGREGATION_FUNCTION_REFERENCE);
      newElement.setAttribute(STORAGE_NAME_AGGREGATION_FUNCTION_REFERENCE, aggregationFunction.id);
      value.appendChild(newElement);
    }

    if (computedAttributeFunction) {
      const newElement = doc.createElement(STORAGE_NAME_COMPUTED_ATTRIBUTES_FUNCTION_REFERENCE);
      newElement.setAttribute(STORAGE_NAME_COMPUTED_ATTRIBUTES_FUNCTION_REFERENCE, computedAttributeFunction.id);
      value.appendChild(newElement);
    }

    return sidebar.createVertexTemplate(style, width, height, value);
  }

  private getGlobalAttributes(): GlobalAttribute[] | null {
    if (this.ui !== null) {
      return AttributeRenderer.rootAttributes().getGlobalAttributes();
    } else {
      return null;
    }
  }

  private getGlobalAggregationFunctions() {
    if (this.ui) {
      return AttributeRenderer.rootAttributes().getGlobalAggregationFunctions();
    }
    return [];
  }

  private getDefaultGlobalAggregationFunctionByVertexType(type: string) {
    if (this.ui) {
      return AttributeRenderer.rootAttributes().getDefaultGlobalAggregationFunctionByVertexType(type);
    }
    return null;
  }

  private getComputedAttributeFunctions() {
    if (this.ui) {
      return AttributeRenderer.rootAttributes().getGlobalComputedAttributesFunctions();
    }
    return [];
  }

  private getDefaultGlobalComputedAttributesFunctionByVertexType(type: string) {
    if (this.ui) {
      return AttributeRenderer.rootAttributes().getDefaultGlobalComputedAttributesFunctionByVertexType(type);
    }
    return null;
  }

  private createDefaultActivityVertexTemplate(sidebar: Draw.Sidebar, aggregationFunction: AttackgraphFunction | null, computedAttributeFunction: AttackgraphFunction | null) {
    return this.createActivityVertexTemplateOfShape(sidebar, '', false, aggregationFunction, computedAttributeFunction);
  }

  private createGreenActivityVertexTemplate(sidebar: Draw.Sidebar, aggregationFunction: AttackgraphFunction | null, computedAttributeFunction: AttackgraphFunction | null): HTMLAnchorElement {
    return this.createActivityVertexTemplateOfShape(sidebar, 'fillColor=#D7E3BF', true, aggregationFunction, computedAttributeFunction);
  }

  private createYellowActivityVertexTemplate(sidebar: Draw.Sidebar, aggregationFunction: AttackgraphFunction | null, computedAttributeFunction: AttackgraphFunction | null): HTMLAnchorElement {
    return this.createActivityVertexTemplateOfShape(sidebar, 'fillColor=#FEE599', true, aggregationFunction, computedAttributeFunction);
  }

  private createControlVertexTemplate(
    sidebar: Draw.Sidebar,
    aggregationFunction: AttackgraphFunction | null,
    computedAttributeFunction: AttackgraphFunction | null
    ): HTMLAnchorElement {
    const doc = mxUtils.createXmlDocument();
    const value = doc.createElement('object');
    value.setAttribute('label', mxResources.get('attackGraphs.control'));

    const attributes = this.getGlobalAttributes();

    if (attributes !== null) {
      for (const attribute of attributes) {
        value.setAttribute(attribute['name'], '0');
      }
    }

    if (aggregationFunction) {
      const newElement = doc.createElement(STORAGE_NAME_AGGREGATION_FUNCTION_REFERENCE);
      newElement.setAttribute(STORAGE_NAME_AGGREGATION_FUNCTION_REFERENCE, aggregationFunction.id);
      value.appendChild(newElement);
    }

    if (computedAttributeFunction) {
      const newElement = doc.createElement(STORAGE_NAME_COMPUTED_ATTRIBUTES_FUNCTION_REFERENCE);
      newElement.setAttribute(STORAGE_NAME_COMPUTED_ATTRIBUTES_FUNCTION_REFERENCE, computedAttributeFunction.id);
      value.appendChild(newElement);
    }

    return sidebar.createVertexTemplate(`shape=${AttackGraphNodeShape.ID};fillColor=#DAE8FC`, 150, 75, value);
  }

  addPalette(): void {
    // Adds custom sidebar entry
    const sidebar = this.sidebar;
    if (sidebar !== null) {
      sidebar.addPalette('AttackGraphs', 'Attack Graphs', true, content => {
        const globalAttributes = this.getGlobalAttributes();
        if (globalAttributes !== null && globalAttributes.filter(attribute => attribute.iconName !== '').length > 0) {
          content.appendChild(this.createIconLegendShape(sidebar));
        }

        content.appendChild(this.createConsequenceVertexTemplate(sidebar, this.getDefaultGlobalAggregationFunctionByVertexType('consequence'), this.getDefaultGlobalComputedAttributesFunctionByVertexType('consequence')));
        content.appendChild(this.createDefaultActivityVertexTemplate(sidebar, this.getDefaultGlobalAggregationFunctionByVertexType('activity_w'), this.getDefaultGlobalComputedAttributesFunctionByVertexType('activity_w')));
        content.appendChild(this.createGreenActivityVertexTemplate(sidebar, this.getDefaultGlobalAggregationFunctionByVertexType('activity_g'), this.getDefaultGlobalComputedAttributesFunctionByVertexType('activity_g')));
        content.appendChild(this.createYellowActivityVertexTemplate(sidebar, this.getDefaultGlobalAggregationFunctionByVertexType('activity_y'), this.getDefaultGlobalComputedAttributesFunctionByVertexType('activity_y')));
        content.appendChild(this.createControlVertexTemplate(sidebar, this.getDefaultGlobalAggregationFunctionByVertexType('measurement'), this.getDefaultGlobalComputedAttributesFunctionByVertexType('measurement')));

        content.appendChild(this.createVertexTemplate(sidebar, 'shape=or;whiteSpace=wrap;html=1;rotation=-90;', 45, 60, 'AND', this.getDefaultGlobalAggregationFunctionByVertexType('and'), this.getDefaultGlobalComputedAttributesFunctionByVertexType('and')));
        content.appendChild(this.createVertexTemplate(sidebar, 'shape=xor;whiteSpace=wrap;html=1;rotation=-90;', 45, 60, 'OR', this.getDefaultGlobalAggregationFunctionByVertexType('or'), this.getDefaultGlobalComputedAttributesFunctionByVertexType('or')));

        content.appendChild(this.createLinkVertexTemplate(sidebar, this.getDefaultGlobalAggregationFunctionByVertexType('link')));
      });
    }

    // Collapses default sidebar entry and inserts this before
    const c = this.sidebar?.container;
    if (c && c.firstChild && c.lastChild) {
      (c.firstChild as HTMLElement).click();
      c.insertBefore(c.lastChild, c.firstChild);
      c.insertBefore(c.lastChild, c.firstChild);
    }

  }

  updatePalette(): void {
    this.sidebar?.removePalette('AttackGraphs');
    this.addPalette();
  }
}
