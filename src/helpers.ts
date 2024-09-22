export {};

var equal = require('fast-deep-equal');
const turf = require('@turf/turf');
const {getPathName} = require("./dijkstra")

const saveGraph = (nodes: any, conditions: any) => {
  const [graph, excludedNodes, excludedPaths]: any = buildGraph(nodes, conditions);

  const finishedGraph: any = {}

  if (!graph || graph.length < 2) return false

  graph.map((node: { id: string | number; }) => {
    finishedGraph[node.id] = node
  })

  return [finishedGraph, excludedNodes, excludedPaths]
}

const buildGraph = (nodes: any, conditions: any) => {
  const nodesArray: any = []
  // let filteredNodes = nodes;
  const [filteredNodes, excludedNodes, excludedPaths] = removeEdges(nodes, conditions)
  // no nodes left after filter
  if (Object.entries(filteredNodes.nodes).length < 2) {
    return false
  }

  for (const nodeID in filteredNodes.nodes) {
    const adjacentLinks: any = {}

    const node = nodeID?.includes(":") ? filteredNodes.nodes[nodeID.split(":")[0]] : filteredNodes.nodes[nodeID];

    if (node[4]) {
      node[4].map((adjacentNode: any) => {

        const dest = adjacentNode?.includes(":") ? filteredNodes.nodes[adjacentNode.split(":")[0]] : filteredNodes.nodes[adjacentNode]
        if (!dest) return false
       
        // node[0] -> coordinates
        const from = turf.point(node[0])
        const to = turf.point(dest[0])

        const distance = turf.distance(from, to, { units: 'meters' })

        adjacentLinks[adjacentNode?.includes(":") ? adjacentNode.split(":")[0] : adjacentNode] = {
          distance,
          // direction: "east",
          // semantics: "go straight",
          // width: adjacentNode.attributes ? adjacentNode.attributes.width : 0,
          // slope: adjacentNode.attributes ? adjacentNode.attributes.slope : 0,
          // wheelChair: adjacentNode.attributes ? adjacentNode.attributes.wheelChair : false
        }       
      })
    }

    nodesArray.push({
      id: node[1],
      type: node[2],
      coords: node[0],
      adjacentLinks
    })
  }

  return [nodesArray, excludedNodes, excludedPaths]
}

const getNodeKeyValuePairs = (node: any, na: any, nan: any) => {
  const attributes = na[node[3]];
  const transformedAttributes: any = {}

  if (!attributes) return undefined

  Object.entries(attributes).map(([index, value]) => {
    const name = nan[index]

    transformedAttributes[name] = value
  })

  return transformedAttributes;
}

const getPathAttributesKeyValuePairs = (attributes: any, pan: any) => {
  const transformedAttributes: any = {}

  Object.entries(attributes).map(([index, value]) => {
    const name = pan[index]

    transformedAttributes[name] = value
  })

  return transformedAttributes;
}

function evaluateExpression(a: any, operator: any, b: any) {
  // Convert b to the type of a if a is a number
  if (typeof a === 'number') {
    b = Number(b);
  }

  if (typeof a === 'boolean' && typeof b !== 'boolean') {
    b = b === "true" ? true : false
  }

  switch (operator) {
    case "===":
      return a === b;
    case "==":
      return a == b;
    case "!==":
      return a !== b;
    case "!=":
      return a != b;
    case ">":
      return a > b;
    case "<":
      return a < b;
    case ">=":
      return a >= b;
    case "<=":
      return a <= b;
    case "||":
      return a || b;
    case "&&":
        return a && b;
    default:
      throw new Error("Unsupported operator");
  }
}

const applyExpression = (attributes: any, conditions: any) => {  
  if (conditions.length === 1) {
    const firstExpression = conditions[0];
    const [firstExpressionKey, relationalOperator, firstExpressionValue] = firstExpression.split(" ");

    return evaluateExpression(attributes[firstExpressionKey], relationalOperator, firstExpressionValue)
  }

  if (conditions.length === 3) {
    const firstExpression = conditions[0];
    const andOr = conditions[1];
    const secondExpression = conditions[2];

    const [firstExpressionKey, relationalOperator, firstExpressionValue] = firstExpression.split(" ");
    const [secondExpressionKey, secondRelationalOperator, secondExpressionValue] = secondExpression.split(" ");

    const firstExpressionResult = evaluateExpression(attributes[firstExpressionKey], relationalOperator, firstExpressionValue)
    const secondExpressionResult = evaluateExpression(attributes[secondExpressionKey], secondRelationalOperator, secondExpressionValue)

    return evaluateExpression(firstExpressionResult, andOr, secondExpressionResult)
  }

}

const removeEdges = (data: any ,conditions: any) => {
  let copiedNodes = JSON.parse(JSON.stringify(data))
  const excludedNodes: string[] = []
  const excludedPaths: string[] = []

  // na = node attributes
  // nan = node attribute names
  const nodeAttributes = data.na;     
  const pathAttributes = copiedNodes.pa;

  let nodeRemovalConditions: any = null;
  let edgeRemovalConditions: any = null;

  if (conditions) {
    nodeRemovalConditions = conditions?.nodeRemovalConditions ? conditions.nodeRemovalConditions : null
    edgeRemovalConditions = conditions?.edgeRemovalConditions ? conditions?.edgeRemovalConditions : null
  }

  // run every node against every expression
  nodeRemovalConditions && nodeRemovalConditions.map((conditions: any) => {

    Object.entries(copiedNodes.nodes).map(([id, node]: any) => {
      if (! nodeAttributes[node[3]] || Object.keys(nodeAttributes[node[3]]).length === 0) return;

      const attributes = getNodeKeyValuePairs(node, copiedNodes.na, copiedNodes.nan);

      if (attributes) {
        const shouldDelete = applyExpression(attributes, conditions);

        if (shouldDelete) {
          delete copiedNodes.nodes[id]
          excludedNodes.push(id)
        }
      }                      
    })
  })

  Object.entries(copiedNodes.nodes).map(([id, node]: any) => {
    const adjacentNodes = node[4]

    adjacentNodes.map((adjacentNode: string) => {
      if (!adjacentNode.includes(":")) return;

      const pathAttributesId = adjacentNode.split(":")[1];
      const attributes = pathAttributes[pathAttributesId]

      if (!attributes || Object.keys(attributes).length === 0) return;

       // run every path against every expression
       edgeRemovalConditions && edgeRemovalConditions.map((conditions: any) => {
        const transformedPathAttributes = getPathAttributesKeyValuePairs(attributes, copiedNodes.pan);

        if (attributes) {
          const shouldDelete = applyExpression(transformedPathAttributes, conditions);

          if (shouldDelete) {
              // remove node from adjacentNodes
              const filteredAdjacentNodes = copiedNodes.nodes[id][4].filter((nodeId: string) => nodeId !== adjacentNode);
              copiedNodes.nodes[id][4] = filteredAdjacentNodes;
              excludedPaths.push(pathAttributesId)
          }
        }  
      })
    })
  })

  return [copiedNodes, excludedNodes, excludedPaths]
}

const getNodesPathAttribute = (pathAttributesId: string, copiedNodes: any) => {
  // pa = pathAttributes
  const pathAttributes = copiedNodes.pa;
  let pathAttributesForBothIds: any = pathAttributes[pathAttributesId];

  return pathAttributesForBothIds
}

function combinePathAttributes(graph: any) {
  const nodes: any = graph.nodes;
  const pathAttributes: any = graph.pathAttributes;
  const combined: any = {};
  const pathIds: any = {};
  const pathAttributeNames: string[] = []

  for (const [pathKey, pathAttr] of Object.entries(pathAttributes)) {
    const pathAttrStr = JSON.stringify(pathAttr);

    Object.keys(pathAttr).map((key) => {
      if (!pathAttributeNames.includes(key)) pathAttributeNames.push(key)
    })

    if (pathAttrStr in pathIds) {
      combined[pathIds[pathAttrStr]].push(pathKey);
    } else {
      const randomId = generateId(pathAttributes)
      pathIds[pathAttrStr] = randomId;
      combined[randomId] = [pathKey];
    }
  }

  const newPathAttributes: any = {};
  for (const [randomId, pathKeys] of Object.entries(combined)) {

    // @ts-ignore
    const pathAttr = JSON.parse(JSON.stringify(pathAttributes[pathKeys[0]]));

    // fill in attributes with n times null
    // const attributes = new Array(pathAttributeNames.length).fill(null);
    let attributes = {}
    pathAttributeNames.map((name, index) => {
      const currentPathAttributeKeys = Object.keys(pathAttr); 

      if (currentPathAttributeKeys.includes(name)) {
        attributes = {...attributes, [index]: pathAttr[name] }
      } 
    })

    newPathAttributes[randomId] = attributes;

    // @ts-ignore
    for (const pathKey of pathKeys) {
      delete pathAttributes[pathKey];
      const [node1Id, node2Id] = pathKey.split('-');

      if (nodes[node1Id] && nodes[node2Id]) {
        nodes[node1Id].adjacentNodes = nodes[node1Id].adjacentNodes.filter((nodeId: string) => nodeId !== node2Id)
        nodes[node2Id].adjacentNodes = nodes[node2Id].adjacentNodes.filter((nodeId: string) => nodeId !== node1Id)
  
        nodes[node1Id].adjacentNodes.push(`${node2Id}:${randomId}`)
        nodes[node2Id].adjacentNodes.push(`${node1Id}:${randomId}`)
      }
    }
  }
  
  // pa = pathAttributes
  // pan = pathAttributeNames
  return { nodes, pa: newPathAttributes, pan: pathAttributeNames };
}

const generateId = (pathAttributes: any) => {
  const id = Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);

  // check if id is not already used
  const pathAttributeIds = Object.keys(pathAttributes);
  // does this really work?
  while (pathAttributeIds.includes(id)) {
    generateId(pathAttributes)
  }

  return id;
}

const reduceNodeInformations = (nodes: any) => {
  const reducedNodes: any = {};
  
  Object.entries(nodes).map(([nodeId, attributes]: any) => {
    reducedNodes[nodeId] = [attributes.coordinates, attributes.id, attributes.level, attributes.attributes, attributes.adjacentNodes]
  })
  
  return reducedNodes;
}

/*
 * Export routing graph for production use
 * combines all the same pathAttributes into one, to reduce graph size
 */
const exportForProductionBuild = (graph: any, streetIds: any) => {
  const graphWithCombinedPathAttributes = combinePathAttributes(graph);
  const combinedNodeAttributes = combineNodeAttributes(graphWithCombinedPathAttributes);
  const reducedNodes = reduceNodeInformations(graph.nodes);

 //  delete graphWithCombinedPathAttributes.nodes;
  graphWithCombinedPathAttributes["nodes"] = reducedNodes

  // @ts-ignore
  graphWithCombinedPathAttributes["na"] = combinedNodeAttributes.combinedTest;
  // @ts-ignore
  graphWithCombinedPathAttributes["nan"] = combinedNodeAttributes.nodeAttributeNames;

  // export for production
  return graphWithCombinedPathAttributes;
}

const combineNodeAttributes = (graph: any) => {
  const nodes: any = graph.nodes;
  const combined: any = {};
  const nodeAttributeNames: string[] = [];

  // create combined Attributes object
  for (const [nodeId, attr] of Object.entries(nodes)) {
    const attributes: any = attr;
    const nodeAttributes: any = attributes.attributes;

    if (!nodeAttributes) continue;

    Object.keys(nodeAttributes).map((key) => {
      if (!nodeAttributeNames.includes(key)) nodeAttributeNames.push(key)
    })

    if (Object.keys(combined).length === 0) combined[generateId(nodeAttributes)] = nodeAttributes; 
  
    let isThereAnEqualAttributes = false;

    Object.entries(combined).map(([id, attributes]) => {
      if (equal(attributes, nodeAttributes)) {
        isThereAnEqualAttributes = true;
      }
    })

    if (!isThereAnEqualAttributes && Object.keys(nodeAttributes).length > 0) {
      combined[generateId(nodeAttributes)] = nodeAttributes;      
    }
  }

  // add combineAttributes id to attributes of node
  for (const [nodeId, attr] of Object.entries(nodes)) {
    const attributes: any = attr;
    const nodeAttributes: any = attributes.attributes;
  
    Object.entries(combined).map(([id, attributes]) => {
      if (equal(attributes, nodeAttributes)) {
        nodes[nodeId].attributes = id
      }
    })
  }
  
  const combinedTest: any = {}
  // extract keys and values
  // fill in attributes with n times null
  Object.entries(combined).map(([nodeKey, nodeAttributes]: any) => {
      let attributes: any = {} // new Array(nodeAttributeNames.length).fill(null);

      nodeAttributeNames.map((name, index) => {
        const currentPathAttributeKeys = Object.keys(nodeAttributes); 
  
        if (currentPathAttributeKeys.includes(name)) attributes = {...attributes, [index] : nodeAttributes[name] } // attributes[index] = nodeAttributes[name]
        // else attributes[index] = null
      })

      combinedTest[nodeKey] = attributes;
      attributes = new Array(nodeAttributeNames.length).fill(null);
  })


  return {combinedTest, nodeAttributeNames};
}

const getRoutableOptions = (prod: any, exclude: [string]) => {
  const nodeAttributesOptions: any = {};
  const pathAttributesOptions: any = {};

  const nodeAttributes = prod.nan;
  const pathAttributes = prod.pan;

  // extract nodeAttributes
  nodeAttributes.map((key: string, index: number) => {
    // @ts-ignore
    if (!nodeAttributesOptions.hasOwnProperty(key) && !exclude?.includes(key)) {
      if (key.includes("is") || key.includes("has") || key.includes("Has") || key.includes("have")) nodeAttributesOptions[key] = "boolean"
      else {
        // @ts-ignore
        nodeAttributesOptions[key] = "string";
      }
    }  
  })
  
  // extract pathAttributes
  pathAttributes.map((key: string, index: number) => {
    // @ts-ignore
    if (!pathAttributesOptions.hasOwnProperty(key) && !exclude?.includes(key)) {
      if (key.includes("is") || key.includes("has") || key.includes("Has") || key.includes("have")) pathAttributesOptions[key] = "boolean"
      else {
        // @ts-ignore
        pathAttributesOptions[key] = "string";
      }
    }  
  })

  return { nodeAttributesOptions, pathAttributesOptions }
}

const matchToNearestPath = (graph: any, coords: number[], type: string, match: any, pathNameIds: any) => {
  const matchLayer = match?.matchLayer;
  const matchOnGraphNodes = match?.matchOnGraphNodes;
  const matchOnFeatures = match?.matchOnFeatures;

  // match to a specific floor (or outdoor if not specified)
  let matchLevel: string;
  if (type === "Start") matchLevel = match?.startLevel;
  else if (type === "Dest") matchLevel = match?.destLevel;

  const skipMissing = match?.skipMissing === true ? true : false;

  // user provided at least an empty object for the match
  if (match) {
    // only show the error message, if no matchLayer but also no matchLevel
    if (!matchLayer && typeof matchLevel === "undefined") {
      return { error: true, message: "You've provided an empty object for the match functionality." }
    }
    
    if (matchLayer && !matchOnGraphNodes ) {
      return { error: true, message: "You've provided a match layer but no attributes to match on." }
    }

    if ((matchOnFeatures && !matchOnGraphNodes) || (!matchOnFeatures && matchOnGraphNodes)) {
      return { error: true, message: "Please provide matchOnFeatures and matchOnGraphNodes." }
    }

    // only validate matchOnGraphNodes if the user actually provided a matchLayer. Otherwise: ignore
    if (matchLayer && typeof matchOnGraphNodes !== "string" || matchOnGraphNodes?.length < 1 ) {
      return { error: true, message: "'matchOnGraphNodes' attribute must be of type string and contain a valid value." }
    }

    // only validate matchOnFeautres if the user actually provided a matchLayer. Otherwise: ignore
    if (matchLayer && typeof matchOnFeatures !== "string" || matchOnFeatures?.length < 1 ) {
      return { error: true, message: "'matchOnFeatures' attribute must be of type string and contain a valid value." }
    }

    // only show the error message, if matchLayer
    if (matchLayer) {
      if (typeof matchLayer !== "object" || matchLayer?.type !== "FeatureCollection" || !matchLayer?.features.length ) {
        return { error: true, message: "Please provide a valid FeatureCollection for the 'matchLayer'." }
      }
    }
  }

  const targetPoint = turf.point(coords);
  const points: any = [];
  const coordinatesOnlyPoints: number[][] = [];
  let roomEntrancePresent = false;

  // check if coords are in a room; if so -> match to room entrance
  if (matchLayer) {
    let invalidMatchOn = undefined;

    matchLayer.features.map(({properties, geometry}: any) => {
      const coordinates = geometry.coordinates;
      const roomNumber = properties[matchOnFeatures]

      const pt = turf.point(coords);
      const converted = turf.toMercator(pt);
      const poly = turf.polygon(coordinates[0]);

      if (turf.booleanPointInPolygon(converted, poly)) {
        // check if room has a valid room entrance
        roomEntrancePresent = true;

        Object.values(graph.nodes).map((attributes: any) => {
          if (!attributes[matchOnGraphNodes]) {
            invalidMatchOn = matchOnGraphNodes;
            return;
          }

          // node is room entrance
          if (attributes[matchOnGraphNodes]?.includes(roomNumber) && attributes.type === "Room entrance") {
            // return if attributes dont include matchOnGraphNodes and user decided to skip this case
            // if (!attributes[matchOnGraphNodes] && skipMissing) return; 

            // create new temp node
            graph.nodes[`matchedTemp${type}`] = {
              coordinates: coords,
              attributes: {},
              id: `matchedTemp${type}`,
              type: "Node",
              adjacentNodes: [attributes.id]
            }
            // add adjacency
            graph.nodes[attributes.id].adjacentNodes.push(`matchedTemp${type}`)
          } 
        })
      }
    })

    if (typeof invalidMatchOn === "string" && !skipMissing) {
      return { error: true, message: "Found features that do not contain the provided 'matchOnGraphNodes' attribute." }
    } else {
      roomEntrancePresent = false
    }
  }

  Object.entries(graph.nodes).map(([id, attributes]: any) => {
    const coordinates: number[] = attributes[0];
    if (!coordinates) return;

    // only consider nodes that are on same floor
    if (matchLevel === attributes.level) {
      points.push(turf.point(coordinates, { id }))
      coordinatesOnlyPoints.push(coordinates)
    }
    else if (!matchLevel) {
      points.push(turf.point(coordinates, { id }))
      coordinatesOnlyPoints.push(coordinates)
    }
  })

  let pointsInBuffer = [];
  let bufferDistance = 10;

  // extract 10 points that are inside the target points buffer 
  while (pointsInBuffer.length < 10) {
    const buffer = turf.buffer(targetPoint, bufferDistance, { units: "meters" });

    const ptsWithin = turf.pointsWithinPolygon(turf.points(coordinatesOnlyPoints), buffer);
  
    pointsInBuffer = ptsWithin.features;

    bufferDistance = bufferDistance + 2.5;
  }

  const nodeIds: string[] = pointsInBuffer.map((point: any) => {
    // get actual node ids
    const nextPointsFeatureCollection = turf.featureCollection(points);
    const nextNearestNode = turf.nearestPoint(point, nextPointsFeatureCollection);
    return nextNearestNode.properties.id
  })

  let shortestDistance: any = { distance: 100000 }

  // loop over every node, extract the adjacent nodes and calculate distance between target point and the path
  nodeIds.map((nodeID) => {
    const nodes = graph.nodes;
    // console.log(nodeID.includes(":") ? nodeID.split(":")[0] : nodeID)
    const node = nodes[nodeID.includes(":") ? nodeID.split(":")[0] : nodeID];

    const nodeCoordinates = node[0]
    const adjacentNodes = node[4];

    // loop over every adjacent node, span a linestring and calculate distance
    adjacentNodes.map((id: string) => {
      const adjacentNodeID = id.includes(":") ? id.split(":")[0] : id;

      if (nodeID !== "matchedTempStart" && nodeID !== "matchedTempDest" && 
        id !== "matchedTempStart" && id !== "matchedTempDest" &&
          adjacentNodeID !== "matchedTempStart" && adjacentNodeID !== "matchedTempDest"
      ) {

        const adjacentNode = nodes[adjacentNodeID]

        if (typeof adjacentNode === "undefined") return;

        const adjacentNodeCoordinates = adjacentNode[0]

        const linestring = turf.lineString([nodeCoordinates, adjacentNodeCoordinates], {nodeA: nodeID, nodeB: adjacentNodeID});
        var distance = turf.pointToLineDistance(targetPoint, linestring, {units: 'meters'});

        if (shortestDistance.distance > distance) shortestDistance = {distance, nodeA: nodeID, nodeB: adjacentNodeID, nodeACoords: nodeCoordinates, nodeBCoords: adjacentNodeCoordinates}
      }
    })
  })

  // create linestring between the two points that are nearest to the selected coordinates
  const line = turf.lineString([
    shortestDistance.nodeACoords,
    shortestDistance.nodeBCoords
  ]);

  // get nearest point on the linestring
  const snapped = turf.nearestPointOnLine(line, targetPoint, {units: 'kilometers'});

  const nodeA = shortestDistance.nodeA.includes(":") ? shortestDistance.nodeA.split(":")[0] : shortestDistance.nodeA
  const nodeB = shortestDistance.nodeB.includes(":") ? shortestDistance.nodeB.split(":")[0] : shortestDistance.nodeB
  
  const pathName = getPathName(nodeA.split("_")[1], nodeB.split("_")[1], graph.streetIds);

  let pathId = graph.nodes[nodeA][4].filter((id: string) => id.includes(nodeB));
  if (pathId[0] && pathId[0].includes(":")) pathId = pathId[0].split(":")[1]
  else pathId = ""

  let matchedTempNodeId = `matchedTemp${type}`
  if (pathId) matchedTempNodeId= matchedTempNodeId + ":" + pathId

  // add adjacency
  graph.nodes[nodeA][4].push(matchedTempNodeId)
  graph.nodes[nodeB][4].push(matchedTempNodeId)

  // create new temp node
  const tmpNode = [
    snapped.geometry.coordinates,
    `matchedTemp${type}`,
    null,
    'OD',
    null,
    [`${nodeA}:${pathId}`, `${nodeB}:${pathId}`],
  ]

  graph.nodes[`matchedTemp${type}`] = tmpNode

  if (pathName) graph.streetIds[pathName].push(`matchedTemp${type}`)
  
  return graph;
}

module.exports = { saveGraph, removeEdges, exportForProductionBuild, getRoutableOptions, matchToNearestPath }