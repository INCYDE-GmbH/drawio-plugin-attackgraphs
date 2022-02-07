import { AttackgraphFunction, getUUID } from '../Model';
import { EditFunctionDialog } from './EditFunctionDialog';
import { SettingsDialog } from './SettingsDialog';

export abstract class FunctionListDialog extends SettingsDialog<AttackgraphFunction[]> {
  protected width = 360;
  protected height = 210;
  protected title: string | null = null;
  protected editDialogTitle: string | null = null;

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

    const items = this.getFunctionItems()
      // Assign UUIDs to items that have not yet received one
      .map(x => x.id === undefined ? { ...x, id: getUUID() } : x);

    const refresh = () => {
      if (items.length === 0) {
        inner.textContent = mxResources.get('attackGraphs.noItems');
      } else {
        inner.innerHTML = '';

        for (let i = 0; i < items.length; i++) {
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
              this.ui?.confirm(mxResources.get('delete') + ' "' + items[index].name + '"?', () => {
                items.splice(index, 1);
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
              const dialog = new EditFunctionDialog(ui, undefined, undefined, items[index], this.editDialogTitle || '').init();
              if (await dialog.show()) {
                const result = dialog.result;

                if (result !== undefined && result !== null) {
                  //keep ID of an edited function
                  result.id = items[index].id;
                  items[index] = result;
                  refresh();
                }
              }
            };
          })(i));
          span.appendChild(imgEdit);

          mxUtils.write(span, items[i].name);
          inner.appendChild(span);

          mxUtils.br(inner, 1);
        }
      }
    }

    refresh();

    const addBtn = mxUtils.button(mxResources.get('add') + '...', async () => {
      const newAggregationFunction = { name: '', fn: '', id: '' };
      const dialog = new EditFunctionDialog(ui, undefined, undefined, newAggregationFunction, this.editDialogTitle || '').init();
      if (await dialog.show()) {
        const result = dialog.result;

        if (result !== undefined && result !== null) {
          items.push(result);
          refresh();
        }
      }
    });
    addBtn.className = 'geBtn';

    const applyBtn = this.getApplyButton(() => {
      this.apply(items);
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
}
