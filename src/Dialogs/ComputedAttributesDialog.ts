import { AttributeRenderer } from '../AttributeRenderer';
import { AttackgraphFunction } from '../Model';
import { FunctionListDialog } from './FunctionListDialog';

export class ComputedAttributesDialog extends FunctionListDialog {
  protected title = mxResources.get('attackGraphs.computedAttributes');
  protected editDialogTitle = mxResources.get('attackGraphs.computedAttributeFunction');

  setFunctionItems(aggregationFunctions: AttackgraphFunction[]): void {
    const graph = this.ui?.editor.graph;
    if (graph) {
      AttributeRenderer.rootAttributes(graph).setGlobalComputedAttributesFunctions(aggregationFunctions);
    }
  }

  getFunctionItems(): AttackgraphFunction[] {
    const graph = this.ui?.editor.graph;
    if (graph !== undefined) {
      return AttributeRenderer.rootAttributes(graph).getGlobalComputedAttributesFunctions();
    } else {
      return [];
    }
  }
}
