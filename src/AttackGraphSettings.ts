import { CellStyles } from './Analysis/CellStyles';

export abstract class AttackGraphSettings {

    static isAttackGraphBool = false;

    static isAttackGraph(graph: Draw.EditorGraph): boolean {
        if (AttackGraphSettings.isAttackGraphBool) {
            return true;
        } else {
            for (const [, cell] of Object.entries(graph.model.cells as { [id: string]: import('mxgraph').mxCell })) {
                if (new CellStyles(cell).isAttackgraphCell()) {
                    AttackGraphSettings.isAttackGraphBool = true;
                    return true;
                }
            }
            return false;
        }
    }
}
