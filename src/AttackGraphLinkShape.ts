import { CellStyles } from './Analysis/CellStyles';
import { AttributeRenderer } from './AttributeRenderer';

export class AttackGraphLinkShape extends mxEllipse {
  public static readonly ID = 'attackgraphs.link';
  private static readonly defaultFontSize = 11;
  private static readonly defaultFontColor = '#000000';

  constructor(bounds: import('mxgraph').mxRectangle, fill: string, stroke: string, strokewidth?: number) {
    super(bounds, fill, stroke, strokewidth);
  }

  paintVertexShape(c: import('mxgraph').mxAbstractCanvas2D, x: number, y: number, w: number, h: number): void {
    let circDiameter = (h > w) ? w : h;

    if (this.state) {
      const cell = AttributeRenderer.nodeAttributes(this.state.cell);
      const allValues = cell.getAllValues().current;
      const fontSize = AttackGraphLinkShape.defaultFontSize;

      if ('_error' in allValues) {
        circDiameter = (h - 2 * fontSize > w) ? w : h - 2 * fontSize;
        this.writeText('!! No Link !!', x + w * 0.5, y + circDiameter + fontSize, fontSize, '#f00', c);
      } else {
        const page = cell.getReferencedPage();
        if (page) {
          circDiameter = (h - 2 * fontSize > w) ? w : h - 2 * fontSize;
          this.writeText('«' + page.getName() + '»', x + w * 0.5, y + circDiameter + fontSize, fontSize, AttackGraphLinkShape.defaultFontColor, c);
        }
      }

      if (!cell.getEnabledStatus()) {
        c.setAlpha(CellStyles.DISABLED_CELL_ALPHA);
      }
    }

    super.paintVertexShape(c, x + (w - circDiameter) * 0.5, y, circDiameter, circDiameter);

    if (this.state) {
      const label = AttributeRenderer.nodeAttributes(this.state.cell).getCellLabel() || '';
      const fontSize = mxUtils.getValue(this.state.style, 'fontSize', AttackGraphLinkShape.defaultFontSize + 1) as number;
      this.writeText(label, x + w * 0.5, y + circDiameter * 0.5, fontSize, AttackGraphLinkShape.defaultFontColor, c);
    }
  }

  private writeText(text: string, x: number, y: number, size: number, color: string, c: import('mxgraph').mxAbstractCanvas2D): void {
    if (this.state) {
      const opacity = mxUtils.getValue(this.state.style, 'opacity', '100') as number;
      c.setAlpha(opacity / 100);
      c.setFontStyle(mxConstants.DEFAULT_FONTSTYLE.toString());
      c.setFontColor(color);
      c.setFontSize(size);
      c.text(x, y, 0, 0, text, mxConstants.ALIGN_CENTER, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
    }
  }

  static register(): void {
    mxCellRenderer.registerShape(AttackGraphLinkShape.ID, AttackGraphLinkShape);
  }
}
