export {}
const {IndoorGraphs, getProductionBuild} = require('../dist/index');
const graphA = require("./graphs/prod-dev-builds.test/graph-a.json")

describe('prod and dev builds', () => {
    test("test getProductionBuild()", () => {
        const prodBuild = getProductionBuild(graphA)
        
        expect(prodBuild.hasOwnProperty("nodes")).toBe(true)
        expect(prodBuild.hasOwnProperty("na")).toBe(true)
        expect(prodBuild.hasOwnProperty("nan")).toBe(true)
        expect(prodBuild.hasOwnProperty("pa")).toBe(true)
        expect(prodBuild.hasOwnProperty("pan")).toBe(true)

        // Should not include undefined for the nodeType that was previously included
        // in the array. It should now be located in the attributes.
        expect(prodBuild.nodes["EG_t1"].length).toBe(5)
        
        Object.values(prodBuild.pa).map((attribute: any) => {
            expect(attribute["0"]).toBe("pathway")
        })

        expect(prodBuild.pan[0]).toBe("pathType")

        Object.values(prodBuild.na).map((attribute: any) => {
            expect(attribute["0"]).toBe("door")
        })

        expect(prodBuild.nan[0]).toBe("nodeType")
    })
})