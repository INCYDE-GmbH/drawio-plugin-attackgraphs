import { CellStyles } from './Analysis/CellStyles';
import { AttributeProvider } from './Analysis/AttributeProvider';
import { AsyncWorker } from './AsyncUtils';
import { AttackGraphIconLegendShape } from './AttackGraphIconLegendShape';
import { AttackGraphLinkShape } from './AttackGraphLinkShape';
import { AttackGraphNodeShape } from './AttackGraphNodeShape';
import { ConversionHelpTool } from './ConversionHelpTool';
import { IconLegend } from './IconLegend';
import { Menubar } from './Menubar';
import { Resources } from './Resources';
import { AttributeRenderer } from './AttributeRenderer';
import { Sidebar } from './Sidebar';
import { installVertexHandler } from './VertexHandler';
import { KeyValuePairs } from './Model';
import { RootAttributeProvider } from './Analysis/RootAttributeProvider';
import { VersionDialog } from './Dialogs/VersionDialog';

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
  CellStyles.register(ui);

  AttributeProvider.register(ui);

  AttackGraphNodeShape.register();
  AttackGraphLinkShape.register();
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


  ui.editor.graph.model.addListener(mxEvent.CHANGE, (_, evt: import('mxgraph').mxEventObject) => {
    const cells: {[id: string]: import('mxgraph').mxCell} = {};
    const deferCellUpdate = (cell: import('mxgraph').mxCell) => {
      if (!Object.prototype.hasOwnProperty.call(cells, cell.id)) {
        cells[cell.id] = cell;
      }
    };
    
    const edit = evt.getProperty('edit') as import('mxgraph').mxUndoableEdit;
    void (async () => {
      let refresh = false;
      for (const change of edit.changes) {
        if (change instanceof mxValueChange) {
          if (change.cell.source !== null) { // value of an edge was changed (edge weight)
            if (AttributeRenderer.sensitivityAnalysisEnabled()) {
              const label = AttributeRenderer.edgeAttributes(change.cell).getCellLabel() || '';
              const previousLabel = change.previous !== null ? typeof change.previous === 'string' ? change.previous as string : change.previous.getAttribute('label') : null;
              if (label !== previousLabel) {
                AttributeRenderer.edgeAttributes(change.cell).replaceCellValue({ label });
                change.cell.setValue(change.previous);
              }
            }
            deferCellUpdate(change.cell.source);
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
            deferCellUpdate(change.cell);
          }
        } else if (change instanceof mxTerminalChange) { // is an edge and changed connection
          new CellStyles(change.cell).updateEdgeStyle();
          if (change.terminal !== null || change.previous !== null) {
            if (change.terminal !== null) {
              deferCellUpdate(change.terminal); // New connection
            }
            if (change.previous !== null) {
              deferCellUpdate(change.previous); // Old connection
            }
          } else {
            refresh = true;
          }
        } else if (change instanceof mxChildChange) { // a cell was added or removed from the graph model
          const cell = change.child;
          if (change.previous === null && change.parent !== null) { // cell was added
            if (cell.edge) {
              new CellStyles(cell).updateEdgeStyle();
              if (cell.source) {
                deferCellUpdate(cell.source);
              } else {
                refresh = true;
              }
            } else {
              // No edge style updates needed because mxTerminalChange is fired for every edge connected to the added node
              deferCellUpdate(cell);
            }
          } else if (change.previous !== null && change.parent === null) { // cell was removed
            // No edge style updates needed because mxTerminalChange is fired as well if a node is removed
            if (cell.edge) {
              if (cell.source) {
                deferCellUpdate(cell.source);
              } else {
                refresh = true;
              }
            } else if (CellStyles.isAttackgraphCell(cell)) {
              refresh = true;
            } else {
              deferCellUpdate(cell);
            }
          }
        }
      }
      
      if (refresh) {
        await AttributeRenderer.recalculateAllCells(ui, worker); // Already refreshes graph
      } else if (Object.entries(cells).length > 0) {
        await AttributeRenderer.refreshCellValuesUpwards(Object.entries(cells).map(([, cell]) => cell), ui, worker);
        ui.editor.graph.refresh();
      }
    })();
  });

  let loadingComplete = false;
  let pageCycling = false;
  let firstPageIdx: number | null = null;
  ui.editor.graph.addListener(mxEvent.ROOT, () => {
    if (ui.editor.graph.model.root.value || pageCycling) {
      // Cycle through all pages so each diagram's root is stored in ui.pages
      if (!loadingComplete) {
        pageCycling = true;

        const idx = ui.getPageIndex(ui.currentPage);
        const nextIdx = (idx + 1) % ui.pages.length;
        const page = ui.pages[nextIdx];

        firstPageIdx = (firstPageIdx === null) ? idx : firstPageIdx;
        loadingComplete = (nextIdx === firstPageIdx);

        ui.selectPage(page, true, page.viewState || null);
      } else {
        pageCycling = false;

        sidebar.updatePalette();
        void AttributeRenderer.recalculateAllCells(ui, worker);
        CellStyles.updateAllEdgeStyles(ui.editor.graph.model);
      }
    } else {
      loadingComplete = false;
      firstPageIdx = null;
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

  // React if the first page (with the root attributes) was moved
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const movePageExecute = MovePage.prototype.execute;
  MovePage.prototype.execute = function() {    
    const firstPageMoved = (this.oldIndex === 0 || this.newIndex === 0);
    movePageExecute.apply(this, []); // Changes this.oldIndex and this.newIndex

    if (firstPageMoved) {
      RootAttributeProvider.moveRootAttributes();
    }
  }

  // Visually disable edges connected to disabled nodes
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const paintEdgeShape = mxConnector.prototype.paintEdgeShape;
  mxConnector.prototype.paintEdgeShape = function(c: import('mxgraph').mxAbstractCanvas2D, pts: import('mxgraph').mxPoint[]) {
    if (this.state && this.state.cell.source && this.state.cell.target) {
      const source = AttributeRenderer.nodeAttributes(this.state.cell.source);
      const target = AttributeRenderer.nodeAttributes(this.state.cell.target);

      if (!source.getEnabledStatus() || !target.getEnabledStatus()) {
        c.setAlpha(CellStyles.DISABLED_EDGE_ALPHA);
      }
    }
    paintEdgeShape.apply(this, [c, pts]);
  }

  // Visually disable OR and AND nodes when disabled
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const paintVertexShape = mxActor.prototype.paintVertexShape;
  mxActor.prototype.paintVertexShape = function(c: import('mxgraph').mxAbstractCanvas2D, x: number, y: number, w: number, h: number) {
    if (this.state
        && CellStyles.isAttackgraphCell(this.state.cell)
        && !AttributeRenderer.nodeAttributes(this.state.cell).getEnabledStatus()) {
      c.setAlpha(CellStyles.DISABLED_CELL_ALPHA);
    }
    paintVertexShape.apply(this, [c, x, y, w, h]);
  }

  // Show edge weight reduction in cell label
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const paint = mxText.prototype.paint;
  mxText.prototype.paint = function(c: import('mxgraph').mxAbstractCanvas2D, update?: boolean) {
    if (this.state && this.state.cell.edge && this.state.cell.source && this.state.cell.target) {
      const source = AttributeRenderer.nodeAttributes(this.state.cell.source);
      const attributes = source.getAggregatedCellValues();

      // Are edge weight reductions defined?
      if (Object.prototype.hasOwnProperty.call(attributes, '_weight')) {
        const edge = AttributeRenderer.edgeAttributes(this.state.cell);
        const target = this.state.cell.target;
        const oldWeight = edge.getEdgeWeight();
        const newWeight = (attributes['_weight'].split(';').filter(x => x.split(':')[0] === target.id)[0] || '').split(':')[1] || null;

        if (oldWeight && newWeight && newWeight !== oldWeight) {
          this.state.text.value = `${newWeight} <span style="text-decoration:line-through;color:#00f">${oldWeight}</span>`;
          update = false;
        }
      }
    }
    paint.apply(this, [c, update]);
  }

  /*
   * Highlight and mark edges connected to the selected node
   */
  let activeCell: import('mxgraph').mxCell | undefined = undefined;
  let movedCell: import('mxgraph').mxCell | undefined = undefined;

  // Fired before mxEvent.CLICK by draw.io
  ui.editor.graph.addListener(mxEvent.CELLS_MOVED, (_, evt: import('mxgraph').mxEventObject) => {    
    const cells = evt.getProperty('cells') as import('mxgraph').mxCell[];
    if (cells.length === 1) {
      movedCell = cells[0];
    }
  });
  ui.editor.graph.addListener(mxEvent.CLICK, (_, evt: import('mxgraph').mxEventObject) => {
    const cell = evt.getProperty('cell') as import('mxgraph').mxCell | null;

    if (movedCell) {
      // Was the cell first clicked by the move? --> Mark! (and store the clicked cell)
      if (!activeCell) {
        CellStyles.updateConnectedEdgesStyle(movedCell, true, true);
        activeCell = movedCell
      }

      movedCell = undefined;
    } else {
      // Was a cell clicked beforehand? --> Unmark!
      if (activeCell) {
        CellStyles.updateConnectedEdgesStyle(activeCell, false, false);
        activeCell = undefined;
      }

      // Was a cell clicked? --> Mark!
      if (cell) {
        CellStyles.updateConnectedEdgesStyle(cell, true, true);
        activeCell = cell;
      }
    }
  });

  // Check for latest plugin release after draw.io finished loading
  void (async () => {
    try {
      if (await VersionDialog.isLatestVersion()) {
        return;
      }
    } catch (e) {
      // Check failed --> Do not show dialog
      mxUtils.alert(e as string);
      return;
    }
    
    try {
      const dismiss = VersionDialog.getDismissedRelease();
      if (dismiss && await VersionDialog.isLatestVersion(dismiss)) {
        return;
      }
    } catch {
      // Do nothing
    }
    
    // Brute force showing the dialog.
    // Unfortunately, it is sometimes closed without the user intentionally closing it...
    for (let retry = true; retry; ) {
      try {
        const dlg = new VersionDialog(ui);
        await dlg.init();
        await dlg.show(); // Fails if the dialog wasn't closed by the user
        retry = false;
      } catch {
        // Do nothing
      }
    }
  })();


  installVertexHandler(ui, worker);
});
