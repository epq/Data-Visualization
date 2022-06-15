//source: https://d3-graph-gallery.com/graph/line_filter.html 

const honeyDataFile = 'data/honey.csv';

// set the dimensions and margins of the graph
// Viz 1: Line Chart
const margin = {top: 20, right: 0, bottom: 60, left: 60},
    width =  1000 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// append the svg object to the body of the page
const lineSvg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

//Read the data
d3.csv(honeyDataFile).then(function(data) {

    // List of groups (here I have one group per column)
    const allGroup = new Set(data.map(d => d.State))

    // add the options to the button
    d3.select("#selectButton")
      .selectAll('myOptions')
     	.data(allGroup)
      .enter()
    	.append('option')
      .text(function (d) { return d; }) // text showed in the menu
      .attr("value", function (d) { return d; }) // corresponding value returned by the button

    // A color scale: one color for each group
    const myColor = d3.scaleOrdinal()
      .domain(allGroup)
      .range(d3.schemeSet2);

    // Add X axis --> it is a date format
    const x = d3.scaleLinear()
      .domain(d3.extent(data, function(d) { return d.Year; }))
      .range([ 0, width ]);
    const formatxAxis = d3.format('.0f');
    lineSvg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).ticks(7).tickFormat(formatxAxis));

    // Add Y axis
    const startingProduction = data.filter(d => d.State === 'AL');

    const y = d3.scaleLinear()
      .domain([0, d3.max(startingProduction, function(d) { return +d.Production; })])
      .range([ height, 0 ]);
    let yAxis = lineSvg.append("g")
      .call(d3.axisLeft(y));

    // Y label
    lineSvg.append("text")
      .attr("x", -(height/ 2))
      .attr("y", -40)
      .attr("font-size", "15px")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .text("Production (1000 pounds)")

    // X label
    lineSvg.append("text")
      .attr("x", width / 2)
      .attr("y", height + 50)
      .attr("font-size", "15px")
      .attr("text-anchor", "middle")
      .text("Year")

    // Initialize line with first group of the list
    const line = lineSvg
      .append('g')
      .append("path")
        .datum(data.filter(function(d){return d.State=="AL"}))
        .attr("d", d3.line()
          .x(function(d) { return x(d.Year) })
          .y(function(d) { return y(+d.Production) })
        )
        .attr("stroke", function(d){ return myColor("valueA") })
        .style("stroke-width", 4)
        .style("fill", "none")

    // A function that update the chart
    function update(selectedGroup) {

      // Create new data with the selection?
      const dataFilter = data.filter(function(d){return d.State==selectedGroup})
      const newY = d3.scaleLinear()
        .domain([0, d3.max(dataFilter, function (d) { return +d.Production; })])
        .range([height, 0]);
        yAxis.transition().duration(100).call(d3.axisLeft(newY));

      // Give these new data to update line
      line
          .datum(dataFilter)
          .transition()
          .duration(100)
          .attr("d", d3.line()
            .x(function(d) { return x(d.Year) })
            .y(function(d) { return newY(+d.Production) })
          )
          .attr("stroke", function(d){ return myColor(selectedGroup) })
    }

    // When the button is changed, run the updateChart function
    d3.select("#selectButton").on("change", function(event,d) {
        // recover the option that has been chosen
        const selectedOption = d3.select(this).property("value")
        // run the updateChart function with this selected option
        update(selectedOption)
    })
})

