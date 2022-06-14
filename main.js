
const honeyFile = 'data/honey.csv';
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

    drawLineChart(honey, svg);
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
