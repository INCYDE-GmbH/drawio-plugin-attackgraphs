import { FunctionListDialog } from './FunctionListDialog';
import { AttackgraphFunction } from '../Model';
import { AttributeRenderer } from '../AttributeRenderer';

export class AggregationFunctionListDialog extends FunctionListDialog {
  protected title = mxResources.get('attackGraphs.aggregationFunctions');
  protected editDialogTitle = mxResources.get('attackGraphs.aggregationFunction');

  setFunctionItems(aggregationFunctions: AttackgraphFunction[]): void {
    const graph = this.ui?.editor.graph;
    if (graph) {
      AttributeRenderer.rootAttributes(graph).setGlobalAggregatonFunctions(aggregationFunctions);
    }
  }

  getFunctionItems(): AttackgraphFunction[] {
    const graph = this.ui?.editor.graph;
    if (graph) {
      return AttributeRenderer.rootAttributes(graph).getGlobalAggregationFunctions();
    } else {
      return [];
    }
  }
}
