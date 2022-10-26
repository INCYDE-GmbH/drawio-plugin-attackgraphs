import { KeyValuePairs } from '../Model';

export abstract class AttributeProvider {
  private static ui: Draw.UI;
  private page: Draw.DiagramPage | null;
  private pageDetermined = false;
  cell: import('mxgraph').mxCell;

  constructor(cell: import('mxgraph').mxCell) {
    this.cell = cell;
    this.page = null;
  }

  static shouldRenderAttribute(attribute: string): boolean {
    return (new RegExp('s*_').exec(attribute) === null)
      // defined attributes by draw.io
      && attribute !== 'placeholder'
      && attribute !== 'link'
      && attribute !== 'name';
  }

  protected static getUI(): Draw.UI {
    return this.ui;
  }

  static register(ui: Draw.UI): void {
    if (!this.ui) {
      this.ui = ui;
    }
  }

  private isCellAncestor(cell: import('mxgraph').mxCell): boolean {
    if (this.cell === cell) {
      return true;
    }

    if (cell.children) {
      for (const child of cell.children) {
        if (this.isCellAncestor(child)) {
          return true;
        }
      }
    }

    return false;
  }

  private resolvePageForCell(): Draw.DiagramPage | null {
    if (AttributeProvider.ui.pages && AttributeProvider.ui.pages.length > 0) {
      for (const page of AttributeProvider.ui.pages) {
        if (page.root) {
          if (this.isCellAncestor(page.root)) {
            return page;
          }
        }
      }
    }

    return null;
  }

  keyValuePairsToString(kvp: KeyValuePairs): string {
    let result = '';
    for (const [k, v] of Object.entries(kvp)) {
      result += `<b>${k.toString()}:</b> ${mxUtils.htmlEntities(v.toString())}\n`;
    }
    return result;
  }

  abstract getTooltip(): string;

  parseCellValue(): Element {
    if (this.cell.value !== null && typeof (this.cell.value) === 'object') {
      return this.cell.value as Element;
    }

    const doc = mxUtils.createXmlDocument();
    const value = doc.createElement('object');
    const cellValue = this.cell.value as string | null;
    if (cellValue !== null && cellValue !== undefined) {
      value.setAttribute('label', cellValue);
    }
    return value;
  }

  getCellId(): string {
    return this.cell.id;
  }

  getPage(): Draw.DiagramPage | null {
    if (!this.pageDetermined) {
      this.page = this.resolvePageForCell();
      this.pageDetermined = true;
    }
    return this.page;
  }

  getPageId(): string {
    const page = this.getPage();
    return (page) ? page.getId() : '';
  }

  getCellValues(): KeyValuePairs {
    const xml = this.parseCellValue();
    const keyValuePairs = xml.getAttributeNames()
      .map(x => ({ [x]: xml.getAttribute(x) }));
    return Object.assign({}, ...keyValuePairs) as KeyValuePairs;
  }

  getCellLabel(): string | null {
    const values = this.parseCellValue();
    return values.getAttribute('label');
  }

  replaceCellValue(newValue: KeyValuePairs): void {
    const result = this.parseCellValue();
    const oldAttributes = result.getAttributeNames();
    for (const attribute of oldAttributes) {
      result.removeAttribute(attribute);
    }
    for (const [key, value] of Object.entries(newValue)) {
      result.setAttribute(key, value);
    }
    this.cell.setValue(result);
  }

  storeValuesInCell(name: string, keyValuePairs: KeyValuePairs): void {
    const node = this.parseCellValue();

    const doc = mxUtils.createXmlDocument();
    const newElement = doc.createElement(name);

    for (const [key, value] of Object.entries(keyValuePairs)) {
      if (value === null) {
        continue;
      }
      newElement.setAttribute(key, value);
    }

    const children = node.children ? Array.from(node.children) : [];
    const oldStore = children.filter((child: Element) => child.tagName === name);
    if (oldStore.length > 0) {
      node.replaceChild(newElement, oldStore[0]);
    } else {
      node.appendChild(newElement);
    }

    this.cell.setValue(node);
  }

  storeGroupedValuesInCell<T extends KeyValuePairs>(groupName: string, singleName: string, keyValuePairs: T[]): void {
    const value = this.parseCellValue();
    AttributeProvider.storeGroupedValuesInElement(groupName, singleName, keyValuePairs, value);
    this.cell.setValue(value);
  }

  static storeGroupedValuesInElement<T extends KeyValuePairs>(groupName: string, singleName: string, keyValuePairs: T[], value: Element): void {
    const xml = mxUtils.createXmlDocument();

    const parentObject = xml.createElement(groupName);
    for (const pair of keyValuePairs) {
      const dataObject = xml.createElement(singleName);
      for (const [key, value] of Object.entries(pair)) {
        dataObject.setAttribute(key, value);
      }
      parentObject.appendChild(dataObject);
    }

    const children = Array.from(value.children || []).filter(child => child.tagName === groupName);
    if (children.length > 0) {
      value.replaceChild(parentObject, children[0]);
    } else {
      value.appendChild(parentObject);
    }
  }

  getGroupedValuesFromCell<T extends KeyValuePairs>(groupName: string): T[] | null {
    const value = this.cell.value as Element;
    if (value === undefined) {
      return null;
    }
    const children = Array.from(value.children || [])
      .filter(child => child.tagName === groupName);
    if (children.length > 0) {
      return Array.from(children[0].children).map(child => {
        const attributes = Array.from(child.attributes).map(attribute => [attribute.name, attribute.value]);
        const obj = Object.fromEntries(attributes) as T;
        return obj;
      });
    } else {
      return null;
    }
  }

  getValueFromGroupInCell<T extends KeyValuePairs>(groupName: string, name: string): T | null {
    const results = this.getGroupedValuesFromCell<T>(groupName)?.filter(x => x.name === name);
    if (results !== undefined && results.length > 0) {
      return results[0];
    } else {
      return null;
    }
  }

  getStringStoredInCell(name: string): string | null {
    const result = this.getValuesStoredInCell(name);
    if (result) {
      return result[name];
    } else {
      return null;
    }
  }

  getValuesStoredInCell(name: string): KeyValuePairs | null {
    const value = this.cell.value as Element;
    if (!value) {
      return null;
    }
    if (value.children !== undefined) {
      const children = Array.from(value.children);
      const attributes = children.filter((child: Element) => child.tagName === name)[0]?.attributes;
      if (attributes) {
        return Object.fromEntries(Object.values(attributes).filter(attr => attr.name !== 'xmlns').map(attr => [attr.name, attr.value]));
      }
    }
    return null;
  }

  storeStringInCell(name: string, value: string | null): void {
    if (value !== null) {
      this.storeValuesInCell(name, Object.fromEntries([[name, value]]));
    }
  }

  removeValuesFromCell(name: string): void {
    const node = this.parseCellValue();
    const children = node.children ? Array.from(node.children) : [];
    const child = children.filter(child => child.tagName === name)[0];

    if (child !== undefined) {
      node.removeChild(child);
    }
  }

  removeStringFromCell(name: string): void {
    this.removeValuesFromCell(name);
  }
}

