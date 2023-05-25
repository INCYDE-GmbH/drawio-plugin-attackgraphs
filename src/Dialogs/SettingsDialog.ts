import { Sidebar } from '../Sidebar';
import { KeyValuePairs } from '../Model';
import { ImportFileDialog } from './ImportFileDialog';

export abstract class SettingsDialog<TValue> {
  protected ui: Draw.UI;
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
      this.ui.showDialog(this.container, this.width, this.height, true, false, () => resolve(this.result !== undefined), false);
    });
  }

  init(): SettingsDialog<TValue> {
    this.createUIElements(this.ui);
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

  protected setAlertMessage(message?: string): void {
    this.alertMessage.innerHTML = '';

    if (message) {
      const span = document.createElement('span');
      span.style.display = 'inline-block';
      span.style.borderLeftStyle = 'solid';
      span.style.borderWidth = '5px';
      span.style.borderColor = '#f00';
      span.style.backgroundColor = '#f99';
      span.style.padding = '10px';
      span.style.color = '#000';
      span.innerText = message;

      this.alertMessage.appendChild(span);
    }
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
    textArea.style.width = '4ch';
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

  protected getImportFileDiv(): HTMLDivElement {
    const div = document.createElement('div');
    
    const title = document.createElement('p');
    title.innerText = mxResources.get('attackgraphs.importFromFile');
    div.appendChild(title);

    // https://stackoverflow.com/a/40971885
    const fileBtn = document.createElement('input');
    fileBtn.type = 'file';
    fileBtn.onchange = e => {
      void (async () => {
        try {
          const result = await ImportFileDialog.handleFileInput(e);
          const dlg = new ImportFileDialog(this.ui, result);
          if (await dlg.init().show() && dlg.result) {
            console.log(dlg.result);
          } else {
            // Dialog cancelled
          }
          this.setAlertMessage();
        } catch(e) {
          this.setAlertMessage(e as string);
        }
      })();
    };
    div.appendChild(fileBtn);

    return div;
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

