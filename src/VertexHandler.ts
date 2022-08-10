import { Framework7Icons } from './Framework7Icons';
import { EditAggregationFunctionDialog, EditComputedAttributesFunctionDialog } from './Dialogs/TextAreaDialog';
import { AsyncWorker } from './AsyncUtils';
import { AttributeRenderer } from './AttributeRenderer';
import { AttackGraphSettings } from './AttackGraphSettings';
import { CellStyles } from './Analysis/CellStyles';


const IMAGE_WIDTH = 24;
const IMAGE_HEIGHT = 24;
class VertexHandler extends mxVertexHandler {
  functionHandles: HTMLImageElement[] | null = null;
}

export const installVertexHandler = (ui: Draw.UI, worker: AsyncWorker): void => {

  const drawFunctionHandle = (vertexHandler: VertexHandler) => {
    // Destroys existing handles
    if (vertexHandler.functionHandles) {
      for (const functionHandle of vertexHandler.functionHandles) {
        if (functionHandle.parentNode) {
          functionHandle.parentNode.removeChild(functionHandle);

        }
      }
    }
    vertexHandler.functionHandles = [];

    // Creates new handles
    const aggregationFunctionHandle = mxUtils.createImage(`data:image/svg+xml;utf8,${Framework7Icons.Icons.function}`);
    aggregationFunctionHandle.className = 'ag_function_handle';
    aggregationFunctionHandle.style.position = 'absolute';
    aggregationFunctionHandle.style.cursor = 'pointer';
    aggregationFunctionHandle.style.width = `${IMAGE_WIDTH}px`;
    aggregationFunctionHandle.style.height = `${IMAGE_HEIGHT}px`;

    const computedAttributesFunctionHandle = mxUtils.createImage(`data:image/svg+xml;utf8,${Framework7Icons.Icons.label}`);
    computedAttributesFunctionHandle.className = 'ag_computed_attributes_handle';
    computedAttributesFunctionHandle.style.position = 'absolute';
    computedAttributesFunctionHandle.style.cursor = 'pointer';
    computedAttributesFunctionHandle.style.width = `${IMAGE_WIDTH}px`;
    computedAttributesFunctionHandle.style.height = `${IMAGE_HEIGHT}px`;

    mxEvent.addListener(aggregationFunctionHandle, mxEvent.CLICK, () => {
      const cell = AttributeRenderer.nodeAttributes(vertexHandler.state.cell);
      const dlg = new EditAggregationFunctionDialog(cell, ui, mxResources.get('attackGraphs.defineAggregationFunction'), 500, 500, true, true, undefined, mxResources.get('cancel'));
      dlg.init();
      void (async () => {
        if (await dlg.show()) {
          await AttributeRenderer.refreshCellValuesUpwards(cell.cell, ui, worker);
          await ui.editor.graph.refresh();
        }
      })();
    })

    mxEvent.addListener(computedAttributesFunctionHandle, mxEvent.CLICK, () => {
      const cell = AttributeRenderer.nodeAttributes(vertexHandler.state.cell);
      const dlg = new EditComputedAttributesFunctionDialog(cell, ui, mxResources.get('attackGraphs.defineComputedAttributesFunction'), 500, 500, true, true, undefined, mxResources.get('cancel'));
      dlg.init();
      void (async () => {
        if (await dlg.show()) {
          await AttributeRenderer.refreshCellValuesUpwards(cell.cell, ui, worker);
          await ui.editor.graph.refresh();
        }
      })();
    })

    vertexHandler.functionHandles.push(computedAttributesFunctionHandle);
    vertexHandler.graph.container.appendChild(computedAttributesFunctionHandle);

    vertexHandler.functionHandles.push(aggregationFunctionHandle);
    vertexHandler.graph.container.appendChild(aggregationFunctionHandle);
  }

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const vertexHandlerInit = mxVertexHandler.prototype.init;
  mxVertexHandler.prototype.init = function (this: VertexHandler, ...rest) {
    vertexHandlerInit.apply(this, rest);
    if (AttackGraphSettings.isAttackGraph(ui.editor.graph) && this.graph.getSelectionCount() === 1) {
      drawFunctionHandle(this);

      // Highlight incoming and outgoing edges
      const cell = this.state.cell;
      if (cell.edges) {
        const style = new CellStyles(cell);
        style.updateConnectedEdgesStyle(true, true);
        ui.editor.graph.refresh();
      }

      this.redrawHandles();
    }
  }

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const vertexHandlerSetHandlesVisible = mxVertexHandler.prototype.setHandlesVisible;
  mxVertexHandler.prototype.setHandlesVisible = function (this: VertexHandler, visible, ...rest) {
    vertexHandlerSetHandlesVisible.apply(this, [visible, ...rest]);

    if (this.functionHandles) {
      for (const functionHandle of this.functionHandles) {
        functionHandle.style.visibility = (visible) ? '' : 'hidden';
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const vertexHandlerRedrawHandles = mxVertexHandler.prototype.redrawHandles;
  mxVertexHandler.prototype.redrawHandles = function (this: VertexHandler) {
    if (this.functionHandles) {
      const b = this.state;
      this.functionHandles[0].style.left = `${Math.round(b.x + b.width + 5)}px`;
      this.functionHandles[0].style.top = `${b.y}px`;
      this.functionHandles[1].style.left = `${Math.round(b.x - IMAGE_WIDTH - 5)}px`;
      this.functionHandles[1].style.top = `${b.y}px`;

      for (const functionHandle of this.functionHandles) {
        // Shows function handles only if one vertex is selected
        functionHandle.style.display = this.graph.getSelectionCount() === 1 ? '' : 'none';
      }
    }

    vertexHandlerRedrawHandles.apply(this);
  };

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const vertexHandlerDestroy = mxVertexHandler.prototype.destroy;
  mxVertexHandler.prototype.destroy = function (this: VertexHandler, ...rest) {
    vertexHandlerDestroy.apply(this, rest);

    if (this.functionHandles) {
      for (const functionHandle of this.functionHandles) {
        if (functionHandle.parentNode !== null) {
          functionHandle.parentNode.removeChild(functionHandle);
        }
      }

      // Remove highlight of incoming and outgoing edges
      const cell = this.state.cell;
      if (cell.edges) {
        const style = new CellStyles(cell);
        style.updateConnectedEdgesStyle(false, false);
        ui.editor.graph.refresh();
      }

      this.functionHandles = null;
    }
  };

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const vertexHandlerMouseUp = mxVertexHandler.prototype.mouseUp;
  mxVertexHandler.prototype.mouseUp = function(this: VertexHandler, ...rest) {
    vertexHandlerMouseUp.apply(this, rest);

    // Shows function handles only if one vertex is selected
    if (this.functionHandles) {
      for (const functionHandle of this.functionHandles) {
        functionHandle.style.display = (this.graph.getSelectionCount() === 1) ? '' : 'none';
      }
    }
  }
};
