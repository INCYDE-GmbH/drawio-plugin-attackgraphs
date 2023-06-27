// This file provides typings for the environment provided by draw.io

declare namespace Draw {
  function loadPlugin(plugin: ((ui: UI) => any)): void;

  type DatabaseItem = {key: any, data: any};

  class UI {
    actions: Actions;
    currentPage: DiagramPage;
    pages: DiagramPage[];
    menubar: Menubar;
    menus: UIMenus;
    copiedValue: null;
    getCurrentFile(): File;
    getPageIndex(page: DiagramPage): number;
    getPageById(id: string, pages?: DiagramPage[]): DiagramPage | null;
    selectPage(page: DiagramPage, quiet?: boolean, viewState?: Object): void;
    sidebar: Sidebar;
    footerContainer: HTMLElement;
    fileNode: FileNode;
    editor: Editor;
    toolbar: Toolbar;
    showDialog(
      element: HTMLElement,
      width: number,
      height: number,
      modal: boolean, // Add background?
      closable: boolean, // Show close icon?
      onClose: (cancel?: boolean, isEsc?: boolean) => boolean | void, // Return value specifies whether dialog shall be closed
      noScroll?: boolean, // Dialog not scrollable?
      transparent?: boolean, // Dialog transparent?
      onResize?: () => void,
      ignoreBgClick?: boolean
    ): void;
    confirm(msg: string, okFn: () => void, cancelFn?: () => void, okLabel?: string, cancelLabel?: string, closable?: boolean): void;
    hideDialog(cancel?: boolean, isEsc?: boolean, matchContainer?: HTMLElement): void;
    removeLibrarySidebar(id: string);

    // IndexDB operations
    setDatabaseItem(key: any, data: any, success: (() => void) | null, error: (() => void) | null, storeName?: string): void;
    removeDatabaseItem(key: any, success: (() => void) | null, error: (() => void) | null, storeName?: string): void;
    getDatabaseItem(key: any, success: ((result?: DatabaseItem) => void) | null, error: (() => void) | null, storeName?: string): void;
    getDatabaseItems(success: ((result?: DatabaseItem[]) => void) | null, error: (() => void) | null, storeName?: string): void;
  }

  class DiagramPage {
    root: import('mxgraph').mxCell;
    viewState: Object;
    needsUpdate: boolean;
    getName(): string;
    getId(): string;
  }

  class Actions {
    addAction(label: string, arg1: (menu: any, parent: any) => void, arg2?: any, arg3?: any, keyCode?: string): Action;
    get(name: string): { funct: () => void };
  }

  class Action extends mxEventSource {

    setToggleAction(value: boolean);
    setSelectedCallback(funct: () => boolean);
  }

  class Toolbar {
    container: HTMLDivElement;
    addDropDownArrow(elt: any, arg1: string, arg2: number, arg3: number, arg4: number, arg5: number, arg6: number, arg7: number);
    addMenuFunction(arg0: string, arg1: string, arg2: boolean, arg3: (menu: import('mxgraph').mxPopupMenu) => void);
    addSeparator();
    addItem(sprite: string, key: string, container?: HTMLElement, callback?: () => void): HTMLAnchorElement;
  }

  class UIMenus {
    get(name: string): any;
    addSubmenu(name: string, menu: mxPopupMenuHandler, parent: any);
    addMenuItem(menu: import('mxgraph').mxPopupMenu, key: any, parent?: any, trigger?: any, sprite?: any, label?: any): Element;
    addMenuItems(menu: import('mxgraph').mxPopupMenu, key: any, parent?: any, trigger?: any, sprite?: any, label?: any): Element;
    createPopupMenu(menu: import('mxgraph').mxPopupMenu, cell: import('mxgraph').mxCell, evt: import('mxgraph').mxEvent): void;
  }

  class Menubar {
    menus: any;
    container: HTMLElement;
    addMenu(label: string, factoryMethod: (handler: mxPopupMenuHandler, cell: mxCell, me: mxMouseEvent) => any);
  }

  class Dialog {
    static closeImage: URL;
  }

  class Editor {
    graph: EditorGraph;
    cancelFirst: any;
  }

  interface EditorGraph {
    convertValueToString(cell: mxCell): string;
    isEnabled();
    insertVertex(parent: any, arg1: any, node: Node, arg3: number, arg4: number, arg5: number, arg6: number);
    isSelectionEmpty();
    getEditableCells(arg0: import('mxgraph').mxCell[]): import('mxgraph').mxCell[];
    addCell(cell: mxCell, parent?: mxCell);
    openLink(helpLink: string): void;
    refresh();
    addCellOverlay(cell: mxCell, overlay: mxCellOverlay);
    removeCellOverlays(cell: mxCell);
    addListener(event: mxEvent, callback: (sender: any, event: any) => void): void;
    getCellOverlays(cell: mxCell): mxCellOverlay[];
    getGlobalVariable: (args: any) => any;
    getExportVariables: any;
    model: import('mxgraph').mxGraphModel;
    getDefaultParent();
    getValue(cell: mxCell);
    getModel(): import('mxgraph').mxGraphModel;
    encodeCells(arg0: import('mxgraph').mxCell[]);
    getGlobalVariable: (args: any) => any;
    getExportVariables: any;
    getSelectionCell(): import('mxgraph').mxCell;
    getSelectionCells(): import('mxgraph').mxCell[];
    view: import('mxgraph').mxGraphView;
  }

  class SettingsDialog {
    ui: Draw.UI;
    container: HTMLElement;
    show();
  }

  class EditDataDialog {
    ui: Draw.UI;
    container: HTMLElement;
    show();
  }

  class Sidebar {
    container: HTMLElement;
    createVertexTemplate(style: string, width: number, height: number, value?: any, title?: string, showLabel?: boolean, showTitle?: boolean, allowCellsInserted?: boolean, showTooltip?: boolean): HTMLAnchorElement;
    createEdgeTemplate(style: string, width: number, height: number, value?: any, title?: string, showLabel?: boolean, allowCellsInserted?: boolean, showTooltip?: boolean): HTMLAnchorElement;
    addPalette(id: string, title: string, expanded: boolean, onInit: (content: HTMLDivElement, title?: HTMLAnchorElement) => void);
    //removePalette(id: string); // Buggy
    updatePalette();
  }

  class File {
    getTitle();
  }
}

declare class MovePage {
  ui: UI;
  oldIndex: number;
  newIndex: number;
  execute(): void;
}

declare class Graph {
  getExportVariables: () => any;
  getTooltipForCell(cell: import('mxgraph').mxCell): void;
}

class mxSettings {
  static settings: {
    language: string
  }
}

declare module 'mxgraph' {
  export interface mxAbstractCanvas2D {
    text(x, y, w, h, str, align, valign, wrap, format, overflow, clip, rotation, dir?): void;
  }
}

const mxIsElectron: boolean;

class mxValueChange {
  cell: import('mxgraph').mxCell;
  previous: Element;
  value: Element;
  execute(): void;
}
class mxTerminalChange {
  cell: import('mxgraph').mxCell;
  terminal: import('mxgraph').mxCell;
  previous: import('mxgraph').mxCell;
}
class mxChildChange {
  child: import('mxgraph').mxCell;
  parent: import('mxgraph').mxCell;
  terminal: import('mxgraph').mxCell;
  previous: import('mxgraph').mxCell;
}

class mxEventObject { }

type WorkerRequestTypes = 'Function' | 'Release';

interface WorkerRequest {
  readonly type: WorkerRequestTypes,
}
interface WorkerFunctionRequest extends WorkerRequest {
  readonly fn: string,
  readonly data: unknown,
}

interface WorkerResponse {
  result?: unknown,
  error?: string,
}

// Globally available mxgraph exports
const mxChildChange: typeof import('mxgraph').mxChildChange;
const mxClient: typeof import('mxgraph').mxClient;
const mxLog: typeof import('mxgraph').mxLog;
const mxObjectIdentity: typeof import('mxgraph').mxObjectIdentity;
const mxDictionary: typeof import('mxgraph').mxDictionary;
const mxResources: typeof import('mxgraph').mxResources;
const mxPoint: typeof import('mxgraph').mxPoint;
const mxRectangle: typeof import('mxgraph').mxRectangle;
const mxEffects: typeof import('mxgraph').mxEffects;
const mxUtils: typeof import('mxgraph').mxUtils;
const mxConstants: typeof import('mxgraph').mxConstants;
const mxEventObject: typeof import('mxgraph').mxEventObject;
const mxMouseEvent: typeof import('mxgraph').mxMouseEvent;
const mxEventSource: typeof import('mxgraph').mxEventSource;
const mxEvent: typeof import('mxgraph').mxEvent;
const mxXmlRequest: typeof import('mxgraph').mxXmlRequest;
const mxClipboard: typeof import('mxgraph').mxClipboard;
const mxWindow: typeof import('mxgraph').mxWindow;
const mxForm: typeof import('mxgraph').mxForm;
const mxImage: typeof import('mxgraph').mxImage;
const mxDivResizer: typeof import('mxgraph').mxDivResizer;
const mxDragSource: typeof import('mxgraph').mxDragSource;
const mxToolbar: typeof import('mxgraph').mxToolbar;
const mxUndoableEdit: typeof import('mxgraph').mxUndoableEdit;
const mxUndoManager: typeof import('mxgraph').mxUndoManager;
const mxUrlConverter: typeof import('mxgraph').mxUrlConverter;
const mxPanningManager: typeof import('mxgraph').mxPanningManager;
const mxPopupMenu: typeof import('mxgraph').mxPopupMenu;
const mxAutoSaveManager: typeof import('mxgraph').mxAutoSaveManager;
const mxAnimation: typeof import('mxgraph').mxAnimation;
const mxMorphing: typeof import('mxgraph').mxMorphing;
const mxImageBundle: typeof import('mxgraph').mxImageBundle;
const mxImageExport: typeof import('mxgraph').mxImageExport;
const mxAbstractCanvas2D: typeof import('mxgraph').mxAbstractCanvas2D;
const mxXmlCanvas2D: typeof import('mxgraph').mxXmlCanvas2D;
const mxSvgCanvas2D: typeof import('mxgraph').mxSvgCanvas2D;
const mxVmlCanvas2D: typeof import('mxgraph').mxVmlCanvas2D;
const mxGuide: typeof import('mxgraph').mxGuide;
const mxShape: typeof import('mxgraph').mxShape;
const mxStencil: typeof import('mxgraph').mxStencil;
const mxStencilRegistry: typeof import('mxgraph').mxStencilRegistry;
const mxMarker: typeof import('mxgraph').mxMarker;
const mxActor: typeof import('mxgraph').mxActor;
const mxCloud: typeof import('mxgraph').mxCloud;
const mxRectangleShape: typeof import('mxgraph').mxRectangleShape;
const mxEllipse: typeof import('mxgraph').mxEllipse;
const mxDoubleEllipse: typeof import('mxgraph').mxDoubleEllipse;
const mxRhombus: typeof import('mxgraph').mxRhombus;
const mxPolyline: typeof import('mxgraph').mxPolyline;
const mxArrow: typeof import('mxgraph').mxArrow;
const mxArrowConnector: typeof import('mxgraph').mxArrowConnector;
const mxText: typeof import('mxgraph').mxText;
const mxTriangle: typeof import('mxgraph').mxTriangle;
const mxHexagon: typeof import('mxgraph').mxHexagon;
const mxLine: typeof import('mxgraph').mxLine;
const mxImageShape: typeof import('mxgraph').mxImageShape;
const mxLabel: typeof import('mxgraph').mxLabel;
const mxCylinder: typeof import('mxgraph').mxCylinder;
const mxConnector: typeof import('mxgraph').mxConnector;
const mxSwimlane: typeof import('mxgraph').mxSwimlane;
const mxGraphLayout: typeof import('mxgraph').mxGraphLayout;
const mxStackLayout: typeof import('mxgraph').mxStackLayout;
const mxPartitionLayout: typeof import('mxgraph').mxPartitionLayout;
const mxCompactTreeLayout: typeof import('mxgraph').mxCompactTreeLayout;
const mxRadialTreeLayout: typeof import('mxgraph').mxRadialTreeLayout;
const mxFastOrganicLayout: typeof import('mxgraph').mxFastOrganicLayout;
const mxCircleLayout: typeof import('mxgraph').mxCircleLayout;
const mxParallelEdgeLayout: typeof import('mxgraph').mxParallelEdgeLayout;
const mxCompositeLayout: typeof import('mxgraph').mxCompositeLayout;
const mxEdgeLabelLayout: typeof import('mxgraph').mxEdgeLabelLayout;
const mxGraphAbstractHierarchyCell: typeof import('mxgraph').mxGraphAbstractHierarchyCell;
const mxGraphHierarchyNode: typeof import('mxgraph').mxGraphHierarchyNode;
const mxGraphHierarchyEdge: typeof import('mxgraph').mxGraphHierarchyEdge;
const mxGraphHierarchyModel: typeof import('mxgraph').mxGraphHierarchyModel;
const mxSwimlaneModel: typeof import('mxgraph').mxSwimlaneModel;
const mxHierarchicalLayoutStage: typeof import('mxgraph').mxHierarchicalLayoutStage;
const mxMedianHybridCrossingReduction: typeof import('mxgraph').mxMedianHybridCrossingReduction;
const mxMinimumCycleRemover: typeof import('mxgraph').mxMinimumCycleRemover;
const mxCoordinateAssignment: typeof import('mxgraph').mxCoordinateAssignment;
const mxSwimlaneOrdering: typeof import('mxgraph').mxSwimlaneOrdering;
const mxHierarchicalLayout: typeof import('mxgraph').mxHierarchicalLayout;
const mxSwimlaneLayout: typeof import('mxgraph').mxSwimlaneLayout;
const mxGraphModel: typeof import('mxgraph').mxGraphModel;
const mxCell: typeof import('mxgraph').mxCell;
const mxGeometry: typeof import('mxgraph').mxGeometry;
const mxCellPath: typeof import('mxgraph').mxCellPath;
const mxPerimeter: typeof import('mxgraph').mxPerimeter;
const mxPrintPreview: typeof import('mxgraph').mxPrintPreview;
const mxStylesheet: typeof import('mxgraph').mxStylesheet;
const mxCellState: typeof import('mxgraph').mxCellState;
const mxGraphSelectionModel: typeof import('mxgraph').mxGraphSelectionModel;
const mxCellEditor: typeof import('mxgraph').mxCellEditor;
const mxCellRenderer: typeof import('mxgraph').mxCellRenderer;
const mxEdgeStyle: typeof import('mxgraph').mxEdgeStyle;
const mxStyleRegistry: typeof import('mxgraph').mxStyleRegistry;
const mxGraphView: typeof import('mxgraph').mxGraphView;
const mxGraph: typeof import('mxgraph').mxGraph;
const mxCellOverlay: typeof import('mxgraph').mxCellOverlay;
const mxOutline: typeof import('mxgraph').mxOutline;
const mxMultiplicity: typeof import('mxgraph').mxMultiplicity;
const mxLayoutManager: typeof import('mxgraph').mxLayoutManager;
const mxSwimlaneManager: typeof import('mxgraph').mxSwimlaneManager;
const mxTemporaryCellStates: typeof import('mxgraph').mxTemporaryCellStates;
const mxCellStatePreview: typeof import('mxgraph').mxCellStatePreview;
const mxConnectionConstraint: typeof import('mxgraph').mxConnectionConstraint;
const mxGraphHandler: typeof import('mxgraph').mxGraphHandler;
const mxPanningHandler: typeof import('mxgraph').mxPanningHandler;
const mxPopupMenuHandler: typeof import('mxgraph').mxPopupMenuHandler;
const mxCellMarker: typeof import('mxgraph').mxCellMarker;
const mxSelectionCellsHandler: typeof import('mxgraph').mxSelectionCellsHandler;
const mxConnectionHandler: typeof import('mxgraph').mxConnectionHandler;
const mxConstraintHandler: typeof import('mxgraph').mxConstraintHandler;
const mxRubberband: typeof import('mxgraph').mxRubberband;
const mxHandle: typeof import('mxgraph').mxHandle;
const mxVertexHandler: typeof import('mxgraph').mxVertexHandler;
const mxEdgeHandler: typeof import('mxgraph').mxEdgeHandler;
const mxElbowEdgeHandler: typeof import('mxgraph').mxElbowEdgeHandler;
const mxEdgeSegmentHandler: typeof import('mxgraph').mxEdgeSegmentHandler;
const mxKeyHandler: typeof import('mxgraph').mxKeyHandler;
const mxTooltipHandler: typeof import('mxgraph').mxTooltipHandler;
const mxCellTracker: typeof import('mxgraph').mxCellTracker;
const mxCellHighlight: typeof import('mxgraph').mxCellHighlight;
const mxDefaultKeyHandler: typeof import('mxgraph').mxDefaultKeyHandler;
const mxDefaultPopupMenu: typeof import('mxgraph').mxDefaultPopupMenu;
const mxDefaultToolbar: typeof import('mxgraph').mxDefaultToolbar;
const mxEditor: typeof import('mxgraph').mxEditor;
const mxCodecRegistry: typeof import('mxgraph').mxCodecRegistry;
const mxCodec: typeof import('mxgraph').mxCodec;
const mxObjectCodec: typeof import('mxgraph').mxObjectCodec;
