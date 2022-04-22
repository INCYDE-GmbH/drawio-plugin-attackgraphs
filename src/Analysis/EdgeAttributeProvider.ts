import { NodeAttributeProvider } from './NodeAttributeProvider';

export class EdgeAttributeProvider extends NodeAttributeProvider {

  getTooltip(): string {
    return '';
  }

  getEdgeWeight(): string | null {
    return this.getCellLabel() || '';
  }

}
