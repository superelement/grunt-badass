(function() {
	/***
	@tags [svg, grunt-badass, ie8]
	@docs IE8 and below will ignore the SVG content and just add class below. Needed to add doc ready for it because
	once in production it was throwing a JS error, claiming that the document element was being modified before it
	had been closed.
	***/
	if( document.documentMode && document.documentMode < 9 ) {
		window.attachEvent("onload", function() {
			var classes = ["iconsfallback"].concat( document.documentElement.className.split(" ") );
			document.documentElement.className = classes.join(" ");
		});
		return;
	}
	/*@end*/

	/***
	@tags [svg, grunt-badass, ios]
	@docs Don't use 'DOMContentLoaded'. It breaks iOS6 because the page loads before it has read the SVG data.
	***/
	if( document && document.querySelectorAll ) {
		var i=0,svgs = document.querySelectorAll('.svgdefs');
		for (;i<svgs.length; i++) {
			svgs[i].innerHTML = '<%= svgDefs %>';
		};
	}
	/*@end*/
})();