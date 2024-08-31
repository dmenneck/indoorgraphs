export {}
const {IndoorGraphs} = require('../dist/index');
const graphA = require("./graphs/routes.test/graph-a.json")
const graphB = require("./graphs/routes.test/graph-b.json")
const graphC = require("./graphs/routes.test/graph-c.json")
const graphD = require("./graphs/routes.test/graph-d.json")
const graphE = require("./graphs/routes.test/graph-e.json")
const graphF = require("./graphs/routes.test/graph-f.json")
const graphG = require("./graphs/routes.test/graph-g.json")

describe('routes', () => {
    test("From a to b", () => {
        const graph = new IndoorGraphs(graphA);

        try {
            const [coordinates, path, instructions, error] = graph.getRoute('EG_t1', 'EG_t2');

            const steps = instructions.steps;

            expect(steps[0].instruction).toBe("Folge Pfadabschnitt für 375 Meter")
            expect(steps[1].instruction).toBe("Sie haben Ihr Ziel erreicht")
            expect(path.length).toBe(2)
        } catch (error) {
            console.log(error)
        }
    })
    
    // pass building entrance
    test("Path through entranceType: building", () => {
        const graph = new IndoorGraphs(graphB);

        try {
            const [coordinates, path, instructions, error] = graph.getRoute('EG_t4', 'EG_t3');

            const steps = instructions.steps

            expect(steps[0].instruction).toBe("Folge Pfadabschnitt für 427 Meter")
            expect(steps[0].category).toBe("start")
            expect(steps[0].pathType).toBe("Pfadabschnitt")
            expect(steps[0].streetName).toBe(null);

            // Betrete das Gebäude / Betrete den Raum
            expect(steps[1].instruction).toBe("Betrete das Gebäude")
            expect(steps[1].category).toBe("entrance")
            expect(steps[1].pathType).toBe(null)
            expect(steps[1].streetName).toBe(null)

            expect(steps[2].instruction).toBe("Folge Pfadabschnitt für 196 Meter")
            expect(steps[2].category).toBe("follow")
            expect(steps[2].pathType).toBe("Pfadabschnitt")
            expect(steps[2].streetName).toBe(null)

            expect(steps[3].instruction).toBe("Sie haben Ihr Ziel erreicht")
            expect(steps[3].category).toBe("arrived")
            expect(steps[3].pathType).toBe(null)
            expect(steps[3].streetName).toBe(null)
  
            expect(path.length).toBe(4)
        } catch (error) {
            console.log(error)
        }
    })

    // pass room entrance
    test("Path through entranceType: room", () => {
        const graph = new IndoorGraphs(graphC);

        try {
            const [coordinates, path, instructions, error] = graph.getRoute('EG_t1', 'EG_t5');
            const steps = instructions.steps;

            expect(steps[0].instruction).toBe("Folge Pfadabschnitt für 607 Meter")
            expect(steps[0].category).toBe("start")
            expect(steps[0].pathType).toBe("Pfadabschnitt")
            expect(steps[0].streetName).toBe(null);

            expect(steps[1].instruction).toBe("Rechts abbiegen")
            expect(steps[1].category).toBe("right")
            expect(steps[1].pathType).toBe(null)
            expect(steps[1].streetName).toBe(null)

            expect(steps[2].instruction).toBe("Folge Pfadabschnitt für 199 Meter")
            expect(steps[2].category).toBe("follow")
            expect(steps[2].pathType).toBe("Pfadabschnitt")
            expect(steps[2].streetName).toBe(null)
            
            // Betrete Raum
            expect(steps[3].instruction).toBe("Durchquere die Tür")
            expect(steps[3].category).toBe("entrance")
            expect(steps[3].pathType).toBe(null)
            expect(steps[3].streetName).toBe(null)

            expect(steps[4].instruction).toBe("Folge Pfadabschnitt für 195 Meter")
            expect(steps[4].category).toBe("follow")
            expect(steps[4].pathType).toBe("Pfadabschnitt")
            expect(steps[4].streetName).toBe(null)

            expect(steps[5].instruction).toBe("Sie haben Ihr Ziel erreicht")
            expect(steps[5].category).toBe("arrived")
            expect(steps[5].pathType).toBe(null)
            expect(steps[5].streetName).toBe(null)
        } catch (error) {
            console.log(error)
        }
    })

    test("Path along pathType", () => {
        // take the {stairs}/{ramp}
        const graph = new IndoorGraphs(graphD);

        try {
            const [coordinates, path, instructions, error] = graph.getRoute('EG_t1', 'EG_t4');

            const steps = instructions.steps

            expect(steps[0].instruction).toBe("Folge pathway für 313 Meter")
            expect(steps[0].category).toBe("start")
            expect(steps[0].pathType).toBe("pathway")
            expect(steps[0].streetName).toBe(null);

            expect(steps[1].instruction).toBe("Rechts abbiegen")
            expect(steps[1].category).toBe("right")
            expect(steps[1].pathType).toBe(null)
            expect(steps[1].streetName).toBe(null)

            expect(steps[2].instruction).toBe("Folge ramp für 410 Meter")
            expect(steps[2].category).toBe("follow")
            expect(steps[2].pathType).toBe("ramp")
            expect(steps[2].streetName).toBe(null)

            expect(steps[3].instruction).toBe("Sie haben Ihr Ziel erreicht")
            expect(steps[3].category).toBe("arrived")
            expect(steps[3].pathType).toBe(null)
            expect(steps[3].streetName).toBe(null)
        } catch (error) {
            console.log(error)
        }
    })

    test("Path along elevator", () => {
        // take elevator
        const graph = new IndoorGraphs(graphE);

        try {
            const [coordinates, path, instructions, error] = graph.getRoute('EG_t1', 'OG3_t6');

            const steps = instructions.steps;

            expect(steps[0].instruction).toBe("Folge Pfadabschnitt für 56 Meter")
            expect(steps[0].category).toBe("start")
            expect(steps[0].pathType).toBe("Pfadabschnitt")
            expect(steps[0].streetName).toBe(null);

            expect(steps[1].instruction).toBe("Fahre mit dem Aufzug zum OG3")
            expect(steps[1].category).toBe("follow")
            expect(steps[1].pathType).toBe("elevator")
            expect(steps[1].streetName).toBe(null)

            expect(steps[2].instruction).toBe("Folge Pfadabschnitt für 4 Meter")
            expect(steps[2].category).toBe("follow")
            expect(steps[2].pathType).toBe("Pfadabschnitt")
            expect(steps[2].streetName).toBe(null)

            expect(steps[3].instruction).toBe("Sie haben Ihr Ziel erreicht")
            expect(steps[3].category).toBe("arrived")
            expect(steps[3].pathType).toBe(null)
            expect(steps[3].streetName).toBe(null)
        } catch (error) {
            console.log(error)
        }

    })

    test("turn right", () => {
        // follow Gottesweg for x meters
        const graph = new IndoorGraphs(graphF);

        try {
            const [coordinates, path, instructions, error] = graph.getRoute('EG_t1', 'EG_t3');
            const steps = instructions.steps;

            expect(steps[1].instruction).toBe("Rechts abbiegen")
            expect(steps[1].category).toBe("right")
        } catch (error) {
            console.log(error)
        }
    })

    test("Turn left", () => {
        const graph = new IndoorGraphs(graphF);

        try {
            const [coordinates, path, instructions, error] = graph.getRoute('EG_t1', 'EG_t7');
            const steps = instructions.steps;

            expect(steps[1].instruction).toBe("Links abbiegen")
            expect(steps[1].category).toBe("left")
        } catch (error) {
            console.log(error)
        }
    })

    test("Follow path", () => {
        const graph = new IndoorGraphs(graphF);

        try {
            const [coordinates, path, instructions, error] = graph.getRoute('EG_t1', 'EG_t5');
            const steps = instructions.steps;

            expect(steps[0].instruction).toBe("Folge Pfadabschnitt für 58 Meter")
            expect(steps[1].instruction).toBe("Sie haben Ihr Ziel erreicht")

            expect(steps[0].category).toBe("start")
        } catch (error) {
            console.log(error)
        }
    })

    test("Turn slight right", () => {
        const graph = new IndoorGraphs(graphF);

        try {
            const [coordinates, path, instructions, error] = graph.getRoute('EG_t1', 'EG_t4');
            const steps = instructions.steps;

            expect(steps[1].instruction).toBe("Leicht rechts abbiegen")
            expect(steps[1].category).toBe("slightlyRight")
        } catch (error) {
            console.log(error)
        }
    })

    test("Turn slight left", () => {
        const graph = new IndoorGraphs(graphF);

        try {
            const [coordinates, path, instructions, error] = graph.getRoute('EG_t1', 'EG_t6');
            const steps = instructions.steps;

            expect(steps[1].instruction).toBe("Leicht links abbiegen")
            expect(steps[1].category).toBe("slightlyLeft")
        } catch (error) {
            console.log(error)
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

            console.log(steps)
        } catch (error) {
            console.log(error)
        }
    })
})