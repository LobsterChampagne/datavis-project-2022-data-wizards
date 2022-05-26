// Barchart for the first viz, inspired and adapted by https://d3-graph-gallery.com/graph/barplot_stacked_basicWide.html

// set the dimensions and margins of the graph
const margin = { top: 10, right: 30, bottom: 20, left: 50 },
  width = 660 - margin.left - margin.right - 200,
  height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#barchart")
  .append("svg")
  .attr("width", width + margin.left + margin.right + 200)
  .attr("height", height + margin.top + margin.bottom)

  .append("g")
  .attr("id", "bar_plot_area")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Add event listeners to the info event
document
  .getElementById('info_year')
  .addEventListener('mouseover', function () {
    document.getElementById('info_year_select').style.display = 'flex'
  })
document
  .getElementById('info_year')
  .addEventListener('mouseout', function () {
    document.getElementById('info_year_select').style.display = 'none'
  })

// Parse the Data
d3.csv("./Data/platform_per_year.csv")
  .then(function (dd) {

    //get distinct years
    years = [... new Set(dd.map(d => d.date_added))].sort()
    
    //Add input function incase the user changes the range
    $('#year_plot')
      .unbind('input')
      .on('input', function () {

        //delete the previously drawn things
        year = document.getElementById('year_plot').value;
        d3.select("#bar_plot_area").selectAll("g").remove()
        draw_barplot(year)

        //check for special case 2023
        if (year == 2023) {
          $('#year_txt').val(
            'Today (2022 + undated)'
          )
        } else {
          $('#year_txt').val(
            'Year ' + document.getElementById('year_plot').value
          )
        }
      })


    draw_barplot(document.getElementById('year_plot').value)


    // function to draw the plot
    function draw_barplot(year) {

      // filter data according the year
      data = dd.filter(d => d.date_added <= year && d.date_added != 2000 || year == 2023)

      //summarize data according to the filter above
      data = data.reduce((prev, cur) => {
        if (!prev[cur.service]) {
          prev[cur.service] = { MovieOld: 0, TVShowOld: 0, MovieNew: 0, TVShowNew: 0 };
        }

        if (cur.date_added == year) {
          prev[cur.service].MovieNew += parseFloat(cur.Movie) || 0;
          prev[cur.service].TVShowNew += parseFloat(cur["TV Show"]) || 0;
        } else {
          prev[cur.service].MovieOld += parseFloat(cur.Movie) || 0;
          prev[cur.service].TVShowOld += parseFloat(cur["TV Show"]) || 0;
        }
        return prev;
      }, {})


      //generate new data fields
      keys = Object.keys(data)
      data = keys.map(d => ({
        provider: d, MovieOld: data[d].MovieOld,
        TVShowOld: data[d].TVShowOld,
        MovieNew: data[d].MovieNew,
        TVShowNew: data[d].TVShowNew
      }))

      // List of subgroups
      const subgroups = ["MovieOld", "TVShowOld", "MovieNew", "TVShowNew"]

      // List of groups = Providers here = value of the first column called group
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
        .domain([0, d3.max(data.map(d => d.MovieOld + d.MovieNew + d.TVShowNew + d.TVShowOld))])
        .range([height, 0]);
      svg.append("g")
        .call(d3.axisLeft(y));

      // color palette = one color per subgroup
      const color = d3.scaleOrdinal()
        .domain(subgroups)
        .range(['#41b3a3', '#377eb8', "#BA93CD", "#8A449F"])

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
        .attr("class", "bar_hover")

      // draw rects corresponding to stackedData
      bar.append("rect")
        .attr("x", d => x(d.data.provider))
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
        .attr("width", x.bandwidth())

      //draw background rect for info text
      bar.append("rect")
        .attr("id", "rect_background")
        .attr("x", 450)
        .attr("y", margin.top + 35)
        .attr("width", 50)
        .attr("height", 25)
        .attr("rx", 5)
        .attr("fill", "#D7F0FE")

      //insert text
      bar.append("text")
        .text(d => d[1] - d[0])
        .attr("text-anchor", "left")
        .attr("x", 460)
        .attr("y", margin.top + 50)


      // insert area for legend
      legend = svg.append("g")

      // use circles as identifier
      legend.append("circle")
        .attr("cy", height / 2 - 10)
        .attr("cx", 450)
        .attr("r", 5)
        .style("fill", '#41b3a3')

      legend.append("circle")
        .attr("cy", height / 2 - 30)
        .attr("cx", 450)
        .attr("r", 5)
        .style("fill", '#377eb8')

      // add text to legend
      legend.append("text")
        .attr("x", 460)
        .attr("y", height / 2 - 10)
        .text("Movies")
        .attr("alignment-baseline", "central")

      legend.append("text")
        .attr("x", 460)
        .attr("y", height / 2 - 30)
        .text("TV Shows")
        .attr("alignment-baseline", "central")

      // handle special case of 2023
      if (year != 2023) {
        legend.append("circle")
          .attr("cy", height / 2 + 30)
          .attr("cx", 450)
          .attr("r", 5)
          .style("fill", '#BA93CD')

        legend.append("circle")
          .attr("cy", height / 2 + 10)
          .attr("cx", 450)
          .attr("r", 5)
          .style("fill", '#8A449F')
        legend.append("text")
          .attr("x", 460)
          .attr("y", height / 2 + 30)
          .text("Movies added in " + year)
          .attr("alignment-baseline", "central")

        legend.append("text")
          .attr("x", 460)
          .attr("y", height / 2 + 10)
          .text("TV Shows added in " + year)
          .attr("alignment-baseline", "central")
      }
    }

  })