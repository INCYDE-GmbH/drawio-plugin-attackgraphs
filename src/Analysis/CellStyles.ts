import { AttackGraphIconLegendShape } from '../AttackGraphIconLegendShape';
import { AttackGraphNodeShape } from '../AttackGraphNodeShape';

export class CellStyles {
  cell: import('mxgraph').mxCell;
  private selected = false;

  constructor(cell: import('mxgraph').mxCell) {
    this.cell = cell;
  }

  parseStyles(): { [key: string]: string } {
    const result: { [key: string]: string } = {};
    if (this.cell.style) {
      const tokens = this.cell.style.split(';');
      for (const token of tokens) {
        const pos = token.indexOf('=');

        if (pos >= 0) {
          const key = token.substring(0, pos);
          const value = token.substring(pos + 1);

          result[key] = value;
        }
      }
    }
    return result;
  }

  isAttackgraphCell(): boolean {
    const styles = this.parseStyles();
    return 'shape' in styles && (styles['shape'] === AttackGraphNodeShape.ID || styles['shape'] === AttackGraphIconLegendShape.ID || styles['shape'] === 'or' || styles['shape'] === 'xor');
  }

  setSelected(selected: boolean): void {
    this.selected = selected;
  }

  private encodeStyles(styles: { [key: string]: string }) {
    let style = '';
    for (const [k, v] of Object.entries(styles)) {
      style += `${k}=${v};`;
    }
    return style;
  }

  renderHighlightedEdge(): void {
    const styles = this.parseStyles();
    styles['strokeWidth'] = '4';
    this.cell.style = this.encodeStyles(styles);
  }

  renderFatEdge(): void {
    const styles = this.parseStyles();
    styles['strokeWidth'] = '2';
    this.cell.style = this.encodeStyles(styles);
  }

  resetEdge(): void {
    const styles = this.parseStyles();
    styles['strokeWidth'] = '1';
    this.cell.style = this.encodeStyles(styles);
  }

  updateEdgeStyle(): void {
    if ((this.cell.target !== null && this.cell.source !== null) &&
      (new CellStyles(this.cell.target).isAttackgraphCell() || new CellStyles(this.cell.source).isAttackgraphCell())) {
        if (this.selected) {
          new CellStyles(this.cell).renderHighlightedEdge();
        } else {
          new CellStyles(this.cell).renderFatEdge();
        }
    } else {
      new CellStyles(this.cell).resetEdge();
    }
  }

  static updateAllEdgeStyles(mxGraphModel: import('mxgraph').mxGraphModel): void {
    for (const cell of Object.values(mxGraphModel.cells as { number: import('mxgraph').mxCell })) {
      if (mxGraphModel.isEdge(cell)) {
        new CellStyles(cell).updateEdgeStyle();
      }
    }
  }

  updateConnectedEdgesStyle() {
    for (const edge of this.cell.edges) {
      const style = new CellStyles(edge);
      style.setSelected(this.selected);
      style.updateEdgeStyle();
    }
  }
}
