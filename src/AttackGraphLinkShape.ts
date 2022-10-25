import { AttributeRenderer as AttributeRenderer } from './AttributeRenderer';

export class AttackGraphLinkShape extends mxEllipse {
  public static readonly ID = 'attackgraphs.link';
  private static ui: Draw.UI;

  constructor(bounds: import('mxgraph').mxRectangle, fill: string, stroke: string, strokewidth?: number) {
    super(bounds, fill, stroke, strokewidth);
  }

  paintVertexShape(c: import('mxgraph').mxAbstractCanvas2D, x: number, y: number, w: number, h: number): void {
    super.paintVertexShape(c, x, y, w, h);

    if (this.state) {
      const cell = AttributeRenderer.nodeAttributes(this.state.cell);
      const allValues = cell.getAllValues().current;
      const fontSize = 11;

      if ('_error' in allValues) {
        this.writeText('!! No Link !!', x + w/2, y + h + fontSize, fontSize, '#f00', c);
        return;
      }

      const page = cell.getReferencedPage();
      if (page) {
        this.writeText('«' + page.getName() + '»', x + w/2, y + h + fontSize, fontSize, '#000', c);
      }
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

  static register(ui: Draw.UI): void {
    this.ui = ui;
    mxCellRenderer.registerShape(AttackGraphLinkShape.ID, AttackGraphLinkShape);
  }
}
