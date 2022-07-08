import ace from 'ace-builds';
import 'ace-builds/src-noconflict/mode-javascript';
import { NodeAttributeProvider } from '../Analysis/NodeAttributeProvider';
import { AttributeRenderer } from '../AttributeRenderer';
import { STORAGE_ID_NONE_FUNCTION, STORAGE_NAME_CUSTOM_FUNCTION } from '../CellUtils';
import { AttackgraphFunction, CellFunctionFormat } from '../Model';

export class TextAreaDialog {
  textarea: HTMLTextAreaElement;
  container: HTMLTableElement;
  ui: Draw.UI;
  editor?: ace.Ace.Editor;
  fn?: ((value: string) => void);
  w: number;
  h: number;
  noHide: boolean;
  title: string;
  url?: string;
  cancelFn?: (() => void);
  cancelTitle?: string;
  addButtons?: ((container: HTMLElement, textarea: HTMLTextAreaElement) => void);
  noWrap?: boolean;
  applyTitle: string;
  helpLink?: string;
  customButtons?: [string, (e: MouseEvent, textarea: HTMLTextAreaElement) => void][];
  tbody: HTMLTableSectionElement;
  result: boolean | undefined = undefined;

  constructor(editorUi: Draw.UI,
    title: string, w: number, h: number,
    noHide?: boolean,
    noWrap?: boolean,
    applyTitle?: string,
    cancelTitle?: string,
    url?: string,
    fn?: ((value: string) => void),
    cancelFn?: (() => void),
    addButtons?: ((container: HTMLElement, textarea: HTMLTextAreaElement) => void),
    helpLink?: string,
    customButtons?: [string, (e: MouseEvent, textarea: HTMLTextAreaElement) => void][]) {
    this.ui = editorUi;
    this.fn = fn;
    this.w = w || 300;
    this.h = h || 120;
    this.noHide = noHide || false;
    this.title = title || '';
    this.url = url;
    this.cancelFn = cancelFn;
    this.cancelTitle = cancelTitle;
    this.addButtons = addButtons;
    this.noWrap = noWrap;
    this.applyTitle = applyTitle || mxResources.get('apply');
    this.helpLink = helpLink;
    this.customButtons = customButtons;
    this.container = document.createElement('table');
    this.textarea = document.createElement('textarea');
    this.tbody = document.createElement('tbody');
  }

  init(): void {
    let buttonsRow, td;

    const table = document.createElement('table');
    table.style.height = `${this.h - 40}px`;
    table.style.overflowY = 'scroll';
    table.style.display = 'block';

    buttonsRow = document.createElement('tr');

    td = document.createElement('td');
    td.style.fontSize = '10pt';
    td.style.width = '100px';
    mxUtils.write(this.container, this.title);

    this.tbody.appendChild(buttonsRow);

    buttonsRow = document.createElement('tr');
    td = document.createElement('td');

    const nameInput = document.createElement('textarea');

    if (this.noWrap) {
      nameInput.setAttribute('wrap', 'off');
    }

    nameInput.setAttribute('spellcheck', 'false');
    nameInput.setAttribute('autocorrect', 'off');
    nameInput.setAttribute('autocomplete', 'off');
    nameInput.setAttribute('autocapitalize', 'off');

    mxUtils.write(nameInput, this.url || '');
    nameInput.style.resize = 'none';
    nameInput.style.width = this.w.toString() + 'px';
    nameInput.style.height = this.h.toString() + 'px';

    this.textarea = nameInput;


    nameInput.focus();
    nameInput.scrollTop = 0;

    td.appendChild(nameInput);

    this.editor = ace.edit(this.textarea, {
      mode: 'ace/mode/javascript',
      // It seems that workers have to be asynchonrously loaded via a URL,
      // which is not possible in our case (everything has to be bundled into a single JS file)
      // Thus, we don't get editing hints but only syntax highlighting from ACE.
      useWorker: false,
    });
    td.appendChild(this.editor.container);

    this.editor.container.style.width = this.w.toString() + 'px';
    this.editor.container.style.height = (this.h / 2).toString() + 'px';
    this.editor.resize();

    buttonsRow.appendChild(td);

    this.tbody.appendChild(buttonsRow);

    buttonsRow = document.createElement('tr');
    td = document.createElement('td');
    td.style.paddingTop = '14px';
    td.style.whiteSpace = 'nowrap';
    td.setAttribute('align', 'right');

    if (this.helpLink) {
      const link = this.helpLink;
      const helpBtn = mxUtils.button(mxResources.get('help'), () => this.ui.editor.graph.openLink(link));
      helpBtn.className = 'geBtn';

      td.appendChild(helpBtn);
    }

    if (this.customButtons) {
      for (const [label, fn] of this.customButtons) {
        const customBtn = mxUtils.button(label, (e: MouseEvent) => {
          fn(e, nameInput);
        });
        customBtn.className = 'geBtn';

        td.appendChild(customBtn);
      }
    }

    const cancelBtn = mxUtils.button(this.cancelTitle || mxResources.get('cancel'), () => {
      this.ui.hideDialog();

      if (this.cancelFn) {
        this.cancelFn();
      }
    });
    cancelBtn.className = 'geBtn';

    if (this.ui.editor.cancelFirst) {
      td.appendChild(cancelBtn);
    }

    if (this.addButtons) {
      this.addButtons(td, nameInput);
    }

    if (this.fn) {
      const genericBtn = mxUtils.button(this.applyTitle, () => {
        if (!this.noHide) {
          this.ui.hideDialog();
        }

        this.fn?.(nameInput.value);
      });

      genericBtn.className = 'geBtn gePrimaryBtn';
      td.appendChild(genericBtn);
    }

    if (!this.ui.editor.cancelFirst) {
      td.appendChild(cancelBtn);
    }

    buttonsRow.appendChild(td);
    table.appendChild(this.tbody);
    this.container.appendChild(table);
    this.container.appendChild(buttonsRow);
  }

  show(): Promise<boolean> {
    return new Promise((resolve,) => {
      this.ui?.showDialog(this.container, this.w * 1.1, this.h, true, false, () => resolve(this.result !== undefined), false);
    });
  }

  protected cancelDialog(ui: Draw.UI): void {
    this.closeDialog(ui);
  }

  protected closeDialog(ui: Draw.UI): void {
    ui.hideDialog();
  }
}

export abstract class EditCellFunctionDialog extends TextAreaDialog {
  selected: number | null = null;
  cell: NodeAttributeProvider;
  functionItems: AttackgraphFunction[];
  fieldset: HTMLFieldSetElement;

  constructor(cell: NodeAttributeProvider,
    editorUi: Draw.UI,
    title: string, w: number, h: number,
    noHide?: boolean,
    noWrap?: boolean,
    applyTitle?: string,
    cancelTitle?: string,
    url?: string,
    fn?: ((value: string) => void),
    cancelFn?: (() => void),
    addButtons?: ((container: HTMLElement, textarea: HTMLTextAreaElement) => void),
    helpLink?: string,
    customButtons?: [string, (e: MouseEvent, textarea: HTMLTextAreaElement) => void][]) {
    super(editorUi,
      title, w, h,
      noHide,
      noWrap,
      applyTitle,
      cancelTitle,
      url,
      fn,
      cancelFn,
      addButtons,
      helpLink,
      customButtons);

    this.cell = cell;
    this.fieldset = document.createElement('fieldset');
    this.functionItems = this.getFunctionItems();
    this.fn = () => this.apply();
  }

  init(): void {
    super.init();
    this.updateSelection();
    const dropDown = this.getDropdownMenu();
    const row = document.createElement('tr');
    const td = document.createElement('td');
    row.appendChild(td);
    td.appendChild(dropDown);
    this.tbody.firstChild?.after(row);
  }

  updateSelection(): void {
    const cellFunction = this.getCellFunction();
    this.functionItems.unshift({ name: mxResources.get('attackGraphs.none'), fn: '', id: '', default: [] }) // TODO: empty default array might cause problems...
    this.functionItems.push({ name: STORAGE_NAME_CUSTOM_FUNCTION, fn: '', id: '', default: [] });
    this.selected = 0;
    if (cellFunction !== null) {
      if (cellFunction.name === STORAGE_NAME_CUSTOM_FUNCTION) {
        // remove custom function placeholder
        this.functionItems.pop();

        this.functionItems.push(cellFunction);
        this.selected = this.functionItems.length - 1;
        return;
      }
      if (cellFunction.id !== STORAGE_ID_NONE_FUNCTION) {
        for (let index = 0; index < this.functionItems.length; index++) {
          if (cellFunction.id === this.functionItems[index].id) {
            this.selected = index;
          }
        }
      }
    }
  }

  abstract setCellFunction(): void;
  protected setCellReferenceOrCustomFunction(setFunction: (id: string, format: CellFunctionFormat) => void): void {
    if (this.selected !== null) {
      if (this.selected === 0) {
        setFunction(STORAGE_ID_NONE_FUNCTION, CellFunctionFormat.REFERENCE);
      } else
        if (this.selected !== this.functionItems.length - 1) {
          setFunction(this.functionItems[this.selected].id, CellFunctionFormat.REFERENCE);
        } else {
          setFunction(this.editor?.getValue() || '', CellFunctionFormat.CUSTOM);
        }
    }
  }
  abstract getCellFunction(): AttackgraphFunction | null;
  abstract getFunctionItems(): AttackgraphFunction[];

  private apply(): void {
    this.setCellFunction();
    this.result = true;
    this.closeDialog(this.ui);
  }

  private updateEditor() {
    if (this.selected !== null) {
      const value = this.functionItems[this.selected].fn;
      this.editor?.setValue(value);
      // if not a custom function, do not allow editing
      if (this.selected !== this.functionItems.length - 1) {
        this.editor?.setReadOnly(true);
      } else {
        this.editor?.setReadOnly(false);
      }
    }
  }

  private getDropdownMenu(): Element {
    const form = document.createElement('form');
    const tbody = document.createElement('tbody');

    this.updateEditor();
    const refresh = () => {
      this.fieldset.innerHTML = '';
      if (this.selected === null) {
        this.selected = this.functionItems.length - 1;
      }

      for (const [i, item] of this.functionItems.entries()) {
        const row = document.createElement('tr');
        const input = document.createElement('input');
        input.type = 'radio';
        input.title = item.name;
        input.name = 'functionitems';
        input.value = i.toString();

        mxEvent.addListener(input, 'click', () => {
          this.selected = i;
          this.updateEditor();
        })

        const text = document.createElement('span');
        text.innerHTML = item.name;

        if (i === this.selected) {
          input.checked = true;
        }
        const label = document.createElement('label');
        label.appendChild(input);
        label.appendChild(text);
        row.appendChild(label);
        tbody.appendChild(row);
      }
    }
    refresh();

    this.fieldset.appendChild(tbody);
    form.appendChild(this.fieldset);
    return form;
  }

  protected getCellReferenceOrCustomFunction(
    resolveIDFunction: () => string | null,
    resolveAttackGraphFunctionFunction: (graph: Draw.EditorGraph) => AttackgraphFunction | null
  ): AttackgraphFunction | null {

    const functionID = resolveIDFunction();
    const functionContent = resolveAttackGraphFunctionFunction(this.ui.editor.graph);

    if (functionID !== null && functionContent !== null) {
      return functionContent;
    } else {
      return null;
    }
  }
}


export class EditAggregationFunctionDialog extends EditCellFunctionDialog {

  getFunctionItems(): AttackgraphFunction[] {
    return AttributeRenderer.rootAttributes(this.ui.editor.graph).getGlobalAggregationFunctions();
  }

  setCellFunction(): void {
    this.setCellReferenceOrCustomFunction((id: string, format: CellFunctionFormat) => this.cell.setCellAggregationFunction(id, format));
  }

  getCellFunction(): AttackgraphFunction | null {
    return this.getCellReferenceOrCustomFunction(() => this.cell.resolveAggregationFunctionIDOfCell(), () => this.cell.resolveAggregationFunction(AttributeRenderer.rootAttributes(this.ui.editor.graph)))
  }
}


export class EditComputedAttributesFunctionDialog extends EditCellFunctionDialog {

  getFunctionItems(): AttackgraphFunction[] {
    return AttributeRenderer.rootAttributes(this.ui.editor.graph).getGlobalComputedAttributesFunctions();
  }

  setCellFunction(): void {
    this.setCellReferenceOrCustomFunction((id: string, format: CellFunctionFormat) => this.cell.setCellComputedAttributesFunction(id, format));
  }

  getCellFunction(): AttackgraphFunction | null {
    return this.getCellReferenceOrCustomFunction(() => this.cell.resolveComputedAttributesFunctionIDOfCell(), () => this.cell.resolveComputedAttributesFunction(AttributeRenderer.rootAttributes(this.ui.editor.graph)))
  }

}
