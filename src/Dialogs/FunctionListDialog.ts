import { AttackgraphFunction, getUUID } from '../Model';
import { EditFunctionDialog } from './EditFunctionDialog';
import { SettingsDialog } from './SettingsDialog';
import { STORAGE_ID_NONE_FUNCTION } from '../CellUtils';

type VertexType = {
  type: string,
  name: string,
  style: string,
  html: string
};

const BORDER_STYLE = '1px solid #D0D0D0';
const VERTEX_TYPES: VertexType[] = [
  {type: 'consequence', name: 'attackGraphs.consequence', style: 'width:20px;height:12px;border:1px solid black;border-radius:5px;background:#FFFFFF;', html: '&nbsp;'},
  {type: 'impact', name: 'attackGraphs.impact', style: 'width:20px;height:12px;border:1px solid black;border-radius:5px;background:#ffcccb;', html: '&nbsp;'},
  {type: 'severity', name: 'attackGraphs.severity', style: 'rhombus;width:12px;height:12px;border:1px solid black;background:#FFFF8F;', html: '&nbsp;'},
  {type: 'activity_w', name: 'attackGraphs.activity', style: 'width:20px;height:12px;border:1px solid black;background:#FFFFFF;', html: '&nbsp;'},
  {type: 'activity_g', name: 'attackGraphs.activity', style: 'width:20px;height:12px;border:1px solid black;background:#D7E3BF;', html: '&nbsp;'},
  {type: 'activity_y', name: 'attackGraphs.activity', style: 'width:20px;height:12px;border:1px solid black;background:#FEE599;', html: '&nbsp;'},
  {type: 'measurement', name: 'attackGraphs.control', style: 'width:20px;height:12px;border:1px solid black;background:#DAE8FC;', html: '&nbsp;'},
  {type: 'or', name: 'attackGraphs.orNode', style: '', html: 'OR'},
  {type: 'and', name: 'attackGraphs.andNode', style: '', html: 'AND'},
  {type: 'link', name: 'attackGraphs.link', style: 'width: 12px;height:12px;border-radius:6px;border:1px solid black;background:#FFFFFF;text-align:center;font-size:11px;', html: 'A'}
];

export abstract class FunctionListDialog extends SettingsDialog<AttackgraphFunction[]> {
  protected width = 500;
  protected height = 360;
  protected title: string | null = null;
  protected editDialogTitle: string | null = null;

  private items: AttackgraphFunction[] = [];

  abstract getFunctionItems(): AttackgraphFunction[];
  abstract setFunctionItems(aggregationFunctions: AttackgraphFunction[]): void;

  override createUIElements(ui: Draw.UI): void {

    const top = document.createElement('div');
    const title = this.getTitleDiv(this.title || '');
    top.appendChild(title);

    const inner = document.createElement('div');
    inner.style.height = '270px';
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
          td.style.borderRight = BORDER_STYLE;
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
        td.style.padding = '5px';
        td.style.borderRight = BORDER_STYLE;
        td.style.textAlign = 'center';
        td.innerText = mxResources.get('attackGraphs.none');
        row.appendChild(td);
        this.appendDefaultFunctionSelectFormToRow(row, STORAGE_ID_NONE_FUNCTION, VERTEX_TYPES.map(e => e.type).filter(e => !defaultTypes.includes(e)));
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
    for (let i = 0; i < VERTEX_TYPES.length; i++) {
      const td = document.createElement('td');
      td.style.borderRight = BORDER_STYLE;
      td.style.borderBottom = BORDER_STYLE;
      td.style.padding = '5px';

      const div = document.createElement('div');
      div.setAttribute('style', VERTEX_TYPES[i].style);
      div.setAttribute('title', mxResources.get(VERTEX_TYPES[i].name));
      div.innerHTML = VERTEX_TYPES[i].html;

      td.appendChild(div);
      row.appendChild(td);
    }

    const headingRow = document.createElement('tr');
    const emptyCell = document.createElement('td'); // Empty cell for title of function
    emptyCell.rowSpan = 2;
    emptyCell.style.padding = '5px';
    emptyCell.style.borderRight = BORDER_STYLE;
    emptyCell.style.borderBottom = BORDER_STYLE;
    emptyCell.innerHTML = '&nbsp;';
    headingRow.appendChild(emptyCell);

    const heading = document.createElement('td');
    heading.colSpan = VERTEX_TYPES.length;
    heading.style.textAlign = 'center';
    heading.style.padding = '5px';
    heading.style.borderRight = BORDER_STYLE;
    heading.style.borderBottom = BORDER_STYLE;
    heading.innerText = mxResources.get('attackGraphs.defaultFunction');
    headingRow.appendChild(heading);

    thead.appendChild(headingRow);
    thead.appendChild(row);
  }

  private appendDefaultFunctionSelectFormToRow(row: HTMLTableRowElement, id: string, types: string[]): void {
    for (let i = 0; i < VERTEX_TYPES.length; i++) {
      const td = document.createElement('td');
      td.style.borderRight = BORDER_STYLE;
      td.style.padding = '0 5px';

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = VERTEX_TYPES[i].type;
      input.className = id;
      input.addEventListener('click', () => {
        this.updateDefaultFunctions();
      });
      if (types.includes(VERTEX_TYPES[i].type)) {
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
