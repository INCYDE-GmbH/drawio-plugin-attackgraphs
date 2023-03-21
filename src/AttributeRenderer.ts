import { EdgeAttributeProvider } from './Analysis/EdgeAttributeProvider';
import { NodeAttributeProvider } from './Analysis/NodeAttributeProvider';
import { RootAttributeProvider } from './Analysis/RootAttributeProvider';
import { SensitivityAnalysisCache, SensitivityAnalysisEdgeAttributeProvider, SensitivityAnalysisNodeAttributeProvider, SensitivityAnalysisRootAttributeProvider } from './Analysis/SensitivityAnalysisProvider';
import { AsyncWorker } from './AsyncUtils';
import { AttackGraphSettings } from './AttackGraphSettings';
import { GraphUtils } from './GraphUtils';
import { AttackgraphFunction, CellDataCollection, ChildCellData, ChildCellDataCollection, GlobalAttribute, GlobalAttributeDict, KeyValuePairs } from './Model';
import { Menubar } from './Menubar';
import { CellStyles } from './Analysis/CellStyles';

export class AttributeRenderer {
  private static _sensitivityAnalysisEnabled = false;
  static sensitivityAnalysisEnabled(): boolean {
    return this._sensitivityAnalysisEnabled;
  }

  static toggleSensitivityAnalysis(): void {
    this._sensitivityAnalysisEnabled = !this._sensitivityAnalysisEnabled;
    SensitivityAnalysisCache.reset();
  }

  static nodeAttributes(cell: import('mxgraph').mxCell): NodeAttributeProvider {
    if (this._sensitivityAnalysisEnabled) {
      return new SensitivityAnalysisNodeAttributeProvider(cell);
    } else {
      return new NodeAttributeProvider(cell);
    }
  }

  static rootAttributes(): RootAttributeProvider {
    if (this._sensitivityAnalysisEnabled) {
      return new SensitivityAnalysisRootAttributeProvider();
    } else {
      return new RootAttributeProvider();
    }
  }

  static edgeAttributes(cell: import('mxgraph').mxCell): EdgeAttributeProvider {
    if (this._sensitivityAnalysisEnabled) {
      return new SensitivityAnalysisEdgeAttributeProvider(cell);
    } else {
      return new EdgeAttributeProvider(cell);
    }
  }

  static runAggregationFunctionWorker(fn: string, childAttributes: ChildCellDataCollection, worker: AsyncWorker): Promise<KeyValuePairs> {
    return worker.runWorkerFunction<ChildCellDataCollection, KeyValuePairs>(fn, childAttributes);
  }

  private static async updateCellValues(cell: NodeAttributeProvider, root: RootAttributeProvider, worker: AsyncWorker): Promise<void> {
    const globalDefaultAttributes = root.getGlobalAttributes();
    const globalDefaultAttributesDict = this.transformGlobalAttributesToGlobalAttributesDict(globalDefaultAttributes || []) as GlobalAttributeDict;

    const childValues = this.getChildValues(cell);
    const aggregationFunction = cell.resolveAggregationFunction(root);

    const localAttributes = cell.getCellValues();
    let aggregatedValues: KeyValuePairs = {};
    let aggregate = true;

    // Link to another page
    if (new CellStyles(cell.cell).isLinkNode()) {
      if (cell.isLeave()) { // source link node
        const refCell = cell.getReferencedCell();        
        if (refCell) {
          aggregatedValues = refCell.getAggregatedCellValues();
          aggregate = false;
        } else {
          aggregatedValues['_error'] = 'true';
        }
      }
    }

    if (aggregate) {
      const values = await this.aggregateAttributes({
        globalAttributes: globalDefaultAttributesDict,
        childAttributes: childValues,
        localAttributes: localAttributes,
        id: cell.getCellId()
      }, aggregationFunction, worker);
      aggregatedValues = { ...values, ...aggregatedValues }; // Include possible link errors
    }
    cell.setAggregatedCellValues(aggregatedValues);

    const labelFunction = cell.resolveComputedAttributesFunction(root);

    const cellAttributes = cell.getCellValues();
    const computedAttributes = await this.recalculateCellLabel({ globalAttributes: globalDefaultAttributesDict, cellAttributes: { ...cellAttributes, ...aggregatedValues } }, labelFunction, worker);
    cell.setComputedAttributesForCell(computedAttributes);
  }

  static async refreshCellValuesUpwards(
    cells: import('mxgraph').mxCell[],
    ui: Draw.UI,
    worker: AsyncWorker
  ): Promise<void> {
    if (AttackGraphSettings.isAttackGraph(ui.editor.graph)) {
      Menubar.increaseUnfinishedWorkers(ui);
      try {
        await this.refreshCellValues(cells, worker);
      } catch(e) {
        mxUtils.alert(e as string);
      }
      Menubar.decreaseUnfinishedWorkers(ui);
    }
  }

  /**
   * Refreshes the values of edited {@link cells} in the graph.
   * 
   * The {@link cells} are the anchors from which the values of cells are updated.
   * An update structure is created first to track for all cells affected by the update
   * of {@link cells} for which child cells it has to wait. Afterward, the values
   * of the affected cells are updated in the right order.
   * 
   * @param cells 
   * @param worker 
   */
  private static async refreshCellValues(
    cells: import('mxgraph').mxCell[],
    worker: AsyncWorker
  ): Promise<void> {
    const structure: {[id: string]: string[]} = {};
    const topLevelCells: import('mxgraph').mxCell[] = [];

    // Checks
    for (const cell of cells) {
      if (!GraphUtils.isTree(cell)) {
        throw new Error('Cannot recalculate the graph as it contains loops!');
      }
    }

    // Create update structure
    const ps: {[id: string]: Promise<void>} = {};
    for (const cell of cells) {
      if (!Object.prototype.hasOwnProperty.call(ps, cell.id)) {
        ps[cell.id] = this.createUpdateStructure(cell, structure, topLevelCells, ps);
      }
    }
    await Promise.all(Object.entries(ps).map(([, x]) => x));    

    // Update cells
    const ps2: {[id: string]: Promise<void>} = {};
    const root = AttributeRenderer.rootAttributes();
    for (const cell of topLevelCells) {
      if (!Object.prototype.hasOwnProperty.call(ps2, cell.id)) {
        ps2[cell.id] = this.updateCells(cell, root, worker, structure, ps2);
      }
    }
    await Promise.all(Object.entries(ps2).map(([, x]) => x));
  }

  /**
   * Recusrively finds the update structure when updating {@link cell}.
   * 
   * The update structure {@link structure} includes for every cell affected by the update
   * of {@link cell} for which child cells it has to wait before it can recalculated its
   * own values.
   * 
   * As a side effect, the method also returns the {@link topLevelCells} which includes all
   * cells in the update structure that have no parents themselves.
   * 
   * @param cell 
   * @param structure 
   * @param topLevelCells 
   * @param promises 
   */
  private static async createUpdateStructure(
    cell: import('mxgraph').mxCell,
    structure: {[id: string]: string[]},
    topLevelCells: import('mxgraph').mxCell[],
    promises: {[id: string]: Promise<void>}
  ): Promise<void> {
    // At first, we have no childs
    structure[cell.id] = []; 

    // Wait for all parents
    const incomingEdges = cell.edges?.filter(x => x.target === cell && x.source) || [];
    await Promise.all(incomingEdges.map(x => {
      // Only act if the cell is not process by anybody yet
      if (!Object.prototype.hasOwnProperty.call(promises, x.source.id)) {
        promises[x.source.id] = this.createUpdateStructure(x.source, structure, topLevelCells, promises);
      }
      return promises[x.source.id];
    }));

    if (incomingEdges.length === 0) {
      topLevelCells.push(cell);
    }

    // Add us as child of each parent
    for (const edge of incomingEdges) {
      structure[edge.source.id].push(cell.id)
    }
  }

  /**
   * Recursively updates the values of {@link cell} and all its parents.
   * 
   * This method uses the update structure {@link structure} to first wait for all
   * childs of {@link cell} before recalculating its own values.
   * 
   * @param cell 
   * @param root 
   * @param worker 
   * @param structure 
   * @param promises 
   */
  private static async updateCells(
    cell: import('mxgraph').mxCell,
    root: RootAttributeProvider,
    worker: AsyncWorker,
    structure: {[id: string]: string[]},
    promises: {[id: string]: Promise<void>}
  ): Promise<void> {
    // Wait for all childs
    const outgoingEdges = cell.edges?.filter(x => x.source === cell && x.target) || [];
    await Promise.all(outgoingEdges.map(x => {
      // Only act if the cell is not process by anybody yet
      if (!Object.prototype.hasOwnProperty.call(promises, x.target.id)) {
        promises[x.target.id] = this.updateCells(x.target, root, worker, structure, promises);
      }
      return promises[x.target.id];
    }));

    // Update our value
    await this.updateCellValues(this.nodeAttributes(cell), root, worker);
  }

  public static transformGlobalAttributesToGlobalAttributesDict(attributes: GlobalAttribute[]): { [name: string]: KeyValuePairs } {
    return Object.fromEntries(attributes
      .map(attribute => {
        return { name: attribute.name, value: attribute.value, min: attribute.min, max: attribute.max };
      })
      .map(kvp => [kvp.name, kvp]));
  }

  static async aggregateAttributes(childAttributes: ChildCellDataCollection, aggregationFunction: AttackgraphFunction | null, worker: AsyncWorker): Promise<KeyValuePairs> {
    if (aggregationFunction === null) {
      return {};
    }

    try {
      return await this.runAggregationFunctionWorker(aggregationFunction.fn, childAttributes, worker);
    } catch (e) {
      return {};
    }
  }

  static async recalculateAllCells(ui: Draw.UI, worker: AsyncWorker): Promise<void> {
    const cells = Object.entries(ui.editor.graph.getModel().cells as { [id: string]: import('mxgraph').mxCell }).map(([, cell]) => cell);
    await this.refreshCellValuesUpwards(cells, ui, worker);
    ui.editor.graph.refresh();
  }

  static getChildValues(cell: NodeAttributeProvider): ChildCellData[] {
    return cell.cell.edges?.filter(x => x.source === cell.cell && x.target).map(x => {
      const edgeWeight = this.edgeAttributes(x).getEdgeWeight();
      const target = this.nodeAttributes(x.target);
      const cellValues = target.getCellValues();
      const aggregatedValues = target.getAggregatedCellValues();
      const computedAttribute = (target.getComputedAttributesForCell() || {})['value'] || '';
      return { edgeWeight, attributes: { ...cellValues, ...aggregatedValues }, computedAttribute: computedAttribute, id: target.getCellId() };
    }) || [];
  }

  static async recalculateCellLabel(cellAttributes: CellDataCollection, labelFunction: AttackgraphFunction | null, worker: AsyncWorker): Promise<KeyValuePairs> {
    return (labelFunction) ? this.runLabelFunctionWorker(labelFunction, cellAttributes, worker) : {};
  }

  private static async runLabelFunctionWorker(labelFunction: AttackgraphFunction, attributes: CellDataCollection, worker: AsyncWorker): Promise<KeyValuePairs> {
    try {
      return await worker.runWorkerFunction<CellDataCollection, KeyValuePairs>(labelFunction.fn, attributes);
    } catch (e) {      
      return {};
    }
  }
}
