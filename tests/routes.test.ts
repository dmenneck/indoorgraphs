export {}
const {IndoorGraphs} = require('../dist/index');
const graphA = require("./graphs/routes.test/graph-a.json")
const graphB = require("./graphs/routes.test/graph-b.json")
const graphC = require("./graphs/routes.test/graph-c.json")
const graphD = require("./graphs/routes.test/graph-d.json")
const graphE = require("./graphs/routes.test/graph-e.json")
const graphF = require("./graphs/routes.test/graph-f.json")
const graphG = require("./graphs/routes.test/graph-g.json")
const graphH = require("./graphs/routes.test/graph-h.json")
const streetsH = require("./streetNames/streetNames-h.json")

describe('routes', () => {

    test("Calculation with a Graph with includingIcons true", () => {
        const graph = new IndoorGraphs(graphA, { includeIcons: true });

        try {
            expect(() => graph.getRoute('EG_t1', 'EG_t2')).not.toThrow()
        } catch (error) {
            throw new Error("fails with -> " + error)
        }
    })

    test("From a to b", () => {
        const graph = new IndoorGraphs(graphA);

        try {
            const [coordinates, path, instructions, error] = graph.getRoute('EG_t1', 'EG_t2');

            const steps = instructions.steps;

            expect(steps[0].category).toBe("start")
            expect(steps[0].distance).toBe(375)
            expect(steps[0].pathType).toBe("pathSection")
            expect(steps[1].category).toBe("arrived")
            expect(path.length).toBe(2)
        } catch (error) {
            throw new Error("fails with -> " + error)
        }
    })

    // pass building entrance
    test("Path through entranceType: building", () => {
        const graph = new IndoorGraphs(graphB);

        try {
            const [coordinates, path, instructions, error] = graph.getRoute('EG_t4', 'EG_t3');

            const steps = instructions.steps

            expect(steps[0].distance).toBe(427)
            expect(steps[0].category).toBe("start")
            expect(steps[0].pathType).toBe("pathSection")
            expect(steps[0].streetName).toBe(null);

            // Betrete das Gebäude / Betrete den Raum
            expect(steps[1].category).toBe("entrance")
            expect(steps[1].pathType).toBe(null)
            expect(steps[1].streetName).toBe(null)

            expect(steps[2].distance).toBe(196)
            expect(steps[2].category).toBe("follow")
            expect(steps[2].pathType).toBe("pathSection")
            expect(steps[2].streetName).toBe(null)

            expect(steps[3].category).toBe("arrived")
            expect(steps[3].pathType).toBe(null)
            expect(steps[3].streetName).toBe(null)

            expect(path.length).toBe(4)
        } catch (error) {
            throw new Error("fails with -> " + error)
        }
    })

    // pass room entrance
    test("Path through entranceType: room", () => {
        const graph = new IndoorGraphs(graphC);

        try {
            const [coordinates, path, instructions, error] = graph.getRoute('EG_t1', 'EG_t5');
            const steps = instructions.steps;

            expect(steps[0].distance).toBe(607)
            expect(steps[0].category).toBe("start")
            expect(steps[0].pathType).toBe("pathSection")
            expect(steps[0].streetName).toBe(null);

            expect(steps[1].category).toBe("right")
            expect(steps[1].pathType).toBe(null)
            expect(steps[1].streetName).toBe(null)

            expect(steps[2].category).toBe("follow")
            expect(steps[2].pathType).toBe("pathSection")
            expect(steps[2].streetName).toBe(null)

            // Betrete Raum
            expect(steps[3].category).toBe("entrance")
            expect(steps[3].pathType).toBe(null)
            expect(steps[3].streetName).toBe(null)

            expect(steps[4].distance).toBe(195)
            expect(steps[4].category).toBe("follow")
            expect(steps[4].pathType).toBe("pathSection")
            expect(steps[4].streetName).toBe(null)

            expect(steps[5].category).toBe("arrived")
            expect(steps[5].pathType).toBe(null)
            expect(steps[5].streetName).toBe(null)
        } catch (error) {
            throw new Error("fails with -> " + error)
        }
    })

    test("Path along pathType", () => {
        // take the {stairs}/{ramp}
        const graph = new IndoorGraphs(graphD);

        try {
            const [coordinates, path, instructions, error] = graph.getRoute('EG_t1', 'EG_t4');

            const steps = instructions.steps

            expect(steps[0].distance).toBe(313)
            expect(steps[0].category).toBe("start")
            expect(steps[0].pathType).toBe("pathway")
            expect(steps[0].streetName).toBe(null);

            expect(steps[1].category).toBe("right")
            expect(steps[1].pathType).toBe(null)
            expect(steps[1].streetName).toBe(null)

            expect(steps[2].distance).toBe(410)
            expect(steps[2].category).toBe("follow")
            expect(steps[2].pathType).toBe("ramp")
            expect(steps[2].streetName).toBe(null)

            expect(steps[3].category).toBe("arrived")
            expect(steps[3].pathType).toBe(null)
            expect(steps[3].streetName).toBe(null)
        } catch (error) {
            throw new Error("fails with -> " + error)
        }
    })

    test("Path along elevator", () => {
        // take elevator
        const graph = new IndoorGraphs(graphE);

        try {
            const [coordinates, path, instructions, error] = graph.getRoute('EG_t1', 'OG3_t6');

            const steps = instructions.steps;

            expect(steps[0].distance).toBe(56)
            expect(steps[0].category).toBe("start")
            expect(steps[0].pathType).toBe("pathSection")
            expect(steps[0].streetName).toBe(null);

            expect(steps[1].category).toBe("follow")
            expect(steps[1].pathType).toBe("elevator")
            expect(steps[1].streetName).toBe(null)

            expect(steps[2].distance).toBe(4)
            expect(steps[2].category).toBe("follow")
            expect(steps[2].pathType).toBe("pathSection")
            expect(steps[2].streetName).toBe(null)

            expect(steps[3].category).toBe("arrived")
            expect(steps[3].pathType).toBe(null)
            expect(steps[3].streetName).toBe(null)
        } catch (error) {
            throw new Error("fails with -> " + error)
        }

    })

    test("turn right", () => {
        // follow Gottesweg for x meters
        const graph = new IndoorGraphs(graphF);

        try {
            const [coordinates, path, instructions, error] = graph.getRoute('EG_t1', 'EG_t3');
            const steps = instructions.steps;

            expect(steps[1].category).toBe("right")
        } catch (error) {
            throw new Error("fails with -> " + error)
        }
    })

    test("Turn left", () => {
        const graph = new IndoorGraphs(graphF);

        try {
            const [coordinates, path, instructions, error] = graph.getRoute('EG_t1', 'EG_t7');
            const steps = instructions.steps;

            expect(steps[1].category).toBe("left")
        } catch (error) {
            throw new Error("fails with -> " + error)
        }
    })

    test("Follow path", () => {
        const graph = new IndoorGraphs(graphF);

        try {
            const [coordinates, path, instructions, error] = graph.getRoute('EG_t1', 'EG_t5');
            const steps = instructions.steps;

            expect(steps[0].category).toBe("start")
            expect(steps[0].pathType).toBe("pathSection")
            expect(steps[0].distance).toBe(58)
            expect(steps[1].category).toBe("arrived")

            expect(steps[0].category).toBe("start")
        } catch (error) {
            throw new Error("fails with -> " + error)
        }
    })

    test("Turn slight right", () => {
        const graph = new IndoorGraphs(graphF);

        try {
            const [coordinates, path, instructions, error] = graph.getRoute('EG_t1', 'EG_t4');
            const steps = instructions.steps;

            expect(steps[1].category).toBe("slightlyRight")
        } catch (error) {
            throw new Error("fails with -> " + error)
        }
    })

    test("Turn slight left", () => {
        const graph = new IndoorGraphs(graphF);

        try {
            const [coordinates, path, instructions, error] = graph.getRoute('EG_t1', 'EG_t6');
            const steps = instructions.steps;

            expect(steps[1].category).toBe("slightlyLeft")
        } catch (error) {
            throw new Error("fails with -> " + error)
        }
    })

    test("Path with street names", () => {
        const streetNames = {
            "1": "Gottesweg",
            "2": "Luxemburgerstraße"
        }

        const graph = new IndoorGraphs(graphG, {pathNameIds: streetNames});

        try {
            const [coordinates, path, instructions, error] = graph.getRoute('EG_t1', 'EG_t6');

            const steps = instructions.steps;

            // TODO
        } catch (error) {
            throw new Error("fails with -> " + error)
        }
    })

    test("Path with street names: combine paths with same streetname", () => {
        const graph = new IndoorGraphs(graphH, {pathNameIds: streetsH});
        try {
            const [coordinates, path, instructions, error] = graph.getRoute([6.92317, 50.92991], [6.93699, 50.92639]);
        } catch (error) {
            throw new Error("fails with -> " + error)
        }
    })
})