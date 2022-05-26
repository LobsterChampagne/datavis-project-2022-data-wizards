// Barchart for the first viz

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


    years = [... new Set(dd.map(d => d.date_added))].sort()
    $('#year_plot')
      .unbind('input')
      .on('input', function () {
        year = document.getElementById('year_plot').value;
        d3.select("#bar_plot_area").selectAll("g").remove()
        draw_barplot(year)
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


    function draw_barplot(year) {
      data = dd.filter(d => d.date_added <= year && d.date_added != 2000 || year == 2023)

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


      keys = Object.keys(data)
      data = keys.map(d => ({
        provider: d, MovieOld: data[d].MovieOld,
        TVShowOld: data[d].TVShowOld,
        MovieNew: data[d].MovieNew,
        TVShowNew: data[d].TVShowNew
      }))

      data.columns = ["provider", "MovieOld", "TVShowOld", "MovieNew", "TVShowNew"]

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

      bar.append("rect")
        .attr("x", d => x(d.data.provider))
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
        .attr("width", x.bandwidth())

      bar.append("rect")
        .attr("id", "rect_background")
        .attr("x", 450)
        .attr("y", margin.top + 35)
        .attr("width", 50)
        .attr("height", 25)
        .attr("rx", 5)
        .attr("fill", "#D7F0FE")

      bar.append("text")
        .text(d => d[1] - d[0])
        .attr("text-anchor", "left")
        .attr("x", 460)
        .attr("y", margin.top + 50)



      legend = svg.append("g")



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