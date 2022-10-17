import { AttackGraphIconLegendShape } from '../AttackGraphIconLegendShape';
import { AttackGraphLinkShape } from '../AttackGraphLinkShape';
import { AttackGraphNodeShape } from '../AttackGraphNodeShape';
import { AttributeRenderer } from '../AttributeRenderer';

export class CellStyles {
  cell: import('mxgraph').mxCell;
  private selected = false;
  private marked = false;

  constructor(cell: import('mxgraph').mxCell) {
    this.cell = cell;
  }

  parseStyles(): { [key: string]: string | null } {
    const result: { [key: string]: string | null } = {};
    if (this.cell.style) {
      const tokens = this.cell.style.split(';');
      for (const token of tokens) {
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

  setSelected(selected: boolean): void {
    this.selected = selected;
  }

  setMarked(marked: boolean): void {
    this.marked = marked;
  }

  private encodeStyles(styles: { [key: string]: string | null }) {
    let style = '';
    for (const [k, v] of Object.entries(styles)) {
      style += (v) ? `${k}=${v};` :  `${k};` ;
    }
    return style;
  }

  renderMarkedEdge(): void {
    const styles = this.parseStyles();
    styles['strokeColor'] = '#EA6B66';
    this.cell.style = this.encodeStyles(styles);
  }

  resetMarkedEdge(): void {
    const styles = this.parseStyles();
    delete styles['strokeColor'];
    this.cell.style = this.encodeStyles(styles);
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
    this.resetMarkedEdge();
    this.cell.style = this.encodeStyles(styles);
  }

  updateEdgeStyle(): void {
    const style = new CellStyles(this.cell);

    if ((this.cell.target !== null && this.cell.source !== null) &&
      (new CellStyles(this.cell.target).isAttackgraphCell() || new CellStyles(this.cell.source).isAttackgraphCell())) {
        if (this.marked) {
          style.renderHighlightedEdge();
          style.renderMarkedEdge();
        } else if (this.selected) {
          style.renderHighlightedEdge();
          style.resetMarkedEdge();
        } else {
          style.renderFatEdge();
          style.resetMarkedEdge();
        }
    } else {
      style.resetEdge();
    }
  }

  static updateAllEdgeStyles(mxGraphModel: import('mxgraph').mxGraphModel): void {
    for (const cell of Object.values(mxGraphModel.cells as { number: import('mxgraph').mxCell })) {
      if (mxGraphModel.isEdge(cell)) {
        new CellStyles(cell).updateEdgeStyle();
      }
    }
  }

  updateConnectedEdgesStyle(selected: boolean, shallMark: boolean) {
    if (this.cell.edges) {
      const values = AttributeRenderer.nodeAttributes(this.cell).getAggregatedCellValues();
      const markings = ('_marking' in values) ? values['_marking'].split(';') : null;

      for (const edge of this.cell.edges) {
        const style = new CellStyles(edge);
        style.setSelected(selected);

        // Mark edge?
        if (edge.target
            && edge.source
            && edge.target.id !== this.cell.id
            && edge.source.id === this.cell.id) {
          const mark = (markings && markings.includes(edge.target.id)) as boolean;
          if (mark) {
            style.setMarked(shallMark);
            new CellStyles(edge.target).updateConnectedEdgesStyle(false, shallMark);
          }
        }

        style.updateEdgeStyle();
      }
    }
  }
}
