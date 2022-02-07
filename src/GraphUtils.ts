export class GraphUtils {
  static isTree(cell: import('mxgraph').mxCell): boolean {
    return !this.findLoopViaDepthFirstSearch(cell);
  }

  private static findLoopViaDepthFirstSearch(cell: import('mxgraph').mxCell): boolean {
    return this.isCyclic(cell, []);
  }

  private static isCyclic(cell: import('mxgraph').mxCell, visited: import('mxgraph').mxCell[]): boolean {
    visited.push(cell);
    const outgoingEdges = cell.edges?.filter(x => x.source === cell && x.target) || [];
    if (outgoingEdges.length > 0) {
      return outgoingEdges.map(edge => {
        if (!visited.includes(edge.target)) {
          return this.isCyclic(edge.target, visited.slice(0));
        } else {
          return true;
        }
      }).some((element) => element === true);
    } else {
      return false;
    }
  }
}


