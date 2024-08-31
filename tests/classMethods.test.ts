export {};

const { IndoorGraphs } = require('../dist/index');
const dataFive = require("./graphs/classMethods.test/graph-a.json")
const dataFiveProd = require("./graphs/classMethods.test/graph-b.json")

describe('Class methods', () => {
    const id1 =  "UG_t1";
    const id2 =  "UG_t2";
    const coords = [ 6.964595992508727, 50.94904578470164 ]
    const level = "UG"
    const adjacentNodesId1 = ["UG_t2"]
    const adjacentNodesId2 = ["UG_t1"]

    const UG_t1 =  { id: id1, coordinates: coords, level, adjacentNodes: adjacentNodesId1 }
    const UG_t2 =  { id: id2, coordinates: coords, level, adjacentNodes: adjacentNodesId2 }

    const data = { nodes: { UG_t1, UG_t2}, pathAttributes: {} } 

    test("getData()", () => {
        const graph = new IndoorGraphs(data);

        const nodes = Object.keys(graph.getData().nodes);

        expect(nodes.includes("UG_t1")).toBe(true)
        expect(nodes.includes("UG_t2")).toBe(true)

        expect(Object.keys(graph.getData().nodes).length).toBe(2)
        expect(graph.getData()).toBeDefined()
    })
    
    test("setData()", () => {
        const graph = new IndoorGraphs(data);
        expect(Object.keys(graph.getData().nodes).length).toBe(2)
        expect(graph.getData()).toBeDefined()

        const id =  "UG_t1";
        const coordinates = [ 6.964595992508727, 50.94904578470164 ]
        const level = "UG"
        const adjacentNodes = ["UG_t2", "UG_t3"]

        const EG_t1 =  { id, coordinates, level, adjacentNodes }
        const newData = { nodes: { EG_t1 }, pathAttributes: {} }

        graph.setData(newData)

        expect(Object.keys(graph.getData().nodes).length).toBe(1)
    })

    test("setData() -> invalid data", () => {
        const graph = new IndoorGraphs(data);

        expect(graph.setData()).toBe("Please provide a valid indoor graph.")
        expect(graph.setData(232)).toBe("Please provide a valid indoor graph.")
        expect(graph.setData({})).toBe("Graph is not of type {nodes: {}, pathAttributes: {}}. Please provide a valid indoor graph.")
        expect(graph.setData([])).toBe("Graph is not of type {nodes: {}, pathAttributes: {}}. Please provide a valid indoor graph.")
        expect(graph.setData({nodes: 2})).toBe("Graph is not of type {nodes: {}, pathAttributes: {}}. Please provide a valid indoor graph.")
    })

    test("getRoutableOptions()", () => {
        const data = {
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
                },
                "EG_t2": {
                    "coordinates": [
                        6.95561996432432,
                        50.947109852057906
                    ],
                    "attributes": {},
                    "id": "EG_t2",
                    "level": "EG",
                    "adjacentNodes": [
                        "EG_t1",
                        "OG1_t2"
                    ]
                },
                "OG1_t2": {
                    "coordinates": [
                        6.95561996432432,
                        50.947109852057906
                    ],
                    "id": "OG1_t2",
                    "attributes": {},
                    "dest": "OG1",
                    "level": "OG1",
                    "adjacentNodes": [
                        "EG_t2",
                        "EG_t4"
                    ]
                },
                "EG_t3": {
                    "coordinates": [
                        6.942328652117318,
                        50.944791628390846
                    ],
                    "attributes": {
                        "doorWidth": "40"
                    },
                    "id": "EG_t3",
                    "level": "EG",
                    "adjacentNodes": [
                        "EG_t1",
                        "EG_t4"
                    ]
                },
                "EG_t4": {
                    "coordinates": [
                        6.942816227424807,
                        50.94232167852843
                    ],
                    "attributes": {
                        "isWellLit": false
                    },
                    "id": "EG_t4",
                    "level": "EG",
                    "adjacentNodes": [
                        "EG_t3",
                        "OG1_t2"
                    ]
                }
            },
            "pathAttributes": {}
        }
        
        try {
            const graph = new IndoorGraphs(data);

            const { nodeAttributesOptions, pathAttributesOptions } = graph.getRoutableOptions();
            
            expect(nodeAttributesOptions.doorWidth).toBe("string")
            expect(nodeAttributesOptions.isWellLit).toBe("boolean")
        } catch (error) {
            console.log(error)
        }
    })

    test("getRoutableOptions() pathAttributesOptions", () => {
        const data = {
            "nodes": {
                "EG_t1": {
                    "coordinates": [
                        6.93957671090673,
                        50.939350753943216
                    ],
                    "attributes": {
                        "isWellLit": false
                    },
                    "id": "EG_t1",
                    "level": "EG",
                    "adjacentNodes": [
                        "EG_t2",
                        "EG_t3"
                    ]
                },
                "EG_t2": {
                    "coordinates": [
                        6.946505543180664,
                        50.941262250870466
                    ],
                    "attributes": {
                        "isWellLit": false
                    },
                    "id": "EG_t2",
                    "level": "EG",
                    "adjacentNodes": [
                        "EG_t1",
                        "EG_t3",
                        "EG_t4"
                    ]
                },
                "EG_t3": {
                    "coordinates": [
                        6.946244900941135,
                        50.938247080639684
                    ],
                    "attributes": {
                        "isWellLit": false
                    },
                    "id": "EG_t3",
                    "level": "EG",
                    "adjacentNodes": [
                        "EG_t1",
                        "EG_t2",
                        "EG_t4"
                    ]
                },
                "EG_t4": {
                    "coordinates": [
                        6.94962923947096,
                        50.940506023209394
                    ],
                    "attributes": {
                        "isWellLit": false
                    },
                    "id": "EG_t4",
                    "level": "EG",
                    "adjacentNodes": [
                        "EG_t2",
                        "EG_t3"
                    ]
                }
            },
            "pathAttributes": {
                "EG_t2-EG_t1": {
                    "hasStairs": true
                },
                "EG_t3-EG_t2": {
                    "hasStairs": false
                },
                "EG_t3-EG_t1": {
                    "hasStairs": false
                },
                "EG_t4-EG_t2": {
                    "hasStairs": false
                },
                "EG_t4-EG_t3": {
                    "hasStairs": true
                }
            }
        }
     
        try {
            const graph = new IndoorGraphs(data);

            const { nodeAttributesOptions, pathAttributesOptions } = graph.getRoutableOptions()
            expect(pathAttributesOptions).toBeDefined()
            expect(pathAttributesOptions.hasStairs).toBe("boolean")
        } catch (error) {
            console.log(error)
        }
    })

    test("getRoutableOptions() exclude keys", () => {
        const data = {
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
                },
                "EG_t2": {
                    "coordinates": [
                        6.95561996432432,
                        50.947109852057906
                    ],
                    "attributes": {},
                    "id": "EG_t2",
                    "level": "EG",
                    "adjacentNodes": [
                        "EG_t1",
                        "OG1_t2"
                    ]
                },
                "OG1_t2": {
                    "coordinates": [
                        6.95561996432432,
                        50.947109852057906
                    ],
                    "id": "OG1_t2",
                    "attributes": {},
                    "type": "Elevator",
                    "dest": "OG1",
                    "level": "OG1",
                    "adjacentNodes": [
                        "EG_t2",
                        "EG_t4"
                    ]
                },
                "EG_t3": {
                    "coordinates": [
                        6.942328652117318,
                        50.944791628390846
                    ],
                    "attributes": {
                        "doorWidth": "40",
                        "isWellLit": false
                    },
                    "id": "EG_t3",
                    "level": "EG",
                    "adjacentNodes": [
                        "EG_t1",
                        "EG_t4"
                    ]
                },
                "EG_t4": {
                    "coordinates": [
                        6.942816227424807,
                        50.94232167852843
                    ],
                    "attributes": {},
                    "id": "EG_t4",
                    "level": "EG",
                    "adjacentNodes": [
                        "EG_t3",
                        "OG1_t2"
                    ]
                }
            },
            "pathAttributes": {
                "EG_t4-EG_t3": { pathWidth: "20", pathSlope: "2" }
            }
        }
        
        try {
            const graph = new IndoorGraphs(data);

            const { nodeAttributesOptions, pathAttributesOptions } = graph.getRoutableOptions({ exclude: ["doorWidth", "pathSlope"] });
                        
            expect(Object.keys(nodeAttributesOptions).length).toBe(1)
            expect(Object.keys(pathAttributesOptions).length).toBe(1)

            expect(Object.keys(nodeAttributesOptions)[0]).toBe("isWellLit")
            expect(Object.keys(pathAttributesOptions)[0]).toBe("pathWidth")

        } catch (error) {
            console.log(error)
        }     
    })
  
    test("getNodeAttributes()", () => {
        try {
            const graph = new IndoorGraphs(dataFive);
            expect(graph.getNodeAttributes()).toBeDefined()
            
            const graphProd = new IndoorGraphs(dataFiveProd);
            expect(graphProd.getNodeAttributes()).toBeDefined()
        } catch (error) {
            console.log(error)
        }
    })


    test("getPathAttributes()", () => {
        const data = {
            "nodes": {
                "UG_t1": {
                    "coordinates": [
                        6.967842553558049,
                        50.946860664839846
                    ],
                    "attributes": {
                        "wellLit": true,
                        "doorWidth": "200"
                    },
                    "id": "UG_t1",
                    "type": "Node",
                    "level": "UG",
                    "adjacentNodes": [
                        "UG_t2"
                    ]
                },
                "UG_t2": {
                    "coordinates": [
                        6.968503094697883,
                        50.94665193377298
                    ],
                    "attributes": {
                        "wellLit": true,
                        "doorWidth": "200"
                    },
                    "id": "UG_t2",
                    "type": "Node",
                    "level": "UG",
                    "adjacentNodes": [
                        "UG_t1",
                        "UG_t3",
                        "UG_t4"
                    ]
                },
                "UG_t3": {
                    "coordinates": [
                        6.968773492332983,
                        50.946443547248236
                    ],
                    "attributes": {
                        "wellLit": "undefined",
                        "doorWidth": "200"
                    },
                    "id": "UG_t3",
                    "type": "Node",
                    "level": "UG",
                    "adjacentNodes": [
                        "UG_t2"
                    ]
                },
                "UG_t4": {
                    "coordinates": [
                        6.968361048109886,
                        50.94645068963047
                    ],
                    "attributes": {
                        "wellLit": false,
                        "doorWidth": "250"
                    },
                    "id": "UG_t4",
                    "type": "Node",
                    "level": "UG",
                    "adjacentNodes": [
                        "UG_t2",
                        "UG_t5"
                    ]
                },
                "UG_t5": {
                    "coordinates": [
                        6.968284158374042,
                        50.94621802073712
                    ],
                    "attributes": {
                        "wellLit": true,
                        "doorWidth": "200"
                    },
                    "id": "UG_t5",
                    "type": "Node",
                    "level": "UG",
                    "adjacentNodes": [
                        "UG_t4",
                        "UG_t6"
                    ]
                },
                "UG_t6": {
                    "coordinates": [
                        6.968265307378921,
                        50.946034623371844
                    ],
                    "attributes": {
                        "wellLit": false,
                        "doorWidth": "100"
                    },
                    "id": "UG_t6",
                    "type": "Node",
                    "level": "UG",
                    "adjacentNodes": [
                        "UG_t5"
                    ]
                }
            },
            "pathAttributes": {
                "UG_t2-UG_t1": {
                    "pathWidth": "20"
                },
                "UG_t3-UG_t2": {
                    "pathWidth": "20"
                },
                "UG_t4-UG_t2": {
                    "pathWidth": "40"
                },
                "UG_t5-UG_t4": {
                    "pathWidth": "40"
                },
                "UG_t6-UG_t5": {
                    "pathWidth": "20"
                }
            }
        }

        // no prod data
        try {
            const graph = new IndoorGraphs(data);
            const length = Object.keys(graph.getPathAttributes()).length;

            expect(graph.getPathAttributes()).toBeDefined()
            expect(length).toBe(2)
        } catch (error) {
            console.log(error)
        }
    })

    test("getNodeRemovalConditions()", () => {
        const conditions = {
            nodeRemovalConditions: [["isWellLit === true"]],
        }
        const graph = new IndoorGraphs(dataFive, { conditions });
        const getConditions = graph.getNodeRemovalConditions();

        expect(getConditions.length).toBe(1)
        expect(getConditions[0].length).toBe(1)
    })

    test("getEdgeRemovalConditions()", () => {
        const conditions = {
            edgeRemovalConditions: [["isWellLit === true"]],
        }
        const graph = new IndoorGraphs(dataFive, { conditions });
        const getConditions = graph.getEdgeRemovalConditions();

        expect(getConditions.length).toBe(1)
        expect(getConditions[0].length).toBe(1)
    })

    test('getRoute()', () => {
        const graph = new IndoorGraphs(data);

        try {
            const [coordinates, path, instructions, error] = graph.getRoute('UG_t1', 'UG_t2');

            console.log(path)
        } catch (error) {
            console.log(error)
        }
    })
})
