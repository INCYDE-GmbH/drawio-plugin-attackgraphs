import { Sidebar } from '../Sidebar';
import { KeyValuePairs } from '../Model';

export abstract class SettingsDialog<TValue> {
  protected ui: Draw.UI | null;
  protected container: HTMLElement;
  protected values: KeyValuePairs[] = [];
  protected textAreas: HTMLInputElement[] = [];
  protected sidebar: Sidebar | null;
  protected width = 500;
  protected height = 500;
  protected alertMessage: HTMLDivElement = document.createElement('div');
  public result: TValue | undefined = undefined;

  constructor(ui: Draw.UI, width: number, height: number, protected initialValue?: TValue) {
    this.ui = ui;
    this.width = width;
    this.height = height;
    this.sidebar = new Sidebar(ui);
    this.container = document.createElement('div');
  }

  show(): Promise<boolean> {
    return new Promise((resolve,) => {
      this.ui?.showDialog(this.container, this.width, this.height, true, false, () => resolve(this.result !== undefined), false);
    });
  }

  init(): SettingsDialog<TValue> {
    if (this.ui !== null) {
      this.createUIElements(this.ui);
      this.initAlertMessage();
    }
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected createUIElements(ui: Draw.UI): void {
    throw new Error('Method not implemented.');
  }

  clearInput(input: HTMLInputElement): void {
    input.value = '';
  }

  apply(result: TValue): void {
    this.result = result;
  }

  getTitleDiv(name: string): HTMLDivElement {
    const titleBox = document.createElement('div');
    titleBox.style.position = 'relative';
    titleBox.style.boxSizing = 'border-box';
    titleBox.style.width = '100%';

    const title = document.createElement('p');
    title.innerHTML = name;

    titleBox.appendChild(title);

    return titleBox;
  }

  protected addTextAreasTo(
    form: import('mxgraph').mxForm,
    properties: KeyValuePairs[]
  ): void {
    for (const entry of properties) {
      this.addRowToForm(form, entry['name'], entry['value']);
    }
  }

  private initAlertMessage(): void {
    this.alertMessage.style.color = 'red';
    this.alertMessage.style.padding = '10px';
  }

  protected setAlertMessage(message: string): void {
    this.alertMessage.innerHTML = message;
  }

  protected addRowToForm(form: import('mxgraph').mxForm, entryName: string, entryValue: string): void {
    this.addTextAreaTo(form, entryName, entryValue);
    const index = form.table.rows.length - 1;
    const row = form.table.rows[index];
    this.addRemoveButtonToRow(row, () => {
      this.removeRowFromForm(form, row);
    });
  }

  protected removeRowFromForm(form: import('mxgraph').mxForm, row: HTMLTableRowElement): number | null {
    const index = row.rowIndex;
    if (index !== null) {
      this.textAreas.splice(+index, 1);
      this.values.splice(+index, 1);
      form.table.deleteRow(+index);
    }
    return index;
  }

  protected addTextAreaTo(form: import('mxgraph').mxForm, key: string, value: string): HTMLInputElement {
    const oldTextArea = form.addTextarea(key, value, 2);
    const parentNode = oldTextArea.parentNode;
    const textArea = document.createElement('input');
    const label = document.createElement('td');
    label.innerHTML = `${mxResources.get('attackGraphs.value')}:`;
    textArea.value = value;
    textArea.style.width = '50pt';
    if (parentNode) {
      parentNode.removeChild(oldTextArea);
      parentNode.appendChild(textArea);
      parentNode.parentNode?.insertBefore(label, parentNode);
      (parentNode.parentNode?.firstElementChild as HTMLElement).style.fontWeight = '600';
    }
    textArea.setAttribute('rowNumber', (form.table.rows.length - 1).toString());

    if (value.indexOf('\n') > 0) {
      textArea.setAttribute('rows', '2');
    }

    this.textAreas.push(textArea);
    return textArea;
  }

  private addRemoveButtonToRow(row: HTMLTableRowElement, callback: () => void) {
    const td = document.createElement('td');
    td.style.position = 'relative';
    td.style.paddingRight = '20px';
    td.style.boxSizing = 'border-box';
    td.style.width = '100%';
    const removeAttr = document.createElement('a');
    const img = mxUtils.createImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJAQMAAADaX5RTAAAABlBMVEV7mr3///+wksspAAAAAnRSTlP/AOW3MEoAAAAdSURBVAgdY9jXwCDDwNDRwHCwgeExmASygSL7GgB12QiqNHZZIwAAAABJRU5ErkJggg==');
    img.style.height = '9px';
    img.style.fontSize = '9px';
    img.style.marginBottom = mxClient.IS_IE11 ? '-1px' : '5px';

    removeAttr.className = 'geButton';
    removeAttr.setAttribute('title', mxResources.get('delete'));
    removeAttr.style.position = 'absolute';
    removeAttr.style.top = '4px';
    removeAttr.style.left = '0px';
    removeAttr.style.margin = '0px';
    removeAttr.style.width = '9px';
    removeAttr.style.height = '9px';
    removeAttr.style.cursor = 'pointer';
    removeAttr.appendChild(img);

    mxEvent.addListener(removeAttr, 'click', callback);

    td.appendChild(removeAttr);
    row.appendChild(td);
  }

  protected getInputArea(hint?: string): HTMLInputElement {
    const nameInput = document.createElement('input');
    nameInput.setAttribute(
      'placeholder', hint ? hint :
      mxResources.get('enterPropertyName')
    );
    nameInput.setAttribute('type', 'text');
    nameInput.setAttribute('width', '100%');
    nameInput.style.boxSizing = 'border-box';
    nameInput.style.marginLeft = '2px';
    nameInput.style.width = '';

    return nameInput;
  }

  protected getAddButton(
    callback: (event: MouseEvent) => void
  ): HTMLElement {
    const addBtn: HTMLElement = mxUtils.button(mxResources.get('addProperty'), callback) as HTMLElement;

    addBtn.setAttribute('title', mxResources.get('addProperty'));
    addBtn.setAttribute('disabled', 'disabled');
    addBtn.style.textOverflow = 'ellipsis';
    addBtn.style.position = 'static';
    addBtn.style.overflow = 'hidden';
    addBtn.style.display = 'block';
    addBtn.style.right = '0px';
    addBtn.style.marginTop = '5px';
    addBtn.style.marginLeft = '0px';
    addBtn.style.padding = '0px';
    addBtn.className = 'geBtn';

    return addBtn;
  }

  protected getApplyButton(callback: (event: MouseEvent) => void): HTMLElement {
    const applyBtn = mxUtils.button(mxResources.get('apply'), callback) as HTMLElement;
    applyBtn.className = 'geBtn gePrimaryBtn';

    return applyBtn;
  }

  protected getCancelButton(callback: (event: MouseEvent) => void): HTMLElement {
    const cancelBtn: HTMLElement = mxUtils.button(mxResources.get('cancel'), callback) as HTMLElement;
    cancelBtn.className = 'geBtn';

    return cancelBtn;
  }

  protected cancelDialog(ui: Draw.UI): void {
    this.closeDialog(ui);
  }

  protected closeDialog(ui: Draw.UI): void {
    ui.hideDialog();
  }

  protected updateButton(button: HTMLElement, enableCondition: boolean): void {
    if (enableCondition) {
      button.removeAttribute('disabled');
    } else {
      button.setAttribute('disabled', 'disabled');
    }
  }

  protected addEntryTo(entry: KeyValuePairs, collection: KeyValuePairs[]): boolean {
    if (collection.filter(x => x['name'] === entry['name']).length === 0) {
      collection.push(entry);
      return true;
    }
    return false;
  }
}

