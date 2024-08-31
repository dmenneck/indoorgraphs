export {}
const {IndoorGraphs} = require('../dist/index');

describe('Verify graph structure', () => {

    test("Valid graph structure", () => {
        const data = {
            "nodes": {},
            "pathAttributes": {}
        }

        try {
            const graph = new IndoorGraphs(data);

        } catch (error) {
            expect(error.message).toBe("Please provide nodes.")

        }
    })

    test("Invalid graph structure - nodes missing", () => {
        const data = {
            "pathAttributes": {}
        }

        try {
            const graph = new IndoorGraphs(data);

        } catch (error) {
            expect(error.message).toBe("Graph is not of type {nodes: {}, pathAttributes: {}}. Please provide a valid indoor graph.")

        }
    })

    test("Invalid graph structure - wrong key", () => {
        const data = {
            "pathAttributes": {},
            "test": {}
        }

        try {
            const graph = new IndoorGraphs(data);

        } catch (error) {
            expect(error.message).toBe("Graph is not of type {nodes: {}, pathAttributes: {}}. Please provide a valid indoor graph.")
        }
    })

    test("Invalid graph structure - valid node", () => {
        const data = {
            "pathAttributes": {},
            "nodes": {
                "EG_t1": {
                    "coordinates": [
                        6.941962423193652,
                        50.94713474825744
                    ],
                    "attributes": {},
                    "id": "EG_t1",
                    "level": "EG",
                    "adjacentNodes": [
                        "EG_t2",
                        "EG_t3"
                    ]
                }
            }
        }

        const graph = new IndoorGraphs(data);
    })

    test("Invalid graph structure - invalid node: id key missing", () => {
        const data = {
            "pathAttributes": {},
            "nodes": {
                "EG_t1": {
                    "coordinates": [
                        6.941962423193652,
                        50.94713474825744
                    ],
                    "attributes": {},
                    "level": "EG",
                    "adjacentNodes": [
                        "EG_t2",
                        "EG_t3"
                    ]
                }
            }
        }

        try {    
            const graph = new IndoorGraphs(data);
        } catch (error) {
            expect(error.message).toBe('node EG_t1 is missing property "id"')
        }
    })
})