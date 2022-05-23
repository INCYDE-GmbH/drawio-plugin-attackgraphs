import { AttackgraphFunction, getUUID } from '../Model';
import { EditFunctionDialog } from './EditFunctionDialog';
import { SettingsDialog } from './SettingsDialog';
import { STORAGE_ID_NONE_FUNCTION } from '../CellUtils';

type VertexType = {
  type: string,
  name: string,
  color: string,
  style: string,
  html: string
};

export abstract class FunctionListDialog extends SettingsDialog<AttackgraphFunction[]> {
  protected width = 360;
  protected height = 210;
  protected title: string | null = null;
  protected editDialogTitle: string | null = null;

  private items: AttackgraphFunction[] = [];
  private vertexTypes: VertexType[] = [
    {type: 'consequence', name: mxResources.get('attackGraphs.consequence'), color: '#FFFFFF', style: 'width:20px;height:12px;border:1px solid black;border-radius:5px;', html: '&nbsp;'},
    {type: 'activity_w', name: mxResources.get('attackGraphs.activity'), color: '#FFFFFF', style: 'width:20px;height:12px;border:1px solid black;', html: '&nbsp;'},
    {type: 'activity_g', name: mxResources.get('attackGraphs.activity'), color: '#D7E3BF', style: 'width:20px;height:12px;border:1px solid black;', html: '&nbsp;'},
    {type: 'activity_y', name: mxResources.get('attackGraphs.activity'), color: '#FEE599', style: 'width:20px;height:12px;border:1px solid black;', html: '&nbsp;'},
    {type: 'measurement', name: mxResources.get('attackGraphs.control'), color: '#DAE8FC', style: 'width:20px;height:12px;border:1px solid black;', html: '&nbsp;'},
    {type: 'or', name: 'OR', color: '#FFFFFF', style: '', html: 'OR'},
    {type: 'and', name: 'AND', color: '#FFFFFF', style: '', html: 'AND'}
  ];

  abstract getFunctionItems(): AttackgraphFunction[];
  abstract setFunctionItems(aggregationFunctions: AttackgraphFunction[]): void;

  override createUIElements(ui: Draw.UI): void {

    const top = document.createElement('div');
    const title = this.getTitleDiv(this.title || '');
    top.appendChild(title);

    const inner = document.createElement('div');
    inner.style.height = '120px';
    inner.style.overflow = 'auto';
    top.appendChild(inner);

    this.items = this.getFunctionItems()
      // Assign UUIDs to items that have not yet received one
      .map(x => x.id === undefined ? { ...x, id: getUUID() } : x);

    const refresh = () => {
      if (this.items.length === 0) {
        inner.textContent = mxResources.get('attackGraphs.noItems');
      } else {
        inner.innerHTML = '';

        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');
        table.style.borderCollapse = 'seperate';
        table.style.borderSpacing = '0';

        this.createDefaultFunctionSelectFormHeader(thead);

        let defaultTypes: string[] = [];
        for (let i = 0; i < this.items.length; i++) {
          const row = document.createElement('tr');
          const td = document.createElement('td');
          td.style.padding = '0 5px';
          const span = document.createElement('span');
          span.style.whiteSpace = 'nowrap';

          const imgDelete = document.createElement('span');
          imgDelete.className = 'geSprite geSprite-delete';
          imgDelete.style.position = 'relative';
          imgDelete.style.cursor = 'pointer';
          imgDelete.style.top = '5px';
          imgDelete.style.marginRight = '4px';
          imgDelete.style.display = 'inline-block';
          mxEvent.addListener(imgDelete, 'click', (index => {
            return () => {
              this.ui?.confirm(mxResources.get('delete') + ' "' + this.items[index].name + '"?', () => {
                this.items.splice(index, 1);
                refresh();
              });
            };
          })(i));
          span.appendChild(imgDelete);

          const imgEdit = document.createElement('span');
          imgEdit.className = 'geSprite geSprite-code';
          imgEdit.style.position = 'relative';
          imgEdit.style.cursor = 'pointer';
          imgEdit.style.top = '5px';
          imgEdit.style.marginRight = '4px';
          imgEdit.style.display = 'inline-block';
          mxEvent.addListener(imgEdit, 'click', (index => {
            return async () => {
              const dialog = new EditFunctionDialog(ui, undefined, undefined, this.items[index], this.editDialogTitle || '').init();
              if (await dialog.show()) {
                const result = dialog.result;

                if (result !== undefined && result !== null) {
                  //keep ID and the default types of an edited function
                  result.id = this.items[index].id;
                  result.default = this.items[index].default;
                  this.items[index] = result;
                  refresh();
                }
              }
            };
          })(i));
          span.appendChild(imgEdit);

          mxUtils.write(span, this.items[i].name);
          td.appendChild(span);
          row.appendChild(td);

          defaultTypes = defaultTypes.concat(this.items[i].default)
          this.appendDefaultFunctionSelectFormToRow(row, this.items[i].id, this.items[i].default);
          tbody.appendChild(row);
        }

        // 'None' function
        const row = document.createElement('tr');
        const td = document.createElement('td');
        td.setAttribute('style', 'padding:5px;')
        td.innerText = mxResources.get('attackGraphs.none');
        row.appendChild(td);
        this.appendDefaultFunctionSelectFormToRow(row, STORAGE_ID_NONE_FUNCTION, this.vertexTypes.map(e => e.type).filter(e => !defaultTypes.includes(e)));
        tbody.appendChild(row);

        table.appendChild(thead);
        table.appendChild(tbody);
        inner.appendChild(table);
      }
    }

    refresh();

    const addBtn = mxUtils.button(mxResources.get('add') + '...', async () => {
      const newAggregationFunction = { name: '', fn: '', id: '', default: [] };
      const dialog = new EditFunctionDialog(ui, undefined, undefined, newAggregationFunction, this.editDialogTitle || '').init();
      if (await dialog.show()) {
        const result = dialog.result;

        if (result !== undefined && result !== null) {
          this.items.push(result);
          refresh();
        }
      }
    });
    addBtn.className = 'geBtn';

    const applyBtn = this.getApplyButton(() => {
      this.apply(this.items);
      this.closeDialog(ui);
    });
    const cancelBtn = this.getCancelButton(() => {
      this.cancelDialog(ui)
    });

    const buttons = document.createElement('div');
    buttons.style.marginTop = '14px';
    buttons.style.textAlign = 'right';
    buttons.appendChild(addBtn);
    buttons.appendChild(applyBtn);
    buttons.appendChild(cancelBtn);

    this.container.append(top);
    this.container.appendChild(buttons);
  }

  private createDefaultFunctionSelectFormHeader(thead: HTMLTableSectionElement) : void {
    const row = document.createElement('tr');
    const emptyCell = document.createElement('td'); // Empty cell for title of function
    emptyCell.style.padding = '5px';
    emptyCell.innerHTML = '&nbsp;';
    row.appendChild(emptyCell);

    for (let i = 0; i < this.vertexTypes.length; i++) {
      const td = document.createElement('td');
      td.style.background = this.vertexTypes[i].color;
      td.style.borderLeft = '1px solid #E0E0E0';
      td.style.padding = '5px';

      const div = document.createElement('div');
      div.setAttribute('style', this.vertexTypes[i].style);
      div.setAttribute('title', this.vertexTypes[i].name);
      div.innerHTML = this.vertexTypes[i].html;

      td.appendChild(div);
      row.appendChild(td);
    }

    thead.appendChild(row);
  }

  private appendDefaultFunctionSelectFormToRow(row: HTMLTableRowElement, id: string, types: string[]): void {
    for (let i = 0; i < this.vertexTypes.length; i++) {
      const td = document.createElement('td');
      td.style.background = this.vertexTypes[i].color;
      td.style.borderLeft = '1px solid #E0E0E0';
      td.style.padding = '0 5px';

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = this.vertexTypes[i].type;
      input.className = id;
      input.addEventListener('click', () => {
        this.updateDefaultFunctions();
      });
      if (types.includes(this.vertexTypes[i].type)) {
        input.checked = true;
      }

      td.appendChild(input);
      row.appendChild(td);
    }
  }

  private updateDefaultFunctions(): void {
    this.items = this.items.map(fn => {
      fn.default = [];
      return fn;
    });

    const elements = document.querySelectorAll('input[type=radio]');
    for (let i = 0; i < elements.length; i++) {
      const e = elements[i];
      if (e instanceof HTMLInputElement && e.checked) {
        for (const fn of this.items.filter(fn => fn.id === e.className)) {
          fn.default.push(e.name);
        }
      }
    }
  }
}
