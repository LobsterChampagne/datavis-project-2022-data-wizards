//Skeletton from Exercise 8

class sankeyPlot {
  constructor (svg_element_id, data) {
    console.log(data)
    this.svg = d3.select('#' + svg_element_id)
    this.svg.selectAll('*').remove()
    // may be useful for calculating scales
    const svg_viewbox = this.svg.node().viewBox.animVal
    this.svg_width = svg_viewbox.width
    this.svg_height = svg_viewbox.height

    var sankey = d3
      .sankey()
      .nodeWidth(5)
      .size([this.svg_width * 0.8, this.svg_height * 0.8])
      .nodeId(d => {
        return d.name
      })

    let link = this.svg
      .append('g')
      .attr('fill', 'none')
      .selectAll('path')

    let node = this.svg.append('g').selectAll('g')

    sankey(data)

    link = link
      .data(data.links)
      .enter()
      .append('path')
      .attr('stroke', d => get_color(d.target.name))
      .attr('d', d3.sankeyLinkHorizontal())
      .attr('stroke-width', d => {
        return d.width
      })

    node = node
      .data(data.nodes)
      .enter()
      .append('g')

    node
      .append('rect')
      .attr('x', d => {
        return d.x0
      })
      .attr('y', d => {
        return d.y0
      })
      .attr('height', d => {
        return d.y1 - d.y0
      })
      .attr('width', d => {
        return d.x1 - d.x0
      })

    node
      .append('text')
      .text(d => {
        return d.name
      })
      .attr('font-size', '2pt')
      .attr('transform', 'rotate(0)')
      .attr('y', d => {
        return (d.y0 + d.y1) / 2
      })
      .attr('x', d => {
        return d.x1 + 1
      })
      .attr('text-anchor', 'start')

    function get_color (name) {
      var color = 'black'
      switch (name) {
        case 'Netflix':
          color = '#E50914'
          break
        case 'Hulu':
          color = '#3dbb3d'
          break
        case 'Prime':
          color = '#00A8E1'
          break
        case 'Disney':
          color = '#113CCF'
          break
      }
      return color
    }
  }
}

function whenDocumentLoaded (action) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', action)
  } else {
    // `DOMContentLoaded` already fired
    action()
  }
}

whenDocumentLoaded(() => {
  console.log('Sankey: Do what ever you want here')
  //plot_object = new MapPlot('map-plot');
  var providers = [{ name: 'Netflix' }, { name: 'Hulu' }, { name: 'Prime' },{name:'Disney'}]
  var actors = [{ name: 'A' }, { name: 'B' }, { name: 'C' }]

  var links = [
    { source: 'A', target: 'Netflix', value: 10 },
    { source: 'B', target: 'Hulu', value: 20 },
    { source: 'B', target: 'Netflix', value: 10 },
    { source: 'C', target: 'Hulu', value: 10 },
    { source: 'C', target: 'Prime', value: 10 }
  ]
  d3.csv('./Data/cast_per_platform.csv')
	.then(function(dd) {
  var known_actors = dd.filter(d => d.cnt >10).map(d => d.cast);  
	var known_data = dd.filter(d => known_actors.includes(d.cast));
	links = known_data.map(d => ({source:(d.cast), target:(d.service), value:d.cnt}));
  
  actors = [...new Set(known_data.map(d =>d.cast))].sort().map(d => ({name:d}));
console.log(actors);
console.log(known_data.map(d =>({name:d.cast})))
 
  var menu = d3
      .select('#example-getting-started')
      .selectAll('option')
      .data(actors)
      .enter()
      .append('option')
      .attr('value', d => d.name)
      .text(d => d.name)


  $('#example-getting-started').multiselect({
    maxHeight: 300,
    enableFiltering: true,
    onChange: function () {
      console.log(actors)
      selection = $('#example-getting-started').val()
      data = get_data(actors, providers, links, selection)
      plot = new sankeyPlot('sankey', data)
    }
  })

    //var selection = ["Nicolas Cage","John Wayne"]
    selection=null
    var data = get_data(actors, providers, links, selection)
    plot = new sankeyPlot('sankey', data)

    // https://stackoverflow.com/a/33710002
    
})
})

function get_data (actors, providers, links, selection) {
  console.log(links)
  if (selection == null) {
    data = {
      links: links,
      nodes: actors.concat(providers)
    }
  } else {
    var nodes = providers
    nodes = nodes.concat(actors.filter(d => selection.includes(d.name)))
    var links_send = links.filter(d => selection.includes(d.source.name))
    data = {
      links: links_send,
      nodes: nodes
    }
  }
  return data
}
