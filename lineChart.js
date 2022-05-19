function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		// `DOMContentLoaded` already fired
		action();
	}
}

const width = 700, height = 450;

const svg = d3.select("#lineChart")
	.attr("width", width)
	.attr("height", height);

d3.csv('Data/release_year.csv')
	.then( data => {
		console.log()

		var x = d3.scaleLinear()
			.domain(d3.extent(data, d => d.release_year))
			.range([ 0, width - 45 ]);
		svg.append("g")
			.attr("transform", `translate(35, ${height - 30})`)
			.call(d3.axisBottom(x).ticks(5));

		var y = d3.scaleLinear()
			.domain([0, d3.max(data, d => +d.count)])
			.range([ height - 45, 0 ]);
		svg.append("g")
			.attr("transform", `translate(35, 15)`)
			.call(d3.axisLeft(y))

		const line = d3.line()
			.x(d => x(d.release_year))
			.y(d => y(d.count));
		svg.append("path")
			.datum(data)
			.attr("fill", "none")
			.attr("stroke", "steelblue")
			.attr("stroke-linejoin", "round")
			.attr("stroke-linecap", "round")
			.attr("stroke-width", 1.5)
			.attr("transform", `translate(35, 15)`)
			.attr("d", line);
	}
)

whenDocumentLoaded(() => {
    console.log("line Chart: Do what ever you want here")
	//plot_object = new MapPlot('map-plot');
	// plot object is global, you can inspect it in the dev-console
});