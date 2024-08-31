export {};
const turf = require('@turf/turf')
import * as geolib from 'geolib';
import { StreetMap } from '.';

interface Street {
  distanceSum: number,
  streetName: string,
  firstNodeOnStreet: string,
  lastNodeOnStreet: string,
  secondNodeOnStreet: string,
  secondLastNodeOnStreet: string,
  pathType: string
}

const elevatorIcon = `
<svg
    fill="black"
    xmlns="http://www.w3.org/2000/svg"
    height="24"
    viewBox="0 -960 960 960"
    width="24"
  >
  <path d="M280-240h120v-160h40v-100q0-33-23.5-56.5T360-580h-40q-33 0-56.5 23.5T240-500v100h40v160Zm60-380q21 0 35.5-14.5T390-670q0-21-14.5-35.5T340-720q-21 0-35.5 14.5T290-670q0 21 14.5 35.5T340-620Zm180 100h200L620-680 520-520Zm100 240 100-160H520l100 160ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0 0v-560 560Z" />
</svg>
`

const leftIcon = `
<svg
  fill="black"
  xmlns="http://www.w3.org/2000/svg"
  height="24"
  viewBox="0 -960 960 960"
  width="24"
  >
  <path d="M600-160v-360H272l64 64-56 56-160-160 160-160 56 56-64 64h328q33 0 56.5 23.5T680-520v360h-80Z" />
</svg>
`

const rightIcon = `
<svg
  fill="black"
  xmlns="http://www.w3.org/2000/svg"
  height="24"
  viewBox="0 -960 960 960"
  width="24"
  >
  <path d="M280-160v-360q0-33 23.5-56.5T360-600h328l-64-64 56-56 160 160-160 160-56-56 64-64H360v360h-80Z" />
</svg>
`

const slightlyLeftIcon = `
<svg
  fill="black"
  xmlns="http://www.w3.org/2000/svg"
  height="24"
  viewBox="0 -960 960 960"
  width="24"
  >
  <path d="M520-160v-304L320-664v90h-80v-226h226v80h-90l201 201q11 11 17 25.5t6 30.5v303h-80Z" />
</svg>
`

const slightlyRightIcon = `
<svg
  fill="black"
  xmlns="http://www.w3.org/2000/svg"
  height="24"
  viewBox="0 -960 960 960"
  width="24"
  >
  <path d="M360-160v-303q0-16 6-30.5t17-25.5l201-201h-90v-80h226v226h-80v-90L440-464v304h-80Z" />
</svg>
`

const startIcon = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  fill="black"
  height="24"
  viewBox="0 96 960 960"
  width="24"
  >
  <path d="M480 976q-106 0-173-31t-67-79q0-27 24.5-51t67.5-39l18 58q-16 5-29.5 14T299 866q17 20 70.5 35T480 916q57 0 111-15t71-35q-8-8-21-17t-30-15l17-58q43 15 67.5 39t24.5 51q0 48-67 79t-173 31Zm0-215q21.103-39 44.552-71.5Q548 657 571 628q44-57 69.5-98T666 421.926q0-77.666-54.214-131.796-54.215-54.13-132-54.13Q402 236 348 290.13t-54 131.796Q294 489 319.5 530t69.5 98q23 29 46.448 61.5Q458.897 722 480 761Zm0 109q-12 0-21-6.771T446 845q-24-73-60.019-121-36.02-48-69.981-92-34-44-58-91.5t-24-118.541Q234 319 305.319 247.5 376.639 176 480 176q103.361 0 174.681 71.319Q726 318.639 726 422q0 71-23.873 118.341Q678.253 587.681 644 632q-34 44-70 92t-59.852 120.732Q510 856 501 863t-21 7Zm.208-388Q505 482 522.5 464.292q17.5-17.709 17.5-42.5Q540 397 522.292 379.5q-17.709-17.5-42.5-17.5Q455 362 437.5 379.708q-17.5 17.709-17.5 42.5Q420 447 437.708 464.5q17.709 17.5 42.5 17.5ZM480 422Z" />
</svg>
`

const straightIcon = `
<svg
  fill="black"
  xmlns="http://www.w3.org/2000/svg"
  height="24"
  viewBox="0 -960 960 960"
  width="24"
  >
  <path d="M440-80v-647L256-544l-56-56 280-280 280 280-56 57-184-184v647h-80Z" />
</svg>
`

const arrivedIcon = `
<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
  <path d="M200-120v-680h360l16 80h224v400H520l-16-80H280v280h-80Zm300-440Zm86 160h134v-240H510l-16-80H280v240h290l16 80Z"/>
</svg>
`

// @ts-ignore
class Node {
  val: any
  priority: any;
  constructor (val: any, priority: any) {
    this.val = val
    this.priority = priority
  }
}

class PriorityQueue {
  values: any[];
  constructor () {
    this.values = []
  }

  enqueue (val: any, priority: any) {
    // @ts-ignore
    const newNode = new Node(val, priority)
    this.values.push(newNode)
    this.bubbleUp()
  }

  bubbleUp () {
    let idx = this.values.length - 1
    const element = this.values[idx]

    while (idx > 0) {
      const parentIdx = Math.floor((idx - 1) / 2)
      const parent = this.values[parentIdx]
      if (element.priority >= parent.priority) break
      this.values[parentIdx] = element
      this.values[idx] = parent
      idx = parentIdx
    }
  }

  dequeue () {
    const min = this.values[0]
    const end = this.values.pop()
    if (this.values.length > 0) {
      this.values[0] = end
      this.sinkDown()
    }
    return min
  }

  sinkDown () {
    let idx = 0
    const length = this.values.length
    const element = this.values[0]
    while (true) {
      const leftChildIdx = 2 * idx + 1
      const rightChildIdx = 2 * idx + 2
      let leftChild, rightChild
      let swap = null

      if (leftChildIdx < length) {
        leftChild = this.values[leftChildIdx]
        if (leftChild.priority < element.priority) {
          swap = leftChildIdx
        }
      }
      if (rightChildIdx < length) {
        rightChild = this.values[rightChildIdx]
        if (
          (swap === null && rightChild.priority < element.priority) ||
                (swap !== null && rightChild.priority < leftChild.priority)
        ) {
          swap = rightChildIdx
        }
      }
      if (swap === null) break
      this.values[idx] = this.values[swap]
      this.values[swap] = element
      idx = swap
    }
  }
}

// Dijkstra's algorithm only works on a weighted graph.
class WeightedGraph {
  adjacencyList: any;
  constructor () {
    this.adjacencyList = {}
  }

  addVertex (vertex: any) {
    const id = vertex.id
    if (!this.adjacencyList[id]) this.adjacencyList[id] = []
  }

  // weight = distance
  addEdge (vertex1: any, vertex2: any, weight: any) {
    this.adjacencyList[vertex1]?.push({ node: vertex2, weight })
    this.adjacencyList[vertex2]?.push({ node: vertex1, weight })
  }

  Dijkstra (start: any, finish: any) {
    const nodes = new PriorityQueue()
    const distances:any = {}
    const previous: any = {}
    const path = [] // to return at end
    let smallest

    // build up initial state
    for (const vertex in this.adjacencyList) {
      if (vertex === start) {
        distances[vertex] = 0
        nodes.enqueue(vertex, 0)
      } else {
        distances[vertex] = Infinity
        nodes.enqueue(vertex, Infinity)
      }

      previous[vertex] = null
    }

    // as long as there is something to visit
    while (nodes.values.length) {
      smallest = nodes.dequeue().val
      if (smallest === finish) {
        // WE ARE DONE
        // BUILD UP PATH TO RETURN AT END
        while (previous[smallest]) {
          path.push(smallest)
          smallest = previous[smallest]
        }
        break
      }
      if (smallest || distances[smallest] !== Infinity) {
        for (const neighbor in this.adjacencyList[smallest]) {
          // find neighboring node
          const nextNode = this.adjacencyList[smallest][neighbor]
          // calculate new distance to neighboring node
          const candidate = distances[smallest] + nextNode.weight
          const nextNeighbor = nextNode.node
          if (candidate < distances[nextNeighbor]) {
            // updating new smallest distance to neighbor
            distances[nextNeighbor] = candidate
            // updating previous - How we got to neighbor
            previous[nextNeighbor] = smallest
            // enqueue in priority queue with new priority
            nodes.enqueue(nextNeighbor, candidate)
          }
        }
      }
    }
    return path.concat(smallest).reverse()
  }
}

const getDistance = (from: any, to: any) => {
  const options = { units: 'meters' }

  return Math.round(turf.distance(from, to, options))
}

const getShortestPath = (data: any, dataWithAttributes: any, start: any, finish: any, includeIcons: boolean, pathNameIds: StreetMap, lang: string) => {
  const graph = new WeightedGraph();
  const nodes = data;

  // add vertices and edges to graph
  for (const node in nodes) {    
    // add vertices to routing graph
    graph.addVertex({ id: nodes[node].id })

    // add edges to graph
    Object.entries(nodes[node].adjacentLinks).map((item: any) => {
      graph.addEdge(nodes[node].id, item[0], item[1].distance)
    })
  }

  const path = graph.Dijkstra(start, finish);
  const lineString: any = [];
  
  const routingInstructions = calculateInstructions(path, data, includeIcons, pathNameIds, dataWithAttributes, start, finish, lang);

  // map over path to get semantics and stuff
  path.map((node, index) => {
    lineString.push(nodes[node].coords)
  })


  return [lineString, path, routingInstructions, undefined]
}

function getDirection (from:any, to: any) {
  return geolib.getCompassDirection(
      { latitude: from[1], longitude: from[0]},
      { latitude: to[1], longitude: to[0] }
    )
}

const getTurnType = (from: any, to: any, lang: string) => {
  // let instruction;

  function getTurnInstruction(direction1: string, direction2: string) {
    // Define the compass directions and their corresponding angles in degrees.
    const compass: any = {
        "N": 0,
        "NNE": 22.5,
        "NE": 45,
        "ENE": 67.5,
        "E": 90,
        "ESE": 112.5,
        "SE": 135,
        "SSE": 157.5,
        "S": 180,
        "SSW": 202.5,
        "SW": 225,
        "WSW": 247.5,
        "W": 270,
        "WNW": 292.5,
        "NW": 315,
        "NNW": 337.5
    };

    // Calculate the angle between direction1 and direction2.
    const angle = (360 + compass[direction2] - compass[direction1]) % 360;

    // Determine the turn instruction based on the angle.
    if (angle >= 0 && angle < 22.5) {
        // return [lang === "de" ? "Weiter" : "Continue", "straight"];
    } else if (angle >= 22.5 && angle < 67.5) {
        return [lang === "de" ? "Leicht rechts abbiegen" :"Turn slightly right", "slightlyRight"];
    } else if (angle >= 67.5 && angle < 112.5) {
        return [lang === "de" ? "Rechts abbiegen" : "Turn right", "right"];
    } else if (angle >= 112.5 && angle < 157.5) {
        return [lang === "de" ? "Scharf rechts abbiegen" : "Turn sharp right", "sharpRight"];
    } else if (angle >= 157.5 && angle < 202.5) {
        return [lang === "de" ? "Umdrehen" : "Make a U-turn", "uTurn"];
    } else if (angle >= 202.5 && angle < 247.5) {
        return [lang === "de" ? "Scharf links abbiegen" : "Turn sharp left", "sharpLeft"];
    } else if (angle >= 247.5 && angle < 292.5) {
        return [lang === "de" ? "Links abbiegen" : "Turn left", "left"];
    } else if (angle >= 292.5 && angle < 337.5) {
        return [lang === "de" ? "Leicht links abbiegen" : "Turn slightly left", "slightlyLeft"];
    } else {
        // return [lang === "de" ? "Scharf rechts abbiegen" : "Turn sharp left", "sharpLeft"];

        return [lang === "de" ? "Leicht links abbiegen" : "Turn slightly left", "slightlyLeft"];
    }
  }

  const instruction = getTurnInstruction(from, to);
  return instruction;
}

const icons = {
  straight: straightIcon,
  slightlyRight: slightlyRightIcon,
  right: rightIcon,
  sharpRight: rightIcon,
  uTurn: 0,
  sharpLeft: leftIcon,
  left: leftIcon,
  slightlyLeft: slightlyLeftIcon,
  elevator: elevatorIcon,
  start: startIcon,
  arrived: arrivedIcon,
  follow: straightIcon
};


const getRoutingInstructions = (steps: any, pathNameIds: any, path: any, data: any) => {
  const routingInstructions: any = [];
  const updatedNodeIdsPerInstruction: any = {};
  const updatedPathCoordinatesPerInstruction: any = {}
  let count = 0;
  const uniqueFloors: string[] = []
  let pathLength = 0;

  const increaseCount = () => count = count + 1;

  steps.map((step: any, index: number) => {
    const pathNameId = step?.pathNameId
    const floors = step.floors;

    // these variables are only set if there are street names
    const nextStreetNameID = steps[index + 1]?.pathNameId
    const streetName = pathNameIds && pathNameId && pathNameIds[pathNameId]
    const streetNameNext = pathNameIds && nextStreetNameID && pathNameIds[nextStreetNameID];

    // extract unique floors
    path.map((id: any) => {
      if (id && typeof id === "string") {
        const floor = id?.split('_')[0]

        if (floor !== "matchedTempDest" && floor !== "matchedTempStart" &&  !uniqueFloors.includes(floor) && floor !== "fc") uniqueFloors.push(floor)
      }
    })

    const nextPath = steps[index + 1] && steps[index + 1].path;
    const nodesTypes = getNodeTypes(path, nextPath, data);

    // Starting point, first instruction
    if (index === 0) {
      pathLength = pathLength + step.distance;

      if (step.pathType === "elevator") {
        // get next floor 
        const nextFloor = steps[index + 1].floors[0];
        floors.push(nextFloor)
      }

      routingInstructions.push({
        instruction: follow(streetName, step.distance, step.pathType, "de", null, floors),
        category: "start",
        pathType: step.pathType,
        streetName: streetName,
        floors,
      })

      updatedNodeIdsPerInstruction[count] = path;
      updatedPathCoordinatesPerInstruction[count] = step.path
      increaseCount()
    }

    // not first and last step
    if (index > 0 && steps[index + 1]) {
      if (step.type === "entrance") {
        routingInstructions.push({
          instruction: entrance("de", step.entranceType),
          category: "entrance",
          pathType: null,
          streetName: null,
          floors,
        })
        
        updatedNodeIdsPerInstruction[count] = [step.node];
        updatedPathCoordinatesPerInstruction[count] = [step.coordinates]
        increaseCount()
      }

      if (step.type === "turn") {
        let turnInstruction = step.turnType[0];

        if (streetNameNext) turnInstruction = turn(turnInstruction, streetNameNext, "de")
        // routingInstructions.push([turnInstruction, turnType[1], pathType, null, floors]);

        // turns are just points and hence dont include a pathtype or streetname
        routingInstructions.push({
          instruction: turnInstruction,
          category: step.turnType[1],
          pathType: null,
          streetName: null,
          floors,
        })

        updatedNodeIdsPerInstruction[count] = [step.node];
        updatedPathCoordinatesPerInstruction[count] = [step.coordinates]
        increaseCount()
      }

      if (step.type !== "turn" && step.type !== "entrance") {
        pathLength = pathLength + step.distance;

        routingInstructions.push({
          instruction: follow(streetName, step.distance, step.pathType, "de", null, floors),
          category: "follow",
          pathType: step.pathType,
          streetName: streetName,
          floors,
        })
  
        updatedNodeIdsPerInstruction[count] = path;
        updatedPathCoordinatesPerInstruction[count] = step.path
        increaseCount()
      }
    }   
    
    // last step
    if (!steps[index + 1]) {
      pathLength = pathLength + step.distance;

      // add up nodes if there are more than 2 in one path
      if (step.path.length > 1) {
        if (step.pathType === "elevator") {
          // get next floor 
          const nextFloor = steps[index + 1].floors[0];
          floors.push(nextFloor)
        }

        const instruction = {
          instruction: follow(streetName, step.distance, step.pathType, "de", null, floors),
          category: "follow",
          pathType: step.pathType,
          streetName,
          floors,
        }

        // ignore if previous step is exact the same! 
        // this is still a bug and needs to be fixed in the future
        const isSameInstructionBug = checkIfSameInstructionBug(routingInstructions[routingInstructions.length - 1], instruction)
        !isSameInstructionBug && routingInstructions.push(instruction)

        updatedNodeIdsPerInstruction[count] = path;
        updatedPathCoordinatesPerInstruction[count] = step.path
        increaseCount()
      }
  
      routingInstructions.push({
        instruction: arrived("de"),
        category: "arrived",
        pathType: null,
        streetName: null,
        floors
      })

      updatedNodeIdsPerInstruction[count] = [step.path[step.path.length - 1]];
      updatedPathCoordinatesPerInstruction[count] = [step.path[step.path.length - 1]]
      increaseCount()
    }
  });
     
  const timeToTravel = ((pathLength / 1.3) / 60).toFixed(0);

  return { 
    steps: routingInstructions,
    coordinatesPerStep: updatedPathCoordinatesPerInstruction,
    pathLength: pathLength,
    timeToTravel: timeToTravel !== "0" ? timeToTravel : "< 1",
    uniqueFloors
   }
}

const checkIfSameInstructionBug = (obj1: any, obj2: any) => {
  // Helper function to filter out the "category" field
  function filterOutCategory(obj: any) {
    const { category, ...filtered } = obj; // Destructure and exclude the "category" field
    return filtered;
  }

  // Filter out the "category" field from both objects
  const filteredObj1 = filterOutCategory(obj1);
  const filteredObj2 = filterOutCategory(obj2);

  // Check if both are the exact same object reference
  if (filteredObj1 === filteredObj2) return true;

  // Check if both are objects and not null
  if (typeof filteredObj1 !== 'object' || typeof filteredObj2 !== 'object' || filteredObj1 === null || filteredObj2 === null) {
    return false;
  }

  // Check if they have the same number of keys
  const keys1 = Object.keys(filteredObj1);
  const keys2 = Object.keys(filteredObj2);
  if (keys1.length !== keys2.length) return false;

   // Check if all keys in filteredObj1 are in filteredObj2
   for (let key of keys1) {
    if (!keys2.includes(key)) return false;
    
    // Check if values for each key are strictly equal
    if (filteredObj1[key] !== filteredObj2[key]) return false;
  }

  return true;
}

const entrance = (lang: string, entranceType: string) => {
  let instruction = "";
  if (lang === "de") {
    instruction = entranceType === "building" ? "Betrete das Gebäude" : "Durchquere die Tür"
  } 

  return instruction;
}

const getEntranceType = (node: string, nodeAttributesNames: any, na: any) => {
  const indexEntranceType = nodeAttributesNames.indexOf("entranceType");
  const nodeAttributesID = node[4]
  const nodeAttributes = na[nodeAttributesID];

  const entranceType = nodeAttributes[indexEntranceType]

  if (entranceType) return entranceType 
  else return undefined
}

const getEntrances = (adjacentPaths: any, nodeAttributesNames: any, nodeAttributes: any, nodes: any) => {
  const entrances: any = {}

  adjacentPaths.map((path: any, index: number) => {
    const entranceTypeNodeA = getEntranceType(nodes[path.from], nodeAttributesNames, nodeAttributes);
    const entranceTypeNodeB = getEntranceType(nodes[path.to], nodeAttributesNames, nodeAttributes);

    if (entranceTypeNodeA) entrances[path.from] = entranceTypeNodeA
    if (entranceTypeNodeB) entrances[path.to] = entranceTypeNodeB
  })

  return entrances;
}

const getTurns = (path: any, pathCoordinates: number[][]) => {
  const turns: any = {}

  pathCoordinates.map((coordinates: number[], index: number) => {
    const lastNodeCoordinates = pathCoordinates[index - 1]
    const nextNodeCoordinates = pathCoordinates[index + 1];

    if (lastNodeCoordinates && nextNodeCoordinates) {

      const directionA = getDirection(lastNodeCoordinates, coordinates);
      const directionB = getDirection(coordinates, nextNodeCoordinates);
      
      const turnType =  getTurnType(directionA, directionB, "de");

      if (turnType) turns[path[index]] = turnType;
    }
  })

  return turns;
}

const getPathCoordinates = (path: any, nodes: any) => {
  return getCoordinatesFromNodeIds(path, nodes);
}

const insertTurnsAndEntrances = (adjacentPaths: any, entrances: any, turns: any) => {
  const insertedTurnsAndEntrances: any = [];

  adjacentPaths.map((segment: any, index: number) => {
    const { from, to, pathType, pathNameId, distance, path } = segment;

    // push path
    insertedTurnsAndEntrances.push(segment);

    const toEntrance = entrances[to];
    const toTurn     = turns[to];

    if (toEntrance) {
      insertedTurnsAndEntrances.push({
        node: to,
        entranceType: toEntrance,
        coordinates: path[1],
        type: "entrance",
        floors: [to.split("_")[0]]
      })
    }

    if (toTurn) {
      insertedTurnsAndEntrances.push({
        node: to,
        turnType: toTurn,
        coordinates: path[1],
        type: "turn",
        floors: [to.split("_")[0]]
      })
    }
  })

  return insertedTurnsAndEntrances;
}

const combinePaths = (insertedTurnsAndEntrances: any) => {
  const result = [];
  
  for (let i = 0; i < insertedTurnsAndEntrances.length; i++) {
    const current = insertedTurnsAndEntrances[i];

    // If it's an entrance or turn, just add it to the result
    if (current.type === 'entrance' || current.type === 'turn') {
      result.push(current);
      continue;
    }

    // Check if the previous item in the result array can be combined with the current one
    const last = result[result.length - 1];

    if (
      last &&
      last.pathType === current.pathType &&
      last.pathNameId === current.pathNameId
    ) {
      // Combine paths: update 'to', 'distance', 'path', and 'floors'
      last.to = current.to;
      last.distance += current.distance;
      last.path = last.path.concat(current.path);
      // @ts-ignore
      last.floors = [...last.floors, ...current.floors]
    } else {
      // Otherwise, add the current element to the result
      result.push(current);
    }
  }


  return result;
}

const calculateInstructions = (path: any, data: any, includeIcons: boolean, pathNameIds: StreetMap, dataWithAttributes: any, start: any, finish: any, lang: string) => {
  const nodes = dataWithAttributes.nodes;
  const pathAttributes = dataWithAttributes.pa;
  const pathAttributesNames = dataWithAttributes.pan;  
  const nodeAttributes = dataWithAttributes.na;
  const nodeAttributesNames = dataWithAttributes.nan;

  const adjacentPaths = getAdjacentPaths(path, nodes, pathAttributes, pathAttributesNames, nodeAttributes, nodeAttributesNames);
  const entrances = getEntrances(adjacentPaths, nodeAttributesNames, nodeAttributes, nodes);
  const coordinates = getPathCoordinates(path, nodes);
  const turns = getTurns(path, coordinates);

  const insertedTurnsAndEntrances = insertTurnsAndEntrances(adjacentPaths, entrances, turns);
  const combinedPaths = combinePaths(insertedTurnsAndEntrances);
    
  const instructions = getRoutingInstructions(combinedPaths, pathNameIds, path, dataWithAttributes)

  // @ts-ignore
  if (includeIcons) finalData["icons"] = icons;

  return {
    ...instructions,
    path
  } 
}

const getPathName = (nodeAId: string, nodeBId: string, streetIds: any[]): string => {
  let streetId = null;

  streetIds && Object.entries(streetIds).map(([key, arr]) => {
    if (arr.includes(nodeAId) && arr.includes(nodeBId)) {
      streetId = key;
      return
    }
  })

  return streetId
}

const getPathType = (nodeId: string, adjacentNodeId: string, pathAttributes: any, nodes:any, pathAttributesNames: any, nodeAttributes: any, nodeAttributesNames: any): any => {
  const node = nodes[nodeId]
  const adjacentNode = nodes[adjacentNodeId]
  if (!node) return undefined;

  const nodeTypeIndex = nodeAttributesNames.indexOf("type");
  const nodeEntranceTypeIndex = nodeAttributesNames.indexOf("entranceType");

  const nodeType = nodeAttributes[node[4]] && nodeAttributes[node[4]][nodeTypeIndex]
  const nextNodeType = nodeAttributes[adjacentNode[4]] && nodeAttributes[adjacentNode[4]][nodeTypeIndex]

  const entranceNodeType = nodeAttributes[node[4]] && nodeAttributes[node[4]][nodeEntranceTypeIndex]
  const entranceNextNodeType = nodeAttributes[adjacentNode[4]] && nodeAttributes[adjacentNode[4]][nodeEntranceTypeIndex]

  if (entranceNodeType === "elevator" && entranceNodeType === entranceNextNodeType) return "elevator"

  const adjacentNodes = node[5];
  const adjacentNodeWithPathAttributesId = adjacentNodes.filter((id: string) => id.includes(adjacentNodeId))

  if (!adjacentNodeWithPathAttributesId[0]) return undefined;

  const pathAttributeId = adjacentNodeWithPathAttributesId[0].includes(":") && adjacentNodeWithPathAttributesId[0].split(":")[1];
  const pathTypeIndex = pathAttributesNames.indexOf("pathType");

  // if none pathType provided just use gerneric "Pfadabschnitt"
  if (!pathAttributeId || (Object.keys(pathAttributes).length > 0 && !pathAttributes[pathAttributeId][`${pathTypeIndex}`])) return "Pfadabschnitt";

  if (Object.keys(pathAttributes).length === 0) return "Pfadabschnitt"

  const pathType = pathAttributes[pathAttributeId][`${pathTypeIndex}`] 
  const convertToPfadabschnitt = ["indoorPathway", "outdoorPathway", "footway"]

  return convertToPfadabschnitt.includes(pathType) ? "Pfadabschnitt" : pathType
}

const follow = (pathName: string, distance: number, pathType: string, lang: string, nodesTypes: string[], floors: any) => {
  const removedUndefinesNodesTypes = nodesTypes && nodesTypes.filter((type) => type)
  const isDoor = removedUndefinesNodesTypes && removedUndefinesNodesTypes[0] === "door";
  const isElevator = removedUndefinesNodesTypes && removedUndefinesNodesTypes.length > 0 && removedUndefinesNodesTypes.every(item => item === "elevator");

  // wenn erster nodeType elevator ist und die nächsten nicht, dann
  // "verlassen sie den aufzug und ..."

  if (lang === "en") {
    return `Follow ${pathName ? pathName : pathType} for ${distance} meters`
  } else {

    if (isDoor) {
      return `Durchquere die ${isDoor ? "Tür" : ""} und folge ${pathName ? pathName : pathType} für ${distance} Meter`
    } else if (isElevator || pathType === "elevator") {
      return `Fahre mit dem Aufzug zum ${floors.at(-1)}`
    }
    else {
      return `Folge ${pathName ? pathName : pathType} für ${distance} Meter`
  }
  }
}

const turn = (turnInstruction: string, streetNameNext: string, lang: string) => {
  if (lang === "en") {
    return `${turnInstruction} onto ${streetNameNext}`
  } else {
    return `${turnInstruction} auf ${streetNameNext}`
  }
}

const arrived = (lang: string) => {
  if (lang === "en") {
    return "You have reached your destination" 
  } else {
    return "Sie haben Ihr Ziel erreicht"
  }
}

const getNodeTypes = (path: string[], nextPath: string[] ,data: any) => {
  const nodeAttributes = data.na
  const nodeAttributesName = data.nan;
  const nodes = data.nodes;

  const nodeTypes: string[] = [];

  path.map((currentNode, index) => {

    // last node and first node of next path 
    if (nextPath && nextPath.at(0) === currentNode && path.at(-1) === currentNode && nodes[currentNode][4]) nodeTypes.push(undefined)
    else {
      const nodeAttributeID = nodes[currentNode][4]
      const nodeTypeIndex = nodeAttributesName.indexOf("type")

      if (typeof nodeAttributes[nodeAttributeID] === "undefined") nodeTypes.push(undefined)
      else {
        const nodeType = nodeAttributes[nodeAttributeID][nodeTypeIndex]
        nodeTypes.push(nodeType)
      }
    }
  })

  return nodeTypes
}

const groupPaths = (processedPath: any,nodes: any) => {
  /*
    Group same paths 

  */

  const groupedArray: any = [];
  let currentGroup: any = null;
  const coordinatesPerInstructions: any = {}
  let currentFloor: any = null;

  processedPath.forEach((item: any, index: number) => {
    const floor = `${item.from.split("_")[0]}-${item.to.split("_")[0]}`

    // Combine equal adjacent steps into a group. Create a new group if 
    // 1. The street names are different
    // 2. The floor is different
    // 3. The pathType is different

   if (
      // first group
      !currentGroup ||
      // different path/street 
      currentGroup.pathNameId !== item.pathNameId || 
      // floor change
      (floor !== currentFloor && !floor.includes("fc")) ||
      // different pathType
      currentGroup.pathType !== item.pathType 
    ) {
      // Start a new group
      currentGroup = {
        path: [item.from, item.to],
        pathCoordinates: item.path,
        pathType: item.pathType,
        pathNameId: item.pathNameId,
        distance: item.distance,
        floors: [item.from.split("_")[0]]
      };

      groupedArray.push(currentGroup);

    } else {
      // Continue the current group
      currentGroup.path.push(item.to);
      currentGroup.pathCoordinates.push(item.path[item.path.length - 1]);
      currentGroup.distance += item.distance;
      currentGroup.floors.push(item.from.split("_")[0])
    }

    currentFloor = floor
  });

  groupedArray.map((paths: any, index: number) => {
   coordinatesPerInstructions[index] = getCoordinatesFromNodeIds(paths.path, nodes);
  })

  return {groupedPaths: groupedArray,coordinatesPerInstructions}
}

const getAdjacentPaths = (path: string[], nodes: any, pathAttributes: any, pathAttributesNames: any, nodeAttributes: any, nodeAttributesNames: any) => {
  /*
    Returns each connection from one node to another
    Turn points and entrance points will be added later

    [
        {
          from: 'EG_t1',
          to: 'EG_t2',
          path: [ [Array], [Array] ],
          pathType: 'Pfadabschnitt',
          pathNameId: undefined,
          distance: 271,
          floors: ["EG"]
        },
        {
          from: 'EG_t2',
          to: 'EG_t3',
          path: [ [Array], [Array] ],
          pathType: 'Pfadabschnitt',
          pathNameId: undefined,
          distance: 196,
          floors: ["EG"]
        }
      ]
  */

  let adjacentPaths: any = []

  path.map((nodeId: string, index: number) => {
    const nextNodeId = path[index + 1]
    if (!nextNodeId) return;

    const node = nodes[nodeId];
    const nextNode = nodes[nextNodeId]

    // get coordinates
    const coordsNode = nodes[nodeId][0]
    const coordsNextNode = nodes[nextNodeId][0]

    // check if actual node id or matchedTempStart/Dest
    const nodeIdSplit = nodeId.split("_")[1] ? nodeId.split("_")[1] : nodeId;
    const nextNodeIdSplit = nextNodeId.split("_")[1] ? nextNodeId.split("_")[1] : nextNodeId;

    let pathAttributesId = nodes[nodeId][5].filter((adjNode: string) => adjNode.includes(nextNodeIdSplit))
    if (pathAttributesId.length > 0 && pathAttributesId[0].includes(":")) pathAttributesId = pathAttributesId[0].split(":")[1]

    // extract path id/name 
    // 'OG1_t01:f477' => 'f477'
    let pathName = nodes[nodeId][5].filter((adjNode: string) => adjNode.includes(nextNodeIdSplit))
    if (pathName && pathName[0] && pathName[0].includes(":")) {
      pathName = pathName[0].split(":")[1]
    } else {
      pathName = null
    }
    
    // street name
    let pathNameId = undefined;
    if (pathName && pathAttributesNames.includes("streetid")) {
      const streetIdIndex = pathAttributesNames.indexOf("streetid");

      pathNameId = pathAttributes[pathName][streetIdIndex]
    }

    const pathType = getPathType(nodeId, nextNodeId, pathAttributes, nodes, pathAttributesNames, nodeAttributes, nodeAttributesNames);
    const distance = getDistance(coordsNode, coordsNextNode);

    const floors = [nodeId.split("_")[0], nextNodeId.split("_")[0]]
    adjacentPaths.push({
      from: nodeId,
      to: nextNodeId,
      path: [coordsNode, coordsNextNode],
      pathType,
      pathNameId,
      distance: distance,
      floors: floors
    })
  })

  return adjacentPaths;
}

const getCoordinatesFromNodeIds = (nodeIds: [string], nodes: any) => {
  const coordinates: any  = []
  
  nodeIds.map((id: string) => {
    coordinates.push(nodes[id][0])
  })

  return coordinates
}

module.exports = { getShortestPath, getPathName }