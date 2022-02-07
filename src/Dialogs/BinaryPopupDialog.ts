
export class BinaryPopupDialog {
    private ui: Draw.UI;
    private title: string;
    private text: string;
    private acceptString: string;
    private declineString: string;
    private acceptCallback: () => void;
    private declineCallback: () => void;
    private container: HTMLElement = document.createElement('div');
    width: number;
    height: number;
    result: boolean | undefined = undefined;
    customButtons?: [string, () => void][];


    constructor(ui: Draw.UI, text: string, width = 200, height = 100, title?: string, acceptString?: string, declineString?: string, acceptCallback?: () => void, declineCallback?: () => void, customButtons?: [string, () => void][]) {
        this.ui = ui;
        this.title = title || '';
        this.text = text;
        this.acceptString = acceptString || mxResources.get('attackGraphs.ok');
        this.declineString = declineString || mxResources.get('attackGraphs.no');
        this.customButtons = customButtons;
        const _acceptCallback = () => {
            this.result = true;
        };
        const _declineCallback = () => {
            this.result = false;
        };
        this.acceptCallback = acceptCallback || _acceptCallback;
        this.declineCallback = declineCallback || _declineCallback;
        this.width = width;
        this.height = height;

        this.buildUI();
    }

    show(): Promise<boolean | undefined> {
        return new Promise((resolve,) => {
            this.ui?.showDialog(this.container, this.width * 1.1, this.height, true, false, () => {
                return resolve(this.result);
            }, false);
        });
    }

    private buildUI(): void {
        const title = document.createElement('h3');
        title.style.cssText = 'position:absolute;top:30px;left:30px;right:30px;bottom:80px;overflowY=scroll;'
        mxUtils.write(title, this.title);
        const text = document.createElement('div');
        mxUtils.write(text, this.text);
        text.style.cssText = 'position:absolute;top:90px;display:block;boxSizing:border-box;whiteSpace:nowrap;marginTop:6px;overflowY=scroll;';
        const buttons = document.createElement('div');
        const declineBtn = mxUtils.button(this.declineString, () => {
            this.declineCallback();
            this.ui.hideDialog();
        });
        declineBtn.className = 'geBtn';
        const acceptBtn = mxUtils.button(this.acceptString, () => {
            this.acceptCallback();
            this.ui.hideDialog();
        });
        acceptBtn.className = 'geBtn gePrimaryBtn';

        title.style.padding = '10px';
        text.style.padding = '10px';
        buttons.style.cssText = 'position:absolute;left:30px;right:30px;text-align:right;bottom:30px;height:40px;';
        buttons.style.padding = '10px';

        buttons.appendChild(acceptBtn);
        buttons.appendChild(declineBtn);
        this.addCustomButtons(buttons);
        this.container.appendChild(title);
        this.container.appendChild(text);
        this.container.appendChild(buttons);
    }

    private addCustomButtons(buttons: HTMLDivElement) {
        if (this.customButtons !== undefined) {
            for (const [title, callback] of this.customButtons) {
                const btn = buttons.appendChild(mxUtils.button(title, () => callback()));
                btn.className = 'geBtn';
            }
        }
    }

}
