import { EdgeAttributeProvider } from './Analysis/EdgeAttributeProvider';
import { NodeAttributeProvider } from './Analysis/NodeAttributeProvider';
import { RootAttributeProvider } from './Analysis/RootAttributeProvider';
import { SensitivityAnalysisCache, SensitivityAnalysisEdgeAttributeProvider, SensitivityAnalysisNodeAttributeProvider, SensitivityAnalysisRootAttributeProvider } from './Analysis/SensitivityAnalysisProvider';
import { AsyncWorker } from './AsyncUtils';
import { AttackGraphSettings } from './AttackGraphSettings';
import { GraphUtils } from './GraphUtils';
import { AttackgraphFunction, CellDataCollection, ChildCellData, ChildCellDataCollection, GlobalAttribute, GlobalAttributeDict, KeyValuePairs } from './Model';
import { Menubar } from './Menubar';

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

  static rootAttributes(graph: Draw.EditorGraph): RootAttributeProvider {
    if (this._sensitivityAnalysisEnabled) {
      return new SensitivityAnalysisRootAttributeProvider(graph);
    } else {
      return new RootAttributeProvider(graph);
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

  static async refreshCellValuesUpwards(cell: import('mxgraph').mxCell, ui: Draw.UI, worker: AsyncWorker): Promise<void> {
    if (AttackGraphSettings.isAttackGraph(ui.editor.graph)) {
      if (GraphUtils.isTree(cell)) {
        Menubar.increaseUnfinishedWorkers(ui);
        await this.updateCellValuesUpwards(this.nodeAttributes(cell), AttributeRenderer.rootAttributes(ui.editor.graph), worker);
        Menubar.decreaseUnfinishedWorkers(ui);
      } else {
        mxUtils.alert('Cannot recalculate the graph as it contains loops!');
      }
    }
  }

  private static async updateCellValuesUpwards(cell: NodeAttributeProvider, graph: RootAttributeProvider, worker: AsyncWorker): Promise<void> {
    const globalDefaultAttributes = graph.getGlobalAttributes();
    const globalDefaultAttributesDict = this.transformGlobalAttributesToGlobalAttributesDict(globalDefaultAttributes || []) as GlobalAttributeDict;

    const childValues = this.getChildValues(cell);
    const aggregationFunction = cell.resolveAggregationFunction(graph);

    const localAttributes = cell.getCellValues();

    const aggregatedValues = await this.aggregateAttributes({
      globalAttributes: globalDefaultAttributesDict,
      childAttributes: childValues,
      localAttributes: localAttributes,
      id: cell.getCellId()
    }, aggregationFunction, worker);
    cell.setAggregatedCellValues(aggregatedValues);

    const labelFunction = cell.resolveComputedAttributesFunction(graph);

    const cellAttributes = cell.getCellValues();
    const label = await this.recalculateCellLabel({ globalAttributes: globalDefaultAttributesDict, cellAttributes: { ...cellAttributes, ...aggregatedValues } }, labelFunction, worker);
    cell.setComputedAttributesForCell(label, labelFunction?.name || null);

    const incomingEdges = cell.cell.edges?.filter(x => x.target === cell.cell && x.source) || [];
    await Promise.all(incomingEdges.map(x => this.updateCellValuesUpwards(this.nodeAttributes(x.source), graph, worker)));
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
    // TODO: Improve to avoid recalculating nodes already calculated
    await Promise.all(Object.entries(ui.editor.graph.getModel().cells as { [id: string]: import('mxgraph').mxCell }).map(([, cell]) =>
      this.refreshCellValuesUpwards(cell, ui, worker)
    ));
    ui.editor.graph.refresh();
  }

  static getChildValues(cell: NodeAttributeProvider): ChildCellData[] {
    return cell.cell.edges?.filter(x => x.source === cell.cell && x.target).map(x => {
      const edgeWeight = this.edgeAttributes(x).getEdgeWeight();
      const target = this.nodeAttributes(x.target);
      const cellValues = target.getCellValues();
      const aggregatedValues = target.getAggregatedCellValues();
      const computedAttribute = Object.values(target.getComputedAttributesForCell() || {})[0];
      return { edgeWeight, attributes: { ...cellValues, ...aggregatedValues }, computedAttribute: computedAttribute, id: target.getCellId() };
    }) || [];
  }

  static async recalculateCellLabel(cellAttributes: CellDataCollection, labelFunction: AttackgraphFunction | null, worker: AsyncWorker): Promise<string | null> {

    if (labelFunction === null) {
      return null;
    }

    try {
      return this.runLabelFunctionWorker(labelFunction, cellAttributes, worker);
    } catch (e) {
      return null;
    }
  }

  private static async runLabelFunctionWorker(labelFunction: AttackgraphFunction, attributes: CellDataCollection, worker: AsyncWorker): Promise<string> {
    try {
      return await worker.runWorkerFunction<CellDataCollection, string>(labelFunction.fn, attributes);
    } catch (e) {
      return '!';
    }
  }
}
