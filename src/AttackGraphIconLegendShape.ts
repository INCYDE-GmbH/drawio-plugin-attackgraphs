import { RootAttributeProvider } from './Analysis/RootAttributeProvider';
import { AttributeRenderer } from './AttributeRenderer';
import { STORAGE_NAME_GLOBAL_ATTRIBUTES } from './CellUtils';
import { Framework7Icons } from './Framework7Icons';
import { GlobalAttribute } from './Model';


export class AttackGraphIconLegendShape extends mxRectangleShape {
  public static readonly ID = 'attackgraphs.iconLegend';
  private static iconWidthHeight = 20;
  private static paddingTop = 10;
  private static textWidth = 20;
  private static paddingBefore = 5;
  private static paddingBelow = 2;
  private static fontSize = 12;

  private static height = 50;

  constructor(bounds: import('mxgraph').mxRectangle, fill: string, stroke: string, strokewidth?: number) {
    super(bounds, fill, stroke, strokewidth);
  }

  drawAttributeShapes(c: import('mxgraph').mxAbstractCanvas2D, x: number, y: number, w: number, h: number, attrs: GlobalAttribute[]): void {
    super.paintVertexShape(c, x, y, w, h);
    const opacity = mxUtils.getValue(this.state?.style, 'opacity', '100') as string;
    c.translate(x, y);


    c.setAlpha(parseInt(opacity) / 100);
    c.setFontColor('#000');
    c.setFontSize(AttackGraphIconLegendShape.fontSize);

    let i = 0;
    const graph = this.state?.view.graph;
    for (const attribute of attrs) {
      if (graph !== undefined) {
        if (Framework7Icons.Icons[attribute.iconName] !== undefined) {
          const icon = `data:image/svg+xml;utf8,${Framework7Icons.Icons[attribute.iconName]}`;
          c.image(AttackGraphIconLegendShape.paddingBefore, AttackGraphIconLegendShape.paddingTop + i * (AttackGraphIconLegendShape.paddingBelow + AttackGraphIconLegendShape.iconWidthHeight + AttackGraphIconLegendShape.textWidth + AttackGraphIconLegendShape.paddingBelow), AttackGraphIconLegendShape.textWidth, AttackGraphIconLegendShape.iconWidthHeight, icon, true, false, false);
          c.text(2 * AttackGraphIconLegendShape.paddingBefore + AttackGraphIconLegendShape.textWidth, AttackGraphIconLegendShape.paddingTop + i * (AttackGraphIconLegendShape.paddingBelow + AttackGraphIconLegendShape.iconWidthHeight + AttackGraphIconLegendShape.textWidth + AttackGraphIconLegendShape.paddingBelow) + AttackGraphIconLegendShape.iconWidthHeight / 2, AttackGraphIconLegendShape.textWidth, AttackGraphIconLegendShape.iconWidthHeight, attribute.name, mxConstants.ALIGN_LEFT, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
          i++;
        }
      }
    }
  }

  paintVertexShape(c: import('mxgraph').mxAbstractCanvas2D, x: number, y: number, w: number, h: number): void {

    if (this.state) {
      const graph = this.state.view.graph as unknown as Draw.EditorGraph;
      const cell = AttributeRenderer.nodeAttributes(this.state.cell);
      const globalAttributes = AttributeRenderer.rootAttributes(graph).getGlobalAttributes();
      const localattributes = cell.getGroupedValuesFromCell(STORAGE_NAME_GLOBAL_ATTRIBUTES);
      const attributes = (globalAttributes !== null) ? globalAttributes : localattributes;
      const renderableAttributes = RootAttributeProvider.getRenderableAttributes(attributes as GlobalAttribute[]);
      this.drawAttributeShapes(c, x, y, w, h, renderableAttributes || []);
    }
  }

  static register(): void {
    mxCellRenderer.registerShape(AttackGraphIconLegendShape.ID, AttackGraphIconLegendShape);
  }

  static updateHeight(count: number): void {
    this.height = count * (2 * this.paddingBelow + 2 * this.iconWidthHeight);
  }

  static getHeight(): number {
    return this.height;
  }
}


