import { AttackGraphIconLegendShape } from '../AttackGraphIconLegendShape';
import { AttackGraphLinkShape } from '../AttackGraphLinkShape';
import { AttackGraphNodeShape } from '../AttackGraphNodeShape';
import { AttributeRenderer } from '../AttributeRenderer';

type StylesMap = { [key: string]: string | null };

export class CellStyles {
  static ui: Draw.UI
  cell: import('mxgraph').mxCell;

  constructor(cell: import('mxgraph').mxCell) {
    this.cell = cell;
  }

  static register(ui: Draw.UI): void {
    this.ui = ui;
  }

  static parseStyles(cell: import('mxgraph').mxCell): StylesMap {
    const result: StylesMap = {};
    if (cell.style) {
      const tokens = cell.style.split(';');
      for (const token of tokens) {
        if (token.length === 0) {
          continue;
        }

        const pos = token.indexOf('=');

        if (pos >= 0) {
          const key = token.substring(0, pos);
          const value = token.substring(pos + 1);

          result[key] = value;
        } else {
          result[token] = null;
        }
      }
    }
    return result;
  }

  // Backwards compatability
  parseStyles(): StylesMap {
    return CellStyles.parseStyles(this.cell);
  }

  static isAttackgraphCell(cell: import('mxgraph').mxCell): boolean {
    const styles = CellStyles.parseStyles(cell);
    return 'shape' in styles
      && (styles['shape'] === AttackGraphNodeShape.ID
          || styles['shape'] === AttackGraphIconLegendShape.ID
          || styles['shape'] === AttackGraphLinkShape.ID
          || styles['shape'] === 'or'
          || styles['shape'] === 'xor');
  }

  // Backwards compatability
  isAttackgraphCell(): boolean {
    return CellStyles.isAttackgraphCell(this.cell);
  }

  static isLinkNode(cell: import('mxgraph').mxCell): boolean {
    const styles = CellStyles.parseStyles(cell);
    return 'shape' in styles && styles['shape'] === AttackGraphLinkShape.ID;
  }

  // Backwards compatability
  isLinkNode(): boolean {
    return CellStyles.isLinkNode(this.cell)
  }

  private static encodeStyles(styles: StylesMap) {
    let style = '';
    for (const [k, v] of Object.entries(styles)) {
      style += (v) ? `${k}=${v};` :  `${k};` ;
    }
    return style;
  }

  private renderMarkedEdge(): void {
    const styles = CellStyles.parseStyles(this.cell);
    styles['strokeColor'] = '#EA6B66';
    this.cell.style = CellStyles.encodeStyles(styles);
  }

  private resetMarkedEdge(): void {
    const styles = CellStyles.parseStyles(this.cell);
    styles['strokeColor'] = '#000000';
    this.cell.style = CellStyles.encodeStyles(styles);
  }

  private renderHighlightedEdge(): void {
    const styles = CellStyles.parseStyles(this.cell);
    styles['strokeWidth'] = '4';
    this.cell.style = CellStyles.encodeStyles(styles);
  }

  private renderFatEdge(): void {
    const styles = CellStyles.parseStyles(this.cell);
    styles['strokeWidth'] = '2';
    this.cell.style = CellStyles.encodeStyles(styles);
  }

  private renderNormalEdge(): void {
    const styles = CellStyles.parseStyles(this.cell);
    styles['strokeWidth'] = '1';
    this.cell.style = CellStyles.encodeStyles(styles);
  }

  private resetEdge(): void {
    this.renderNormalEdge();
    this.resetMarkedEdge();
  }

  updateEdgeStyle(): void {
    this.resetEdge();
    if ((this.cell.target !== null && this.cell.source !== null) &&
      (CellStyles.isAttackgraphCell(this.cell.target) || CellStyles.isAttackgraphCell(this.cell.source))) {
      this.renderFatEdge();
    }
  }

  static updateAllEdgeStyles(mxGraphModel: import('mxgraph').mxGraphModel): void {
    for (const cell of Object.values(mxGraphModel.cells as { number: import('mxgraph').mxCell })) {
      if (mxGraphModel.isEdge(cell)) {
        new CellStyles(cell).updateEdgeStyle();
      }
    }
  }

  static updateConnectedEdgesStyle(cell: import('mxgraph').mxCell, selected: boolean, shallMark: boolean) {
    if (!cell.edges) {
      return;
    }

    for (const edge of cell.edges) {
      if (edge.target !== null
          && edge.source !== null
          && CellStyles.isAttackgraphCell(edge.target)
          && CellStyles.isAttackgraphCell(edge.source)) {
        const styles = new CellStyles(edge);
        if (selected) {
          styles.renderHighlightedEdge();
        } else {
          styles.renderFatEdge();
        }
        styles.redraw();
      }
    }

    CellStyles.markEdges(cell, shallMark);
  }

  private static markEdges(cell: import('mxgraph').mxCell, shallMark: boolean): void {
    if (!cell.edges) {
      return;
    }

    const values = AttributeRenderer.nodeAttributes(cell).getAggregatedCellValues();
    const markings = ('_marking' in values) ? values['_marking'].split(';') : null;

    for (const edge of cell.edges) {
      if (edge.target !== null
          && edge.source !== null
          && CellStyles.isAttackgraphCell(edge.target)
          && CellStyles.isAttackgraphCell(edge.source)
          && edge.source.id === cell.id) {
        const target = edge.target;
        const mark = (markings && markings.includes(target.id)) as boolean;

        if (mark && target.id !== cell.id) {
          CellStyles.markEdges(target, shallMark);
        }

        const styles = new CellStyles(edge);
        if (shallMark && mark) {
          styles.renderHighlightedEdge();
          styles.renderMarkedEdge();
        } else {
          styles.renderFatEdge();
          styles.resetMarkedEdge();
        }
        styles.redraw();
      }
    }
  }

  public redraw(): void {  
    const view = CellStyles.ui.editor.graph.view;
    const state = view.getState(this.cell);

    state.style = view.graph.getCellStyle(this.cell); // hardcoded because state.invalidStyle is not a defined property in the imported mxgraph library
    state.invalid = true; // force mxGraphView to redraw the cell
    
    // Redraw cell
    view.validateCellState(this.cell, false);
  }
}
