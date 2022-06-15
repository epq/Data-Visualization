const honeyFile = 'honey_withoutUS.csv';
const numbersFile = 'data/numbers.csv';
const stressorsFile = 'data/stressors.csv';
const usaMapFile = 'data/us-states.json';
const svg = d3.select("#chart-area").append("svg")
    .attr("width", 1500)
    .attr("height", 500)

let selectedYear = +document.getElementById("slider").value;

const allGroup = ['Honey producing colonies', 'Yield per colony', 'Production', 'Stocks December 15', 'Average price per pound', 'Value of production'];
d3.select("#mapSelectButton")
    .selectAll('myOptions')
    .data(allGroup)
    .enter()
    .append('option')
    .text(function (d) { return d; }) // text showed in the menu
    .attr("value", function (d) { return d; }) // corresponding value returned by the button
let selectedAttribute = document.getElementById("mapSelectButton").value;

const toolTip = d3.tip()
    .attr('class', 'd3-tip')
    .html(function (_, data) {
        if (data.properties.data) {
            const honeyData = data.properties.data;
            selectedYear = +document.getElementById("slider").value;
            if (honeyData && honeyData.get(selectedYear) && honeyData.get(selectedYear).length > 0) {
                const row = honeyData.get(selectedYear)[0];
                let dataString = `<strong>${data.properties.name}</strong><br> ${selectedAttribute}: ${row[`${selectedAttribute}`]}`;
                if (selectedAttribute === 'Honey producing colonies') {
                    dataString += `,000`;
                } else if (selectedAttribute === 'Yield per colony') {
                    dataString += ' pounds';
                } else if (selectedAttribute === 'Production' || selectedAttribute === 'Stocks December 15') {
                    dataString += '000 pounds';
                } else if (selectedAttribute === 'Average price per pound') {
                    dataString += ' dollars';
                } else if (selectedAttribute === 'Value of production') {
                    dataString += '000 dollars';
                }
                return dataString;
            } else {
                return 'No data';
            }
        } else {
            return 'No data';
        }
    });

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
    update(selectedYear, honeyData, selectedAttribute);

    d3.select("#slider")
        .on("input", function () {
            update(+this.value, honeyData, selectedAttribute);
            selectedYear = +this.value;
            document.getElementById("slider_value").innerHTML = this.value;
        });

    // When the button is changed, run the updateChart function
    d3.select("#mapSelectButton").on("change", function (event, d) {
        // recover the option that has been chosen
        const selectedOption = d3.select(this).property("value")
        // run the updateChart function with this selected option
        // update(selectedOption)
        selectedAttribute = selectedOption;
        update(selectedYear, honeyData, selectedOption);
    })
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

    const mouseOver = function (event, d) {
        toolTip.show(event, d);

        d3.selectAll(".state")
            .transition()
            .duration(200)
            .style("opacity", .5)
        d3.select(this)
            .transition()
            .duration(200)
            .style("opacity", 1)
    }

    const mouseOut = function (event, d) {
        toolTip.hide(event, d);
        d3.selectAll(".state")
            .transition()
            .duration(200)
            .style("opacity", .8)
            .style("stroke", "white")
        d3.select(this)
            .transition()
            .duration(200)
    }

    const mapG = svg.append('g')
        .attr('id', 'map');

    mapG.call(toolTip);
    const paths = mapG.selectAll("path")
        .data(mapJson.features)
        .enter()
        .append("path")
        .style("stroke", "#fff")
        .style("stroke-width", "1")
        .on('mouseover', mouseOver)
        .on('mouseout', mouseOut)
        .attr("d", path)
        .attr('class', 'state')
};

function update(year, honeyData, attribute) {
    const nestedData = d3.group(honeyData, d => d.Year);
    const domain = nestedData.get(year).map(d => d[attribute]);
    const colorScale = d3.scaleLinear()
        .domain(d3.extent(domain))
        .range(['#ffeca7', '#985b10']);

    svg.selectAll('path')
        .attr('fill', function (d) {
            if (d.properties.data) {
                const honeyData = d.properties.data;
                if (honeyData && honeyData.get(year) && honeyData.get(year).length > 0) {
                    return colorScale(honeyData.get(year)[0][attribute]);
                } else {
                    return "rgb(213,222,217)";
                }
            } else {
                return "rgb(213,222,217)";
            }
        })
}