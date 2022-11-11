import { Framework7Icons } from './Framework7Icons';
import { EditAggregationFunctionDialog, EditComputedAttributesFunctionDialog } from './Dialogs/TextAreaDialog';
import { AsyncWorker } from './AsyncUtils';
import { AttributeRenderer } from './AttributeRenderer';
import { AttackGraphSettings } from './AttackGraphSettings';
import { NodeAttributeProvider } from './Analysis/NodeAttributeProvider';
import { CellStyles } from './Analysis/CellStyles';


const IMAGE_WIDTH = 24;
const IMAGE_HEIGHT = 24;
class VertexHandler extends mxVertexHandler {
  functionHandles: HTMLImageElement[] | null = null;
  tooltipHandle: TooltipHandle | null = null;
}
class TooltipHandle {
  private width: number;
  private handle: HTMLElement;

  constructor(width: number) {
    this.width = width;
    this.handle = this.createHandle();
  }

  getHandle(): HTMLElement {
    return this.handle;
  }

  reset(): void {
    this.handle.innerHTML = '';
  }

  setContent(content: string): void {
    this.handle.innerHTML = content;
  }

  redraw(state: import('mxgraph').mxCellState): void {
    this.handle.style.left = `${Math.round(state.x - this.width - 10)}px`;
    this.handle.style.top = `${state.y}px`;
  }

  private createHandle(): HTMLElement {
    const elem = document.createElement('div');
    elem.innerHTML = '';
    elem.style.position = 'absolute';
    elem.style.fontSize = '11px';
    elem.style.background = '#f5f5f5';
    elem.style.border = '1px solid black';
    elem.style.boxShadow = '0 0 5px 0 rgba(0,0,0,0.4)';
    elem.style.boxSizing = 'border-box';
    elem.style.width = `${this.width}px`;
    elem.style.padding = '5px';
    elem.style.opacity = '85%';
    return elem;
  }
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

  const drawTooltipHandle = (vertexHandler: VertexHandler) => {
    if (new CellStyles(vertexHandler.state.cell).isLinkNode()) {
      const cell = new NodeAttributeProvider(vertexHandler.state.cell);
      const pages = cell.getLinkNodesReferencingThisCell().map(x => x.getPage()?.getName()).filter((v, i, a) => a.indexOf(v) === i);

      if (pages.length > 0) {
        vertexHandler.tooltipHandle = new TooltipHandle(125);
        vertexHandler.tooltipHandle.setContent(`<strong>${mxResources.get('attackGraphs.pageReferenceTooltip')}:</strong><br/>` + pages.join('<br/>'));
        vertexHandler.graph.container.appendChild(vertexHandler.tooltipHandle.getHandle());
      }
    }
  };

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const vertexHandlerInit = mxVertexHandler.prototype.init;
  mxVertexHandler.prototype.init = function (this: VertexHandler, ...rest) {
    vertexHandlerInit.apply(this, rest);
    if (AttackGraphSettings.isAttackGraph(ui.editor.graph) && this.graph.getSelectionCount() === 1) {
      drawFunctionHandle(this);
      drawTooltipHandle(this);
      this.redrawHandles();
    }
  }

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const vertexHandlerSetHandlesVisible = mxVertexHandler.prototype.setHandlesVisible;
  mxVertexHandler.prototype.setHandlesVisible = function (this: VertexHandler, visible, ...rest) {
    vertexHandlerSetHandlesVisible.apply(this, [visible, ...rest]);

    if (this.tooltipHandle) {
      this.tooltipHandle.getHandle().style.visibility = (visible) ? '' : 'hidden';
    }

    if (this.functionHandles) {
      for (const functionHandle of this.functionHandles) {
        functionHandle.style.visibility = (visible) ? '' : 'hidden';
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const vertexHandlerRedrawHandles = mxVertexHandler.prototype.redrawHandles;
  mxVertexHandler.prototype.redrawHandles = function (this: VertexHandler) {
    const b = this.state;

    if (this.tooltipHandle) {
      this.tooltipHandle.redraw(b);
      this.tooltipHandle.getHandle().style.display = this.graph.getSelectionCount() === 1 ? '' : 'none';
    }

    if (this.functionHandles) {
      if (new CellStyles(this.state.cell).isLinkNode()) {
        this.functionHandles[0].style.display = 'none'; // Hide computed attributes
        if (!(new NodeAttributeProvider(this.state.cell)).isLeave()) { // destination link node
          this.functionHandles[1].style.top = `${b.y}px`;
          this.functionHandles[1].style.left = `${Math.round(b.x + b.width + 5)}px`;
          this.functionHandles[1].style.display = this.graph.getSelectionCount() === 1 ? '' : 'none';
        } else { // source link node
          this.functionHandles[1].style.display = 'none';
        }
      } else {
        this.functionHandles[0].style.left = `${Math.round(b.x + b.width + 5)}px`;
        this.functionHandles[0].style.top = `${b.y}px`;
        this.functionHandles[1].style.left = `${Math.round(b.x - IMAGE_WIDTH - 5)}px`;
        this.functionHandles[1].style.top = `${b.y}px`;

        for (const functionHandle of this.functionHandles) {
          // Shows function handles only if one vertex is selected
          functionHandle.style.display = this.graph.getSelectionCount() === 1 ? '' : 'none';
        }
      }
    }

    vertexHandlerRedrawHandles.apply(this);
  };

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const vertexHandlerDestroy = mxVertexHandler.prototype.destroy;
  mxVertexHandler.prototype.destroy = function (this: VertexHandler, ...rest) {
    vertexHandlerDestroy.apply(this, rest);

    if (this.tooltipHandle) {
      const tooltipHandle = this.tooltipHandle.getHandle();
      if (tooltipHandle.parentNode) {
        tooltipHandle.parentNode.removeChild(tooltipHandle);
      }
      this.tooltipHandle = null;
    }

    if (this.functionHandles) {
      for (const functionHandle of this.functionHandles) {
        if (functionHandle.parentNode !== null) {
          functionHandle.parentNode.removeChild(functionHandle);
        }
      }

      this.functionHandles = null;
    }
  };

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const vertexHandlerMouseUp = mxVertexHandler.prototype.mouseUp;
  mxVertexHandler.prototype.mouseUp = function(this: VertexHandler, ...rest) {
    vertexHandlerMouseUp.apply(this, rest);

    if (this.tooltipHandle) {
      this.tooltipHandle.getHandle().style.display = (this.graph.getSelectionCount() === 1) ? '' : 'none';
    }

    // Shows function handles only if one vertex is selected
    if (this.functionHandles) {
      for (const functionHandle of this.functionHandles) {
        functionHandle.style.display = (this.graph.getSelectionCount() === 1) ? '' : 'none';
      }
    }
  }
};
