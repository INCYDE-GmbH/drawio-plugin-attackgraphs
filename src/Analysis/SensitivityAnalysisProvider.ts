import { AttackgraphFunction, KeyValuePairs, NodeValues } from '../Model';
import { AttributeProvider } from './AttributeProvider';
import { EdgeAttributeProvider } from './EdgeAttributeProvider';
import { NodeAttributeProvider } from './NodeAttributeProvider';
import { RootAttributeProvider } from './RootAttributeProvider';

type CellAttributeData = { [attribute: string]: KeyValuePairs };
type CellGroupedData = { [group: string]: [KeyValuePairs[], string] };
type CellData = { [id: string]: { attributes: CellAttributeData, cellProperties: KeyValuePairs, groups: CellGroupedData } };

export class SensitivityAnalysisCache {
  static cellValues: CellData = {};
  cellId: string;
  realAttributes: AttributeProvider;

  public static reset(): void {
    this.cellValues = {};
  }

  static apply(graphModel: import('mxgraph').mxGraphModel): void {
    const cells = graphModel.cells as { [k: string]: import('mxgraph').mxCell }
    for (const [cellId, cellData] of Object.entries(this.cellValues)) {
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
        if (cellData.cellProperties !== undefined) {
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

  constructor(cellId: string, realAttributes: AttributeProvider) {
    this.cellId = cellId;
    this.realAttributes = realAttributes;
  }

  getValuesStoredInCell(name: string): KeyValuePairs | null {
    const attributes = SensitivityAnalysisCache.cellValues[this.cellId];
    if (attributes && attributes.attributes[name] !== undefined) {
      return attributes.attributes[name];
    }

    return this.realAttributes.getValuesStoredInCell(name);
  }

  storeValuesInCell(name: string, keyValuePairs: KeyValuePairs): void {
    const attributes = SensitivityAnalysisCache.cellValues[this.cellId] || { attributes: {}, groups: {} };
    attributes.attributes[name] = keyValuePairs;
    SensitivityAnalysisCache.cellValues[this.cellId] = attributes;
  }

  getGroupedValuesFromCell<T extends KeyValuePairs>(groupName: string): T[] | null {
    const attributes = SensitivityAnalysisCache.cellValues[this.cellId];
    if (attributes && attributes.groups[groupName] !== undefined) {
      return attributes.groups[groupName][0] as unknown as T[];
    }

    return this.realAttributes.getGroupedValuesFromCell(groupName);
  }

  storeGroupedValuesInCell<T extends KeyValuePairs>(groupName: string, _singleName: string, keyValuePairs: T[]): void {
    const attributes = SensitivityAnalysisCache.cellValues[this.cellId] || { attributes: {}, groups: {} };
    attributes.groups[groupName] = [keyValuePairs, _singleName];
    SensitivityAnalysisCache.cellValues[this.cellId] = attributes;
  }

  storeCellProperties(cellProperties: KeyValuePairs) {
    SensitivityAnalysisCache.cellValues[this.cellId].cellProperties = cellProperties;
  }

  getCellProperties(): KeyValuePairs | null {
    const cellValues = SensitivityAnalysisCache.cellValues[this.cellId];
    if (cellValues !== undefined) {
      return cellValues.cellProperties;
    } else {
      return null;
    }
  }
}

export class SensitivityAnalysisNodeAttributeProvider extends NodeAttributeProvider {
  realAttributes: NodeAttributeProvider;
  cache: SensitivityAnalysisCache;
  constructor(cell: import('mxgraph').mxCell) {
    super(cell);
    this.realAttributes = new NodeAttributeProvider(cell);
    this.cache = new SensitivityAnalysisCache(this.getCellId(), this.realAttributes)
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
  constructor(graph: Draw.EditorGraph) {
    super(graph);
    this.realAttributes = new RootAttributeProvider(graph);
    this.cache = new SensitivityAnalysisCache(this.getCellId(), this.realAttributes)
  }

  setGlobalFunctions(aggregationFunctions: AttackgraphFunction[], global_function_name: string, global_function_group_name: string): void {
    // TODO: Deleting the default attributes might cause problems for the sensitivity analysis...
    const fn = aggregationFunctions.map(f => {
      return { name: f.name, id: f.id, fn: f.fn };
    });
    this.cache.storeGroupedValuesInCell(global_function_group_name, global_function_name, fn);
  }

  getGlobalFunctions(global_function_name: string, global_function_group_name: string): AttackgraphFunction[] {
    const attributes = SensitivityAnalysisCache.cellValues[this.getCellId()];
    if (attributes && attributes.groups[global_function_group_name] !== undefined) {
      return attributes.groups[global_function_group_name][0] as unknown as AttackgraphFunction[];
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
    this.cache = new SensitivityAnalysisCache(this.getCellId(), this.realAttributes)
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
