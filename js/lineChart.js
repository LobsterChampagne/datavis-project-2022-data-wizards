function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		action();
	}
}

//Selector is the category used in the graph (the upper dropdown (genre/country))
//select is an isntance in that category to "search" for

class LineChart {
	constructor(data) {
		const width = 700, height = 450; // set the SVG size
		const lineSvg = d3.select("#lineChart")
			.attr("width", width)
			.attr("height", height);

		$("#lineChart").empty(); //reset the SVG, useful for updating

		d3.csv(data) //load the data
		.then(function (dd) {
			let lineSelectorSelect = $('#lineSelectorSelect').val() //get the selector type
			//divide the data into multiple elements
			var movies = dd.reduce(function (prev, cur) {
				switch (lineSelectorSelect) {
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
			let lineSelect = $('#lineSelect').val() //get the selected value

			//filter the data to that value and sort by year ascending order
			const filteredData = data.filter(d => d.selector == lineSelect) 
				.sort((a, b) => { return a.year - b.year })

			//create the x axis scaled to the full data (1920-2022)
			var x = d3.scaleLinear()
				.domain(d3.extent(data, d => d.year))
				.range([ 0, width - 45 ]);

			var contextX = d3.scaleLinear()
				.domain(d3.extent(data, d => d.year))
				.range([ 0, width - 45 ]);


			lineSvg.append("g")
				.attr("class","x axis")
				.attr("transform", `translate(35, ${height - 30})`) //have to be shifted into visible space
				.call(d3.axisBottom(x).ticks(5));
	
			//create the y axis scaled to the filtered data
			var y = d3.scaleLinear()
				.domain([0, d3.max(filteredData, d => +d.count)])
				.range([ height - 45, 0 ]);
			lineSvg.append("g")
				.attr("transform", `translate(35, 15)`) //have to be shifted into visible space
				.call(d3.axisLeft(y))

			//group by provider, to make one path for each
			var sumstat = d3.group(filteredData, d => d.service)
			
			lineSvg.selectAll(".line")
				.append("g")
				.attr("class", "line")
				.data(sumstat)
				.enter() //enter into each line
				.append("path")
				.attr("fill", "none")
				.attr("stroke", d => {
					return get_color(d[0])
				})
				.attr("id",d => d[0])
				.attr("class","single_line")
				.attr("title",d=>console.log(d))
				.attr("d", d =>{
					return d3.line()
					  .x(d => { return x(d.year); })
					  .y(d => { return y(+d.count); })
					  (d[1]) //needed to aaccess the current structure
				  })
				.attr("stroke-linejoin", "round")
				.attr("stroke-linecap", "round")
				.attr("stroke-width", 2)
				.attr("transform", `translate(35, 15)`) //have to be shifted to line up with axis

			
		    
			var sel = document.getElementsByClassName("single_line")
			
			console.log(sel)

			for (let i = 0; i < sel.length; i++) {
				sel[i].addEventListener('mouseover', function () {
					var x = document.getElementsByClassName("single_line")
					for(let j =0;j<x.length;j++){
						if(x[j].id != x[i].id){
							x[j].style.opacity = 0.3;
						}
					}
				})
				sel[i].addEventListener('mouseout', function () {
					var x = document.getElementsByClassName("single_line")
					for(let j =0;j<x.length;j++){
						if(x[j].id != x[i].id){
							x[j].style.opacity = 1;
						}
					}
				})
			}
		

		var brush = d3.brushX()
			.extent([
			[x.range()[0], 0],
			[x.range()[1], 100]
			])
			.on("brush", onBrush);

		let context = lineSvg.append("g")
			.attr("class", "context")
			

		context.append("g")
			.attr("class", "x axis top")
			.attr("transform", "translate(0,0)")
			.call(d3.axisBottom(x))

		context.append("g")
			.attr("class", "x brush")
			.call(brush)
			.selectAll("rect")
			.attr("y", 0)
			.attr("height", 100);

		context.append("text")
			.attr("class", "instructions")
			.attr("transform", "translate(0," + (100+ 20) + ")")
			.text('Click and drag above to zoom / pan the data');

		// Brush handler. Get time-range from a brush and pass it to the charts. 
		function onBrush(d) {
			//var b = d3.event.selection === null ? contextXScale.domain() : d3.event.selection.map(contextXScale.invert);
			var domain = d.selection.map(contextX.invert)
			console.log(domain)
			x.domain(domain)
			lineSvg.select(".x.axis").call(d3.axisBottom(x).ticks(5))
			lineSvg.select("path")
  		}


	}
	)
	//function to return the colors for each provider
	function get_color(name) {
		switch (name) {
		  	case 'Netflix':
				return '#ff0202'
		  	case 'Hulu':
				return '#06ff02'
		  	case 'Prime':
				return '#0289ff'
		  	case 'Disney':
				return '#bf02ff'
		}
		return color
	  }
	}
}

whenDocumentLoaded(() => {
	createLineSelect() //input the options for the current selector into the lower dropdown
	new LineChart('Data/all_streams.csv'); //create an instance of the lineChart
	$("#lineSelectorSelect").multiselect({ //when updating the selector, both change the options and update the graph
		onChange: function () {
		 	graphUpdate()
			createLineSelect()
		}
	})
	$("#lineSelect").change(function () { //when update the select, update graph
		 	graphUpdate()
		}
	)

	function graphUpdate() {
		new LineChart('Data/all_streams.csv');
	}

	function createLineSelect() { //function for updating lower dropdown menu
		let lineSelectorSelect = $('#lineSelectorSelect').val() //get the value of the upper menu

		//get the csv of the option data
		let csvFile = ((lineSelectorSelect == 'country') ? 'Data/country_per_platform.csv' : 'Data/genre_per_platform.csv');

		d3.csv(csvFile)
		.then( data => {
				let temp = []
				data.forEach(d => {temp.push(d.qnt)})
				let selectors = [...new Set(temp)].sort() //create a set of the data in the csv (due to duplicates)

				var menu = d3.select('#lineSelect').html('') //clear the options of the dropdown

				menu = menu //add the option
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