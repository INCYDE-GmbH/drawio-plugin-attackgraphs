import { AttackgraphFunction, GlobalAttribute } from '../Model';

export type AGImportFile = {
    ag_type: string;
    ag_version: number; // TODO
    default_attributes: GlobalAttribute[];
    computed_attributes: AttackgraphFunction[];
    aggregation_functions: AttackgraphFunction[];
}

interface AGImportFileContent {
  name: string;
}

export class ImportFileDialog {
  private ui: Draw.UI
  private file: AGImportFile

  private container: HTMLDivElement;
  private alertCtn: HTMLDivElement;
  private width: number;
  private height: number;

  valid = false;
  result: AGImportFile | null = null;

  constructor(ui: Draw.UI, content: string, width?: number, height?: number) {
    this.ui = ui;
    try {
      this.file = JSON.parse(content) as AGImportFile;
      this.valid = Object.prototype.hasOwnProperty.call(this.file, 'ag_type') && this.file.ag_type === 'template';
    } catch {
      this.file = {} as AGImportFile;
    }

    this.container = document.createElement('div');
    this.alertCtn = document.createElement('div');
    this.width = width || 500;
    this.height = height || 500;

    if (this.valid) {
      this.result = {
        'ag_type': this.file.ag_type,
        'ag_version': this.file.ag_version,
        'default_attributes': [],
        'computed_attributes': [],
        'aggregation_functions': []
      };
    }
  }

  init(): ImportFileDialog {
    this.createUIElements();
    return this;
  }

  show(): Promise<boolean> {
    return new Promise((resolve,) => {
      this.ui.showDialog(this.container, this.width, this.height, true, false, () => resolve(this.result !== null), false);
    });
  }

  private getId(suffix: string): string {
    return (suffix.length > 1) ? `ag_import_${suffix}` : 'ag_import';
  }

  private cancelDialog() {
    this.result = null;
    this.ui.hideDialog();
  }

  private closeDialog() {
    this.collectResult();
    this.ui.hideDialog();
  }

  private collectResult() {
    const search = (source: AGImportFileContent[], target: AGImportFileContent[], prefix: string) => {
      for (let i = 0; i < source.length; i++) {
        const elem = document.getElementById(this.getId(`${prefix}_${i.toString()}`));
        if (elem && elem.tagName === 'INPUT' && (elem as HTMLInputElement).checked) {
          target.push(source[i]);
        }
      }
    }

    if (this.result) {
      search(this.file.default_attributes, this.result.default_attributes, 'attr');
      search(this.file.computed_attributes, this.result.computed_attributes, 'comp');
      search(this.file.aggregation_functions, this.result.aggregation_functions, 'agg');
    }
  }

  private createUIElements() {
    const title = document.createElement('h2');
    title.innerText = mxResources.get('attackgraphs.importFile');

    // Body
    const body = document.createElement('div');
    if (this.valid) {
      const header = document.createElement('p');
      header.innerText = mxResources.get('attackgraphs.selectImportItems') + ':';
      body.appendChild(header);

      const ul = this.createChkBoxList();
      if (this.file.default_attributes.length > 0) {
        const item = this.createChkBoxItem(mxResources.get('attackGraphs.defaultAttributes'), 'attr')
        item.appendChild(this.createAttributesList(this.file.default_attributes, 'attr'));
        ul.appendChild(item);
      }
      if (this.file.computed_attributes.length > 0) {
        const item = this.createChkBoxItem(mxResources.get('attackGraphs.computedAttributes'), 'comp')
        item.appendChild(this.createFunctionsList(this.file.computed_attributes, 'comp'));
        ul.appendChild(item);
      }
      if (this.file.aggregation_functions.length > 0) {
        const item = this.createChkBoxItem(mxResources.get('attackGraphs.aggregationFunctions'), 'agg')
        item.appendChild(this.createFunctionsList(this.file.aggregation_functions, 'agg'));
        ul.appendChild(item);
      }

      const top = this.createChkBoxList();
      const allItem = this.createChkBoxItem(mxResources.get('attackGraphs.all'), '');
      allItem.appendChild(ul);
      top.appendChild(allItem);
      body.appendChild(top);
    } else {
      this.setAlertMessage(mxResources.get('attackgraphs.alertFileInvalidFormat'));
    }

    // Buttons
    const buttons = document.createElement('div');
    buttons.style.cssText = 'position:absolute;left:30px;right:30px;text-align:right;bottom:30px;height:40px;';
    if (this.valid) {
      const applyBtn = this.getApplyButton(() => {
        this.closeDialog();
      });
      buttons.appendChild(applyBtn);
    }
    const cancelBtn = this.getCancelButton(() => {
      this.cancelDialog();
    });
    buttons.appendChild(cancelBtn);

    // Construct dialog
    this.container.appendChild(title);
    this.container.appendChild(this.alertCtn);
    this.container.appendChild(body);
    this.container.appendChild(buttons);
  }

  private getApplyButton(callback: (event: MouseEvent) => void): HTMLElement {
    const applyBtn = mxUtils.button(mxResources.get('import'), callback) as HTMLElement;
    applyBtn.className = 'geBtn gePrimaryBtn';
    return applyBtn;
  }

  private getCancelButton(callback: (event: MouseEvent) => void): HTMLElement {
    const cancelBtn: HTMLElement = mxUtils.button(mxResources.get('cancel'), callback) as HTMLElement;
    cancelBtn.className = 'geBtn';
    return cancelBtn;
  }

  private createAttributesList(attributes: GlobalAttribute[], prefix: string): HTMLElement {
    const list = this.createChkBoxList();
    for (let i = 0; i < attributes.length; i++) {
      const item = this.createChkBoxItem(attributes[i].name, `${prefix}_${i.toString()}`);
      list.appendChild(item);
    }
    return list
  }

  private createFunctionsList(fns: AttackgraphFunction[], prefix: string): HTMLElement {
    const list = this.createChkBoxList();
    for (let i = 0; i < fns.length; i++) {
      const item = this.createChkBoxItem(fns[i].name, `${prefix}_${i.toString()}`);
      list.appendChild(item);
    }
    return list;
  }

  private createChkBoxList(): HTMLElement {
    const list = document.createElement('ul');
    list.style.padding = '5px 0 5px 20px';
    return list;
  }

  private createChkBoxItem(text: string, suffix: string): HTMLElement {
    const item = document.createElement('li');
    item.style.listStyle = 'none';

    const id = this.getId(suffix);

    const chkBox = document.createElement('input');
    chkBox.type = 'checkbox';
    chkBox.checked = true;
    chkBox.name = id;
    chkBox.id = id;
    chkBox.onchange = e => ImportFileDialog.chkBoxOnChange(e);

    const label = document.createElement('label');
    label.htmlFor = id;
    label.innerText = text;

    item.appendChild(chkBox);
    item.appendChild(label);

    return item
  }

  private setAlertMessage(message?: string) {
    this.alertCtn.innerHTML = '';

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

      this.alertCtn.appendChild(span);
    }
  }

  private static chkBoxOnChange(e: Event) {
    // https://codepen.io/subinpark/pen/jewJVK
    if (e.currentTarget) {
      const elem = e.currentTarget as HTMLInputElement;
      const state = elem.checked;
      if (elem.parentElement && elem.parentElement.tagName === 'LI') {
        const item = elem.parentElement;
        for (const input of Array.from(item.getElementsByTagName('input')).slice(1)) {
          input.checked = state;
        }
        const checkParents = (el: HTMLElement | null, state: boolean) => {
          if (el && el.tagName === 'LI'
              && el.parentElement && el.parentElement.tagName === 'UL'
              && el.parentElement.parentElement && el.parentElement.parentElement.tagName === 'LI') {
            const parent = el.parentElement.parentElement;
            const inputs = Array.from(parent.getElementsByTagName('input'));
            state = state && inputs.slice(1).reduce((acc, curr) => acc && curr.checked, true);
            inputs[0].checked = state;
            checkParents(parent, state);
          }
        }
        checkParents(elem.parentElement, state);
      }
    }
  }

  static handleFileInput(e: Event): Promise<string> {
    return new Promise((resolve, reject) => {
      if (e.currentTarget) {
        const elem = e.currentTarget as HTMLInputElement;
        const files = elem.files;
        if (files && files.length === 1) {
          const reader = new FileReader();
          reader.readAsText(files[0], 'UTF-8');
          reader.onload = readerEvt => {
            if (readerEvt.target && readerEvt.target.result) {
              resolve(readerEvt.target.result as string);
            } else {
              reject(mxResources.get('error'));
            }
          };
        } else {
          reject(mxResources.get('attackgraphs.alertSelectSingleFile'));
        }
      } else {
        reject(mxResources.get('error'));
      }
    });
  }
}
