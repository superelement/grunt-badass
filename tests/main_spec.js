'use strict';

var badass = require("../tasks/badass.js")
	,_ = require("lodash-node")
	,shell = require("shelljs")
	,fse = require("fs-extra")
	,cwd = process.cwd();

describe("test 1 - check generated files and folders", function() {
	
	/**
	 * Lodash template used just for converting path vars
	 */
	var rootDirObj = { rootDir: "./" }
		,config = require("./grunt_configs/test1.js").test
		,COMPASS_SPRITE_DIR = _.template( config.dest, rootDirObj )
		,STAND_ALONE_PNG_DIR = _.template( config.options.standAlonePngDir, rootDirObj )
		,PNG_DIR = COMPASS_SPRITE_DIR+config.options.cssPrefix+"/";
	
	gruntTest(1);

	it("should have created a scss file for icons which should no longer contains any template syntax.", function() {		

		expect( fse.existsSync(COMPASS_SPRITE_DIR+"icons.scss") ).toBe( true );

		var scss = fse.readFileSync(COMPASS_SPRITE_DIR+"icons.scss").toString();
		expect( scss.indexOf("<%=") ).toEqual(-1);
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