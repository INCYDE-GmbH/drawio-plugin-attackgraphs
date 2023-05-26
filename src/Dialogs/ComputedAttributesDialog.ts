import { AttributeRenderer } from '../AttributeRenderer';
import { AttackgraphFunction } from '../Model';
import { FunctionListDialog } from './FunctionListDialog';
import { AGImportFile } from './ImportFileDialog';

export class ComputedAttributesDialog extends FunctionListDialog {
  protected title = mxResources.get('attackGraphs.computedAttributes');
  protected editDialogTitle = mxResources.get('attackGraphs.computedAttributeFunction');

  setFunctionItems(aggregationFunctions: AttackgraphFunction[]): void {
    const graph = this.ui?.editor.graph;
    if (graph) {
      AttributeRenderer.rootAttributes().setGlobalComputedAttributesFunctions(aggregationFunctions);
    }
  }

  getFunctionItems(): AttackgraphFunction[] {
    const graph = this.ui?.editor.graph;
    if (graph !== undefined) {
      return AttributeRenderer.rootAttributes().getGlobalComputedAttributesFunctions();
    } else {
      return [];
    }
  }

  protected override importFileCallback(file: AGImportFile, refresh: () => void): void {
    this.updateItems(file.computed_attributes);
    super.importFileCallback(file, refresh);
  }
}
