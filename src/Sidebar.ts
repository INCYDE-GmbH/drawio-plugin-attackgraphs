import { RootAttributeProvider } from './Analysis/RootAttributeProvider';
import { AttackGraphIconLegendShape } from './AttackGraphIconLegendShape';
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
      const count = RootAttributeProvider.getRenderableAttributes(new RootAttributeProvider(this.ui.editor.graph).getGlobalAttributes() || []).length;
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
    aggregationFunction: AttackgraphFunction | null,
    computedAttributeFunction: AttackgraphFunction | null
    ): HTMLAnchorElement {
    const doc = mxUtils.createXmlDocument();
    const value = doc.createElement('object');
    value.setAttribute('label', mxResources.get('attackGraphs.activity'));

    const attributes = this.getGlobalAttributes();

    if (attributes !== null) {
      for (const attribute of attributes) {
        value.setAttribute(attribute['name'], attribute['value'])
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

  private createVertexTemplate(
    sidebar: Draw.Sidebar,
    style: string,
    width: number, height: number,
    aggregationFunction: AttackgraphFunction | null,
    computedAttributeFunction: AttackgraphFunction | null
    ): HTMLAnchorElement {
    const doc = mxUtils.createXmlDocument();
    const value = doc.createElement('object');

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
      return AttributeRenderer.rootAttributes(this.ui.editor.graph).getGlobalAttributes();
    } else {
      return null;
    }
  }

  private getGlobalAggregationFunctions() {
    if (this.ui) {
      return AttributeRenderer.rootAttributes(this.ui.editor.graph).getGlobalAggregationFunctions();
    }
    return [];
  }

  private getComputedAttributeFunctions() {
    if (this.ui) {
      return AttributeRenderer.rootAttributes(this.ui.editor.graph).getGlobalComputedAttributesFunctions();
    }
    return [];
  }

  private createDefaultActivityVertexTemplate(sidebar: Draw.Sidebar, aggregationFunction: AttackgraphFunction | null, computedAttributeFunction: AttackgraphFunction | null) {
    return this.createActivityVertexTemplateOfShape(sidebar, '', aggregationFunction, computedAttributeFunction);
  }

  private createGreenActivityVertexTemplate(sidebar: Draw.Sidebar, aggregationFunction: AttackgraphFunction | null, computedAttributeFunction: AttackgraphFunction | null): HTMLAnchorElement {
    return this.createActivityVertexTemplateOfShape(sidebar, 'fillColor=#D7E3BF', aggregationFunction, computedAttributeFunction);
  }

  private createYellowActivityVertexTemplate(sidebar: Draw.Sidebar, aggregationFunction: AttackgraphFunction | null, computedAttributeFunction: AttackgraphFunction | null): HTMLAnchorElement {
    return this.createActivityVertexTemplateOfShape(sidebar, 'fillColor=#FEE599', aggregationFunction, computedAttributeFunction);
  }

  private createControlVertexTemplate(sidebar: Draw.Sidebar): HTMLAnchorElement {
    const doc = mxUtils.createXmlDocument();
    const value = doc.createElement('object');
    value.setAttribute('label', mxResources.get('attackGraphs.control'));

    const attributes = this.getGlobalAttributes();

    if (attributes !== null) {
      for (const attribute of attributes) {
        value.setAttribute(attribute['name'], '0');
      }
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

        const aggregationFunctions = this.getGlobalAggregationFunctions();
        const defaultAggregationFunction = aggregationFunctions.find(x => x.name === 'default') || null;
        const computedAttributeFunctions = this.getComputedAttributeFunctions();
        const defaultComputedAttributeFunction = computedAttributeFunctions.find(x => x.name === 'default') || null;

        content.appendChild(this.createConsequenceVertexTemplate(sidebar, defaultAggregationFunction, defaultComputedAttributeFunction));
        content.appendChild(this.createDefaultActivityVertexTemplate(sidebar, defaultAggregationFunction, defaultComputedAttributeFunction));
        content.appendChild(this.createGreenActivityVertexTemplate(sidebar, defaultAggregationFunction, defaultComputedAttributeFunction));
        content.appendChild(this.createYellowActivityVertexTemplate(sidebar, defaultAggregationFunction, defaultComputedAttributeFunction));
        content.appendChild(this.createControlVertexTemplate(sidebar));

        const andAggregationFunction = aggregationFunctions.find(x => x.name === 'AND') || null;
        if (andAggregationFunction) {
          content.appendChild(this.createVertexTemplate(sidebar, 'shape=or;whiteSpace=wrap;html=1;rotation=-90;', 60, 80, andAggregationFunction, null));
        }
        const orAggregationFunction = aggregationFunctions.find(x => x.name === 'OR') || defaultAggregationFunction;
        if (orAggregationFunction) {
          content.appendChild(this.createVertexTemplate(sidebar, 'shape=xor;whiteSpace=wrap;html=1;rotation=-90;', 60, 80, orAggregationFunction, null));
        }
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
