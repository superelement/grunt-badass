'use strict';

var badass = require("../tasks/badass.js");
var shell = require("shelljs");
var fse = require("fs-extra");
var cwd = process.cwd();

describe("test 1 - check generated files and folders", function() {
	
	var config = require("./grunt_configs/test1.js").test
		,TEST_DIR = "./dist/test1/"
		,pngDir = TEST_DIR+config.options.pngDir+"/"
		,singlesDir = TEST_DIR+"singles/";
	
	gruntTest(1);

	it("should have created a scss file for icons that no longer contains any template syntax.", function() {		
		expect( fse.existsSync("./dist/test1/icons.scss") ).toBe( true );

		var scss = fse.readFileSync(TEST_DIR+"icons.scss").toString();
		expect( scss.indexOf("<%=") ).toEqual(-1);
	});

	it( "should check that all SVG icons have had corresponding PNGs generated", function() {

		expect( fse.existsSync(pngDir) ).toBe( true );
		
		config.options.items.forEach( function(item, i) {
			var pngIcon = pngDir+item.class+".png";
			expect( fse.existsSync(pngIcon) ).toBe( true );
		});
	});

	it("should check that specified stand alone pngs have been generate", function() {
		
		expect( fse.existsSync(TEST_DIR+"singles/") ).toBe( true );

		config.options.items.forEach( function(item, i) {
			if( item.standAlone ) 
				expect( fse.existsSync( singlesDir+item.class+".png" ) ).toBe( true );
		});
	});

	/*it("should have copied the `svgloader.js` file into dist.", function() {		
		expect( fse.existsSync("./dist/test1/svgloader.js") ).toBe( true );
	});*/

});

describe("cleanup", function() {
	it("should clean up the dist folder", function() {
		fse.removeSync( "./dist" );
		expect( fse.existsSync("./dist") ).toBe( false );
	});
});

function gruntTest( number ) {
	process.chdir("tests/grunt_configs/");
	var result = shell.exec("grunt badass:test"+number, {silent:true});
	process.chdir(cwd);
}