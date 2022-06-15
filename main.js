const honeyFile = 'honey_withoutUS.csv';
const numbersFile = 'data/numbers.csv';
const stressorsFile = 'data/stressors.csv';
const usaMapFile = 'data/us-states.json';
const svg = d3.select("#chart-area").append("svg")
    .attr("width", 1500)
    .attr("height", 1000)

const startYear = +document.getElementById("slider").value;

Promise.all([d3.csv(honeyFile), d3.csv(numbersFile), d3.csv(stressorsFile), d3.json(usaMapFile)]).then(files => {
    const [honeyData, numbersData, stressorsData, mapJson] = files;
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

    ready(honey, mapJson);

}).catch(err => {
    console.log(err);
});



function ready(honeyData, mapJson) {
    drawUSA(honeyData, mapJson);
    update(startYear, honeyData);

    d3.select("#slider")
        .on("input", function () {
            update(+this.value, honeyData);
            document.getElementById("slider_value").innerHTML = this.value;
        });
}


function drawUSA(honeyData, mapJson) {
    var width = 960;
    var height = 500;

    // D3 Projection
    var projection = d3.geoAlbersUsa()
        .translate([width / 2, height / 2])    // translate to center of screen
        .scale([1000]);          // scale things down so see entire US

    // Define path generator
    var path = d3.geoPath()       // path generator that will convert GeoJSON to SVG paths
        .projection(projection);  // tell path generator to use albersUsa projection

    // returns nested Map grouped by states and then years
    const nestDataByStateAndYear = d3.group(honeyData, d => d.State, d => d.Year);

    // merge json data and honey data
    // assign data to each state
    for (feature of mapJson.features) {
        const abbr = stateNameToAbbreviation(feature.properties.name);
        if (abbr) {
            const stateData = nestDataByStateAndYear.get(abbr);
            if (stateData && stateData.size > 0) {
                feature.properties.data = stateData;
            }
        }
    }

    const mapG = svg.append('g')
        .attr('id', 'map');

    const tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(d => {
            return 'test'
        });

    const paths = mapG.selectAll("path")
        .data(mapJson.features)
        .enter()
        .append("path")
        .style("stroke", "#fff")
        .style("stroke-width", "1")
        .attr("d", path)
};

function update(year, honeyData) {
    const nestedData = d3.group(honeyData, d => d.Year);
    const domain = nestedData.get(year).map(d => d['Honey producing colonies']);
    const colorScale = d3.scaleLinear()
        .domain(d3.extent(domain))
        .range(['#f9c901', '#985b10']);
    svg.selectAll('path')
    .attr('fill', function(d) {
            if (d.properties.data) {
                const honeyData = d.properties.data;
                if (honeyData && honeyData.get(year) && honeyData.get(year).length > 0) {
                    return colorScale(honeyData.get(year)[0]['Honey producing colonies']);
                } else {
                    return "rgb(213,222,217)";
                }
            } else {
                return "rgb(213,222,217)";
            }
    })

}