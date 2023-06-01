import { RootAttributeProvider } from '../Analysis/RootAttributeProvider';
import { AttributeRenderer } from '../AttributeRenderer';
import { Framework7Icons } from '../Framework7Icons';
import { IconLegend } from '../IconLegend';
import { GlobalAttribute } from '../Model';
import { IconPickerDialog } from './IconPickerDialog';
import { TemplateType } from './FileDialog';
import { SettingsDialog } from './SettingsDialog';


export class DefaultAttributesDialog extends SettingsDialog<true> {
  values: GlobalAttribute[] = [];
  attributeTable: HTMLTableElement = document.createElement('table');
  icons = Framework7Icons.Icons;
  protected minTextAreas: HTMLInputElement[] = [];
  protected maxTextAreas: HTMLInputElement[] = [];

  override init(): DefaultAttributesDialog {
    this.values = this.getGlobalAttributes();
    super.init();
    return this;
  }

  private getGlobalAttributes(): GlobalAttribute[] {
    if (this.ui !== null) {
      return AttributeRenderer.rootAttributes().getGlobalAttributes() || [];
    }
    return [];
  }

  private collectValues(): GlobalAttribute[] {
    const values: GlobalAttribute[] = [];
    for (const [index, attribute] of this.values.entries()) {
      const textAreaValue = this.textAreas[index].value;
      attribute.value = textAreaValue;
      attribute.min = this.minTextAreas[index].value;
      if (attribute.min === '') {
        attribute.min = '0';
      }

      attribute.max = this.maxTextAreas[index].value;
      if (attribute.max === '') {
        this.setAlertMessage(`${mxResources.get('attackGraphs.mustAssignMaxValue')}: ${attribute.name}`);
      }
      values[index] = attribute;
    }
    return values;
  }

  saveAttributes(values?: GlobalAttribute[]): void {
    if (this.ui !== null) {
      AttributeRenderer.rootAttributes().setGlobalAttributes(values ? values : this.collectValues());
    }
  }

  override createUIElements(ui: Draw.UI): void {
    const top = document.createElement('div');
    const newProp = document.createElement('div');
    const buttons = document.createElement('div');

    top.style.cssText = 'position:absolute;top:30px;left:30px;right:30px;bottom:80px;overflowY=scroll;'
    newProp.style.cssText = 'boxSizing:border-box;whiteSpace:nowrap;marginTop:6px;width:100%;overflowY=scroll;';
    buttons.style.cssText = 'position:absolute;left:30px;right:30px;text-align:right;bottom:30px;height:40px;';

    const globalAttributesTitle = this.getTitleDiv(mxResources.get('attackGraphs.defaultAttributes'));
    const addMoreGlobalAttributesTitle = this.getTitleDiv(mxResources.get('attackGraphs.addFurther'));

    // Form
    const form = new mxForm('properties');
    form.table.style.cssText = 'width:100%;display:block;overflow-x:auto;white-space:nowrap;';
    this.attributeTable = form.table;
    this.addTextAreasTo(form, this.values);

    // Add properties
    const keyInputArea = this.getInputArea(mxResources.get('attackGraphs.attributeName'));
    mxEvent.addListener(keyInputArea, 'keyup', () => {
      this.updateButton(addBtn, keyInputArea.value.length > 0);
    });
    mxEvent.addListener(keyInputArea, 'change', () => {
      this.updateButton(addBtn, keyInputArea.value.length > 0);
    });
    const valueInputArea = this.getInputArea(mxResources.get('attackGraphs.attributeValue'));
    const inputWrapper = document.createElement('div');
    inputWrapper.style.cssText = 'flex - direction: row;';
    inputWrapper.appendChild(keyInputArea);
    inputWrapper.appendChild(valueInputArea);

    const addBtn = this.getAddButton(() => {
      if (keyInputArea.value.replace(new RegExp('\\s*'), '') === '') {
        this.setAlertMessage(mxResources.get('attackGraphs.invalidAttributeName'));
        return;
      }

      if (!this.addEntryTo({ name: keyInputArea.value, value: valueInputArea.value, iconName: '' }, this.values)) {
        this.setAlertMessage(mxResources.get('attackGraphs.propertyDefinedTwice'));
        return;
      }

      this.setAlertMessage();
      this.addCustomRowToForm(form, { name: keyInputArea.value, value: valueInputArea.value, iconName: '', min: '', max: '' });
      this.clearInput(keyInputArea);
      this.clearInput(valueInputArea);
      this.updateButton(addBtn, keyInputArea.value.length > 0);
    });
    newProp.appendChild(inputWrapper);
    newProp.appendChild(addBtn);

    // Dialog buttons
    const applyBtn = this.getApplyButton(() => {
      if (this.checkMinMaxValue()) {
        this.apply(true);
        this.closeDialog(ui);
        if (this.ui !== null && this.ui.editor.graph !== null) {
          IconLegend.updateLegend(this.getRenderableAttributes().length);
        }
      }
    });
    const cancelBtn = this.getCancelButton(() => {
      this.cancelDialog(ui)
    });

    buttons.appendChild(applyBtn);
    buttons.appendChild(cancelBtn);

    // Construct dialog
    top.appendChild(this.alertMessage);

    top.appendChild(globalAttributesTitle);
    top.appendChild(form.table);
    if (Object.entries(this.values).length === 0) {
      const noElements = document.createElement('p');
      noElements.textContent = mxResources.get('attackGraphs.noAttributes');
      top.appendChild(noElements);
    }

    top.appendChild(addMoreGlobalAttributesTitle);
    top.appendChild(newProp);

    top.appendChild(
      this.getImportFileDiv(
        TemplateType.DefaulttAttributes,
        file => this.updateAttributes(file.default_attributes, form)
      )
    );

    this.container.append(top);
    this.container.appendChild(buttons);
  }

  private checkMinMaxValue(): boolean {
    for (let index = 0; index < this.values.length; index++) {
      if (this.minTextAreas[index].value === '') {
        this.minTextAreas[index].value = '0';
      }

      if (this.maxTextAreas[index].value === '') {
        this.setAlertMessage(`${mxResources.get('attackGraphs.mustAssignMaxValue')}: ${this.values[index].name}`);
        return false;
      }
    }
    return true;
  }

  private getAddButton(
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

  protected override addTextAreasTo(
    form: import('mxgraph').mxForm,
    properties: GlobalAttribute[]
  ): void {
    for (const entry of properties) {
      this.addCustomRowToForm(form, entry);
    }
  }

  protected addCustomRowToForm(form: import('mxgraph').mxForm, attribute: GlobalAttribute): void {
    super.addRowToForm(form, attribute.name, attribute.value);

    const index = form.table.rows.length - 1;
    const row = form.table.rows[index];

    this.addIconPickerToRow(row, () => this.setIconPickerCallback(row), Framework7Icons.Icons[this.values[index].iconName]);
    this.addMinMaxInputToRow(row);
    this.addUpDownBtnToRow(row);
    this.minTextAreas[index].value = attribute.min || '';
    this.maxTextAreas[index].value = attribute.max || '';
  }

  private addCustomButtonTo(element: Element, callback: () => void, icon?: string,) {
    const img = document.createElement('span');
    if (icon !== undefined) {
      img.innerHTML = icon;
    } else {
      img.innerHTML = Framework7Icons.Icons.question;
    }
    img.style.width = `24px`;
    img.style.height = `24px`;
    img.style.cursor = 'pointer';

    if (img.children[0] !== undefined) {
      this.resizeSVG(img.children[0], '100%', '100%');
    }
    img.style.position = 'relative';
    img.style.marginRight = '4px';
    img.style.display = 'inline-block';
    mxEvent.addListener(img, 'click', callback);
    element.appendChild(img);
  }

  private setIconOfButton(index: number, icon: string): void {
    const row = Array.from(this.attributeTable.rows)[index];
    if (row.children[0].children[0] !== null) {
      row.children[0].children[0].innerHTML = icon;
      this.resizeSVG(row.children[0].children[0].children[0], '100%', '100%');
    }
  }

  private addMinMaxInputToRow(row: HTMLTableRowElement) {
    const tdMin = document.createElement('td');
    const tdTextMin = document.createElement('td');
    const min = document.createElement('input');
    min.setAttribute('name', 'min');
    min.style.width = '4ch';
    tdTextMin.innerHTML = 'Min:';
    tdMin.appendChild(min);
    const tdMax = document.createElement('td');
    const tdTextMax = document.createElement('td');
    const max = document.createElement('input');
    max.setAttribute('name', 'max');
    max.style.width = '4ch';
    tdTextMax.innerHTML = 'Max:';
    tdMax.appendChild(max);

    row.insertBefore(tdTextMin, row.children[row.children.length - 1]);
    row.insertBefore(tdMin, row.children[row.children.length - 1]);
    row.insertBefore(tdTextMax, row.children[row.children.length - 1]);
    row.insertBefore(tdMax, row.children[row.children.length - 1]);

    this.minTextAreas.push(min);
    this.maxTextAreas.push(max);
  }

  private addUpDownBtnToRow(row: HTMLTableRowElement) {
    const tdUp = document.createElement('td');
    tdUp.appendChild(this.createUpDownBtn(() => {
      const table = row.parentElement as HTMLTableElement;
      const idx = row.rowIndex;

      if (idx !== null && idx > 0) {
        [this.minTextAreas[idx], this.minTextAreas[idx-1]] = [this.minTextAreas[idx-1], this.minTextAreas[idx]];
        [this.maxTextAreas[idx], this.maxTextAreas[idx-1]] = [this.maxTextAreas[idx-1], this.maxTextAreas[idx]];
        [this.textAreas[idx], this.textAreas[idx-1]] = [this.textAreas[idx-1], this.textAreas[idx]];
        [this.values[idx], this.values[idx-1]] = [this.values[idx-1], this.values[idx]];

        table.insertBefore(table.rows[idx], table.rows[idx-1]);
      }
    }, Framework7Icons.Icons.control));
    tdUp.title = 'Up';

    const tdDown = document.createElement('td');
    tdDown.appendChild(this.createUpDownBtn(() => {
      const table = row.parentElement as HTMLTableElement;
      const idx = row.rowIndex;

      if (idx !== null && idx < table.rows.length - 1) {
        [this.minTextAreas[idx], this.minTextAreas[idx+1]] = [this.minTextAreas[idx+1], this.minTextAreas[idx]];
        [this.maxTextAreas[idx], this.maxTextAreas[idx+1]] = [this.maxTextAreas[idx+1], this.maxTextAreas[idx]];
        [this.textAreas[idx], this.textAreas[idx+1]] = [this.textAreas[idx+1], this.textAreas[idx]];
        [this.values[idx], this.values[idx+1]] = [this.values[idx+1], this.values[idx]];

        table.insertBefore(table.rows[idx], table.rows[idx+2] || null);
      }
    }, Framework7Icons.Icons.control));
    tdDown.title = 'Down';
    tdDown.style.transform = 'rotate(180deg)';

    row.insertBefore(tdUp, row.children[row.children.length - 1]);
    row.insertBefore(tdDown, row.children[row.children.length - 1]);
  }

  private createUpDownBtn(callback: () => void, icon?: string): HTMLElement {
    const btn = mxUtils.button('', callback) as HTMLElement;
    if (icon !== undefined) {
      btn.innerHTML = icon;
    } else {
      btn.innerHTML = Framework7Icons.Icons.question;
    }
    btn.style.width = `24px`;
    btn.style.height = `24px`;
    btn.style.cursor = 'pointer';
    if (btn.children[0] !== undefined) {
      this.resizeSVG(btn.children[0], '100%', '100%');
    }
    btn.style.position = 'relative';
    btn.style.display = 'inline-block';
    return btn;
  }

  protected override removeRowFromForm(form: import('mxgraph').mxForm, row: HTMLTableRowElement): number | null {
    const index = super.removeRowFromForm(form, row);
    if (index !== null) {
      this.minTextAreas.splice(index, 1);
      this.maxTextAreas.splice(index, 1);
    }
    return index;
  }

  private addIconPickerToRow(row: HTMLTableRowElement, callback: () => void, icon?: string): void {
    const td = document.createElement('td');
    td.setAttribute('name', 'icon_picker');
    if (row.firstChild !== null) {
      row.insertBefore(td, row.firstChild);
    } else {
      row.appendChild(td);
    }
    this.addCustomButtonTo(td, callback, icon);
  }

  private resizeSVG(element: Element, width: string, height: string): void {
    element.setAttribute('width', width);
    element.setAttribute('height', height);
  }

  private setIconPickerCallback(row: HTMLTableRowElement) {
    void (async () => {
      if (this.ui !== null) {
        const index = row.rowIndex;
        const title = this.values[index].name;
        const dialog = new IconPickerDialog(this.ui, 600, 400, this.icons, title).init();
        if (await dialog.show()) {
          const result = dialog.result;

          if (result !== undefined && result !== null) {
            const resultIcon = Object.entries(Framework7Icons.Icons)[result];
            const iconName = resultIcon[0];
            const iconContent = resultIcon[1];
            this.values[index].iconName = iconName;
            this.setIconOfButton(index, iconContent);
          }
        }
      }
    })();
  }

  getRenderableAttributes(): GlobalAttribute[] {
    return RootAttributeProvider.getRenderableAttributes(this.values);
  }

  private updateAttributes(attributes: GlobalAttribute[], form?: import('mxgraph').mxForm): void {
    for (const attribute of attributes) {
      const idx = this.values.findIndex(x => x.name === attribute.name)
      if (idx >= 0) {
        this.values[idx] = attribute;
        this.textAreas[idx].value = attribute.value;
        this.minTextAreas[idx].value = attribute.min;
        this.maxTextAreas[idx].value = attribute.max;
      } else {
        this.values.push(attribute);
        if (form) {
          this.addCustomRowToForm(form, attribute);
        }
      }
    }
  }

  /**
   * Allows to import a list of attributes.
   * Intended to be used by the template import dialog.
   */
  static importAttributes(ui: Draw.UI, attributes: GlobalAttribute[]): void {
    const dlg = new DefaultAttributesDialog(ui, 0, 0);
    dlg.values = dlg.getGlobalAttributes();
    dlg.updateAttributes(attributes);
    dlg.saveAttributes(dlg.values);
  }

  /**
   * Allows to export a list of attributes.
   * Intended to be used by the template export dialog.
   */
  static exportAttributes(ui: Draw.UI): GlobalAttribute[] {
    const dlg = new DefaultAttributesDialog(ui, 0, 0);
    return dlg.getGlobalAttributes();
  }
}
