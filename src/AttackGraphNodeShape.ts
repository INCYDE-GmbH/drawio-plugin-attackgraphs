import { Framework7Icons } from './Framework7Icons';
import { NodeValues } from './Model';
import { AttributeRenderer as AttributeRenderer } from './AttributeRenderer';
import { AttributeProvider } from './Analysis/AttributeProvider';
import { RootAttributeProvider } from './Analysis/RootAttributeProvider';

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

    const attributes: { [name: string]: { oldValue: string, currentValue: string } } = {};

    for (const [k, v] of Object.entries(attrs.old)) {
      if (AttributeProvider.shouldRenderAttribute(k)) {
        attributes[k] = { oldValue: v, currentValue: '' }
      }
    }

    for (const [k, v] of Object.entries(attrs.current)) {
      if (AttributeProvider.shouldRenderAttribute(k)) {
        attributes[k] = { ...attributes[k], currentValue: v }
      }
    }

    const graph = this.state?.view.graph;
    const globalAttributes = AttributeRenderer.rootAttributes().getGlobalAttributes();
    let tempAttributes = Object.entries(attributes);
    if (globalAttributes !== null) {
      const renderableAttributes = RootAttributeProvider.getRenderableAttributes(globalAttributes);
      tempAttributes = tempAttributes.sort((keyA, keyB) => {
        const idx1 = renderableAttributes.findIndex(e => e.name === keyA[0]);
        const idx2 = renderableAttributes.findIndex(e => e.name === keyB[0]);
        if (idx1 !== -1 && idx2 !== -1) {
          return idx1 - idx2;
        } else if (idx1 !== -1) {
          return -1;
        } else if (idx2 !== -1) {
          return 1;
        } else {
          return Object.entries(attributes).findIndex(e => e[0] === keyA[0]) - Object.entries(attributes).findIndex(e => e[0] === keyB[0]);
        }
      });
    }
    const sortedAttributes = tempAttributes;

    let currentOffset = 0;
    for (const [key, { oldValue, currentValue }] of sortedAttributes) {
      if (key === 'label' || key === 'tooltip') {
        continue;
      }

      let icon = `data:image/svg+xml;utf8,${Framework7Icons.Icons.question}`;
      if (graph !== undefined) {
        const globalAttribute = AttributeRenderer.rootAttributes().getGlobalAttribute(key);
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
        if (oldValue !== undefined && currentValue.toString() !== oldValue.toString()) {
          const oldValueWidth = oldValue.toString().length * textWidthPerChar;
          c.text(currentOffset, h - paddingBelow - iconWidthHeight + iconWidthHeight / 2, oldValueWidth, iconWidthHeight, oldValue.toString(), mxConstants.ALIGN_LEFT, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
          currentOffset += oldValueWidth;
        }
      }
    }
  }

  paintVertexShape(c: import('mxgraph').mxAbstractCanvas2D, x: number, y: number, w: number, h: number): void {
    super.paintVertexShape(c, x, y, w, h);

    if (this.state) {
      const cell = AttributeRenderer.nodeAttributes(this.state.cell);
      const allValues = cell.getAllValues();

      this.drawAttributeShapes(c, x, y, w, h, allValues);

      const computedAttributes = cell.getComputedAttributesForCell();
      if (computedAttributes && 'value' in computedAttributes) {
        // Force the following to be strings
        const value = `${computedAttributes['value']}`;
        const fillColor = `${computedAttributes['fillColor'] || '#f00'}`;
        const fontColor = `${computedAttributes['fontColor'] || '#fff'}`;
        this.drawLabelShape(value, c, w, fillColor, fontColor);
      }
    }
  }

  private drawLabelShape(label: string, c: import('mxgraph').mxAbstractCanvas2D, w: number, fillColor: string, fontColor: string) {
    if (this.state) {
      const opacity = mxUtils.getValue(this.state.style, 'opacity', '100') as number;
      const squareDiameter = 20;
      c.setFillColor(fillColor);
      c.setStrokeColor('#000000');
      c.rect(w - squareDiameter, 0, squareDiameter, squareDiameter);
      c.fillAndStroke();

      c.setAlpha(opacity / 100);
      c.setFontStyle(mxConstants.DEFAULT_FONTSTYLE.toString());
      c.setFontColor(fontColor);
      c.setFontSize(13);
      c.text(
        w - squareDiameter * 0.5,
        squareDiameter * 0.5,
        0, 0, label === 'NaN' ? '!' : label, mxConstants.ALIGN_CENTER, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0
      );
    }
  }

  static register(): void {
    mxCellRenderer.registerShape(AttackGraphNodeShape.ID, AttackGraphNodeShape);
  }
}


