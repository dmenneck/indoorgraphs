export {};

const { IndoorGraphs } = require('../dist/index');

describe('Conditions', () => {
    test("remove node", () => {
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
                    "level": "UG",
                    "adjacentNodes": [
                        "UG_t1",
            
                    ]
                }
            },
            "pathAttributes": {
                "UG_t2-UG_t1": {
                    "pathWidth": "20"
                }
            }
        }
        const graph = new IndoorGraphs(data);

        try {
            graph.removeNodes([["doorWidth === 200"]]);
            expect(graph.getRoute('UG_t1', 'UG_t2')[3]).toBe("Node UG_t1 is not present in the graph.")
        } catch (error) {
            console.log(error.message)
        }
    })

    test("remove node", () => {
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
                    "level": "UG",
                    "adjacentNodes": [
                        "UG_t1",
            
                    ]
                }
            },
            "pathAttributes": {
                "UG_t2-UG_t1": {
                    "pathWidth": "20"
                }
            }
        }

        const graph = new IndoorGraphs(data);

        try {
            graph.removeNodes([["doorWidth > 190"]]);
            expect(graph.getRoute('UG_t1', 'UG_t2')[3]).toBe("Node UG_t1 is not present in the graph.")
        } catch (error) {
            console.log(error.message)
        }
    })

    test("remove node", () => {
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
                    "level": "UG",
                    "adjacentNodes": [
                        "UG_t1",
            
                    ]
                }
            },
            "pathAttributes": {
                "UG_t2-UG_t1": {
                    "pathWidth": "20"
                }
            }
        }
        
        const graph = new IndoorGraphs(data);

        try {
            graph.removeNodes([["doorWidth < 190"]]);
            expect(graph.getRoute('UG_t1', 'UG_t2')[3]).toBe(undefined)
        } catch (error) {
            console.log(error.message)
        }
    })

    test("remove node", () => {
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
                    "level": "UG",
                    "adjacentNodes": [
                        "UG_t1",
            
                    ]
                }
            },
            "pathAttributes": {
                "UG_t2-UG_t1": {
                    "pathWidth": "20"
                }
            }
        }
        
        const graph = new IndoorGraphs(data);

        try {
            graph.removeNodes([["doorWidth < 190"]]);
            expect(graph.getRoute('UG_t1', 'UG_t2')[3]).toBe(undefined)
        } catch (error) {
            console.log(error.message)
        }
    })


    test("remove node - coombined conditions", () => {
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
                    "level": "UG",
                    "adjacentNodes": [
                        "UG_t1",
            
                    ]
                }
            },
            "pathAttributes": {
                "UG_t2-UG_t1": {
                    "pathWidth": "20"
                }
            }
        }
        
        const graph = new IndoorGraphs(data);

        try {
            graph.removeNodes([["doorWidth < 190", "||", "wellLit === true"]]);
            expect(graph.getRoute('UG_t1', 'UG_t2')[3]).toBe("Node UG_t1 is not present in the graph.")
        } catch (error) {
            console.log(error.message)
        }
    })
})