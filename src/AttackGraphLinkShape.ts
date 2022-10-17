import { AttributeRenderer as AttributeRenderer } from './AttributeRenderer';

const PREFIX_LINK_PAGE_ID = 'data:page/id,';

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
      const allValues = cell.getCellValues();

      if ('link' in allValues) {
        const link = allValues['link'];
        if (link !== undefined && link.includes(PREFIX_LINK_PAGE_ID)) {
          const idx = link.substring(PREFIX_LINK_PAGE_ID.length);
          const page = AttackGraphLinkShape.ui.getPageById(idx);
          if (page) {
            const name = page.getName();
            const opacity = mxUtils.getValue(this.state.style, 'opacity', '100') as number;
            const fontSize = 11;

            c.setAlpha(opacity / 100);
            c.setFontStyle(mxConstants.DEFAULT_FONTSTYLE.toString());
            c.setFontColor('#000');
            c.setFontSize(fontSize);
            c.text(x + w/2, y + h + fontSize, 0, 0, '«' + name + '»', mxConstants.ALIGN_CENTER, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
          }
        }
      }
    }
  }

  static register(ui: Draw.UI): void {
    this.ui = ui;
    mxCellRenderer.registerShape(AttackGraphLinkShape.ID, AttackGraphLinkShape);
  }
}
