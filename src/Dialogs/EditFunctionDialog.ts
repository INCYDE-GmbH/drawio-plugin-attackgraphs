import { AttackgraphFunction, getUUID } from '../Model';
import { SettingsDialog } from './SettingsDialog';
import ace from 'ace-builds';
import 'ace-builds/src-noconflict/mode-javascript';

export class EditFunctionDialog extends SettingsDialog<AttackgraphFunction> {
  protected editor?: ace.Ace.Editor;
  protected width = 700;
  protected height = 400;
  title: string;

  constructor(ui: Draw.UI, width = 700, height = 400, initialValue: AttackgraphFunction, title: string) {
    super(ui, width, height, initialValue);
    this.width = width;
    this.height = height;
    this.title = title;
  }

  override createUIElements(ui: Draw.UI): void {
    const top = document.createElement('div');
    top.style.cssText = 'position:absolute;top:30px;left:30px;right:30px;bottom:80px;overflowY=scroll;display:flex;flex-direction:column;';

    const title = this.getTitleDiv(this.title);
    top.appendChild(title);

    const form = new mxForm('properties');
    form.table.style.width = '100%';
    const nameInput = form.addText('Name', this.initialValue?.name, '');
    top.appendChild(form.table);

    const input = document.createElement('div');
    input.style.cssText = 'flex-grow:1';
    input.textContent = this.initialValue?.fn || '';
    top.appendChild(input);

    this.editor = ace.edit(input, {
      mode: 'ace/mode/javascript',
      useWorker: false,
    });

    top.appendChild(this.editor.container);

    this.container.appendChild(top);

    const buttons = document.createElement('div');
    buttons.style.cssText = 'position:absolute;left:30px;right:30px;text-align:right;bottom:30px;height:40px;';
    const applyBtn = this.getApplyButton(() => {
      if (this.editor?.getValue().replace(new RegExp('\\s*'), '') !== '' &&
        nameInput.value.replace(new RegExp('\\s*'), '') !== '') {
        this.apply({
          name: nameInput.value || '',
          id: getUUID() || '',
          fn: this.editor?.getValue() || '',
          default: []
        });
        this.closeDialog(ui);
      } else {
        this.setAlertMessage('Empty function!');
      }

    });
    const cancelBtn = this.getCancelButton(() => {
      this.cancelDialog(ui)
    });
    buttons.appendChild(applyBtn);
    buttons.appendChild(cancelBtn);
    top.appendChild(this.alertMessage);
    this.container.appendChild(buttons);
  }
}
