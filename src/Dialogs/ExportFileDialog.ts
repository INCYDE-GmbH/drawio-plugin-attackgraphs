import { AttackgraphFunction, GlobalAttribute } from '../Model';
import { FileDialog, TemplateFile, TemplateType } from './FileDialog';

export class ExportFileDialog extends FileDialog {
  protected title: string | null = mxResources.get('attackgraphs.exportFile');
  protected description: string | null = mxResources.get('attackgraphs.selectExportItems') + ':';
  protected applyBtn: string | null = mxResources.get('export');

  constructor(ui: Draw.UI, file: TemplateFile, width?: number, height?: number) {
    super(ui, file, TemplateType.All, width, height);
  }

  static handleFileOutput(file: TemplateFile): void {
    // https://stackoverflow.com/a/30832210
    const data = JSON.stringify(file);
    const target = new Blob([data], { type: 'application/json' });
    
    const a = document.createElement('a');
    const url = window.URL.createObjectURL(target);
    a.href = url;
    a.download = 'template.json';
    document.body.appendChild(a);

    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }

  static convert2File(
    defaultAttr: GlobalAttribute[],
    computedAttr: AttackgraphFunction[],
    aggFunctions: AttackgraphFunction[]): TemplateFile {
    return {
      'ag_type': 'template',
      'ag_version': 1,
      'default_attributes': defaultAttr,
      'computed_attributes': computedAttr,
      'aggregation_functions': aggFunctions
    };
  }
}
