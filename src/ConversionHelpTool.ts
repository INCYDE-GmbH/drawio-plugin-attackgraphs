import { CellStyles } from './Analysis/CellStyles';
import { AttackGraphNodeShape } from './AttackGraphNodeShape';
import { AttributeRenderer } from './AttributeRenderer';

export class ConversionHelpTool {
    static graph: Draw.EditorGraph;

    static register(graph: Draw.EditorGraph): void {
        this.graph = graph;
    }

    static setDefaultAttributes(): void {
        ConversionHelpTool.setAttackGraphShape();
        const cells = this.graph.getSelectionCells();
        const attributes = AttributeRenderer.rootAttributes(ConversionHelpTool.graph).getGlobalAttributes();
        for (const cell of cells) {
            AttributeRenderer.nodeAttributes(cell).setCellAttributes(attributes || []);
        }
    }

    static setAttackGraphShape(): void {
        const cells = this.graph.getSelectionCells();
        for (const cell of cells) {
            if (!(AttackGraphNodeShape.ID === new CellStyles(cell).parseStyles().shape)) {
                cell.setStyle(cell.style + `shape=${AttackGraphNodeShape.ID};`);
            }
        }
    }
}
