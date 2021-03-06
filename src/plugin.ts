import { CellStyles } from './Analysis/CellStyles';
import { AsyncWorker } from './AsyncUtils';
import { AttackGraphIconLegendShape } from './AttackGraphIconLegendShape';
import { AttackGraphNodeShape } from './AttackGraphNodeShape';
import { ConversionHelpTool } from './ConversionHelpTool';
import { IconLegend } from './IconLegend';
import { Menubar } from './Menubar';
import { Resources } from './Resources';
import { AttributeRenderer } from './AttributeRenderer';
import { Sidebar } from './Sidebar';
import { installVertexHandler } from './VertexHandler';
import { KeyValuePairs } from './Model';

Draw.loadPlugin(ui => {

  // overwrite the default pasteData action to remove the placeholder attribute &
  // copy attackgraph cell data
  ui.actions.addAction('pasteData', (evt: MouseEvent) => {

    // Context menu click uses trigger, toolbar menu click uses evt
    const graph = ui.editor.graph;
    const model = graph.getModel();

    function applyValue(cell: import('mxgraph').mxCell, value: Element) {
      value.removeAttribute('placeholders');

      if (evt === null || !mxEvent.isShiftDown(evt)) {
        value.setAttribute('label', graph.convertValueToString(cell));
      }

      model.setValue(cell, value);
    }

    if (graph.isEnabled() && !graph.isSelectionEmpty() && ui.copiedValue !== null) {
      model.beginUpdate();

      try {
        const cells = graph.getEditableCells(graph.getSelectionCells());

        if (cells.length === 0) {
          applyValue(model.getRoot(), ui.copiedValue);
        } else {
          for (let i = 0; i < cells.length; i++) {
            applyValue(cells[i], ui.copiedValue);
          }
        }
      } finally {
        model.endUpdate();
      }
    }
  }, null, null, 'Alt+Shift+E');

  // Register additional text resources (for the current language)
  Resources.register(mxSettings.settings.language || 'en');

  AttackGraphNodeShape.register();
  AttackGraphIconLegendShape.register();
  IconLegend.register(ui.editor.graph);

  const sidebar = new Sidebar(ui);
  sidebar.addPalette();

  const worker = new AsyncWorker();

  Menubar.register(ui, sidebar, worker);

  ConversionHelpTool.register(ui.editor.graph);

  mxResources.parse(`setDefaultAttributes=${mxResources.get('attackGraphs.setDefaultAttributes')}`);
  mxResources.parse(`setAttackGraphShape=${mxResources.get('attackGraphs.setAttackGraphShape')}`);
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const uiCreatePopupMenu = ui.menus.createPopupMenu;
  ui.menus.createPopupMenu = function (...args) {
    uiCreatePopupMenu.apply(this, args);
    const graph = ui.editor.graph;

    if (graph.model.isVertex(graph.getSelectionCell())) {
      this.addMenuItems(args[0], ['-', 'setDefaultAttributes', 'setAttackGraphShape'], null, args[2], args[2]);
    }

  };

  ui.actions.addAction('setDefaultAttributes', () => {
    ConversionHelpTool.setDefaultAttributes();
    ui.editor.graph.refresh();
  });
  ui.actions.addAction('setAttackGraphShape', () => {
    ConversionHelpTool.setAttackGraphShape();
    ui.editor.graph.refresh();
  });


  ui.editor.graph.model.addListener(mxEvent.CHANGE, (sender, evt: import('mxgraph').mxEventObject) => {
    const edit = evt.getProperty('edit') as import('mxgraph').mxUndoableEdit;
    void (async () => {
      for (const change of edit.changes) {
        if (change instanceof mxValueChange) {
          // value of an edge was changed (edge weight)
          if (change.cell.source !== null) {
            if (AttributeRenderer.sensitivityAnalysisEnabled()) {
              const label = AttributeRenderer.edgeAttributes(change.cell).getCellLabel() || '';
              const previousLabel = change.previous !== null ? typeof change.previous === 'string' ? change.previous as string : change.previous.getAttribute('label') : null;
              if (label !== previousLabel) {
                AttributeRenderer.edgeAttributes(change.cell).replaceCellValue({ label });
                change.cell.setValue(change.previous);
              }
            }
            await AttributeRenderer.refreshCellValuesUpwards(change.cell.source, ui, worker);
          } else {
            if (AttributeRenderer.sensitivityAnalysisEnabled()) {
              const nodeAttributes = AttributeRenderer.nodeAttributes(change.cell).getCellValues();
              if (Object.entries(change.previous.attributes)
                .some(([, value], index) =>
                  change.value.attributes[index].value !== nodeAttributes[value.value]
                ) || change.value.attributes.length !== change.previous.attributes.length) {
                const attributes = Object.entries(change.value.attributes)
                  .map(([, value]) => {
                    return [value.name, (value.value.replace(new RegExp('\\s'), '') !== '') ? value.value : '0']
                  });
                AttributeRenderer.nodeAttributes(change.cell).replaceCellValue(Object.fromEntries(attributes) as KeyValuePairs);
                change.cell.setValue(change.previous);
              }
            }
            await AttributeRenderer.refreshCellValuesUpwards(change.cell, ui, worker);
          }
          // is an edge and changed connection

        } else if (change instanceof mxTerminalChange) {
          new CellStyles(change.cell).updateEdgeStyle();
          if (change.terminal !== null) {
            await AttributeRenderer.refreshCellValuesUpwards(change.terminal, ui, worker);
          } else {
            void AttributeRenderer.recalculateAllCells(ui, worker);
          }

        }
        ui.editor.graph.refresh();
      }
    })();
  });

  ui.editor.graph.addListener(mxEvent.CELLS_ADDED, (sender: Graph, evt: import('mxgraph').mxEventObject) => {
    const source = evt.getProperty('source') as import('mxgraph').mxCell;
    const cells = evt.getProperty('cells') as import('mxgraph').mxCell[];
    // if added cell was an edge, trigger source recalculation
    if (source) {
      new CellStyles(cells[0]).updateEdgeStyle();

      void AttributeRenderer.refreshCellValuesUpwards(source, ui, worker);
    } else {
      void (async () => {
        await Promise.all(cells.map(cell => AttributeRenderer.refreshCellValuesUpwards(cell, ui, worker)));
        ui.editor.graph.refresh();
      })();

    }
  });

  ui.editor.graph.addListener(mxEvent.CELLS_REMOVED, (sender: Graph, evt: import('mxgraph').mxEventObject) => {
    const cells = evt.getProperty('cells') as import('mxgraph').mxCell[];
    if (cells.some(x => new CellStyles(x).isAttackgraphCell())) {
      CellStyles.updateAllEdgeStyles(ui.editor.graph.model);
      void AttributeRenderer.recalculateAllCells(ui, worker);
    } else {
      for (const cell of cells) {
        // is edge
        if (cell.source) {
          void (async () => {
            await AttributeRenderer.refreshCellValuesUpwards(cell.source, ui, worker);
            ui.editor.graph.refresh();
          })();
        }
      }
    }
  });

  ui.editor.graph.addListener(mxEvent.ROOT, () => {
    if (ui.editor.graph.model.root.value) {
      sidebar.updatePalette();
      void AttributeRenderer.recalculateAllCells(ui, worker);
      CellStyles.updateAllEdgeStyles(ui.editor.graph.model);
    }
  });

  // Override value of mxText to support rendering values different from the graph xml
  // during sensitivity analysis
  Object.defineProperty(mxText.prototype, 'value', {
    get: function value(this: import('mxgraph').mxText & { _value?: string }) {
      if (this.state && this.style && 'shape' in this.style && this.style['shape'] === 'connector' && AttributeRenderer.sensitivityAnalysisEnabled()) {
        return AttributeRenderer.edgeAttributes(this.state.cell).getCellLabel();
      }
      return this._value as string;
    },
    set: function value(this: import('mxgraph').mxText & { _value?: string }, value: string) {
      this._value = value;
    }
  });

  // Override graph.getModel().getValue(cell) for sensitivity analysis
  // Use case: edit data dialog
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const mxGraphModelGetValue = mxGraphModel.prototype.getValue;
  mxGraphModel.prototype.getValue = function(cell) {
    if (new CellStyles(cell).isAttackgraphCell() && AttributeRenderer.sensitivityAnalysisEnabled()) {
      const doc = mxUtils.createXmlDocument();
      const value = doc.createElement('object');
      for (const [cellKey, cellValue] of Object.entries(AttributeRenderer.nodeAttributes(cell).getCellValues())) {
        value.setAttribute(cellKey, cellValue);
      }
      return value;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return mxGraphModelGetValue.apply(this, [cell]);
  };

  // Show tooltips including aggregated attributes for AttackGraphNodes
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const graphGetTooltipForCell = Graph.prototype.getTooltipForCell;
  Graph.prototype.getTooltipForCell = function(cell: import('mxgraph').mxCell) {
    // mxUtils.isNode is callable without second parameter
    if (mxUtils.isNode(cell.value as object, undefined as unknown as string) && new CellStyles(cell).isAttackgraphCell()) {
      return AttributeRenderer.nodeAttributes(cell).getTooltip();
    }
    return graphGetTooltipForCell.apply(this, [cell]);
  }

  installVertexHandler(ui, worker);
});
