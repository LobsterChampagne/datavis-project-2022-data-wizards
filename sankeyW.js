//Skeletton from Exercise 8

class sankeyPlot {
	constructor(svg_element_id) {
		
		this.svg = d3.select('#'+svg_element_id);
		
		// may be useful for calculating scales
		const svg_viewbox = this.svg.node().viewBox.animVal;
		this.svg_width = svg_viewbox.width;
		this.svg_height = svg_viewbox.height;

		var providers = [{name:"netflix"},{name:"hulu"},{name:"prime"}];
		var actors = [{name:"A"},{name:"B"},{name:"C"}];
		
		var menu = d3.select('#example-getting-started')
			.selectAll("option")
			.data(actors)
			.enter().append("option")
			.attr("value",d=>d.name)
			.text(d => d.name);
		
		$('#example-getting-started').multiselect({
				onChange: function() {
						console.log($('#example-getting-started').val());
					}
		});

		
		var links = [{source:"A",target:"netflix",value:10},
		{source:"B",target:"hulu",value:20},
		{source:"B",target:"netflix",value:10},
		{source:"C",target:"hulu",value:10},
		{source:"C",target:"prime",value:10}];

		var selection =	$('#example-getting-started').val();
			var data;
			if(selection==null){
				data = {
					links:links,
					nodes:actors.concat(providers)
				}
				}else {
				var nodes = providers;
				nodes.concat(actors.filter(d => selection.includes(d.name)))
				data = {
					links:links.filter(d => selection.includes(d.source)),
					nodes:nodes
				}
		}
			
			
			var sankey = d3.sankey()
				.nodeWidth(5)
				.size([this.svg_width*0.8,this.svg_height*0.8])
				.nodeId((d) => { return d.name; });

			let link = this.svg.append("g")
				.attr("fill","none")
				.attr("stroke", "blue")
				.selectAll("path");

			let node = this.svg.append("g")
				.selectAll("g");

			sankey(data);

			link = link.data(data.links)
				.enter().append("path")
				.attr("stroke", d => get_color(d.target.name))
				.attr("d", d3.sankeyLinkHorizontal())
				.attr("stroke-width", d => { return d.width; })

			node = node.data(data.nodes)
				.enter()
				.append("g");

			node.append("rect")
				.attr("x", d => { return d.x0; })
				.attr("y", d => { return d.y0; })
				.attr("height", d => { return d.y1 - d.y0; })
				.attr("width", d => { return d.x1 - d.x0; });
			
			node.append("text")
				.text(d => { return d.name; })
				.attr("font-size","5pt")
				.attr("transform", "rotate(0)")
				.attr("y", d => {return (d.y0+d.y1)/2} )
				.attr("x", d => { return d.x1 + 1; })	
				.attr("text-anchor", "start");
			
			function get_color(name) {
				var color = "black";
				switch (name) {
					case "netflix":
						color = "#E50914";
						break;
					case "hulu":
						color="#3dbb3d"
						break;
					case "prime":
						color="#00A8E1"
						break;
					case "disney":
						color="#00A8E1"
						break;
				}
				return color;


			}
		

			// https://stackoverflow.com/a/33710002
			
		
	}
}

	function whenDocumentLoaded(action) {
		if (document.readyState === "loading") {
			document.addEventListener("DOMContentLoaded", action);
		} else {
			// `DOMContentLoaded` already fired
			action();
		}
}



whenDocumentLoaded(() => {
    console.log("Sankey: Do what ever you want here")
	//plot_object = new MapPlot('map-plot');
	
	
	plot = new sankeyPlot("sankey")
	
	
	// plot object is global, you can inspect it in the dev-console
});