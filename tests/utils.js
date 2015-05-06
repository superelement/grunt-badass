var parserlib = require("parserlib"); // for linting CSS

module.exports.TEST_DIR = "./../../dist/test3/";
module.exports.DEF_COL = "BADA55";

module.exports.lintCSS = function( done, returnedStr ) {
	// Now we lint the CSS
	var parser = new parserlib.css.Parser();

	// will get changed to true in error handler if errors detected
	var errorsFound = false;

	parser.addListener("error", function(event){
	    console.log("Parse error: " + event.message + " (" + event.line + "," + event.col + ")", "error");
	    errorsFound = true;
	});

	parser.addListener("endstylesheet", function(){
	    console.log("Finished parsing style sheet");

		expect( errorsFound ).toBe( false );

		// finish the test
	    done();
	});
	
	parser.parse( returnedStr );
}


module.exports.trimAllWhite = function(str) {
	return str.replace(/\s+/g, '');
}