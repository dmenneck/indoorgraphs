export {}
const {IndoorGraphs} = require('../dist/index');

describe('addGraph()', () => {
    const data1: any = {
        "nodes": {
            "EG_t1":[[6.941107327625539,50.94804643242088],"EG_t1","EG","40c2",["EG_t2:d650"]],
            "EG_t2":[[6.946257168934133,50.949830888475304],"EG_t2","EG","40c2",["EG_t1:d650"]]
        },
        "pa":{
            "d650":{"0":200,"1":"pathway","2":false}
        },
        "pan":["pathWidth","pathType","isAccessible"],
        "na":{"40c2":{"0":true,"1":50,"2":"door"}},
        "nan":["isLit","doorWidth","nodeType"]
    }
    const data2: any = {
        "nodes": {
            "EG_t3":[[6.93934779851177,50.94753271267544],"EG_t3","EG","eac3",["EG_t4:0675"]],
            "EG_t4":[[6.946772153064991,50.949452373218605],"EG_t4","EG","a64b",["EG_t3:0675"]]
        },
        "pa":{"0675":{"0":"ramp","1":200,"2":2,"3":true}},
        "pan":["pathType","pathWidth","slopeAngle","isWellLit"],
        "na":{"eac3":{"0":"elevator","1":150,"2":false,"3":300},"a64b":{"0":"elevator","1":120,"2":false,"3":320}},
        "nan":["nodeType","doorWidth","isDoor","doorHeight"]
    }

    test("Should fail because no graph provided", () => {
        const graph = new IndoorGraphs(data1);

        const res = graph.addGraph({})
        const res2 = graph.addGraph()

        expect(res2[3]).toBe("Please provide a valid production graph.")
        expect(res[3]).toBe("Please provide a valid production graph.")
    })

    test("Should successfully combine node attributes", () => {
        const graph = new IndoorGraphs(data1);

        const res = graph.addGraph(data2)

        expect(res).toBe(undefined)

        Object.entries(graph.data.nodes).map(([key, values]: any) => {
            const nodeAttributesID = values[3];
            const attributes = graph.data.na[nodeAttributesID];

            const nan = graph.data.nan;

            Object.entries(attributes).map(([key2, value], index) => {
                const nodeAttributeName = nan[index];

                if (key === "EG_t1" || key === "EG_t1") {
                    Object.entries(data1.nodes).map(([key3, values2]: any) => {
                        const nodeAttributesID = values[3];
                        const attributes = graph.data.na[nodeAttributesID];

                        Object.entries(attributes).map(([key4, value2], index) => {
                            const nodeAttributeName2 = nan[index];

                            if (key3 === key && nodeAttributeName2 === nodeAttributeName) expect(value2).toBe(value)
                        })
                    })

                }

                if (key === "EG_t3" || key === "EG_t4") {
                    Object.entries(data2.nodes).map(([key3, values2]: any) => {
                        const nodeAttributesID = values[3];
                        const attributes = graph.data.na[nodeAttributesID];

                        Object.entries(attributes).map(([key4, value2], index) => {
                            const nodeAttributeName2 = nan[index];

                            if (key3 === key && nodeAttributeName2 === nodeAttributeName) expect(value2).toBe(value)
                        })
                    })
                }
            })
        })      
    })
})