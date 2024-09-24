const { saveGraph, exportForProductionBuild, getRoutableOptions, matchToNearestPath } = require('./helpers')
const { getShortestPath } = require('./dijkstra');

interface Data {
  [key: string]: any
}

const validateData = (graph: any) => {
  let invalidProperties: any = null;

  // check if user passed nothing or no object
  if (!graph || typeof graph !== "object") return { invalid: true, message: "Please provide a valid indoor graph." };

  // prod graph
  if (graph.hasOwnProperty("nan")) {
    // todo

    return invalidProperties ? invalidProperties : { invalid: false, message: null };
  } 

  // check if structure of passed graph is not {graph: {}, pathAttributes: {}}
  if (!graph.hasOwnProperty("nodes") || !graph.hasOwnProperty("pathAttributes")) return { invalid: true, message: "Graph is not of type {nodes: {}, pathAttributes: {}}. Please provide a valid indoor graph." };

  // check if user passed no nodes
  if (Object.keys(graph.nodes).length === 0) return { invalid: true, message: "Please provide nodes." };

  // check for valid properties
  Object.entries(graph.nodes).map(([id, properties]) => {
    // only account for valid nodes, not temporary map matching nodes
    if (id === "matchedTempStart" || id === "matchedTempDest" ) return;

    const keys = ["coordinates", "id",  "level", "adjacentNodes"]
    // check for valid keys
    keys.map(key => {
      if (!properties.hasOwnProperty(key)) {
        invalidProperties = { invalid: true, message: `node ${id} is missing property "${key}"` };
      }
    })
    // check for valid value types    
  })
 
  // todo: validate path attributes
  return invalidProperties ? invalidProperties : { invalid: false, message: null };
}

export interface StreetMap {
  [key: number]: string;
}

interface SecondArgument {
  includeIcons: boolean,
  pathNameIds: StreetMap;
}

const getProductionBuild = (data: any, streetIds: any) => {
  const exportGraph = exportForProductionBuild(data, streetIds);

  return exportGraph;
}

const getRoomEntranceNodes = (graph: any, roomNumber: string) => {
  const belongsToRoomIndex = graph.nan?.indexOf('belongsToRoom');

  const entrances: string[] = [];

  Object.values(graph.nodes).map((node: any) => {
    const nodeID = node[1];
    const attributesID = node[3];
    const attributes = graph.na[attributesID];

    if (attributesID) {
      const belongsToRoom = attributes && attributes[belongsToRoomIndex];

      if (belongsToRoom === roomNumber) entrances.push(nodeID);
    }
  });

  return entrances;
};

exports.getRoomEntranceNodes = getRoomEntranceNodes;
exports.getProductionBuild = getProductionBuild;

exports.IndoorGraphs = class IndoorGraphs {
  data: any;
  includeIcons: boolean;
  pathNameIds: StreetMap;
  lang: string;
  conditions: any;

  constructor(data: Data, options: SecondArgument = {
    includeIcons: false,
    pathNameIds: null
  }) {
    const { invalid, message } = validateData(data);

    if (invalid) {
      throw new TypeError(message);
    }

    const { includeIcons, pathNameIds }: SecondArgument = options;

    this.includeIcons = includeIcons;
    this.pathNameIds = pathNameIds;
    this.conditions = {
      nodeRemovalConditions: [],
      edgeRemovalConditions: []
    } 
    this.data = data;
  }

  getNodeRemovalConditions() {
    return this.conditions.nodeRemovalConditions;
  }

  getEdgeRemovalConditions() {
    return this.conditions.edgeRemovalConditions;
  }

  getData () {
    return this.data
  }

  getNodeAttributes () {
    const prodBuild = getProductionBuild(this.data, null)

    if (this.isProdBuild(this.data)) return { nodeAttributes: prodBuild.na, nodeAttributeNames: prodBuild.nan }
    else {
      // todo: extract node attributes
      return this.data
    }
  }

  getPathAttributes () {
    const pathAttributes = Object.keys(this.data.pathAttributes);

    if (pathAttributes.length > 0 && pathAttributes[0].includes("-")) {
      // if the provided nodes are not production ready, convert to prod build first
      const prodBuild = getProductionBuild(this.data, null);

      return prodBuild.pa
    } else {
      return this.data.pathAttributes
    }
  }

  // returns all the attributes present in the graph
  // these can be utilized to request accessible paths
  getRoutableOptions (options: any) {
    const exclude = options?.exclude;

    // differentiate if user provided dev or prod build    
    // todo: write test if user passed prod build
    const isProdBuild = this.isProdBuild(this.data);
    const routableOptions = getRoutableOptions(isProdBuild ? this.data : getProductionBuild(this.data, null), exclude) 

    return routableOptions   
  }

  setData (data: Data) {
    const { invalid, message } = validateData(data);

    if (!data || invalid || !data["nodes"] || Object.keys(data).length === 0) {

      return message
    }

    this.data = data
  }

  // Removes nodes from the graph that match the specified condition.
  removeNodes(nodeRemovalConditions: any) {
    this.conditions.nodeRemovalConditions = nodeRemovalConditions;
  }

  // Removes edges from the graph that match the specified condition.
  removeEdges(edgeRemovalConditions: any) {
    this.conditions.edgeRemovalConditions = edgeRemovalConditions;
  }

  private isProdBuild(graph: any) {
    // if the nodes have the attribute "coordinates", then its the dev build
    if (Object.keys(Object.values(graph.nodes)[0]).includes("coordinates")) return false
    else return true;
  }

  isNodeValid(data: Data, node: string, type: string) {
    let id = node;

    // check if user provided valid node id or coordinates
    if (node.length === 2 && typeof node === "object") {
      id = `matchedTemp${type}`
    }

    if (!data || !data[id]) {
      return false;
    }

    return true;
  }

  constructErrorMessage (message: string) {
    return [undefined, undefined, undefined, message]
  }

  /*
   * Calculate shortest path between start and dest locations
   * start | dest: can be node ids or coordinates
   * match (optional): { matchLayer, matchOn: string } array of room polygons of one floor to match to, each room must have room entrance in the graph
   * lang: string of language code, such as "de", "en"
  */
  getRoute (start: string | number[], dest: string | number[], options: any = { match: undefined, lang: "de" }) {
    const { match, lang } = options;

    // default language = en
    if (!lang) this.lang = "en";
    else this.lang = lang

    if (!this.data) return false

    if (!start || !dest) {
      return this.constructErrorMessage("Please enter a start and destination");
    }

    let data = this.data;

    //  If user provided coordinates, then matchToPath
    // @ts-ignore
    if (typeof start === "object" || start.length === 2) {
      // @ts-ignore
      const updatedGraph = this.matchToNearestPath(start, data, "Start", match);
      if (!updatedGraph.error) data = updatedGraph
      else return this.constructErrorMessage(updatedGraph.message);
    }

    // test!!!
    // @ts-ignore
    if (typeof dest === "object" || dest.length === 2) {

      // @ts-ignore
      const updatedGraph = this.matchToNearestPath(dest, data, "Dest", match);
      if (!updatedGraph.error) data = updatedGraph;
      else return this.constructErrorMessage(updatedGraph.message);
    }

    // check if nodes are prod nodes or dev nodes
    if (!this.data.na || !this.data.nan) {
      console.log("The graph you've provided is not production ready. To calculate a graph more quickly create a production build using getProductionBuild() and pass the data to a new IndoorGraphs.")
      data = exportForProductionBuild(this.data);
    }

    // important: the following steps always use the production build

    // save graph
    const [graph, excludedNodes, excludedPaths] = saveGraph(data, this.conditions);

    // @ts-ignore
    if (!this.isNodeValid(graph, start, "Start")) {
      return this.constructErrorMessage(`Node ${start} is not present in the graph.`)
    }

    // @ts-ignore
    if (!this.isNodeValid(graph, dest, "Dest")) {
      return this.constructErrorMessage(`Node ${dest} is not present in the graph.`)
    }

    // get valid start/dest node ids
    let startId = start;
    let destId = dest;
    if (start.length === 2 && typeof start === "object") {
      startId = "matchedTempStart"
    }

    if (dest.length === 2 && typeof dest === "object") {
      destId = "matchedTempDest"
    }

    const shortestPath: any = getShortestPath(graph, data, `${startId}`, `${destId}`, this.includeIcons, this.pathNameIds, lang);

    // remove "floorChangeWithStairsOrElevator" if only one floor
    if (shortestPath[2].hasOwnProperty("floors") && shortestPath[2].hasOwnProperty("floorChangeWithStairsOrElevator")) {
      // @ts-ignore
      if (shortestPath[2] && shortestPath[2]?.floors?.length === 1) delete shortestPath[2].floorChangeWithStairsOrElevator
    }

    // check if path has more than one node
    if (shortestPath[1] && shortestPath[1]?.length === 1) {
      return this.constructErrorMessage(`No path found.`)
    }

    if (shortestPath[2]) shortestPath[2]["excludedNodes"] = excludedNodes
    if (shortestPath[2]) shortestPath[2]["excludedPaths"] = excludedPaths

    return shortestPath;
  }

  /*
   * Input: location lat long, optional: match layer and attribute
   * Output: location along a path
   * 
   * This function matches the selected location to the nearest point in the graph
  */
  private matchToNearestPath(coordinates: number[], nodes: any, type: string, match: any) {
    return matchToNearestPath(nodes, coordinates, type, match, this.pathNameIds);
  }

  addGraph(graph: any) {

    if (!graph || !Object.keys(graph).includes("nodes")
      || !Object.keys(graph).includes("nan")
    || !Object.keys(graph).includes("na")
    || !Object.keys(graph).includes("pa")
    || !Object.keys(graph).includes("pan")) {
      return this.constructErrorMessage("Please provide a valid production graph.")
    }

    let combinedPathAttributeNames: any = [...graph.pan, ...this.data.pan]
    let combinedNodeAttributeNames: any = [...graph.nan, ...this.data.nan]

    // remove duplicates 
    const uniques = combinedNodeAttributeNames.filter((x: any, i: any) => i === combinedNodeAttributeNames.indexOf(x))
    const uniquesPathAttributeNames = combinedPathAttributeNames.filter((x: any, i: any) => i === combinedPathAttributeNames.indexOf(x))

    const pathAttributesA = this.data.pa;
    const pathAttributesB = graph.pa;

    const combinedNodeAttributes: any = {}
    const nodeAttributesA = this.data.na;
    const nodeAttributesB = graph.na;
    const nanA = this.data.nan;
    const nanB = graph.nan;

    uniques.map((name: string, index: number) => {
      const attributeAIndex = nanA.indexOf(name);

      Object.entries(nodeAttributesA).map(([nodeAId, valuesA]: any) => {
        if (attributeAIndex > -1) {
          if (!combinedNodeAttributes.hasOwnProperty(nodeAId)) combinedNodeAttributes[nodeAId] = {}
          
           combinedNodeAttributes[nodeAId][index] = valuesA[attributeAIndex]
        }
      })

      const attributeBIndex = nanB.indexOf(name);

      Object.entries(nodeAttributesB).map(([nodeBId, valuesB]: any) => {
        if (attributeBIndex > -1) {
          if (!combinedNodeAttributes.hasOwnProperty(nodeBId)) combinedNodeAttributes[nodeBId] = {}

          combinedNodeAttributes[nodeBId][index] = valuesB[attributeBIndex]
        }
      })
    })

    const combinedPathAttributes: any = {}
    const panA = this.data.pan;
    const panB = graph.pan;

    uniquesPathAttributeNames.map((name: string, index: number) => {
      const attributeAIndex = panA.indexOf(name);

      Object.entries(pathAttributesA).map(([pathAId, valuesA]: any) => {
        if (attributeAIndex > -1) {
          if (!combinedPathAttributes.hasOwnProperty(pathAId)) combinedPathAttributes[pathAId] = {}

          combinedPathAttributes[pathAId][index] = valuesA[attributeAIndex]
        }
      })

      const attributeBIndex = panB.indexOf(name);

      Object.entries(pathAttributesB).map(([pathBId, valuesB]: any) => {
        if (attributeBIndex > -1) {
          if (!combinedPathAttributes.hasOwnProperty(pathBId)) combinedPathAttributes[pathBId] = {}

          combinedPathAttributes[pathBId][index] = valuesB[attributeBIndex]
        }
      })
    })

    // delete all entries with undefined or null
    Object.values(combinedNodeAttributes).map((values: any) => {
      Object.entries(values).map(([key, value]: any) => {
        if (!value) delete values[key]
      })
    })

    Object.values(combinedPathAttributes).map((values: any) => {
      Object.entries(values).map(([key, value]: any) => {
        if (!value) delete values[key]
      })
    })
    
    const combined = { 
      nodes: {...graph.nodes, ...this.data.nodes},
      nan: uniques,
      na: combinedNodeAttributes,
      pa: combinedPathAttributes,
      pan: uniquesPathAttributeNames,
    }
      
    // validateData ausführen!!!!

    const isValid = validateData(combined)

    if (isValid.invalid) this.constructErrorMessage("An error occured trying to combine graphs.")
    
    this.data = combined;
  }
}
