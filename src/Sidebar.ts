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

  private createConsequenceVertexTemplate(sidebar: Draw.Sidebar): HTMLAnchorElement {
    return this.createVertexTemplate(
      sidebar,
      `shape=${AttackGraphNodeShape.ID};rounded=1;`,
      150, 75, mxResources.get('attackGraphs.consequence'),
      this.getDefaultGlobalAggregationFunction('consequence'),
      this.getDefaultGlobalComputedAttributesFunction('consequence'),
      null
    );
  }

  private createActivityVertexTemplate(
    sidebar: Draw.Sidebar,
    style: string,
    defaultValues: boolean,
    aggregationFunction: AttackgraphFunction | null,
    computedAttributeFunction: AttackgraphFunction | null
  ): HTMLAnchorElement {
    return this.createVertexTemplate(
      sidebar,
      `shape=${AttackGraphNodeShape.ID};` + style,
      150, 75, mxResources.get('attackGraphs.activity'),
      aggregationFunction,
      computedAttributeFunction,
      defaultValues ? this.getGlobalAttributes() : null
    );
  }

  private createDefaultActivityVertexTemplate(sidebar: Draw.Sidebar) {
    return this.createActivityVertexTemplate(
      sidebar,
      '',
      false,
      this.getDefaultGlobalAggregationFunction('activity_w'),
      this.getDefaultGlobalComputedAttributesFunction('activity_w')
    );
  }

  private createGreenActivityVertexTemplate(sidebar: Draw.Sidebar): HTMLAnchorElement {
    return this.createActivityVertexTemplate(
      sidebar,
      'fillColor=#D7E3BF;',
      true,
      this.getDefaultGlobalAggregationFunction('activity_g'),
      this.getDefaultGlobalComputedAttributesFunction('activity_g')
    );
  }

  private createYellowActivityVertexTemplate(sidebar: Draw.Sidebar): HTMLAnchorElement {
    return this.createActivityVertexTemplate(
      sidebar,
      'fillColor=#FEE599;',
      true,
      this.getDefaultGlobalAggregationFunction('activity_y'),
      this.getDefaultGlobalComputedAttributesFunction('activity_y')
    );
  }

  private createControlVertexTemplate(sidebar: Draw.Sidebar): HTMLAnchorElement {
    let attributes = this.getGlobalAttributes();
    if (attributes) {
      attributes = attributes.map(x => {
        x['value'] = '0';
        return x;
      })
    }
    return this.createVertexTemplate(
      sidebar,
      `shape=${AttackGraphNodeShape.ID};fillColor=#DAE8FC;`,
      150, 75, mxResources.get('attackGraphs.control'),
      this.getDefaultGlobalAggregationFunction('measurement'),
      this.getDefaultGlobalComputedAttributesFunction('measurement'),
      attributes
    );
  }

  private createImpactVertexTemplate(sidebar: Draw.Sidebar): HTMLAnchorElement {
    return this.createVertexTemplate(
      sidebar,
      `shape=${AttackGraphNodeShape.ID};ellipse;aspect=fixed;fillColor=#ffcccb;`,
      75, 75, mxResources.get('attackGraphs.impact'),
      this.getDefaultGlobalAggregationFunction('impact'),
      this.getDefaultGlobalComputedAttributesFunction('impact'),
      null
    );
  }

  private createANDVertexTemplate(sidebar: Draw.Sidebar): HTMLAnchorElement {
    return this.createVertexTemplate(
      sidebar,
      'shape=or;whiteSpace=wrap;html=1;rotation=-90;',
      45, 60, 'AND',
      this.getDefaultGlobalAggregationFunction('and'),
      this.getDefaultGlobalComputedAttributesFunction('and'),
      null
    );
  }

  private createORVertexTemplate(sidebar: Draw.Sidebar): HTMLAnchorElement {
    return this.createVertexTemplate(
      sidebar,
      'shape=xor;whiteSpace=wrap;html=1;rotation=-90;',
      45, 60, 'OR',
      this.getDefaultGlobalAggregationFunction('or'),
      this.getDefaultGlobalComputedAttributesFunction('or'),
      null
    );
  }

  private createLinkVertexTemplate(sidebar: Draw.Sidebar): HTMLAnchorElement {
    return this.createVertexTemplate(
      sidebar,
      `shape=${AttackGraphLinkShape.ID};aspect=fixed;fontColor=none;noLabel=1;`,
      60, 60, 'A',
      this.getDefaultGlobalAggregationFunction('link'),
      null,
      null
    );
  }

  private createVertexTemplate(
    sidebar: Draw.Sidebar,
    style: string,
    width: number, height: number,
    label: string | null,
    aggregationFunction: AttackgraphFunction | null,
    computedAttributeFunction: AttackgraphFunction | null,
    attributes: GlobalAttribute[] | null
  ): HTMLAnchorElement {
    const doc = mxUtils.createXmlDocument();
    const value = doc.createElement('object');

    if (attributes) {
      for (const attribute of attributes) {
        value.setAttribute(attribute['name'], attribute['value']);
      }
    }

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

  private getDefaultGlobalAggregationFunction(type: string) {
    if (this.ui) {
      return AttributeRenderer.rootAttributes().getDefaultGlobalAggregationFunctionByVertexType(type);
    }
    return null;
  }

  private getDefaultGlobalComputedAttributesFunction(type: string) {
    if (this.ui) {
      return AttributeRenderer.rootAttributes().getDefaultGlobalComputedAttributesFunctionByVertexType(type);
    }
    return null;
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

        content.appendChild(this.createConsequenceVertexTemplate(sidebar));
        content.appendChild(this.createDefaultActivityVertexTemplate(sidebar));
        content.appendChild(this.createGreenActivityVertexTemplate(sidebar));
        content.appendChild(this.createYellowActivityVertexTemplate(sidebar));
        content.appendChild(this.createControlVertexTemplate(sidebar));

        content.appendChild(this.createANDVertexTemplate(sidebar));
        content.appendChild(this.createORVertexTemplate(sidebar));
        content.appendChild(this.createLinkVertexTemplate(sidebar));
      });

      sidebar.addPalette('AttackGraphs21434', 'Attack Graphs: ISO/SAE 21434', true, content => {
        content.appendChild(this.createImpactVertexTemplate(sidebar));
      });
    }

    // Collapses default sidebar entry and inserts this before
    if (this.sidebar) {
      let c = this.sidebar.container;

      // draw.io >= 20.6.0: Sidebar structure changed and now has a footer in it...
      if (this.sidebar.container.getElementsByClassName('geSidebarFooter').length > 0 && c.firstChild) {
        c = c.firstChild as HTMLElement;
      }

      if (c && c.firstChild && c.lastChild && c.firstChild.nextSibling && c.firstChild.nextSibling.nextSibling) {
        // Skip search field and hide "General" palette
        const curr = c.firstChild.nextSibling.nextSibling;
        (curr as HTMLElement).click();

        // Move attack graph paletts to the top
        const items = [];
        for (let i = 0; i < 4; i++) { // 2 pallets x (1 header + 1 body) = 4
          items.push(c.lastChild);
          c.insertBefore(c.lastChild, curr);
        }
        while(items.length > 0) { // Reverse
          c.insertBefore(items.pop() || ({} as HTMLElement), curr);
        }
      }
    }
  }

  updatePalette(): void {
    if (this.ui) {
      this.ui.removeLibrarySidebar('AttackGraphs');
      this.ui.removeLibrarySidebar('AttackGraphs21434');
      this.addPalette();
    }
  }
}
