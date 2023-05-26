import { FunctionListDialog } from './FunctionListDialog';
import { AttackgraphFunction } from '../Model';
import { AttributeRenderer } from '../AttributeRenderer';
import { AGImportFile, ImportType } from './ImportFileDialog';

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

  protected override importFileCallback(file: AGImportFile, refresh: () => void): void {
    this.updateItems(file.aggregation_functions);
    super.importFileCallback(file, refresh);
  }

  protected override getImportType(): ImportType {
    return ImportType.AggregationFunctions;
  }
}
