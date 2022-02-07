import { SettingsDialog } from './SettingsDialog';

export class SettingsListDialog extends SettingsDialog<void> {
  private delFn: ((item: string) => void) | null = null;

  override createUIElements(): void {
    const top = document.createElement('div');
    const titleAggregationFunction = this.getTitleDiv('this.title');
    top.appendChild(titleAggregationFunction);

    const inner = document.createElement('div');
    inner.style.height = '120px';
    inner.style.overflow = 'auto';
    top.appendChild(inner);

    const plugins: string[] = [];

    const refresh = () => {
      if (plugins.length === 0) {
        inner.textContent = mxResources.get('attackGraphs.noItems');
      } else {
        inner.innerHTML = '';

        for (let i = 0; i < plugins.length; i++) {
          const span = document.createElement('span');
          span.style.whiteSpace = 'nowrap';

          const img = document.createElement('span');
          img.className = 'geSprite geSprite-delete';
          img.style.position = 'relative';
          img.style.cursor = 'pointer';
          img.style.top = '5px';
          img.style.marginRight = '4px';
          img.style.display = 'inline-block';
          span.appendChild(img);

          mxUtils.write(span, plugins[i]);
          inner.appendChild(span);

          mxUtils.br(inner, 1);

          mxEvent.addListener(img, 'click', (index => {
            return () => {
              this.ui?.confirm(mxResources.get('delete') + ' "' + plugins[index] + '"?', () => {
                if (this.delFn !== null) {
                  this.delFn(plugins[index]);
                }

                plugins.splice(index, 1);
                refresh();
              });
            };
          })(i));
        }
      }
    }

    refresh();

    this.container.append(top);
  }
}
