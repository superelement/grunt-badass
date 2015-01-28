'use strict';

var _ = require("lodash-node")
	,parserlib = require("parserlib") // for linting CSS
	,shell = require("shelljs")
	,fse = require("fs-extra")
	,cwd = process.cwd()


describe("test 1 - check generated files and folders", function() {

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
		,config = require("./grunt_configs/test1.js").test
		,COMPASS_SPRITE_DIR = _.template( config.dest, rootDirObj )
		,STAND_ALONE_PNG_DIR = _.template( config.options.standAlonePngDir, rootDirObj )
		,PNG_DIR = COMPASS_SPRITE_DIR+config.options.cssPrefix+"/";
	
	gruntTest(1);


	it("should check task resources exist", function() {
		expect( fse.existsSync("./tasks/resources/icons.css") ).toBe( true );
		expect( fse.existsSync("./tasks/resources/svgloader.js") ).toBe( true );
	});


	it("should have created a css file for icons which should no longer contains any template syntax.", function(done) {		

		expect( fse.existsSync(COMPASS_SPRITE_DIR+"icons.css") ).toBe( true );

		var css = fse.readFileSync(COMPASS_SPRITE_DIR+"icons.css").toString();
		expect( css.indexOf("<%=") ).toEqual(-1);

		lintCSS( done, css );
	});


	it( "should check that all SVG icons have had corresponding PNGs generated", function() {
		expect( fse.existsSync(PNG_DIR) ).toBe( true );
		
		config.options.items.forEach( function(item, i) {
			var pngIcon = PNG_DIR+item.class+".png";
			expect( fse.existsSync(pngIcon) ).toBe( true );
		});
	});


	it("should check that specified stand alone pngs have been generate", function() {
		
		expect( fse.existsSync(STAND_ALONE_PNG_DIR) ).toBe( true );

		config.options.items.forEach(function(item) {
			if( item.standAlone ) 
				expect( fse.existsSync( STAND_ALONE_PNG_DIR+item.class+".png" ) ).toBe( true );
		});
	});


	// TODO: test file names are css compatible

	/*it("should have copied the `svgloader.js` file into dist.", function() {		
		expect( fse.existsSync("./dist/test1/svgloader.js") ).toBe( true );
	});*/

});


function gruntTest( number ) {
	process.chdir("tests/grunt_configs/");
	var result = shell.exec("grunt badass:test"+number, {silent:true});
	process.chdir(cwd);
}

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

