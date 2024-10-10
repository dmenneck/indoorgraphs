
// const { IndoorGraphs } = require("indoorgraphs");
// const { IndoorGraphs, getProductionBuild } = require("./dist/index")

const test2 = require("./dist/index")

console.log(test2)

const fetchGraph = async () => {
    const baseHref = 'https://campusgis2.uni-koeln.de';
    const outdoorgraphHref = baseHref + '/outdoorgraph.json';
    const streetIdsHref = baseHref + '/streetIds.json';

    Promise.all([
        fetch(outdoorgraphHref).then((response) => response.json()),
        fetch(streetIdsHref).then((response) => response.json())
    ]).then(([outdoorgraph, streetIds]) => {

        // throws an error if library version >0.0.93
        const indoorGraphs = new test2.IndoorGraphs(outdoorgraph, {
            pathNameIds: streetIds
        });

        const route = indoorGraphs.getRoute(
            [6.91854, 50.92796],
            [6.92949, 50.92675],
        );

        console.log(route);
    });


}

fetchGraph()

