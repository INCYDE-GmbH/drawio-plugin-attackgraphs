import { STORAGE_NAME_AGGREGATION_FUNCTION_REFERENCE, STORAGE_NAME_CUSTOM_AGGREGATION_FUNCTION, STORAGE_NAME_COMPUTED_ATTRIBUTES_FUNCTION_REFERENCE, STORAGE_NAME_CUSTOM_COMPUTED_ATTRIBUTES, STORAGE_NAME_ATTRIBUTES, STORAGE_NAME_COMPUTED_ATTRIBUTES, STORAGE_NAME_CUSTOM_FUNCTION } from '../CellUtils';
import { AttackgraphFunctionFormat, CellFunctionFormat, KeyValuePairs, AttackgraphFunction, CellFunctionType, NodeValues } from '../Model';
import { AttributeProvider } from './AttributeProvider';
import { CellStyles } from './CellStyles';
import { RootAttributeProvider } from './RootAttributeProvider';

const PREFIX_LINK_PAGE_ID = 'data:page/id,';

export class NodeAttributeProvider extends AttributeProvider {
  resolveComputedAttributesFunction(graph: RootAttributeProvider): AttackgraphFunction | null {
    const fn = this.getComputedAttributeFunctionOfCell();
    if (fn !== null) {
      return graph.resolveGlobalFunction(fn, CellFunctionType.COMPUTED_ATTRIBUTE);
    }
    return null;
  }

  resolveAggregationFunction(graph: RootAttributeProvider): AttackgraphFunction | null {
    const fn = this.getAggregationFunctionOfCell();
    if (fn !== null) {
      return graph.resolveGlobalFunction(fn, CellFunctionType.AGGREGATION);
    }
    return null;
  }

  resolveComputedAttributesFunctionIDOfCell(): string | null {
    const fn = this.getComputedAttributeFunctionOfCell();
    if (fn === null) {
      return null;
    }
    return this.resolveFunctionIDOfCell(fn);
  }

  resolveAggregationFunctionIDOfCell(): string | null {
    const fn = this.getAggregationFunctionOfCell();
    if (fn === null) {
      return null;
    }
    return this.resolveFunctionIDOfCell(fn);
  }

  resolveFunctionIDOfCell(fn: AttackgraphFunctionFormat): string | null {
    if (fn.format === CellFunctionFormat.CUSTOM) {
      return STORAGE_NAME_CUSTOM_FUNCTION;
    } else {
      return fn.inlineFunctionOrReference;
    }
  }

  getFunctionOfCell(reference_name: string, custom_name: string): AttackgraphFunctionFormat | null {
    const custom = this.getStringStoredInCell(custom_name);
    const reference = this.getStringStoredInCell(reference_name);
    if (custom !== null) {
      return { format: CellFunctionFormat.CUSTOM, inlineFunctionOrReference: custom };
    } else if (reference !== null) {
      return { format: CellFunctionFormat.REFERENCE, inlineFunctionOrReference: reference };
    } else {
      return null;
    }
  }

  getAggregationFunctionOfCell(): AttackgraphFunctionFormat | null {
    return this.getFunctionOfCell(STORAGE_NAME_AGGREGATION_FUNCTION_REFERENCE, STORAGE_NAME_CUSTOM_AGGREGATION_FUNCTION);
  }

  getComputedAttributeFunctionOfCell(): AttackgraphFunctionFormat | null {
    return this.getFunctionOfCell(STORAGE_NAME_COMPUTED_ATTRIBUTES_FUNCTION_REFERENCE, STORAGE_NAME_CUSTOM_COMPUTED_ATTRIBUTES);
  }

  getAggregatedCellValues(): KeyValuePairs {
    return this.getValuesStoredInCell(STORAGE_NAME_ATTRIBUTES) || {};
  }

  setAggregatedCellValues(values: KeyValuePairs): void {
    this.storeValuesInCell(STORAGE_NAME_ATTRIBUTES, values);
  }

  setComputedAttributesForCell(label: string | null, computedAttributeName: string | null): void {
    if (label !== null && computedAttributeName !== null) {
      this.storeValuesInCell(STORAGE_NAME_COMPUTED_ATTRIBUTES, { [computedAttributeName]: label });
    } else {
      this.storeValuesInCell(STORAGE_NAME_COMPUTED_ATTRIBUTES, {});
    }
  }

  getComputedAttributesForCell(): KeyValuePairs | null {
    return this.getValuesStoredInCell(STORAGE_NAME_COMPUTED_ATTRIBUTES);
  }

  setCellComputedAttributesFunction(aggregationFunction: string, format: CellFunctionFormat): void {
    this.setCellFunction(aggregationFunction, format, STORAGE_NAME_COMPUTED_ATTRIBUTES_FUNCTION_REFERENCE, STORAGE_NAME_CUSTOM_COMPUTED_ATTRIBUTES);
  }

  setCellAggregationFunction(aggregationFunction: string, format: CellFunctionFormat): void {
    this.setCellFunction(aggregationFunction, format, STORAGE_NAME_AGGREGATION_FUNCTION_REFERENCE, STORAGE_NAME_CUSTOM_AGGREGATION_FUNCTION);
  }

  setCellFunction(functionNameOrContent: string, format: CellFunctionFormat, reference_name: string, custom_name: string): void {
    if (format === CellFunctionFormat.CUSTOM) {
      this.storeStringInCell(custom_name, functionNameOrContent);
      this.removeStringFromCell(reference_name);
    } else {
      this.storeStringInCell(reference_name, functionNameOrContent);
      this.removeStringFromCell(custom_name);
    }
  }

  getReferencedPage(): Draw.DiagramPage | null {
    const values = this.getCellValues();

    if ('link' in values) {
      const link = values['link'];
      if (link !== undefined && link.includes(PREFIX_LINK_PAGE_ID)) {
        const idx = link.substring(PREFIX_LINK_PAGE_ID.length);
        return AttributeProvider.getUI().getPageById(idx);
      }
    }

    return null;
  }

  getReferencedCell(): NodeAttributeProvider | null {
    if (!(new CellStyles(this.cell)).isLinkNode()) {
      return null;
    }

    const page = this.getReferencedPage();
    const label = this.getCellLabel();
    if (label && page && page.root && page !== AttributeProvider.getUI().currentPage) {
      return this.findCellWithLabel(new NodeAttributeProvider(page.root), label);
    }

    return null;
  }

  private findCellWithLabel(root: NodeAttributeProvider, label: string): NodeAttributeProvider | null {
    if (!root.cell.isEdge()) {
      const cellLabel = root.getCellLabel();
      if (cellLabel && cellLabel === label) {
        return root;
      }
    }

    const children = root.cell.children;
    if (children && children.length > 0) {
      for (const child of children) {
        const refCell = this.findCellWithLabel(new NodeAttributeProvider(child), label);
        if (refCell) {
          return refCell;
        }
      }
    }

    return null;
  }

  getLinkNodesReferencingThisCell(): NodeAttributeProvider[] {
    if (!(new CellStyles(this.cell)).isLinkNode()) {
      return [];
    }

    let nodes: NodeAttributeProvider[] = [];
    const ui = AttributeProvider.getUI();
    const pageId = this.getPageId();
    const label = this.getCellLabel();

    if (label && ui.pages && ui.pages.length > 0) {
      for (const page of ui.pages) {
        if (page.getId() === pageId) {
          continue;
        }
        if (page.root) {
          const refNodes = this.getLinkNodesReferencing(new NodeAttributeProvider(page.root), pageId);
          nodes = nodes.concat(refNodes.filter(x => x.getCellLabel() === label))
        }
      }
    }

    return nodes;
  }

  private getLinkNodesReferencing(root: NodeAttributeProvider, pageId: string): NodeAttributeProvider[] {
    let nodes: NodeAttributeProvider[] = [];

    if (new CellStyles(root.cell).isLinkNode()) {
      const refPage = root.getReferencedPage();
      if (refPage && refPage.getId() === pageId) {
        nodes.push(root);
      }
    }

    const children = root.cell.children;
    if (children && children.length > 0) {
      for (const child of children) {
        nodes = nodes.concat(this.getLinkNodesReferencing(new NodeAttributeProvider(child), pageId));
      }
    }

    return nodes;
  }

  getAllValues(): NodeValues {
    return {
      current: { ...this.getCellValues(), ...this.getAggregatedCellValues() } as KeyValuePairs,
      old: this.getCellValues()
    }
  }

  setCellAttributes(attributes: {name: string, value: string}[]): void {
    const result = this.getCellValues();
    for (const attr of attributes) {
      if (attr.value === null) {
        continue;
      }
      result[attr.name] = attr.value;
    }
    this.replaceCellValue(result);
  }

  getCurrentCellValuesNotLabel(): KeyValuePairs {
    return Object.fromEntries(Object.entries(this.getAllValues().current).filter(([k,]) => k !== 'label' && k !== 'placeholder' && k !== 'link' && k !== 'name'));
  }

  getTooltip(): string {
    return super.keyValuePairsToString(this.getCurrentCellValuesNotLabel());
  }

  isLeave(): boolean {
    return (this.cell.edges?.filter(x => x.source === this.cell && x.target) || []).length === 0;
  }
}
