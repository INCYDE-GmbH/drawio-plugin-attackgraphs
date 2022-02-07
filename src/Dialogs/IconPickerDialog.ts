import { KeyValuePairs } from '../Model';
import { SettingsDialog } from './SettingsDialog';

export class IconPickerDialog extends SettingsDialog<number | null>{
    private icons: KeyValuePairs;
    private iconSize: number;
    private iconBorderSize: number;
    private columns: number;
    private selected: number | null = null;
    private rows: number;
    private defaultBorderStyle = '2px solid white';
    private highlightedBorderStyle = '2px solid red';
    private title: string;

    constructor(ui: Draw.UI, width: number, height: number, icons: KeyValuePairs, title?: string, iconSize?: number) {
        super(ui, width, height, null);
        this.icons = icons;
        this.iconSize = iconSize || 24;
        this.iconBorderSize = Math.ceil(this.iconSize * 0.1);
        this.columns = Math.floor(this.width / (this.iconSize + 2 * this.iconBorderSize) - 1);
        this.title = title || '';
        this.rows = Math.ceil(Object.entries(this.icons).length / this.columns);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    override cancelDialog(ui: Draw.UI): void {
        this.selected = null;
        this.closeDialog();
    }

    createUIElements(): void {
        const titleDiv = this.getTitleDiv(`${mxResources.get('attackGraphs.pickIconForAttribute')} ${this.title}:`);
        const center = document.createElement('center');
        center.style.height = `${this.height - 100}px`;
        center.style.overflowY = 'scroll';
        center.style.display = 'block';
        const table = this.addIconTable(this.rows, this.columns);
        const buttons = this.createButtons();
        center.appendChild(table);
        this.container.appendChild(titleDiv);
        this.container.appendChild(center);
        this.container.appendChild(buttons);
    }

    private createButtons() {
        const buttons = document.createElement('div');
        buttons.style.padding = '10px';
        buttons.style.textAlign = 'right';
        buttons.style.whiteSpace = 'nowrap';

        const cancelBtn = mxUtils.button(mxResources.get('cancel'), () => {
            if (this.ui !== null) {
                this.cancelDialog(this.ui);
            }
        });
        cancelBtn.className = 'geBtn';

        buttons.appendChild(cancelBtn);


        const applyBtn = mxUtils.button(mxResources.get('apply'), () => {
            this.apply(this.selected);
            this.closeDialog();
        });
        applyBtn.className = 'geBtn gePrimaryBtn';
        buttons.appendChild(applyBtn);

        return buttons;
    }

    private addIconTable(rows: number, columns: number) {

        const table = document.createElement('table');
        table.style.borderCollapse = 'collapse';
        table.style.marginBottom = '20px';
        table.style.borderSpacing = '3px';
        const tbody = document.createElement('tbody');
        table.appendChild(tbody);

        for (let row = 0; row < rows; row++) {
            const tr = document.createElement('tr');

            for (let col = 0; col < columns; col++) {
                const td = document.createElement('td');
                td.style.boxSizing = 'border-box';
                const index = row * columns + col;

                td.style.outline = this.defaultBorderStyle;
                td.style.outlineOffset = '-4px';
                td.style.padding = `${this.iconBorderSize}px`;


                const iconEntry = Object.entries(this.icons)[index];
                if (iconEntry === undefined) {
                    continue;
                }
                const icon = iconEntry[1];
                const img = document.createElement('span');
                img.style.width = `${this.iconSize}px`;
                img.style.height = `${this.iconSize}px`;
                img.style.display = 'block';
                img.style.cursor = 'pointer';
                img.innerHTML = icon;

                if (img.children[0] !== undefined) {
                    img.children[0].setAttribute('width', '100%');
                    img.children[0].setAttribute('height', '100%');
                }

                td.appendChild(img);
                tr.appendChild(td);

                mxEvent.addListener(td, 'click', () => {
                    this.redrawTDOutline(this.selected, index, tbody);
                    this.selected = index;
                });

            }

            tbody.appendChild(tr);
        }

        return table;
    }


    protected closeDialog(): void {
        if (this.ui !== null) {
            this.ui.hideDialog();
        }
    }

    private redrawTDOutline(oldIndex: number | null, newIndex: number, tbody: HTMLTableSectionElement) {
        if (oldIndex !== null) {
            const oldRow = Math.floor(oldIndex / this.columns);
            const oldCol = oldIndex % this.columns;
            const oldSelection = tbody.rows[oldRow].children[oldCol] as HTMLTableRowElement;
            oldSelection.style.outline = this.defaultBorderStyle;
        }

        const newRow = Math.floor(newIndex / this.columns);
        const newCol = newIndex % this.columns;
        const newSelection = tbody.rows[newRow].children[newCol] as HTMLTableRowElement;
        newSelection.style.outline = this.highlightedBorderStyle;
    }
}
