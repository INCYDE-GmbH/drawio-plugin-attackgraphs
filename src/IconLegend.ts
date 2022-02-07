import { CellStyles } from './Analysis/CellStyles';
import { AttackGraphIconLegendShape } from './AttackGraphIconLegendShape';

export class IconLegend {
  static graph: Draw.EditorGraph | null = null;

  static register(graph: Draw.EditorGraph): void {
    this.graph = graph;
  }

  static updateLegend(count: number): void {
    if (this.graph !== null) {
      AttackGraphIconLegendShape.updateHeight(count);
      const height = AttackGraphIconLegendShape.getHeight();
      for (const [, cell] of Object.entries(this.graph.model.cells as { [id: string]: import('mxgraph').mxCell })) {
        const styles = new CellStyles(cell).parseStyles();
        if ('shape' in styles && styles['shape'] === AttackGraphIconLegendShape.ID) {
          const geometry = cell.geometry;
          const newGeometry = new mxGeometry(geometry.x, geometry.y, geometry.width, height);
          cell.geometry = newGeometry;
        }
      }
    }
  }
}
