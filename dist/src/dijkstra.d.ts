export {};
import { StreetMap } from ".";
declare const getShortestPath: (data: any, dataWithAttributes: any, start: any, finish: any, includeIcons: boolean, pathNameIds: StreetMap) => any[];
declare const getPathName: (nodeAId: string, nodeBId: string, streetIds: any[]) => string | null;
export { getShortestPath, getPathName };
