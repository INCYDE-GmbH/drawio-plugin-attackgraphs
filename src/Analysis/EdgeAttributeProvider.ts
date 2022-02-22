import { NodeAttributeProvider } from './NodeAttributeProvider';

export class EdgeAttributeProvider extends NodeAttributeProvider {

  getTooltip(): string {
    return '';
  }

  getEdgeWeight(): number | null {
    return this.parseEdgeWeight(this.getCellLabel()|| '');
  }

  parseEdgeWeight(input: string): number | null {
    const output = new RegExp('(-?\\d+)').exec(input);
    if (output !== null) {
      return parseInt(output[0]);
    } else {
      return null;
    }
  }
}
