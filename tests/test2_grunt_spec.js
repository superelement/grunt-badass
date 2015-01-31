'use strict';

var _ = require("lodash-node")
	,parserlib = require("parserlib") // for linting CSS
	,fse = require("fs-extra")
	,cwd = process.cwd()


describe("test 2 - check generated files and folders", function() {

	var originalTimeout;

	beforeEach(function() {
		originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
  		jasmine.DEFAULT_TIMEOUT_INTERVAL = 4000;
	});


	afterEach(function() {
		jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
	});
	
	/**
	 * Lodash template used just for converting path vars
	 */
	var rootDirObj = { rootDir: "./" }
		,config = require("./grunt_configs/test2.js").test
		,DEST = _.template( config.dest, rootDirObj )
		,STAND_ALONE_PNG_DIR = _.template( config.options.standAlonePngDir, rootDirObj )
		,PNG_DIR = DEST+config.options.cssPrefix+"/";


	it("should check task resources exist", function() {
		expect( fse.existsSync("./tasks/resources/icons.css") ).toBe( true );
		expect( fse.existsSync("./tasks/resources/svgloader.js") ).toBe( true );
	});


	it("should have created a css file for icons which should no longer contains any template syntax, then lint the styles.", function(done) {		

		expect( fse.existsSync(DEST+"icons.css") ).toBe( true );

		var css = fse.readFileSync(DEST+"icons.css").toString();
		expect( css.indexOf("<%=") ).toEqual(-1);

		lintCSS( done, css );
	});


	it( "should check that 'pngDir' has been removed", function() {
		expect( fse.existsSync(PNG_DIR) ).toBe( false );
	});


	it("should check that specified stand alone pngs have been generated", function() {
		
		expect( fse.existsSync(STAND_ALONE_PNG_DIR) ).toBe( true );

		config.options.items.forEach(function(item) {
			if( item.standAlone ) 
				expect( fse.existsSync( STAND_ALONE_PNG_DIR+item.class+".png" ) ).toBe( true );
		});
	});

	it("should have copied the `svgloader.js` file into dist.", function() {		
		expect( fse.existsSync(DEST+"svgloader.js") ).toBe( true );
	});

});



function lintCSS( done, returnedStr ) {
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

