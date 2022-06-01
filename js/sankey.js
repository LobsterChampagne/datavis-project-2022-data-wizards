//Skeletton from Exercise 8
//Class to create a sankey plot, some parts were adapted from https://stackoverflow.com/q/50429070
class sankeyPlot {
	constructor(svg_element_id, data, draw) {
		this.svg = d3.select("#" + svg_element_id);
		this.svg.selectAll("*").remove();

		const svg_viewbox = this.svg.node().viewBox.animVal;
		this.svg_width = svg_viewbox.width;
		this.svg_height = svg_viewbox.height;

		//Sett the basic values of the sankey diagram such as size and node width
		var sankey = d3
			.sankey()
			.nodeWidth(5)
			.size([this.svg_width * 0.8, this.svg_height * 0.8])
			.nodeId((d) => {
				return d.name;
			});

		//create an area to create the links within the svg. We will use simple
		//strokes for the links
		let link = this.svg.append("g").attr("fill", "none").selectAll("path");

		//create an area to create the nodes within the svg
		let node = this.svg.append("g").selectAll("g");

		//transform the input data. Sankey returns placement of nodes
		sankey(data);

		//if we just want to use the data generator of sankey we break hear
		if (!draw) {
			return;
		}

		//all links are added to the svg. The function sankeyLinkHorizontal returns path for the strokes.
		link = link
			.data(data.links)
			.enter()
			.append("path")
			.attr("stroke", (d) => get_color(d.target.name))
			.on("click", (d, i) =>
				window.open(
					"http://www.google.com/search?q=Movies+TV+Shows+on+" +
						i.source.name.replace(" ", "+") +
						"+" +
						i.target.name
				)
			)
			.attr("d", d3.sankeyLinkHorizontal())
			.attr("stroke-width", (d) => {
				return Math.max(d.width, "1");
			})
			.attr("class", "sankey_stroke");

		//add a hover on text to the svg strokes
		link.append("title").text((d) => {
			return d.source.name + " on " + d.target.name + "\n" + d.value;
		});

		//fill in the nodes
		node = node.data(data.nodes).enter().append("g");

		//for each node append a rect with the corresponding sizes and position given by sankey
		node.append("rect")
			.attr("x", (d) => {
				return d.x0;
			})
			.attr("y", (d) => {
				return d.y0;
			})
			.attr("height", (d) => {
				return d.y1 - d.y0;
			})
			.attr("width", (d) => {
				return d.x1 - d.x0;
			})
			.attr("fill", (d) => {
				return darker(get_color(d.name));
			})
			.on("click", (d, i) =>
				window.open(
					"http://www.google.com/search?q=" + i.name.replace(" ", "+")
				)
			);

		//add the node titles to the nodes
		node.append("title").text((d) => d.name + ", " + d.value);

		//append the names to the nodes
		node.append("text")
			.text((d) => {
				return d.name;
			})
			.attr("font-size", 4 / (data.nodes.length - 4) + 2 + "pt")
			.attr("y", (d) => {
				return (d.y0 + d.y1) / 2;
			})
			.attr("x", (d) => {
				return d.x1 + 1;
			})
			.attr("text-anchor", "start");

		//function to return the colors of nodes and strokes. For the artist nodes
		//We used a hash color generator (just s.t. any artist will allways have the same color)
		function get_color(name) {
			var color = "black";
			switch (name) {
				case "Netflix":
					color = "#fbe5d6";
					break;
				case "Hulu":
					color = "#e2f0d9";
					break;
				case "Prime":
					color = "#deebf7";
					break;
				case "Disney":
					color = "#bdd7ee";
					break;
				default:
					{
						//Hash color generator from https://stackoverflow.com/a/16348977
						var hash = 0;
						for (var i = 0; i < name.length; i++) {
							hash = name.charCodeAt(i) + ((hash << 5) - hash);
						}
						color = "#";
						for (var i = 0; i < 3; i++) {
							var value = (hash >> (i * 8)) & 0xff;
							color += ("00" + value.toString(16)).substr(-2);
						}
					}
					break;
			}
			return color;
		}

		//function to make a given color 10% darker
		function darker(color) {
			var new_color = "#";
			color = color.replace("#", "");

			for (var i = 0; i < 3; i++) {
				var val = parseInt(color.slice(2 * i, 2 * i + 2), 16);
				val = (0.9 * val) | 0;
				if (val < 0) {
					val = 0;
				}
				var new_val = val.toString(16);

				while (new_val.length < 2) {
					new_val = "0" + new_val;
				}
				new_color += new_val;
			}

			return new_color;
		}
	}
}

function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		action();
	}
}

// function called as soon as the document is loaded
whenDocumentLoaded(() => {
	$("#quantity_select").multiselect({
		onChange: function () {
			document.getElementById("sankey_load").style.display = "block";
			document.getElementById("sankey_env").style.display = "none";
			selection = $("#quantity_select").val();
			sleep = new Promise((d, u) => setTimeout(d, 500));
			sleep.then(function () {
				setup();
			});
		},
	});

	//give time to other plots to be generated
	sleep = new Promise((d, u) => setTimeout(d, 0));
	sleep.then(function () {
		setup();
	});

	function setup() {
		//Load the data from the file and consolidate it
		quantity_selection = $("#quantity_select").val();
		var src = "";
		switch (quantity_selection) {
			case "actors":
				src = "./Data/cast_per_platform.csv";
				default_qnt = ["Nicolas Cage", "John Wayne"];
				break;
			case "directors":
				src = "./Data/director_per_platform.csv";
				default_qnt = ["Marcus Raboy", "Jay Karas", "Robert Stevenson"];
				break;
			case "country":
				src = "./Data/country_per_platform.csv";
				default_qnt = ["Sweden", "Norway", "Switzerland"];
				break;
			case "genre":
				src = "./Data/genre_per_platform.csv";
				default_qnt = ["Action", "Thriller", "LGBTQ Movies"];
				break;
		}
		d3.csv(src).then(function (dd) {
			//disable loader
			document.getElementById("sankey_load").style.display = "none";
			document.getElementById("sankey_env").style.display = "block";

			//setup some dumy data for tests
			var providers = [
				{
					name: "Netflix",
				},
				{
					name: "Hulu",
				},
				{
					name: "Prime",
				},
				{
					name: "Disney",
				},
			];

			var actors = [
				{
					name: "A",
				},
				{
					name: "B",
				},
				{
					name: "C",
				},
			];

			var links = [
				{
					source: "A",
					target: "Netflix",
					value: 10,
				},
				{
					source: "B",
					target: "Hulu",
					value: 20,
				},
				{
					source: "B",
					target: "Netflix",
					value: 10,
				},
				{
					source: "C",
					target: "Hulu",
					value: 10,
				},
				{
					source: "C",
					target: "Prime",
					value: 10,
				},
			];

			//calculate the total number of movies a quantity has in the data
			var actors_total = dd.reduce(function (prev, curr) {
				if (!prev[curr.qnt]) {
					prev[curr.qnt] = 0;
				}

				prev[curr.qnt] = prev[curr.qnt] + parseInt(curr.cnt);
				return prev;
			}, {});

			//reshape the above data
			num_mov_per_qnt = Object.keys(actors_total).map((key) => ({
				qnt: key,
				cnt: actors_total[key],
			}));

			//instatiate the selection menu
			create_select();

			//get the chosen values from the multiselect
			selection = $("#sankey_select").val();

			//instantiate the data by applying sankey to the full data
			//var data = get_data(actors, providers, links, null)
			//plot = new sankeyPlot('sankey', data, false)

			//generate sankey by only using the required data
			var data = get_data(actors, providers, links, selection);
			plot = new sankeyPlot("sankey", data, true);

			$("#sankey_select").multiselect("destroy");
			//instantiate the multiselect
			$("#sankey_select").multiselect({
				// https://stackoverflow.com/a/33710002
				maxHeight: 300,
				enableFiltering: true,
				enableClickableOptGroups: false,
				enableCollapsibleOptGroups: false,
				enableCaseInsensitiveFiltering: true,
				includeSelectAllOption: true,
				onSelectAll: update_sankey,
				onChange: update_sankey,
			});

			function update_sankey() {
				selection = $("#sankey_select").val();

				//if no selection was done, show meme. Otherwise show sankey diagram
				if (!selection) {
					document.getElementById(
						"empty_sankey_select"
					).style.display = "block";
					document.getElementById("sankey").style.display = "none";
					return;
				} else {
					document.getElementById(
						"empty_sankey_select"
					).style.display = "none";
					document.getElementById("sankey").style.display = "block";
				}

				//aggregate the data and plot new sankey plot
				var data = get_data(actors, providers, links, selection);

				plot = new sankeyPlot("sankey", data, selection);
			}

			//enable button to reset the dropdown and recalculate the selection
			var btn = $("#reset_button").on("click", function (e) {
				d3.select("#sankey_select").html("");
				create_select();
				$("#sankey_select").val([]).multiselect("rebuild");
				document.getElementById("empty_sankey_select").style.display =
					"block";
				document.getElementById("sankey").style.display = "none";
			});

			//configure the reset button to deselect all elements in the dropdown menu
			var btn_slc = $("#clear_select_button").on("click", function (e) {
				$("#sankey_select").val([]).multiselect("rebuild");
				plot = new sankeyPlot("sankey", data, null);

				document.getElementById("empty_sankey_select").style.display =
					"block";
				document.getElementById("sankey").style.display = "none";
			});

			$("#number_of_movies_txt").val(
				"Min. number of movies of " +
					quantity_selection +
					": " +
					document.getElementById("number_of_movies").value
			);

			//keep track of wether the slider already warned the user
			var slider_warned = false;

			//configure the slider to choose the minimal number of movies an actor should have
			$("#number_of_movies")
				.unbind("input")
				.on("input", function () {
					$("#number_of_movies_txt").val(
						"Min. number of movies of " +
							quantity_selection +
							": " +
							document.getElementById("number_of_movies").value
					);
					if (
						!slider_warned &&
						document.getElementById("number_of_movies").value <= 3
					) {
						slider_warned = true;
						alert(
							"Pleas note that setting this value to low might make the website considerably slower since the amount of data is quite large.\n" +
								"We recommend using values >=5, but feel free to try it yourself :)"
						);
					}
				});

			//add event listeners to display the help texts
			document
				.getElementById("info_artist")
				.addEventListener("mouseover", function () {
					document.getElementById(
						"info_artist_select"
					).style.display = "flex";
				});
			document
				.getElementById("info_artist")
				.addEventListener("mouseout", function () {
					document.getElementById(
						"info_artist_select"
					).style.display = "none";
				});
			document
				.getElementById("info_size")
				.addEventListener("mouseover", function () {
					document.getElementById("info_size_select").style.display =
						"flex";
				});
			document
				.getElementById("info_size")
				.addEventListener("mouseout", function () {
					document.getElementById("info_size_select").style.display =
						"none";
				});

			//function to create the select in the html page
			function create_select() {
				document.getElementById("sankey_load").style.display = "block";
				document.getElementById("sankey_env").style.display = "none";

				//read the value of the range
				number_of_movies =
					document.getElementById("number_of_movies").value;

				//filter the data according to the value above
				known_qnt = num_mov_per_qnt
					.filter((d) => d.cnt >= number_of_movies && d.qnt != "")
					.map((d) => d.qnt);

				//aggregate the total data
				known_data = dd.filter((d) => known_qnt.includes(d.qnt));
				links = known_data.map((d) => ({
					source: d.qnt,
					target: d.service,
					value: d.cnt,
				}));

				//generate the actors list
				actors = [...new Set(known_data.map((d) => d.qnt))]
					.sort()
					.map((d) => ({
						name: d,
					}));

				//assign the actors to a group
				actors_grouped = [...new Set(known_data.map((d) => d.qnt))]
					.sort()
					.map((d) => ({
						name: d,
						group: get_group(d),
					}));

				//finally create the arrays of the group
				actors_grouped = group_by(actors_grouped, "group");

				//Get the list of all groups
				groups = Object.keys(actors_grouped);

				//clear the html place holder
				var menu = d3.select("#sankey_select").html("");

				//insert optgroup and options into the page
				menu = menu.selectAll("optgroup");
				menu = menu
					.data(groups)
					.enter()
					.append("optgroup")
					.attr("label", (d) => d)
					.each(function (d) {
						d3.select(this)
							.selectAll("option")
							.data(actors_grouped[d])
							.enter()
							.append("option")
							.attr("value", (f) => f.name)
							.text((f) => f.name)
							.filter((f) => default_qnt.includes(f.name))
							.attr("selected", "selected");
					});

				document.getElementById("sankey_load").style.display = "none";
				document.getElementById("sankey_env").style.display = "block";
			}
		});
	}
});

//aggregate the needed data
function get_data(actors, providers, links, selection) {
	//If selection is empty, return everything
	if (selection == null) {
		data = {
			links: links,
			nodes: actors.concat(providers),
		};

		//if selection is not empty, filter links and lists to match
	} else {
		var nodes = providers;
		nodes = nodes.concat(actors.filter((d) => selection.includes(d.name)));
		var links_send = links.filter(
			(d) =>
				selection.includes(d.source.name) ||
				selection.includes(d.source)
		);
		data = {
			links: links_send,
			nodes: nodes,
		};
	}
	return data;
}

//extract the first character of the name and add to group. Add to group other if not alphabetical list
function get_group(d) {
	var group = d.charAt(0).toUpperCase();
	if (group.toLowerCase() == group) {
		group = "other";
	}
	return group;
}

//group array by a given key
function group_by(arr, key) {
	var grouped = arr.reduce((prev, cur) => {
		if (!prev[cur[key]]) {
			prev[cur[key]] = [];
		}

		cur_copy = Object.assign({}, cur);
		delete cur_copy[key];
		prev[cur[key]].push(cur_copy);

		return prev;
	}, {});
	return grouped;
}
