export {};

const {IndoorGraphs} = require('../dist/index');

describe('Create Instance of IndoorGraphs', () => {
  const id =  "UG_t1";
  const coordinates = [ 6.964595992508727, 50.94904578470164 ]
  const level = "UG"
  const adjacentNodes = ["UG_t2: cf23", "UG_t3"]
 
  test('Valid instance', async () => {
    const EG_t1 =  { id, coordinates, level, adjacentNodes }
    const data = { nodes: { EG_t1 }, pathAttributes: {} }

    const graph = new IndoorGraphs(data, 
      { 
        filter: {},
        includeIcons: true
      });
    
    expect(graph.includeIcons).not.toBe(undefined)
    expect(graph.pathNameIds).toBe(undefined)
    expect(graph.data).not.toBe(undefined)
    expect(graph).not.toBe(undefined)
    expect(graph.conditions).toBe(undefined)
  })
   
  test('No data provided', () => {
    try {
      new IndoorGraphs()
    } catch (error) {
      expect(error.message).toBe("Please provide a valid indoor graph.");
    }
  })

  test('Invalid graph: node level attribute missing', () => {
    try {
        // attribute "level" is missing
        const EG_t1 =  { coordinates, id, adjacentNodes }
        const data = { nodes: { EG_t1 }, pathAttributes: {} }
        new IndoorGraphs(data, { routingOptions: {}, filter: {} })
      } catch (error) {
        expect(error.message).toBe('node EG_t1 is missing property "level"');
      }
  })

  test('Invalid graph: node c attribute missing', () => {
    try {
        // attribute "coordinates" is missing
        const EG_t1 =  { level, id, adjacentNodes }
        const data = { nodes: { EG_t1 }, pathAttributes: {} }
        new IndoorGraphs(data, { routingOptions: {}, filter: {} })
      } catch (error) {
        expect(error.message).toBe('node EG_t1 is missing property "coordinates"');
      }
  })

  test('Invalid graph, no object - 1', () => {
    try {
        new IndoorGraphs("2", {})
      } catch (error) {
        expect(error.message).toBe("Please provide a valid indoor graph.");
      }
  })

  test('Invalid graph, no object - 2', () => {
    try {
        new IndoorGraphs(2, {})
      } catch (error) {
        expect(error.message).toBe("Please provide a valid indoor graph.");
      }
  })
 
  test('Invalid graph, no object - 3', () => {
    try {
        new IndoorGraphs({})
      } catch (error) {
        expect(error.message).toBe("Graph is not of type {nodes: {}, pathAttributes: {}}. Please provide a valid indoor graph.");
      }
  })

  test('Invalid graph, no object - 4', () => {
    try {
        new IndoorGraphs(undefined, {})
      } catch (error) {
        expect(error.message).toBe("Please provide a valid indoor graph.");
      }
  })

  test('Invalid graph, no object - 5', () => {
    try {
        new IndoorGraphs(false, {})
      } catch (error) {
        expect(error.message).toBe("Please provide a valid indoor graph.");
      }
  })

  test('Invalid graph: no nodes', () => {
    try {
        new IndoorGraphs({nodes: {}, pathAttributes: {}}, {})
      } catch (error) {
        expect(error.message).toBe("Please provide nodes.");
      }
  })
})
