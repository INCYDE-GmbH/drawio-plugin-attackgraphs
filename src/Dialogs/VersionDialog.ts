import { AsyncWorker } from '../AsyncUtils';

declare const __VERSION__: string;

type Release = {[id: string]: string};

export class VersionDialog {
  static readonly DISMISS_VERSION = 'ag.dismiss-version';

  private static release: Release | null = null;

  private readonly ui: Draw.UI;
  private readonly container: HTMLElement;
  private readonly width = 450;
  private readonly height = 250;
  private closed = false;


  constructor(ui: Draw.UI) {
    this.ui = ui;
    this.container = document.createElement('div');
  }

  async init(): Promise<void> {
    const release = await VersionDialog.fetchRelease();
    const version = await VersionDialog.fetchVersion();
    const url = release['html_url']; // Release page

    this.addTitle();
    this.addBody(version);
    this.addButtons(url, version);
  }

  show(): Promise<void> {
    return new Promise((resolve, reject) =>
      this.ui.showDialog(
        this.container,
        this.width,
        this.height,
        true,
        false,
        () => (this.closed) ? resolve() : reject(),
        true,
        false,
        undefined,
        false
      )
    )
  }

  /**
   * Compares the {@link current} version with the latest {@link version}.
   * 
   * @param version latest version according to GitHub in SemVer format.
   * @param current the version to compare against.
   * @returns
   *   - `< 0` if {@link latest} < {@link current}
   *   - `= 0` if {@link latest} = {@link current}
   *   - `> 0` if {@link latest} > {@link current}
   */
  static compare(latest: string, current: string): number {
    const latestv = latest.split('.').map(x => parseInt(x));
    const currentv = current.split('.').map(x => parseInt(x));

    if (currentv.length !== 3 && latestv.length !== 3) {
      throw new Error('Version number must have the format X.Y.Z');
    }

    for (const i of [0,1,2]) {
      if (latestv[i] > currentv[i]) {
        return 1;
      }
      if (latestv[i] < currentv[i]) {
        return -1;
      }
    }

    return 0;
  }

  static fetchRelease(overwrite?: boolean): Promise<Release> {
    overwrite = overwrite || false;
    return new Promise((resolve, reject) => {
      if (!overwrite && this.release) {
        resolve(this.release);
      }

      const worker = new Worker(AsyncWorker.determineScriptPath());
      worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
        if (e.data.result) {
          this.release = e.data.result as Release;
          resolve(this.release);
        } else if (e.data.error) {
          reject(e.data.error);
        } else {
          reject(mxResources.get('attackGraphs.updateError'));
        }
        worker.terminate();
      };
      worker.onerror = (e: ErrorEvent) => {        
        reject(e.message);
        worker.terminate();
      };

      const request: WorkerRequest = { type: 'Release' };
      worker.postMessage(request);
    });
  }

  static async fetchVersion(overwrite?: boolean): Promise<string> {
    const release = await this.fetchRelease(overwrite);
    return release['tag_name'].substring(1);
  }

  static async isLatestVersion(current?: string): Promise<boolean> {
    current = current || __VERSION__; 
    const latest = await this.fetchVersion();    
    return this.compare(latest, current) <= 0;
  }

  private closeDialog(): void {
    this.closed = true;
    this.ui.hideDialog();
  }

  private addTitle(): void {
    const title = document.createElement('h2');
    title.innerText = mxResources.get('attackGraphs.newVersionTitle');
    this.container.appendChild(title);
  }

  private addBody(version: string): void {
    const description = document.createElement('p');
    description.innerText = mxResources.get('attackGraphs.newVersionText')

    const currentVersion = document.createElement('p');
    const emph1 = document.createElement('strong');
    emph1.innerText = mxResources.get('attackGraphs.currentVersion');
    currentVersion.appendChild(emph1);
    currentVersion.innerHTML += ': ' + __VERSION__;

    const newVersion = document.createElement('p');
    const emph2 = document.createElement('strong');
    emph2.innerText = mxResources.get('attackGraphs.newVersion');
    newVersion.appendChild(emph2);
    newVersion.innerHTML += ': ' + version;

    this.container.appendChild(description);
    this.container.appendChild(currentVersion);
    this.container.appendChild(newVersion);
  }

  private addButtons(url: string, version: string): void {
    const openBtn = mxUtils.button(mxResources.get('attackGraphs.openRelease'), () => {
      window.open(url, '_blank', 'noreferrer');
    });
    openBtn.className = 'geBtn gePrimaryBtn';

    const dismissBtn = mxUtils.button(mxResources.get('attackGraphs.dismiss'), () => {
      const chk = document.querySelector<HTMLInputElement>('input[type=checkbox]#ag_dismiss_version');
      if (chk && chk.checked) {
        try {
          this.dismissRelease(version);
        } catch {
          mxUtils.alert(mxResources.get('attackGraphs.dismissReleaseError'));
        }
      }
      this.closeDialog();
    });
    dismissBtn.className = 'geBtn';

    const dismissReleaseChk = document.createElement('input');
    dismissReleaseChk.setAttribute('type', 'checkbox');
    dismissReleaseChk.setAttribute('id', 'ag_dismiss_version');
    const dismissReleaseLbl = document.createElement('label');
    dismissReleaseLbl.setAttribute('for', 'ag_dismiss_version');
    dismissReleaseLbl.innerHTML = mxResources.get('attackGraphs.dismissRelease');
    const dismissRelease = document.createElement('span');
    dismissRelease.style.marginLeft = '5px';
    dismissRelease.appendChild(dismissReleaseChk);
    dismissRelease.appendChild(dismissReleaseLbl);

    const div = document.createElement('div');
    for (const btn of [openBtn, dismissBtn, dismissRelease]) {
      div.appendChild(btn);
    }
    this.container.appendChild(div);
  }

  static getDismissedRelease(): string | null {
    return localStorage.getItem(VersionDialog.DISMISS_VERSION);
  }

  private dismissRelease(version: string): void {
    localStorage.setItem(VersionDialog.DISMISS_VERSION, version);
  }
}
