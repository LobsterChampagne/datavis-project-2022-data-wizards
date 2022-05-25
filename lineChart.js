function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		action();
	}
}

class LineChart {
	constructor(data) {
		// set the SVG size
		const width = 700, height = 450;
		const lineSvg = d3.select("#lineChart")
			.attr("width", width)
			.attr("height", height);

		let lineQuantitySelection = $('#lineQuantitySelect').val()

		d3.csv(data) //load the data
		.then(function (dd) {
       
			//divide the data into multiple elements
			var movies = dd.reduce(function (prev, cur) {
				switch (lineQuantitySelection) {
					case "country":
					var ret = cur.country
						.split(',')
						.filter(d => d != '')
						.map(d => ({ service: cur.service, selector: d.trim(), year: cur.release_year }))
					break;
					case "genre":
					var ret = cur.listed_in
						.split(/[\s&,]+/)
						.filter(d => d != '')
						.map(d => ({ service: cur.service, selector: d.trim(), year: cur.release_year }))
					break;
				}
			return prev.concat(ret)
			}, [])

			console.log(movies)

			//reduce the data from above to the single keys
			var num_movies = movies.reduce(function (prev, cur) {
				if (!prev[cur.service + ',' + cur.selector + ',' + cur.year]) {
					prev[cur.service + ',' + cur.selector + ',' + cur.year] = 0
				}
				prev[cur.service + ',' + cur.selector + ',' + cur.year] += 1
				return prev
			}, {})

			//get into the needed shape
			var ret = Object.keys(num_movies).map(d => ({
				service: d.split(',')[0],
				selector: d.split(',')[1],
				year: d.split(',')[2],
				count: num_movies[d]
			}))
		
			return ret
		}).then( data => {

			//create the x axis scaled according to the data
			var x = d3.scaleLinear()
				.domain(d3.extent(data, d => d.year))
				.range([ 0, width - 45 ]);
			lineSvg.append("g")
				.attr("transform", `translate(35, ${height - 30})`)
				.call(d3.axisBottom(x).ticks(5));
	
			//create the y axis scaled according to the data
			var y = d3.scaleLinear()
				.domain([0, d3.max(data, d => +d.count)])
				.range([ height - 45, 0 ]);
			lineSvg.append("g")
				.attr("transform", `translate(35, 15)`)
				.call(d3.axisLeft(y))
	
			//fill in the path based on the data
			const line = d3.line()
				.x(d => x(d.year))
				.y(d => y(d.count));
			lineSvg.append("path")
				.datum(data)
				.attr("fill", "none")
				.attr("stroke", d => {
					return get_color(d.service)
				})
				.attr("stroke-linejoin", "round")
				.attr("stroke-linecap", "round")
				.attr("stroke-width", 1.5)
				.attr("transform", `translate(35, 15)`)
				.attr("d", line);
		}
	)
  
	//function to return the colors of nodes and strokes. For the artist nodes 
	//We used a hash color generator (just s.t. any artist will allways have the same color)
	function get_color(name) {
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
		  	default:
			{
			  	//Hash color generator from https://stackoverflow.com/a/16348977
			  	var hash = 0
			  	for (var i = 0; i < name.length; i++) {
					hash = name.charCodeAt(i) + ((hash << 5) - hash)
			  	}
			  	color = '#'
			  	for (var i = 0; i < 3; i++) {
					var value = (hash >> (i * 8)) & 0xff
					color += ('00' + value.toString(16)).substr(-2)
			  	}
			}
			break
		}
		return color
	  }
	}
}

whenDocumentLoaded(() => {
	let lineChart = new LineChart('Data/all_streams.csv'); //release_year
	create_line_select()
	$("#lineQuantitySelect").multiselect({
		onChange: function () {
		 	lineSetup()
			create_line_select()
		}
	})
	function lineSetup() {
		let lineChart = new LineChart(data);
	}

	function create_line_select() {
		let lineQuantitySelection = $('#lineQuantitySelect').val()

		let csvFile;
		switch (lineQuantitySelection) {
			case 'country':
				csvFile = 'Data/netflix_titles.csv'
				break
			case 'genre':
				csvFile = 'Data/netflix_titles.csv'
				break
		}
		let selectors;

		d3.csv(csvFile)
		.then( data => {
				let temp = []
				data.forEach(d => {temp.push(d.country)})
				selectors = [...new Set(temp)].sort()

				var menu = d3.select('#lineSelect').html('')

				menu = menu
					.selectAll('option')
					.data(selectors)
					.enter()
					.append('option')
					.attr('value', f => f)
					.text(f => f)
					.attr('selected', 'selected')
			}	
		)
	}
});