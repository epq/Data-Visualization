
const honeyFile = 'honey_withoutUS.csv';
const numbersFile = 'data/numbers.csv';
const stressorsFile = 'data/stressors.csv';

Promise.all([d3.csv(honeyFile), d3.csv(numbersFile), d3.csv(stressorsFile)]).then(files => {
    const [honeyData, numbersData, stressorsData] = files;
    const honey = honeyData.map(d => {
        for (prop in d) {
            if (prop !== 'State') {
                d[prop] = Number(d[prop]);
            }
        }
        return d;
    });
    const numbers = numbersData.map(d => {
        for (prop in d) {
            if (prop !== 'State' && prop !== 'Year') {
                d[prop] = Number(d[prop]);
            }
        }
        return d;
    });
    const stressors = stressorsData.map(d => {
        for (prop in d) {
            if (prop !== 'State' && prop !== 'Year' && prop !== 'Diseases') {
                d[prop] = Number(d[prop]);
            }
        }
        return d;

    });
    console.log(honey[0]);
    console.log(numbers[0]);
    console.log(stressors[0]);

    const svg = d3.select("#chart-area").append("svg")
        .attr("width", 1500)
        .attr("height", 1000)
    // drawLineChart(honey, svg);

    drawMap(honey, svg);
}).catch(err => {
    console.log(err);
});


function drawLineChart(data, svg) {
    let lineLeft = 0, lineTop = 400;
    let lineTotalWidth = 600, lineTotalHeight = 100;
    let lineMargin = { top: 10, right: 30, bottom: 10, left: 100 },
        lineWidth = lineTotalWidth - lineMargin.left - lineMargin.right,
        lineHeight = lineTotalHeight - lineMargin.top - lineMargin.bottom;

    const g = svg.append("g")
        .attr("transform",
            `translate(${lineLeft + lineMargin.left}, ${lineTop + lineMargin.top})`);

    const years = data.map(d => d.year);

    const x = d3.scaleLinear()
        .domain(d3.extent(years))
        .range([0, lineWidth])
    const xAxisCall = d3.axisBottom(x);

    g.append("g")
        .attr("transform", `translate(0, ${lineHeight})`)
        .call(xAxisCall);

    const production = data.map(d => d.production);
    const y = d3.scaleLinear()
        .domain(d3.extent(production))
        .range([lineHeight, 0]);

    const yAxisCall = d3.axisLeft(y);
    g.append('g').call(yAxisCall);
}


function drawMap(data, svg) {
    //Width and height of map
    d3.json("data/us-states.json").then(drawUSA);

    function drawUSA(json) {
        var width = 960;
        var height = 500;

        // D3 Projection
        var projection = d3.geoAlbersUsa()
            .translate([width / 2, height / 2])    // translate to center of screen
            .scale([1000]);          // scale things down so see entire US

        // Define path generator
        var path = d3.geoPath()       // path generator that will convert GeoJSON to SVG paths
            .projection(projection);  // tell path generator to use albersUsa projection

        const nestDataByStateAndYear = d3.nest().key(d => d.State).key(d => d.Year).entries(data);

        // merge json data and honey data
        for (feature of json.features) {
            const abbr = stateNameToAbbreviation(feature.properties.name);
            if (abbr) {
                const stateData = nestDataByStateAndYear.filter(d => d.key === abbr);
                if (stateData.length > 0) {
                    // console.log(stateData[0].values)
                    feature.properties.data = stateData[0].values;
                }
            }
        }
        const nestedData = d3.nest()
            .key(d => d.Year)
            .entries(data);
        
        const currentYear = 2019;
        const domain = nestedData.filter(d => {
            return Number(d.key) === currentYear
        }).map(d => d.values)[0].map(d => d['Honey producing colonies']);

        var colorScale = d3.scaleLinear()
            .domain(d3.extent(domain))
            .range(['#f9c901', '#985b10']);

        svg.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("stroke", "#fff")
            .style("stroke-width", "1")
            .style("fill", function (d) {
                if (d.properties.data) {
                const honeyData = d.properties.data;
                const currentYearData = honeyData.filter(d => Number(d.key) === currentYear)
                if (currentYearData.length > 0) {
                   const currentYearDataValues = currentYearData[0].values[0];
                   console.log(currentYearDataValues['Honey producing colonies']);
                   return colorScale(currentYearDataValues['Honey producing colonies']);
                } else {
                    return "rgb(213,222,217)";
                }
                } else {
                    return "rgb(213,222,217)";
                }
            });
    };
}