import { AttributeRenderer } from '../AttributeRenderer';
import { AttackgraphFunction } from '../Model';
import { FunctionListDialog } from './FunctionListDialog';
import { TemplateFile, TemplateType } from './FileDialog';

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

  protected override importFileCallback(file: TemplateFile, callback: () => void): void {
    this.updateItems(file.computed_attributes);
    callback();
  }

  protected override getImportType(): TemplateType {
    return TemplateType.ComputedAttributes;
  }

  /**
   * Allows to import a list of function items.
   * Intended to be used by the template import dialog.
   */
  static override importFunctionItems(ui: Draw.UI, items: AttackgraphFunction[]): void {
    const dlg = new ComputedAttributesDialog(ui, 0, 0);
    dlg.importFunctionItems(items);
  }

  /**
   * Allows to export a list of function items.
   * Intended to be used by the template export dialog.
   */
  static override exportFunctionItems(ui: Draw.UI): AttackgraphFunction[] {
    const dlg = new ComputedAttributesDialog(ui, 0, 0);
    return dlg.getFunctionItems();
  }
}
