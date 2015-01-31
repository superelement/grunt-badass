'use strict';

var _ = require("lodash-node")
	,parserlib = require("parserlib") // for linting CSS
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

	it("should check task resources exist", function() {
		expect( fse.existsSync("./tasks/resources/icons-compass-sprite.scss") ).toBe( true );
		expect( fse.existsSync("./tasks/resources/icons.css") ).toBe( true );
		expect( fse.existsSync("./tasks/resources/svgloader.js") ).toBe( true );
	});


	it("should have created a scss file for icons which should no longer contains any template syntax.", function() {		

		expect( fse.existsSync(COMPASS_SPRITE_DIR+"icons.scss") ).toBe( true );

		var css = fse.readFileSync(COMPASS_SPRITE_DIR+"icons.scss").toString();
		expect( css.indexOf("<%=") ).toEqual(-1);
	});


	it( "should check that all SVG icons have had corresponding PNGs generated", function() {
		expect( fse.existsSync(PNG_DIR) ).toBe( true );
		
		config.options.items.forEach( function(item, i) {
			var pngIcon = PNG_DIR+item.class+".png";
			expect( fse.existsSync(pngIcon) ).toBe( true );
		});
	});


	it("should check that specified stand alone pngs have been generated", function() {
		
		expect( fse.existsSync(STAND_ALONE_PNG_DIR) ).toBe( true );

		config.options.items.forEach(function(item) {
			if( item.standAlone ) 
				expect( fse.existsSync( STAND_ALONE_PNG_DIR+item.class+".png" ) ).toBe( true );
		});
	});


	// TODO: test file names are css compatible

	it("should have copied the `svgloader.js` file into dist.", function() {		
		expect( fse.existsSync(COMPASS_SPRITE_DIR+"svgloader.js") ).toBe( true );
	});

});

