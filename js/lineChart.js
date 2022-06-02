function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		action();
	}
}

//Selector is the category used in the graph (the upper dropdown (genre/country))
//select is an isntance in that category to "search" for

//class for handeling the linechart, brush and updates to the linechart
class LineChart {
	constructor() {
		$("#lineChart").empty(); //reset the SVG, useful when updating the graph

		this.width = 700; // set the SVG size
		this.height = 450;
		this.svg = d3
			.select("#lineChart")
			.attr("width", this.width)
			.attr("height", this.height);

		this.x = d3 //set placeholder values for the x and y axis to be changed according to the data
			.scaleLinear()
			.domain([1920, 2021]) //the total range of the data
			.range([0, this.width - 45]);
		this.y = d3
			.scaleLinear()
			.domain([0, 100])
			.range([this.height - 45, 0]);
	}

	loadData(data) {
		//load the data based on selector
		let lineSelectorSelect = $("#lineSelectorSelect").val(); //get the selector type
		//divide the data into multiple elements
		var movies = data.reduce(function (prev, cur) {
			switch (lineSelectorSelect) {
				case "country":
					var ret = cur.country
						.split(",") //split where a movie has many countries for example
						.filter((d) => d != "")
						.map((d) => ({
							service: cur.service,
							selector: d.trim(), //this is the selector (country in this case)
							year: cur.release_year,
						}));
					break;
				case "genre":
					var ret = cur.listed_in
						.split(/[\s&,]+/) //genre needs to split on more than just ,
						.filter((d) => d != "")
						.map((d) => ({
							service: cur.service,
							selector: d.trim(),
							year: cur.release_year,
						}));
					break;
				case "type":
					var ret = cur.type
						.split(",")
						.filter((d) => d != "")
						.map((d) => ({
							service: cur.service,
							selector: d.trim(),
							year: cur.release_year,
						}));
					break;
			}
			return prev.concat(ret);
		}, []);

		//reduce the data from above to the single keys
		var num_movies = movies.reduce(function (prev, cur) {
			if (!prev[cur.service + "," + cur.selector + "," + cur.year]) {
				prev[cur.service + "," + cur.selector + "," + cur.year] = 0;
			}
			prev[cur.service + "," + cur.selector + "," + cur.year] += 1;
			return prev;
		}, {});

		//get into the needed shape for easy plotting
		var ret = Object.keys(num_movies).map((d) => ({
			service: d.split(",")[0], //the values of each row is clearly displayed here
			selector: d.split(",")[1],
			year: d.split(",")[2],
			count: num_movies[d],
		}));

		this.data = ret;
	}

	drawChart() {
		$("#lineChart").empty(); //remove previous chart
		let lineSelect = $("#lineSelect").val(); //get the select value. (specific country or genre etc.)

		//filter the data to that value and sort by year in ascending order
		const filteredData = this.data
			.filter((d) => d.selector == lineSelect)
			.sort((a, b) => {
				return a.year - b.year;
			});

		//Append the x axis to the svg
		this.svg
			.append("g")
			.attr("class", "x axis")
			.attr("transform", `translate(35, ${this.height - 30})`) //have to be shifted into visible space
			.call(d3.axisBottom(this.x).ticks(5));

		let xdom = this.x.domain();
		//get highest value for y within x range
		let highY = d3.max(
			filteredData.filter((d) => d.year >= xdom[0] && d.year <= xdom[1]),
			(d) => +d.count
		);

		//create the y axis scaled to the brushed data (visible space)
		this.y = d3
			.scaleLinear()
			.domain([0, highY + 1]) //do +1 to make high values more easily seen (avoid that they cramp up in corner)
			.range([this.height - 45, 0]);
		this.svg
			.append("g")
			.attr("transform", `translate(35, 15)`) //have to be shifted into visible space
			.call(d3.axisLeft(this.y));

		//group by provider, to make one path for each
		var sumstat = d3.group(filteredData, (d) => d.service);

		this.svg
			.selectAll(".line")
			.append("g")
			.data(sumstat)
			.enter() //enter into each line
			.append("path")
			.attr("fill", "none")
			.attr("stroke", (d) => {
				return this.get_color(d[0]); //get the color based on provider
			})
			.attr("id", (d) => d[0])
			.attr("class", "line")
			.attr("title", (d) => d.service)
			.attr("d", (d) => {
				return d3
					.line()
					.x((d) => {
						return this.x(d.year);
					})
					.y((d) => {
						return this.y(+d.count);
					})(d[1]); //needed to access the current structure
			})
			.attr("stroke-linejoin", "round")
			.attr("stroke-linecap", "round")
			.attr("stroke-width", 2)
			.attr("transform", `translate(35, 15)`); //have to be shifted to line up with axis

		this.svg //add the circles for data points
			.selectAll(".circle")
			.append("g")
			.data(filteredData) //use the data ungrouped by provider as the structure is easy to use for points
			.enter()
			.append("circle")
			.attr("r", 4) //size of circles (changed by hover)
			.attr("cx", (d) => this.x(d.year))
			.attr("cy", (d) => this.y(d.count))
			.style("fill", (d) => {
				return this.get_color(d.service);
			})
			.attr("transform", `translate(35, 15)`) //to line up with everything else
			.attr("class", "dot")
			.attr("id", (d) => {
				return "dot" + d.service + d.year;
			})
			.append("title")
			.text((d) => {
				//displayed on hover
				return d.service + " " + d.year + "\n" + d.count;
			});
	}

	createBrush() {
		let that = this;

		//brush
		var contextX = d3 //copy of full x axis to be changed
			.scaleLinear()
			.domain([1920, 2021])
			.range([0, this.width - 45]);

		var brushSvg = d3
			.select("#lineBrush")
			.attr("width", this.width)
			.attr("height", 150); //size of visual brush

		var brush = d3
			.brushX()
			.extent([
				[this.x.range()[0], 0],
				[this.x.range()[1], 100],
			])
			.on("brush", onBrush) //changing axis
			.on("end", checkReset); //for resetting graph if brush is deselcted

		let context = brushSvg.append("g").attr("class", "context"); //append to the separate svg

		context
			.append("g")
			.attr("class", "x axis top") //axis for brush svg
			.attr("transform", "translate(20, 20)")
			.call(d3.axisBottom(this.x));

		context //this calls all d3 components that make up the brush
			.append("g")
			.attr("class", "x brush")
			.attr("transform", "translate(20, 20)")
			.call(brush)
			.selectAll("rect")
			.attr("y", 0)
			.attr("height", 100);

		context
			.append("text") //text for describing the brush
			.attr("class", "instructions")
			.attr("transform", "translate(212, 140)") //center text
			.text("Click and drag above to zoom / pan the data");

		function checkReset(d) {
			//func for resseting if brush is deselected
			if (!d.selection) {
				that.x = d3
					.scaleLinear() //rescale the xaxis
					.domain(d3.extent(that.data, (d) => d.year))
					.range([0, that.width - 45]);
				that.drawChart();
			}
		}

		// Brush handler. Get time-range from a brush and pass it to the charts.
		function onBrush(d) {
			var domainX = d.selection.map(contextX.invert);
			that.x.domain(domainX); //change the x axis of the graph
			that.svg.select(".x.axis").call(d3.axisBottom(that.x).ticks(5));
			that.drawChart(); //redraw the lines and circles
		}
	}

	get_color(name) {
		switch (name) {
			case "Netflix":
				return "#ff0202";
			case "Hulu":
				return "#06ff02";
			case "Prime":
				return "#0289ff";
			case "Disney":
				return "#bf02ff";
		}
		return color;
	}
}

whenDocumentLoaded(() => {
	createLineSelect(); //input the options for the current selector into the lower dropdown
	const lineChart = new LineChart(); //create an instance of the lineChart
	d3.csv("Data/all_streams.csv").then((d) => {
		lineChart.loadData(d); //the data is loaded and updated in this order for all to work
		lineChart.drawChart();
		lineChart.createBrush();
	});

	$("#lineSelectorSelect").multiselect({
		//when updating the selector, both change the options for select and update the graph
		onChange: function () {
			createLineSelect();
			d3.csv("Data/all_streams.csv").then((d) => {
				lineChart.loadData(d);
				lineChart.drawChart();
			});
		},
	});
	$("#lineSelect").multiselect({
		maxHeight: 300,
		enableCaseInsensitiveFiltering: true,
		enableFiltering: true,
		onChange: function () {
			//when update the select, only need to update the graph
			lineChart.drawChart();
		},
	});

	function createLineSelect() {
		//function for updating lower dropdown menu
		let lineSelectorSelect = $("#lineSelectorSelect").val(); //get the value of the upper menu

		//get the csv of the option data. These csv contain the separated countries etc.
		let csvFile;
		switch (lineSelectorSelect) {
			case "country":
				csvFile = "Data/country_per_platform.csv";
				break;
			case "genre":
				csvFile = "Data/genre_per_platform.csv";
				break;
			case "type":
				csvFile = "Data/types_per_platform.csv";
				break;
		}

		d3.csv(csvFile).then((data) => {
			let temp = [];
			data.forEach((d) => {
				temp.push(d.qnt); //add all values for the select from the csv
			});
			let selectors = [...new Set(temp)].sort().filter((d) => d != ""); //create a set of the data in the csv (due to duplicates)
			var menu = d3.select("#lineSelect").html(""); //clear the options of the dropdown
			menu = menu //add the options
				.selectAll("option")
				.data(selectors)
				.enter()
				.append("option")
				.attr("value", (f) => f)
				.text((f) => f);

			$("#lineSelect")
				.val([
					//these are the standard values when changing options
					lineSelectorSelect == "country"
						? "United States"
						: lineSelectorSelect == "genre"
						? "Action"
						: "Movie",
				])
				.multiselect("rebuild");
		});
	}
});
