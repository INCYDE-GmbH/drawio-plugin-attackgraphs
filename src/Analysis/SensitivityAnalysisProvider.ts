import { AttackgraphFunction, KeyValuePairs, NodeValues } from '../Model';
import { AttributeProvider } from './AttributeProvider';
import { EdgeAttributeProvider } from './EdgeAttributeProvider';
import { NodeAttributeProvider } from './NodeAttributeProvider';
import { RootAttributeProvider } from './RootAttributeProvider';

type CellAttributeData = { [attribute: string]: KeyValuePairs };
type CellGroupedData = { [group: string]: [KeyValuePairs[], string] };
type CellData = { attributes: CellAttributeData, cellProperties: KeyValuePairs | null, groups: CellGroupedData };
type CellCache = { [id: string]: CellData};
type PageData = { [id: string]: CellCache };

type Cells = { [k: string]: import('mxgraph').mxCell };

export class SensitivityAnalysisCache {
  static pageData: PageData = {};
  pageId: string;
  cellId: string;
  realAttributes: AttributeProvider;

  public static reset(): void {
    this.pageData = {};
  }

  static apply(ui: Draw.UI): void {
    for (const [pageId, pageCells] of Object.entries(this.pageData)) {
      let cells: Cells = {};
      if (pageId === ui.currentPage.getId()) {
        cells = ui.editor.graph.getModel().cells as Cells;
      } else {
        const page = ui.getPageById(pageId);
        if (page && page.root) {
          cells = this.flattenCells(page.root);
        }
      }

      for (const [cellId, cellData] of Object.entries(pageCells)) {
        const cell = cells[cellId];
        if (cell !== null) {
          const provider = new NodeAttributeProvider(cell);
          for (const [attribute, value] of Object.entries(cellData.attributes)) {
            provider.storeValuesInCell(attribute, value);
          }
          for (const [groupName, [attributes, singleName]] of Object.entries(cellData.groups)) {
            provider.storeGroupedValuesInCell(groupName, singleName, attributes);
          }
          const values = provider.getCellValues();
          if (cellData.cellProperties) {
            for (const [attribute, value] of Object.entries(cellData.cellProperties)) {
              values[attribute] = value;
            }
            provider.setCellAttributes(Object.entries(values).map(([key, value]) => {
              return { name: key, value: value }
            }));
          }
        }
      }
    }
  }

  private static flattenCells(cell: import('mxgraph').mxCell): Cells {
    let cells: Cells = {};
    if (cell.children) {
      for (const child of cell.children) {
        cells = { ...cells, ...this.flattenCells(child) };
      }
    }
    cells[cell.id] = cell;
    return cells;
  }

  constructor(pageId: string, cellId: string, realAttributes: AttributeProvider) {
    this.pageId = pageId;
    this.cellId = cellId;
    this.realAttributes = realAttributes;
  }

  getValuesStoredInCell(name: string): KeyValuePairs | null {
    const cells = SensitivityAnalysisCache.pageData[this.pageId];
    if (cells) {
      const attributes = cells[this.cellId];
      if (attributes && attributes.attributes[name] !== undefined) {
        return attributes.attributes[name];
      }
    }

    return this.realAttributes.getValuesStoredInCell(name);
  }

  storeValuesInCell(name: string, keyValuePairs: KeyValuePairs): void {
    let attributes = { attributes: {}, cellProperties: null, groups: {} } as CellData;
    const cells = SensitivityAnalysisCache.pageData[this.pageId];
    if (cells) {
      attributes = cells[this.cellId] || attributes;
    }
    attributes.attributes[name] = keyValuePairs;
    if (cells) {
      SensitivityAnalysisCache.pageData[this.pageId][this.cellId] = attributes;
    } else {
      const cache: CellCache = {};
      cache[this.cellId] = attributes;
      SensitivityAnalysisCache.pageData[this.pageId] = cache;
    }

  }

  getGroupedValuesFromCell<T extends KeyValuePairs>(groupName: string): T[] | null {
    const cells = SensitivityAnalysisCache.pageData[this.pageId];
    if (cells) {
      const attributes = cells[this.cellId];
      if (attributes && attributes.groups[groupName] !== undefined) {
        return attributes.groups[groupName][0] as unknown as T[];
      }
    }

    return this.realAttributes.getGroupedValuesFromCell(groupName);
  }

  storeGroupedValuesInCell<T extends KeyValuePairs>(groupName: string, _singleName: string, keyValuePairs: T[]): void {
    let attributes = { attributes: {}, cellProperties: null, groups: {} } as CellData;
    const cells = SensitivityAnalysisCache.pageData[this.pageId];
    if (cells) {
      attributes = cells[this.cellId] || attributes;
    }
    attributes.groups[groupName] = [keyValuePairs, _singleName];
    if (cells) {
      SensitivityAnalysisCache.pageData[this.pageId][this.cellId] = attributes;
    } else {
      const cache: CellCache = {};
      cache[this.cellId] = attributes;
      SensitivityAnalysisCache.pageData[this.pageId] = cache;
    }
  }

  storeCellProperties(cellProperties: KeyValuePairs) {
    let attributes = { attributes: {}, cellProperties: null, groups: {} } as CellData;
    const cells = SensitivityAnalysisCache.pageData[this.pageId];
    if (cells) {
      attributes = cells[this.cellId] || attributes;
    }
    attributes.cellProperties = cellProperties;
    if (cells) {
      SensitivityAnalysisCache.pageData[this.pageId][this.cellId] = attributes;
    } else {
      const cache: CellCache = {};
      cache[this.cellId] = attributes;
      SensitivityAnalysisCache.pageData[this.pageId] = cache;
    }
  }

  getCellProperties(): KeyValuePairs | null {
    const cells = SensitivityAnalysisCache.pageData[this.pageId];
    if (cells) {
      const cellValues = cells[this.cellId];
      if (cellValues !== undefined) {
        return cellValues.cellProperties;
      }
    }
    return null;
  }
}

export class SensitivityAnalysisNodeAttributeProvider extends NodeAttributeProvider {
  realAttributes: NodeAttributeProvider;
  cache: SensitivityAnalysisCache;
  constructor(cell: import('mxgraph').mxCell) {
    super(cell);
    this.realAttributes = new NodeAttributeProvider(cell);
    this.cache = new SensitivityAnalysisCache(this.getPageId(), this.getCellId(), this.realAttributes)
  }

  getValuesStoredInCell(name: string): KeyValuePairs | null {
    return this.cache.getValuesStoredInCell(name);
  }

  storeValuesInCell(name: string, keyValuePairs: KeyValuePairs): void {
    this.cache.storeValuesInCell(name, keyValuePairs);
  }

  getGroupedValuesFromCell<T extends KeyValuePairs>(groupName: string): T[] | null {
    return this.cache.getGroupedValuesFromCell(groupName);
  }

  storeGroupedValuesInCell<T extends KeyValuePairs>(groupName: string, singleName: string, keyValuePairs: T[]): void {
    this.cache.storeGroupedValuesInCell(groupName, singleName, keyValuePairs);
  }

  getAllValues(): NodeValues {
    return {
      current: { ...this.getCellValues(), ...this.getAggregatedCellValues() } as KeyValuePairs,
      old: { ...this.realAttributes.getCellValues(), ...this.realAttributes.getAggregatedCellValues() } as KeyValuePairs,
    }
  }

  replaceCellValue(newValue: KeyValuePairs) {
    this.cache.storeCellProperties(newValue);
  }

  getCellValues(): KeyValuePairs {
    return this.cache.getCellProperties() || super.getCellValues();
  }
}
export class SensitivityAnalysisRootAttributeProvider extends RootAttributeProvider {
  realAttributes: RootAttributeProvider;
  cache: SensitivityAnalysisCache;
  constructor() {
    super();
    this.realAttributes = new RootAttributeProvider();
    this.cache = new SensitivityAnalysisCache(this.getPageId(), this.getCellId(), this.realAttributes)
  }

  setGlobalFunctions(aggregationFunctions: AttackgraphFunction[], global_function_name: string, global_function_group_name: string): void {
    const fn = aggregationFunctions.map(f => {
      return { name: f.name, id: f.id, fn: f.fn, default: f.default.join(';') };
    });
    this.cache.storeGroupedValuesInCell(global_function_group_name, global_function_name, fn);
  }

  getGlobalFunctions(global_function_name: string, global_function_group_name: string): AttackgraphFunction[] {
    const cells = SensitivityAnalysisCache.pageData[this.getPageId()];
    if (cells) {
      const attributes = cells[this.getCellId()];
      if (attributes && attributes.groups[global_function_group_name] !== undefined) {
        return attributes.groups[global_function_group_name][0].map(f => {
          return { name: f.name, id: f.id, fn: f.fn, default: f.default.split(';') };
        }) as unknown as AttackgraphFunction[];
      }
    }

    return this.realAttributes.getGlobalFunctions(global_function_name, global_function_group_name);
  }

  getValuesStoredInCell(name: string): KeyValuePairs | null {
    return this.cache.getValuesStoredInCell(name);
  }

  storeValuesInCell(name: string, keyValuePairs: KeyValuePairs): void {
    this.cache.storeValuesInCell(name, keyValuePairs);
  }

  getGroupedValuesFromCell<T extends KeyValuePairs>(groupName: string): T[] | null {
    return this.cache.getGroupedValuesFromCell(groupName);
  }

  storeGroupedValuesInCell<T extends KeyValuePairs>(groupName: string, singleName: string, keyValuePairs: T[]): void {
    this.cache.storeGroupedValuesInCell(groupName, singleName, keyValuePairs);
  }
}

export class SensitivityAnalysisEdgeAttributeProvider extends EdgeAttributeProvider {
  realAttributes: EdgeAttributeProvider;
  cache: SensitivityAnalysisCache;
  constructor(cell: import('mxgraph').mxCell) {
    super(cell);
    this.realAttributes = new EdgeAttributeProvider(cell);
    this.cache = new SensitivityAnalysisCache(this.getPageId(), this.getCellId(), this.realAttributes)
  }

  getCellLabel(): string | null {
    const values = this.getCellValues();
    if ('label' in values) {
      return values.label;
    }
    return super.getCellLabel();
  }

  getValuesStoredInCell(name: string): KeyValuePairs | null {
    return this.cache.getValuesStoredInCell(name);
  }

  storeValuesInCell(name: string, keyValuePairs: KeyValuePairs): void {
    this.cache.storeValuesInCell(name, keyValuePairs);
  }

  getGroupedValuesFromCell<T extends KeyValuePairs>(groupName: string): T[] | null {
    return this.cache.getGroupedValuesFromCell(groupName);
  }

  storeGroupedValuesInCell<T extends KeyValuePairs>(groupName: string, singleName: string, keyValuePairs: T[]): void {
    this.cache.storeGroupedValuesInCell(groupName, singleName, keyValuePairs);
  }

  getAllValues(): NodeValues {
    return {
      current: { ...this.getCellValues(), ...this.getAggregatedCellValues() } as KeyValuePairs,
      old: { ...this.realAttributes.getCellValues(), ...this.realAttributes.getAggregatedCellValues() } as KeyValuePairs,
    }
  }

  replaceCellValue(newValue: KeyValuePairs) {
    this.cache.storeCellProperties(newValue);
  }

  getCellValues(): KeyValuePairs {
    return this.cache.getCellProperties() || super.getCellValues();
  }
}
