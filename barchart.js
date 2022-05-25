// Barchart for the first viz

// set the dimensions and margins of the graph
const margin = {top: 10, right: 30, bottom: 20, left: 50},
    width = 660 - margin.left - margin.right-200,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#barchart")
  .append("svg")
    .attr("width", width + margin.left + margin.right+200)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Parse the Data
d3.csv("./Data/providerNumbers.csv").then( function(data) {

  // List of subgroups = header of the csv files = soil condition here
  const subgroups = data.columns.slice(1)

  // List of groups = species here = value of the first column called group -> I show them on the X axis
  const groups = data.map(d => (d.provider))

  // Add X axis
  const x = d3.scaleBand()
      .domain(groups)
      .range([0, width])
      .padding([0.2])
  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).tickSizeOuter(0));

  // Add Y axis
  const y = d3.scaleLinear()
    .domain([0, 10000])
    .range([ height, 0 ]);
  svg.append("g")
    .call(d3.axisLeft(y));

  // color palette = one color per subgroup
  const color = d3.scaleOrdinal()
    .domain(subgroups)
    .range(['#41b3a3', '#377eb8'])

  //stack the data? --> stack per subgroup
  const stackedData = d3.stack()
    .keys(subgroups)
    (data)
  // Show the bars
  bar = svg.append("g")
    .selectAll("g")
    // Enter in the stack data = loop key per key = group per group
    .data(stackedData)
    .join("g")
      .attr("fill", d => color(d.key))
      .selectAll("g")
      // enter a second time = loop subgroup per subgroup to add all rectangles
      .data(d => d)
      .join("g")
      .attr("class","bar_hover")
      
  bar.append("rect")
        .attr("x", d => x(d.data.provider))
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
        .attr("width",x.bandwidth())
        

    bar.append("text")
        .text(d=>d[1]-d[0])
        .attr("text-anchor","middle")
        .attr("x",d => x(d.data.provider)+x.bandwidth()/2)
        .attr("y",d => (y(d[0]) + y(d[1]))/2)
        
  legend = svg.append("g")
  
  legend.append("circle")
  .attr("cy",height/2+10)
  .attr("cx",460)
  .attr("r",5)
  .style("fill",'#41b3a3')

  legend.append("circle")
  .attr("cy",height/2-10)
  .attr("cx",460)
  .attr("r",5)
  .style("fill",'#377eb8')

  legend.append("text")
  .attr("x",470)
  .attr("y",height/2+10)
  .text("Movies")
  .attr("alignment-baseline","central")

  legend.append("text")
  .attr("x",470)
  .attr("y",height/2-10)
  .text("TV Shows")
  .attr("alignment-baseline","central")
        
})