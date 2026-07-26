interface Data {
    [key: string]: any;
}
interface ProductionGraph {
    nodes: any;
    nan: string;
    na: any;
    pa: any;
    pan: string[];
}
export interface StreetMap {
    [key: number]: string;
}
interface SecondArgument {
    includeIcons: boolean;
    pathNameIds: StreetMap;
}
declare const getProductionBuild: (data: any, streetIds: any) => ProductionGraph;
declare const getRoomEntranceNodes: (graph: any, roomNumber: string) => string[];
export { getRoomEntranceNodes, getProductionBuild };
export declare class IndoorGraphs {
    data: any;
    includeIcons: boolean;
    pathNameIds: StreetMap;
    conditions: any;
    constructor(data: Data, options?: SecondArgument);
    getNodeRemovalConditions(): any;
    getEdgeRemovalConditions(): any;
    getData(): any;
    getNodeAttributes(): any;
    getPathAttributes(): any;
    getRoutableOptions(options: any): {
        nodeAttributesOptions: any;
        pathAttributesOptions: any;
    };
    setData(data: Data): any;
    removeNodes(nodeRemovalConditions: any): void;
    removeEdges(edgeRemovalConditions: any): void;
    private isProdBuild;
    isNodeValid(data: Data, node: string, type: string): boolean;
    constructErrorMessage(message: string): string[];
    getRoute(start: string | number[], dest: string | number[], options?: any): any;
    private matchToNearestPath;
    addGraph(graph: any): string[];
}
