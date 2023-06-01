import { FunctionListDialog } from './FunctionListDialog';
import { AttackgraphFunction } from '../Model';
import { AttributeRenderer } from '../AttributeRenderer';
import { TemplateFile, TemplateType } from './FileDialog';

export class AggregationFunctionListDialog extends FunctionListDialog {
  protected title = mxResources.get('attackGraphs.aggregationFunctions');
  protected editDialogTitle = mxResources.get('attackGraphs.aggregationFunction');

  setFunctionItems(aggregationFunctions: AttackgraphFunction[]): void {
    const graph = this.ui?.editor.graph;
    if (graph) {
      AttributeRenderer.rootAttributes().setGlobalAggregatonFunctions(aggregationFunctions);
    }
  }

  getFunctionItems(): AttackgraphFunction[] {
    const graph = this.ui?.editor.graph;
    if (graph) {
      return AttributeRenderer.rootAttributes().getGlobalAggregationFunctions();
    } else {
      return [];
    }
  }

  protected override importFileCallback(file: TemplateFile, callback: () => void): void {
    this.updateItems(file.aggregation_functions);
    callback();
  }

  protected override getImportType(): TemplateType {
    return TemplateType.AggregationFunctions;
  }

  /**
   * Allows to import a list of function items.
   * Intended to be used by the template import dialog.
   */
  static override importFunctionItems(ui: Draw.UI, items: AttackgraphFunction[]): void {
    const dlg = new AggregationFunctionListDialog(ui, 0, 0);
    dlg.importFunctionItems(items);
  }

  /**
   * Allows to export a list of function items.
   * Intended to be used by the template export dialog.
   */
  static override exportFunctionItems(ui: Draw.UI): AttackgraphFunction[] {
    const dlg = new AggregationFunctionListDialog(ui, 0, 0);
    return dlg.getFunctionItems();
  }
}
