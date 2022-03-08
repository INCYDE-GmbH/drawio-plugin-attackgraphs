import { Framework7Icons } from './Framework7Icons';
import { NodeValues } from './Model';
import { AttributeRenderer as AttributeRenderer } from './AttributeRenderer';
import { AttributeProvider } from './Analysis/AttributeProvider';

export class AttackGraphNodeShape extends mxRectangleShape {
  public static readonly ID = 'attackgraphs.node';

  constructor(bounds: import('mxgraph').mxRectangle, fill: string, stroke: string, strokewidth?: number) {
    super(bounds, fill, stroke, strokewidth);
  }

  drawAttributeShapes(c: import('mxgraph').mxAbstractCanvas2D, x: number, y: number, w: number, h: number, attrs: NodeValues): void {
    const opacity = mxUtils.getValue(this.state?.style, 'opacity', '100') as string;
    c.translate(x, y);

    const iconWidthHeight = 20
    const textWidthPerChar = 8;
    const diffPadding = 2;
    const paddingBefore = 5;
    const paddingBelow = 2;
    const paddingAfter = 2;
    const fontSize = 12;

    c.setAlpha(parseInt(opacity) / 100);
    c.setFontColor('#000');
    c.setFontSize(fontSize);

    const sortedAttributes: { [name: string]: { oldValue: string, currentValue: string } } = {};

    for (const [k, v] of Object.entries(attrs.old)) {
      if (AttributeProvider.shouldRenderAttribute(k)) {
        sortedAttributes[k] = { oldValue: v, currentValue: '' }
      }
    }

    for (const [k, v] of Object.entries(attrs.current)) {
      if (AttributeProvider.shouldRenderAttribute(k)) {
        sortedAttributes[k] = { ...sortedAttributes[k], currentValue: v }
      }
    }

    let currentOffset = 0;
    const graph = this.state?.view.graph;
    for (const [key, { oldValue, currentValue }] of Object.entries(sortedAttributes)) {
      if (key === 'label' || key === 'tooltip') {
        continue;
      }

      let icon = `data:image/svg+xml;utf8,${Framework7Icons.Icons.question}`;
      if (graph !== undefined) {
        const globalAttribute = AttributeRenderer.rootAttributes(graph as unknown as Draw.EditorGraph).getGlobalAttribute(key);
        if (globalAttribute !== null) {
          if (Framework7Icons.Icons[globalAttribute.iconName] !== undefined) {
            icon = `data:image/svg+xml;utf8,${Framework7Icons.Icons[globalAttribute.iconName]}`;
          }
        }
      }

      currentOffset += paddingBefore;

      c.image(currentOffset, h - paddingBelow - iconWidthHeight, iconWidthHeight, iconWidthHeight, icon, true, false, false);
      currentOffset += iconWidthHeight;
      currentOffset += paddingAfter;

      if (currentValue.toString() !== '') {
        const currentValueWidth = currentValue.toString().length * textWidthPerChar;
        c.setFontStyle(mxConstants.DEFAULT_FONTSTYLE.toString());
        c.setFontColor('#000');
        c.text(currentOffset, h - paddingBelow - iconWidthHeight + iconWidthHeight / 2, currentValueWidth, iconWidthHeight, currentValue.toString(), mxConstants.ALIGN_LEFT, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
        currentOffset += currentValueWidth;

        c.setFontColor(AttributeRenderer.sensitivityAnalysisEnabled() ? '#f00' : '#00f');
        c.setFontStyle(mxConstants.FONT_STRIKETHROUGH.toString());
        if (oldValue !== undefined && currentValue.toString() !== oldValue.toString()) {
          currentOffset += diffPadding;
          const oldValueWidth = oldValue.toString().length * textWidthPerChar;
          c.text(currentOffset, h - paddingBelow - iconWidthHeight + iconWidthHeight / 2, oldValueWidth, iconWidthHeight, oldValue.toString(), mxConstants.ALIGN_LEFT, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
          currentOffset += oldValueWidth;
        }
      } else {
        c.setFontColor(AttributeRenderer.sensitivityAnalysisEnabled() ? '#f00' : '#00f');
        c.setFontStyle(mxConstants.FONT_STRIKETHROUGH.toString());
        const oldValueWidth = oldValue.toString().length * textWidthPerChar;
        c.text(currentOffset, h - paddingBelow - iconWidthHeight + iconWidthHeight / 2, oldValueWidth, iconWidthHeight, oldValue.toString(), mxConstants.ALIGN_LEFT, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
        currentOffset += oldValueWidth;
      }
    }
  }

  paintVertexShape(c: import('mxgraph').mxAbstractCanvas2D, x: number, y: number, w: number, h: number): void {
    super.paintVertexShape(c, x, y, w, h);

    if (this.state) {
      const cell = AttributeRenderer.nodeAttributes(this.state.cell);
      const allValues = cell.getAllValues();

      this.drawAttributeShapes(c, x, y, w, h, allValues);

      const label = cell.getComputedAttributesForCell();
      if (label !== null) {
        for (const [, value] of Object.entries(label)) {
          this.drawLabelShape(value.toString(), c, x, y, w, h);
          break;  // Only draw the 'first' computed attribute
        }
      }
    }
  }

  private drawLabelShape(label: string, c: import('mxgraph').mxAbstractCanvas2D, x: number, y: number, w: number, h: number) {
    void h;
    if (this.state) {
      const opacity = mxUtils.getValue(this.state.style, 'opacity', '100') as number;
      const bubbleDiameter = 20;
      c.setFillColor('#ff0000');
      c.setStrokeColor('#ff0000');
      c.ellipse(w - (bubbleDiameter * 0.5), - (bubbleDiameter * 0.5), bubbleDiameter, bubbleDiameter);
      c.fillAndStroke();

      c.setAlpha(opacity / 100);
      c.setFontStyle(mxConstants.DEFAULT_FONTSTYLE.toString());
      c.setFontColor('#fff');
      c.setFontSize(14);

      c.text(w, 0, 0, 0, label === 'NaN' ? '!' : label, mxConstants.ALIGN_CENTER, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
    }
  }

  static register(): void {
    mxCellRenderer.registerShape(AttackGraphNodeShape.ID, AttackGraphNodeShape);
  }
}

