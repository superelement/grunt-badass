'use strict';

var _ = require("lodash-node")
	,shell = require("shelljs")
	,fse = require("fs-extra")
	,parserlib = require("parserlib") // for linting CSS
	,cwd = process.cwd();


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


describe("badass testable methods", function() {

	var badass = require("../tasks/badass.js")
		,testableMethods = badass( require("grunt") ).tests

	describe("replaceBetween()", function() {
		var START = "{{START}}"
			,END = "{{END}}";

		it("should replace 'love' with 'money' and no longer contain delimeters", function() {
			
			var originalStr = "I need your "+START+"love"+END+"."
				,modifiedStr = testableMethods.replaceBetween( START, END, originalStr, 'money' );

			expect( modifiedStr ).toBe("I need your money.");
		});

		it("should replace 'time' with 'sugar' and still contain delimeters", function() {
			var originalStr = "I need your "+START+"time"+END+"."
				,modifiedStr = testableMethods.replaceBetween( START, END, originalStr, 'sugar', true );

			expect( modifiedStr ).toBe("I need your "+START+"sugar"+END+".");
		});

		it("should replace a string containing a line break with an empty string and no longer contain delimeters", function() {
			var originalStr = "I need "+START+"a break \n from "+END+"you."
				,modifiedStr = testableMethods.replaceBetween( START, END, originalStr );

			expect( modifiedStr ).toBe("I need you.");
		});
	});

	describe("getClassesByProp()", function() {

		it("should return specific CSS with 'fillCol' property", function(done) {
			
			var returnedStr = callSimple();

			expect( trimAllWhite(returnedStr) ).toBe(".bad-cloud-down{fill:#999;}");

			lintCSS( done, returnedStr );
		});


		describe("specific CSS with 'strokeCol' property", function() {

			var cssPrefix = "bad"
				,item = {
					filename: "cloud"
					,class: "cloud-down"
					,w:50
					,h:41
					,strokeCol: "#999"
				}
				,propName = "strokeCol"
				,cssPropName = "stroke";

			it("should have specified hex value, when 'inclNone' is false", function(done) {
				
				var inclNone = false
					,thisItem = _.clone(item);

				var returnedStr = testableMethods.getClassesByProp( cssPrefix, [thisItem], propName, cssPropName, inclNone );

				// expect result, based on 'strokeCol' property having a value in object with 'items' array. 
				expect( trimAllWhite(returnedStr) ).toBe(".bad-cloud-down{stroke:#999;}");

				lintCSS( done, returnedStr );
			});


			it("should have specified hex value, when 'inclNone' is true, showing it doesn't matter what this value is if property exists and ISN'T a falsey", function(done) {
				
				var inclNone = true
					,thisItem = _.clone(item);

				var returnedStr = testableMethods.getClassesByProp( cssPrefix, [thisItem], propName, cssPropName, inclNone );

				// expect result, based on 'strokeCol' property having a value in object with 'items' array. 
				expect( trimAllWhite(returnedStr) ).toBe(".bad-cloud-down{stroke:#999;}");

				lintCSS( done, returnedStr );
			});


			it("should have 'transparent' value, when 'inclNone' is true and if property IS a falsey", function(done) {
				
				var inclNone = true
					,thisItem = _.clone(item);

				thisItem.strokeCol = undefined;

				var returnedStr = testableMethods.getClassesByProp( cssPrefix, [thisItem], propName, cssPropName, inclNone );

				expect( trimAllWhite(returnedStr) ).toBe(".bad-cloud-down{stroke:transparent;}");

				lintCSS( done, returnedStr );
			});


			it("should return an empty string, when 'inclNone' is false and if property IS a falsey", function() {
				
				var inclNone = false
					,thisItem = _.clone(item);

				thisItem.strokeCol = undefined;

				var returnedStr = testableMethods.getClassesByProp( cssPrefix, [thisItem], propName, cssPropName, inclNone );
				
				expect( returnedStr ).toBe("");
			});
		});



		

		function callSimple() {
			var cssPrefix = "bad"
				,items = [{
					filename: "cloud"
					,class: "cloud-down"
					,w:50
					,h:41
					,fillCol: "#999"
				}]
				,propName = "fillCol"
				,cssPropName = "fill"
				,inclNone = true;

			return testableMethods.getClassesByProp( cssPrefix, items, propName, cssPropName, inclNone );
		}
	});

	describe("saveScss()", function() {
		it("should save css in given location, ensuring 'includeCompassSpriteStyles' is false and lint it", function(done) {
			var cssPrefix = "bad"
				,items = [{
					filename: "cloud"
					,class: "cloud-down"
					,w:50
					,h:41
					,strokeCol: "#999"
				}]
				,scssOutput = cwd + "/tests/tmp/icons.css"
				// can only lint if 'includeCompassSpriteStyles' is false, as it will add scss specific styles
				,includeCompassSpriteStyles = false;

			testableMethods.saveScss( includeCompassSpriteStyles, cssPrefix, cwd + "/", scssOutput, items );

			// ensure file exists before reading it
			expect( fse.existsSync( scssOutput ) ).toBe( true );

			// Lint it to make sure it is valid CSS
			var css = fse.readFileSync( scssOutput ).toString();
			lintCSS( done, css )
		});
	});
});


describe("cleanup", function() {
	it("should clean up the dist folder", function() {
		fse.removeSync( "./dist/test1" );
		expect( fse.existsSync("./dist/test1") ).toBe( false );
	});
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


function trimAllWhite(str) {
	return str.replace(/\s+/g, '');
}