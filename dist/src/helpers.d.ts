export {};
declare const saveGraph: (nodes: any, conditions: any) => false | any[];
declare const removeEdges: (data: any, conditions: any) => any[];
declare const exportForProductionBuild: (graph: any, streetIds: any) => {
    nodes: any;
    pa: any;
    pan: string[];
};
declare const getRoutableOptions: (prod: any, exclude: [string]) => {
    nodeAttributesOptions: any;
    pathAttributesOptions: any;
};
declare const matchToNearestPath: (graph: any, coords: number[], type: string, match: any, pathNameIds: any) => any;
export { saveGraph, removeEdges, exportForProductionBuild, getRoutableOptions, matchToNearestPath, };
