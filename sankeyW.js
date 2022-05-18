//Skeletton from Exercise 8

class sankeyPlot {
  constructor (svg_element_id, data, draw) {
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
    if(!draw){
      return;
    }
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
          color = '#fbe5d6'
          break
        case 'Hulu':
          color = '#e2f0d9'
          break
        case 'Prime':
          color = '#deebf7'
          break
        case 'Disney':
          color = '#bdd7ee'
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

  d3.csv('./Data/cast_per_platform.csv').then(function (dd) {
    var providers = [
      { name: 'Netflix' },
      { name: 'Hulu' },
      { name: 'Prime' },
      { name: 'Disney' }
    ]
    var actors = [{ name: 'A' }, { name: 'B' }, { name: 'C' }]

    var links = [
      { source: 'A', target: 'Netflix', value: 10 },
      { source: 'B', target: 'Hulu', value: 20 },
      { source: 'B', target: 'Netflix', value: 10 },
      { source: 'C', target: 'Hulu', value: 10 },
      { source: 'C', target: 'Prime', value: 10 }
    ]

    var actors_total = dd.reduce(function (prev, curr) {
      if (!prev[curr.cast]) {
        prev[curr.cast] = 0
      }

      prev[curr.cast] = prev[curr.cast] + parseInt(curr.cnt)
      return prev
    }, {})
  
    asdf = Object.keys(actors_total).map(key => ({
      cast: key,
      cnt: actors_total[key]
    }))
    var number_of_movies = document.getElementById('number_of_movies').value

    //var known_actors = dd.filter(d => d.cnt >=10).map(d => d.cast);
    var known_actors = asdf
      .filter(d => d.cnt >= number_of_movies)
      .map(d => d.cast)

    default_cast = ['Nicolas Cage', 'John Wayne']

    /*
  var menu = d3
      .select('#sankey_select')
      .selectAll('option')
      .data(actors)
      .enter()
      .append('option')
      .attr('value', d => d.name)
      .text(d => d.name)
      .filter(d => default_cast.includes(d.name))
      .attr("selected","selected");
*/ 
    var number_of_movies = document.getElementById('number_of_movies').value

    //var known_actors = dd.filter(d => d.cnt >=10).map(d => d.cast);
    var known_actors = asdf
      .filter(d => d.cnt >= number_of_movies)
      .map(d => d.cast)
    var known_data = dd.filter(
      d => known_actors.includes(d.cast)
    )
    links = known_data.map(d => ({
      source: d.cast,
      target: d.service,
      value: d.cnt
    }))

    actors = [...new Set(known_data.map(d => d.cast))]
      .sort()
      .map(d => ({ name: d }))
    actors_grouped = [...new Set(known_data.map(d => d.cast))]
      .sort()
      .map(d => ({ name: d, group: get_group(d) }))

    actors_grouped = group_by(actors_grouped, 'group')

    var groups = Object.keys(actors_grouped)

    create_select()

    function create_select () {
      number_of_movies = document.getElementById('number_of_movies').value
      known_actors = asdf
      .filter(d => d.cnt >= number_of_movies)
      .map(d => d.cast)
      known_data = dd.filter(
        d => known_actors.includes(d.cast)
      )
      console.log(links)
      links = known_data.map(d => ({
        source: d.cast,
        target: d.service,
        value: d.cnt
      }))
      console.log(links)
      actors = [...new Set(known_data.map(d => d.cast))]
        .sort()
        .map(d => ({ name: d }))
      actors_grouped = [...new Set(known_data.map(d => d.cast))]
        .sort()
        .map(d => ({ name: d, group: get_group(d) }))
  
      actors_grouped = group_by(actors_grouped, 'group')
  
      groups = Object.keys(actors_grouped) 

      var menu = d3.select('#sankey_select').html("")
      menu=menu.selectAll('optgroup')
      menu = menu
        .data(groups)
        .enter()
        .append('optgroup')
        .attr('label', d => d)
        .each(function (d) {
          d3.select(this)
            .selectAll('option')
            .data(actors_grouped[d])
            .enter()
            .append('option')
            .attr('value', f => f.name)
            .text(f => f.name)
            .filter(f => default_cast.includes(f.name))
            .attr('selected', 'selected')
        })
        data = get_data(actors, providers, links, null)
        plot = new sankeyPlot('sankey', data,false)
        
    }

      $('#sankey_select').multiselect({
        maxHeight: 300,
        enableFiltering: true,
        enableClickableOptGroups: false,
        enableCollapsibleOptGroups: false,
        enableCaseInsensitiveFiltering: true,
        enableResetButton: true,
        resetButtonText: 'Reset',
        onChange: function () {
          console.log('here')
          selection = $('#sankey_select').val()
          data = get_data(actors, providers, links, selection)
          plot = new sankeyPlot('sankey', data,true)
        }
      })
  
    var btn = $('#reset_button').on('click', function (e) {
      d3.select('#sankey_select').html('')

      create_select()
      $('#sankey_select')
        .val([])
        .multiselect('rebuild')
    })

    $('#number_of_movies').on('input', function() {
      $('#number_of_movies_txt').val(document.getElementById('number_of_movies').value)
    })
    selection = $('#sankey_select').val()

    var data = get_data(actors, providers, links, null)
    console.log(data)
    plot = new sankeyPlot('sankey', data,false)

    var data = get_data(actors, providers, links, selection)
    plot = new sankeyPlot('sankey', data,true)

    // https://stackoverflow.com/a/33710002
  })
})

function get_data (actors, providers, links, selection) {
  console.log(selection)
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

function get_group (d) {
  var group = d.charAt(0).toUpperCase()
  if (group.toLowerCase() == group) {
    group = 'other'
  }
  return group
}

function group_by (arr, key) {
  var grouped = arr.reduce((prev, cur) => {
    if (!prev[cur[key]]) {
      prev[cur[key]] = []
    }
    cur_copy = Object.assign({}, cur)
    delete cur_copy[key]
    prev[cur[key]].push(cur_copy)

    return prev
  }, {})
  return grouped
}
