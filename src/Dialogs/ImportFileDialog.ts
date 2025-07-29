import { FileDialog, TemplateFile, TemplateType } from './FileDialog';

export class ImportFileDialog extends FileDialog {
  protected title: string | null = mxResources.get('attackgraphs.importFile');
  protected description: string | null = mxResources.get('attackgraphs.selectImportItems') + ':';
  protected applyBtn: string | null = mxResources.get('import');

  constructor(ui: Draw.UI, content: string, type: TemplateType, width?: number, height?: number) {
    const file = ImportFileDialog.convert2File(content);
    super(ui, file || ({} as TemplateFile), type, width, height);
  }

  static handleFileInput(e: Event): Promise<string> {
    return new Promise((resolve, reject) => {
      if (e.currentTarget) {
        const elem = e.currentTarget as HTMLInputElement;
        const files = elem.files;
        if (files && files.length === 1) {
          const reader = new FileReader();
          reader.readAsText(files[0], 'UTF-8');
          reader.onload = readerEvt => {
            if (readerEvt.target && readerEvt.target.result) {
              resolve(readerEvt.target.result as string);
            } else {
              // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
              reject(mxResources.get('error'));
            }
          };
        } else {
          // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
          reject(mxResources.get('attackgraphs.alertSelectSingleFile'));
        }
      } else {
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
        reject(mxResources.get('error'));
      }
    });
  }

  static convert2File(content: string): TemplateFile | null {
    try {
      const file = JSON.parse(content) as TemplateFile;
      if (FileDialog.isValidFile(file)) {
        return file;
      }
    } catch {
      // Do nothing...
    }
    return null;
  }
}
