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
	// plot object is global, you can inspect it in the dev-console
});