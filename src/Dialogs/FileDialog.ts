import { AttackgraphFunction, GlobalAttribute } from '../Model';

export type TemplateFile = {
  ag_type: string;
  ag_version: number; // TODO
  default_attributes: GlobalAttribute[];
  computed_attributes: AttackgraphFunction[];
  aggregation_functions: AttackgraphFunction[];
}

export interface TemplateFileContent {
  name: string;
}

export enum TemplateType {
  All = '',
  DefaulttAttributes = 'attr',
  ComputedAttributes = 'comp',
  AggregationFunctions = 'agg'
}

export abstract class FileDialog {
  protected ui: Draw.UI;
  protected file: TemplateFile;
  protected type: TemplateType;
  
  private container: HTMLDivElement;
  private alertCtn: HTMLDivElement;
  private width: number;
  private height: number;

  protected title: string | null = null;
  protected description: string | null = null;
  protected applyBtn: string | null = null;

  valid = false;
  result: TemplateFile | null = null;

  constructor(ui: Draw.UI, file: TemplateFile, type: TemplateType, width?: number, height?: number) {
    this.ui = ui;
    this.file = file;
    this.type = type;
    this.valid = FileDialog.isValidFile(this.file);
    
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

  init(): FileDialog {
    this.createUIElements();
    return this;
  }

  show(): Promise<boolean> {
    return new Promise((resolve,) => {
      this.ui.showDialog(this.container, this.width, this.height, true, false, () => resolve(this.result !== null), false);
    });
  }

  protected getId(suffix: string): string {
    return (suffix.length > 1) ? `ag_template_${suffix}` : 'ag_template';
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
    const search = (source: TemplateFileContent[], target: TemplateFileContent[], prefix: TemplateType) => {
      for (let i = 0; i < source.length; i++) {
        const elem = document.getElementById(this.getId(`${prefix}_${i.toString()}`));
        if (elem && elem.tagName === 'INPUT' && (elem as HTMLInputElement).checked) {
          target.push(source[i]);
        }
      }
    }

    if (this.valid && this.result) {
      if (this.type === TemplateType.All || this.type === TemplateType.DefaulttAttributes) {
        search(this.file.default_attributes, this.result.default_attributes, TemplateType.DefaulttAttributes);
      }
      if (this.type === TemplateType.All || this.type === TemplateType.ComputedAttributes) {
        search(this.file.computed_attributes, this.result.computed_attributes, TemplateType.ComputedAttributes);
      }
      if (this.type === TemplateType.All || this.type === TemplateType.AggregationFunctions) {
        search(this.file.aggregation_functions, this.result.aggregation_functions, TemplateType.AggregationFunctions);
      }
    }
  }

  protected addDialogElement(elem: HTMLElement): void {
    this.container.appendChild(elem);
  }

  protected createUIElements(): void {
    const title = document.createElement('h2');
    title.innerText = this.title || 'TODO';

    // Body
    const body = document.createElement('div');
    if (this.valid) {
      const description = document.createElement('p');
      description.innerText = this.description || 'TODO';
      body.appendChild(description);
      body.appendChild(this.createSelectionTree());
    } else {
      this.setAlertMessage(mxResources.get('attackgraphs.alertFileInvalidFormat'));
    }

    // Construct dialog
    this.addDialogElement(title);
    this.addDialogElement(this.getAlertContainer());
    this.addDialogElement(body);
    this.addDialogElement(this.getDialogButtons());
  }

  protected createSelectionTree(): HTMLElement {
    const ul = this.createChkBoxList();

    if ((this.type === TemplateType.All || this.type === TemplateType.DefaulttAttributes) && this.file.default_attributes.length > 0) {
      const item = this.createChkBoxItem(mxResources.get('attackGraphs.defaultAttributes'), 'attr')
      item.appendChild(this.createAttributesList(this.file.default_attributes, 'attr'));
      ul.appendChild(item);
    }
    if ((this.type === TemplateType.All || this.type === TemplateType.ComputedAttributes) && this.file.computed_attributes.length > 0) {
      const item = this.createChkBoxItem(mxResources.get('attackGraphs.computedAttributes'), 'comp')
      item.appendChild(this.createFunctionsList(this.file.computed_attributes, 'comp'));
      ul.appendChild(item);
    }
    if ((this.type === TemplateType.All || this.type === TemplateType.AggregationFunctions) && this.file.aggregation_functions.length > 0) {
      const item = this.createChkBoxItem(mxResources.get('attackGraphs.aggregationFunctions'), 'agg')
      item.appendChild(this.createFunctionsList(this.file.aggregation_functions, 'agg'));
      ul.appendChild(item);
    }

    if (this.type === TemplateType.All) {
      const top = this.createChkBoxList();
      const allItem = this.createChkBoxItem(mxResources.get('attackGraphs.all'), '');
      allItem.appendChild(ul);
      top.appendChild(allItem);
      return top;
    } else {
      return ul;
    }
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
    chkBox.onchange = e => FileDialog.chkBoxOnChange(e);

    const label = document.createElement('label');
    label.htmlFor = id;
    label.innerText = text;

    item.appendChild(chkBox);
    item.appendChild(label);

    return item
  }

  protected setAlertMessage(message?: string) {
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

  protected getAlertContainer(): HTMLDivElement {
    return this.alertCtn;
  }

  protected getDialogButtons(): HTMLElement {
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
    return buttons;
  }

  private getApplyButton(callback: (event: MouseEvent) => void): HTMLElement {
    const applyBtn = mxUtils.button(this.applyBtn || 'TODO', callback) as HTMLElement;
    applyBtn.className = 'geBtn gePrimaryBtn';
    return applyBtn;
  }

  private getCancelButton(callback: (event: MouseEvent) => void): HTMLElement {
    const cancelBtn: HTMLElement = mxUtils.button(mxResources.get('cancel'), callback) as HTMLElement;
    cancelBtn.className = 'geBtn';
    return cancelBtn;
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

  protected static isValidFile(file: TemplateFile): boolean {
    return Object.prototype.hasOwnProperty.call(file, 'ag_type') && file.ag_type === 'template';
  }
}
