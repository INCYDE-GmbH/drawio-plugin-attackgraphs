import { AttackGraphIconLegendShape } from '../AttackGraphIconLegendShape';
import { AttackGraphLinkShape } from '../AttackGraphLinkShape';
import { AttackGraphNodeShape } from '../AttackGraphNodeShape';
import { AttributeRenderer } from '../AttributeRenderer';

type CellStyle = { [key: string]: string | null };

export class CellStyles {
  cell: import('mxgraph').mxCell;

  constructor(cell: import('mxgraph').mxCell) {
    this.cell = cell;
  }

  parseStyles(): CellStyle {
    const result: CellStyle = {};
    if (this.cell.style) {
      const tokens = this.cell.style.split(';');
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

  isAttackgraphCell(): boolean {
    const styles = this.parseStyles();
    return 'shape' in styles
      && (styles['shape'] === AttackGraphNodeShape.ID
          || styles['shape'] === AttackGraphIconLegendShape.ID
          || styles['shape'] === AttackGraphLinkShape.ID
          || styles['shape'] === 'or'
          || styles['shape'] === 'xor');
  }

  isLinkNode(): boolean {
    const styles = this.parseStyles();
    return 'shape' in styles && styles['shape'] === AttackGraphLinkShape.ID;
  }

  private encodeStyles(styles: CellStyle) {
    let style = '';
    for (const [k, v] of Object.entries(styles)) {
      style += (v) ? `${k}=${v};` :  `${k};` ;
    }
    return style;
  }

  private renderMarkedEdge(): void {
    const styles = this.parseStyles();
    styles['strokeColor'] = '#EA6B66';
    this.cell.style = this.encodeStyles(styles);
  }

  private resetMarkedEdge(): void {
    const styles = this.parseStyles();
    styles['strokeColor'] = '#000000';
    this.cell.style = this.encodeStyles(styles);
  }

  private renderHighlightedEdge(): void {
    const styles = this.parseStyles();
    styles['strokeWidth'] = '4';
    this.cell.style = this.encodeStyles(styles);
  }

  private renderFatEdge(): void {
    const styles = this.parseStyles();
    styles['strokeWidth'] = '2';
    this.cell.style = this.encodeStyles(styles);
  }

  private resetEdge(): void {
    const styles = this.parseStyles();
    styles['strokeWidth'] = '1';
    this.resetMarkedEdge();
    this.cell.style = this.encodeStyles(styles);
  }

  updateEdgeStyle(): void {
    if ((this.cell.target !== null && this.cell.source !== null) &&
      (new CellStyles(this.cell.target).isAttackgraphCell() || new CellStyles(this.cell.source).isAttackgraphCell())) {
      this.renderFatEdge();
    } else {
      this.resetEdge();
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

    const values = AttributeRenderer.nodeAttributes(cell).getAggregatedCellValues();
    const markings = ('_marking' in values) ? values['_marking'].split(';') : null;

    for (const edge of cell.edges) {
      if (edge.target !== null && edge.source !== null &&
          (new CellStyles(edge.target).isAttackgraphCell() || new CellStyles(edge.source).isAttackgraphCell())) {
        const styles = new CellStyles(edge);
        let mark = false;

        if (edge.target.id !== cell.id && edge.source.id === cell.id) {
          mark = (markings && markings.includes(edge.target.id)) as boolean;
          if (mark) {
            CellStyles.updateConnectedEdgesStyle(edge.target, false, shallMark);
          }
        }

        if (shallMark && mark) {
          styles.renderHighlightedEdge();
          styles.renderMarkedEdge();
        } else if (selected) {
          styles.renderHighlightedEdge();
          styles.resetMarkedEdge();
        } else {
          styles.renderFatEdge();
          styles.resetMarkedEdge();
        }
      }
    }
  }
}
