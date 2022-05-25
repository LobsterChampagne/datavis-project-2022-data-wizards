function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		// `DOMContentLoaded` already fired
		action();
	}
}

const lineChartWidth = 700, lineChartHeight = 450;

const lineSvg = d3.select("#lineChart")
	.attr("width", lineChartWidth)
	.attr("height", lineChartHeight);

d3.csv('Data/release_year.csv')
	.then( data => {
		console.log()

		var x = d3.scaleLinear()
			.domain(d3.extent(data, d => d.release_year))
			.range([ 0, lineChartWidth - 45 ]);
		lineSvg.append("g")
			.attr("transform", `translate(35, ${lineChartHeight - 30})`)
			.call(d3.axisBottom(x).ticks(5));

		var y = d3.scaleLinear()
			.domain([0, d3.max(data, d => +d.count)])
			.range([ lineChartHeight - 45, 0 ]);
		lineSvg.append("g")
			.attr("transform", `translate(35, 15)`)
			.call(d3.axisLeft(y))

		const line = d3.line()
			.x(d => x(d.release_year))
			.y(d => y(d.count));
		lineSvg.append("path")
			.datum(data)
			.attr("fill", "none")
			.attr("stroke", "steelblue")
			.attr("stroke-linejoin", "round")
			.attr("stroke-linecap", "round")
			.attr("stroke-lineChartWidth", 1.5)
			.attr("transform", `translate(35, 15)`)
			.attr("d", line);
	}
)

whenDocumentLoaded(() => {
    console.log("line Chart: Do what ever you want here")
	//plot_object = new MapPlot('map-plot');
	// plot object is global, you can inspect it in the dev-console
});