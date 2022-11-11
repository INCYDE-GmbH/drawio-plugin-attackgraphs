import { AsyncWorker } from './AsyncUtils';
import { AggregationFunctionListDialog } from './Dialogs/AggregationFunctionDialog';
import { ComputedAttributesDialog } from './Dialogs/ComputedAttributesDialog';
import { DefaultAttributesDialog } from './Dialogs/DefaultAttributesDialog';
import { AttributeRenderer } from './AttributeRenderer';
import { Sidebar } from './Sidebar';
import { SensitivityAnalysisCache } from './Analysis/SensitivityAnalysisProvider';
import { BinaryPopupDialog } from './Dialogs/BinaryPopupDialog';

declare const __COMMIT_HASH__: string;

const ICON_START_ANALYSIS = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 56 56"><path d="M 9.6367 41.9453 L 13.9960 41.9453 L 13.9960 45.9766 C 13.9960 50.8047 16.4336 53.2422 21.3555 53.2422 L 46.3868 53.2422 C 51.2617 53.2422 53.7227 50.8047 53.7227 45.9766 L 53.7227 21.0625 C 53.7227 16.2578 51.2617 13.8203 46.3868 13.8203 L 42.0273 13.8203 L 42.0273 10.0234 C 42.0273 5.1953 39.5664 2.7578 34.6679 2.7578 L 9.6367 2.7578 C 4.7382 2.7578 2.2773 5.1953 2.2773 10.0234 L 2.2773 34.7031 C 2.2773 39.5312 4.7382 41.9453 9.6367 41.9453 Z M 9.7070 38.1719 C 7.3633 38.1719 6.0508 36.9297 6.0508 34.4922 L 6.0508 10.2344 C 6.0508 7.7969 7.3633 6.5312 9.7070 6.5312 L 34.6211 6.5312 C 36.9179 6.5312 38.2539 7.7969 38.2539 10.2344 L 38.2539 13.8203 L 21.3555 13.8203 C 16.4336 13.8203 13.9960 16.2344 13.9960 21.0625 L 13.9960 38.1719 Z M 21.4023 49.4687 C 19.0586 49.4687 17.7695 48.2031 17.7695 45.7656 L 17.7695 21.2734 C 17.7695 18.8359 19.0586 17.5937 21.4023 17.5937 L 46.3163 17.5937 C 48.6366 17.5937 49.9494 18.8359 49.9494 21.2734 L 49.9494 45.7891 C 49.9494 48.2031 48.6366 49.4687 46.3163 49.4687 Z M 33.9179 43.2812 C 34.9023 43.2812 35.6757 42.4844 35.6757 41.4297 L 35.6757 35.3359 L 41.6289 35.3359 C 42.7304 35.3359 43.6211 34.4922 43.6211 33.4844 C 43.6211 32.5 42.7304 31.6563 41.6289 31.6563 L 35.6757 31.6563 L 35.6757 25.5859 C 35.6757 24.5312 34.9023 23.7578 33.9179 23.7578 C 32.9336 23.7578 32.1367 24.5312 32.1367 25.5859 L 32.1367 31.6563 L 25.9726 31.6563 C 24.9882 31.6563 24.0976 32.5469 24.0976 33.4844 C 24.0976 34.4688 24.9882 35.3359 25.9726 35.3359 L 32.1367 35.3359 L 32.1367 41.4297 C 32.1367 42.4844 32.9336 43.2812 33.9179 43.2812 Z"/></svg>';
const ICON_APPLY_ANALYSIS = '<svg xmlns="http://www.w3.org/2000/svg" fill="green" width="20" height="20" viewBox="0 0 56 56"><path d="M 27.9999 51.9063 C 41.0546 51.9063 51.9063 41.0781 51.9063 28 C 51.9063 14.9453 41.0312 4.0937 27.9765 4.0937 C 14.8983 4.0937 4.0937 14.9453 4.0937 28 C 4.0937 41.0781 14.9218 51.9063 27.9999 51.9063 Z M 27.9999 47.9219 C 16.9374 47.9219 8.1014 39.0625 8.1014 28 C 8.1014 16.9609 16.9140 8.0781 27.9765 8.0781 C 39.0155 8.0781 47.8983 16.9609 47.9219 28 C 47.9454 39.0625 39.0390 47.9219 27.9999 47.9219 Z M 25.0468 39.7188 C 25.8202 39.7188 26.4530 39.3437 26.9452 38.6172 L 38.5234 20.4063 C 38.8046 19.9375 39.0858 19.3984 39.0858 18.8828 C 39.0858 17.8047 38.1483 17.1484 37.1640 17.1484 C 36.5312 17.1484 35.9452 17.5 35.5234 18.2031 L 24.9296 35.1484 L 19.4921 28.1172 C 18.9765 27.4141 18.4140 27.1563 17.7812 27.1563 C 16.7499 27.1563 15.9296 28 15.9296 29.0547 C 15.9296 29.5703 16.1405 30.0625 16.4687 30.5078 L 23.0312 38.6172 C 23.6640 39.3906 24.2733 39.7188 25.0468 39.7188 Z"/></svg>';
const ICON_ABORT_ANALYSIS = '<svg xmlns="http://www.w3.org/2000/svg" fill="red" width="20" height="20" viewBox="0 0 56 56"><path d="M 27.9999 51.9063 C 41.0546 51.9063 51.9063 41.0781 51.9063 28 C 51.9063 14.9453 41.0312 4.0937 27.9765 4.0937 C 14.8983 4.0937 4.0937 14.9453 4.0937 28 C 4.0937 41.0781 14.9218 51.9063 27.9999 51.9063 Z M 27.9999 47.9219 C 16.9374 47.9219 8.1014 39.0625 8.1014 28 C 8.1014 16.9609 16.9140 8.0781 27.9765 8.0781 C 39.0155 8.0781 47.8983 16.9609 47.9219 28 C 47.9454 39.0625 39.0390 47.9219 27.9999 47.9219 Z M 19.9843 37.9375 C 20.4999 37.9375 20.9687 37.7266 21.3202 37.3516 L 27.9765 30.6719 L 34.6327 37.3516 C 34.9843 37.7031 35.4530 37.9375 35.9921 37.9375 C 37.0234 37.9375 37.8671 37.0703 37.8671 36.0390 C 37.8671 35.5 37.6562 35.0547 37.3046 34.7031 L 30.6483 28.0469 L 37.3280 21.3437 C 37.7030 20.9453 37.8905 20.5469 37.8905 20.0312 C 37.8905 18.9766 37.0468 18.1563 36.0155 18.1563 C 35.5234 18.1563 35.1014 18.3203 34.7030 18.7188 L 27.9765 25.4219 L 21.2733 18.7422 C 20.9218 18.3672 20.4999 18.2031 19.9843 18.2031 C 18.9296 18.2031 18.1093 19 18.1093 20.0547 C 18.1093 20.5703 18.2968 21.0156 18.6718 21.3672 L 25.3280 28.0469 L 18.6718 34.7266 C 18.2968 35.0547 18.1093 35.5234 18.1093 36.0390 C 18.1093 37.0703 18.9296 37.9375 19.9843 37.9375 Z"/></svg>';

export class Menubar {
  private static unfinishedWorkers = 0;

  static register(ui: Draw.UI, sidebar: Sidebar, worker: AsyncWorker): void {

    this.addMenuActions(ui, sidebar, worker)

    // Adds menu
    ui.menubar.addMenu(mxResources.get('attackGraphs.attackGraphs'), (menu: import('mxgraph').mxPopupMenuHandler) => {
      ui.menus.addMenuItem(menu, 'attackGraphs.openDefaultAttributesDialog');
      ui.menus.addMenuItem(menu, 'attackGraphs.openComputedAttributesDialog');
      ui.menus.addMenuItem(menu, 'attackGraphs.openAggregationFunctionsDialog');
      ui.menus.addMenuItem(menu, 'attackGraphs.documentation');
      ui.menus.addMenuItem(menu, 'attackGraphs.showVersion');
    });

    // Reorders menubar
    if (ui.menubar.container.lastChild
      && ui.menubar.container.lastChild.previousSibling
      && ui.menubar.container.lastChild.previousSibling.previousSibling) {
      ui.menubar.container.insertBefore(ui.menubar.container.lastChild,
        ui.menubar.container.lastChild.previousSibling.previousSibling.previousSibling);
    }
  }

  private static addMenuActions(ui: Draw.UI, sidebar: Sidebar, worker: AsyncWorker) {
    ui.actions.addAction('attackGraphs.openDefaultAttributesDialog', () => {
      void (async () => {
        const dlg = new DefaultAttributesDialog(ui, 500, 500);
        dlg.init();

        if (await dlg.show()) {
          dlg.saveAttributes();
          sidebar.updatePalette();
          await AttributeRenderer.recalculateAllCells(ui, worker);
        }
      })();
    });

    ui.actions.addAction('attackGraphs.openComputedAttributesDialog', () => {
      void (async () => {
        const dlg = new ComputedAttributesDialog(ui, 500, 500);
        dlg.init()
        if (await dlg.show() && dlg.result) {
          dlg.setFunctionItems(dlg.result);
          sidebar.updatePalette();
          await AttributeRenderer.recalculateAllCells(ui, worker);
        }
      })();
    });

    ui.actions.addAction('attackGraphs.openAggregationFunctionsDialog', () => {
      void (async () => {
        const dlg = new AggregationFunctionListDialog(ui, 500, 500);
        dlg.init();
        if (await dlg.show() && dlg.result) {
          dlg.setFunctionItems(dlg.result);
          sidebar.updatePalette();
          await AttributeRenderer.recalculateAllCells(ui, worker);
        }
      })();
    });

    ui.actions.addAction('attackGraphs.applyAnalysis', () => {
      Menubar.stopSensitivityAnalysis(ui, worker, true);
    });

    ui.actions.addAction('attackGraphs.cancelAnalysis', () => {
      Menubar.stopSensitivityAnalysis(ui, worker, false);
    });


    const sensitivityAnalysisAction = ui.actions.addAction('attackGraphs.enableSensitivityAnalysis', () => {
      void (async () => {
        if (AttributeRenderer.sensitivityAnalysisEnabled()) {
          const cancel: [string, () => void][] = [[mxResources.get('attackGraphs.cancel'), () => {
            ui.hideDialog();
          }]];
          const result = await new BinaryPopupDialog(
            ui,
            mxResources.get('attackGraphs.acceptAnalysisDialog'),
            250, 200,
            mxResources.get('attackGraphs.acceptAnalysisTitle'),
            mxResources.get('attackGraphs.yes'),
            mxResources.get('attackGraphs.no'),
            undefined, undefined,
            cancel
          ).show();
          if (result !== undefined) {
            if (result) {
              SensitivityAnalysisCache.apply(ui);
            }
          } else {
            return;
          }
        }
        
        Menubar.startSensitivityAnalysis(ui, worker);
      })();
    });
    sensitivityAnalysisAction.setToggleAction(true);
    sensitivityAnalysisAction.setSelectedCallback(() => AttributeRenderer.sensitivityAnalysisEnabled());

    ui.toolbar.addSeparator();
    this.updateWorkersStatus(ui); // Updates the sensitivity analysis toolbar

    ui.actions.addAction('attackGraphs.documentation', () => {
      window.open('https://incyde-gmbh.github.io/drawio-plugin-attackgraphs/', '_blank')?.focus();
    });

    ui.actions.addAction('attackGraphs.showVersion', () => {
      void navigator.clipboard.writeText(__COMMIT_HASH__);
    });
  }

  private static updateSensitivityAnalysis(ui: Draw.UI, showIcons: boolean) {
    const startBtn = document.getElementById('ag_enableSensitivityAnalysis');
    const cnclBtn = document.getElementById('ag_cancelAnalysis');
    const applyBtn = document.getElementById('ag_applyAnalysis');

    if (AttributeRenderer.sensitivityAnalysisEnabled()) {
      if (startBtn) {
        ui.toolbar.container.removeChild(startBtn);
      }
      if (showIcons) {
        if (!applyBtn) {
          const item = ui.toolbar.addItem('', 'attackGraphs.applyAnalysis');
          item.id = 'ag_applyAnalysis';
          item.innerHTML = ICON_APPLY_ANALYSIS;
          item.style.margin = '0px';
          item.style.padding = '2px';
          item.setAttribute('title', `${mxResources.get('attackGraphs.acceptAnalysisTitle')}`);
        }
        if (!cnclBtn) {
          const item = ui.toolbar.addItem('', 'attackGraphs.cancelAnalysis');
          item.id = 'ag_cancelAnalysis';
          item.innerHTML = ICON_ABORT_ANALYSIS;
          item.style.margin = '0px';
          item.style.padding = '2px';
          item.setAttribute('title', `${mxResources.get('attackGraphs.abortAnalysisTitle')}`);
        }
      } else {
        if (applyBtn) {
          ui.toolbar.container.removeChild(applyBtn);
        }
        if (cnclBtn) {
          ui.toolbar.container.removeChild(cnclBtn);
        }
      }
    } else {
      if (applyBtn) {
        ui.toolbar.container.removeChild(applyBtn);
      }
      if (cnclBtn) {
        ui.toolbar.container.removeChild(cnclBtn);
      }
      if (showIcons) {
        if (!startBtn) {
          const item = ui.toolbar.addItem('', 'attackGraphs.enableSensitivityAnalysis');
          item.id = 'ag_enableSensitivityAnalysis';
          item.innerHTML = ICON_START_ANALYSIS;
          item.style.margin = '0px';
          item.style.padding = '2px';
          item.setAttribute('title', `${mxResources.get('attackGraphs.startAnalysisTitle')}`);
        }
      } else {
        if (startBtn) {
          ui.toolbar.container.removeChild(startBtn);
        }
      }
    }
  }

  private static updateWorkersStatus(ui: Draw.UI) {    
    const elem = document.getElementById('ag_workerStatus');
    if (this.unfinishedWorkers > 0) {
      if (!elem) {
        const item = document.createElement('progress');
        item.id = 'ag_workerStatus';
        item.title = `${mxResources.get('attackGraphs.workerStatus')}`;
        item.style.marginLeft = '10px';
        item.style.width = '75px';
        item.style.height = '30px';
        ui.toolbar.container.appendChild(item);
      }
      this.updateSensitivityAnalysis(ui, false);
    } else {
      if (elem) {
        ui.toolbar.container.removeChild(elem);
      }
      this.updateSensitivityAnalysis(ui, true);
    }
  }

  private static startSensitivityAnalysis(ui: Draw.UI, worker: AsyncWorker): void {
    void (async () => {
      AttributeRenderer.toggleSensitivityAnalysis();

      this.updateSensitivityAnalysis(ui, false);
      await AttributeRenderer.recalculateAllCells(ui, worker);
      this.updateSensitivityAnalysis(ui, true);

      ui.editor.graph.refresh();
    })();
  }

  private static stopSensitivityAnalysis(ui: Draw.UI, worker: AsyncWorker, doApply: boolean) {
    void (async () => {
      if (doApply) {
        SensitivityAnalysisCache.apply(ui);
      }
      AttributeRenderer.toggleSensitivityAnalysis();

      this.updateSensitivityAnalysis(ui, false);
      await AttributeRenderer.recalculateAllCells(ui, worker);
      this.updateSensitivityAnalysis(ui, true);

      ui.editor.graph.refresh();
    })();
  }

  static increaseUnfinishedWorkers(ui: Draw.UI) {
    if (this.unfinishedWorkers++ === 0) {
      this.updateWorkersStatus(ui);
    }
  }

  static decreaseUnfinishedWorkers(ui: Draw.UI) {
    if (this.unfinishedWorkers > 0 && --this.unfinishedWorkers === 0) {
      this.updateWorkersStatus(ui);
    }
  }
}
