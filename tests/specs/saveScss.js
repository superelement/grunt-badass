var badass = require("./../../index.js")
	,testableMethods = badass.testableMethods
	,utils = require("./../utils.js")
	,fse = require("fs-extra")

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
			,stylesOutput = utils.TEST_DIR + "tmp/icons.css"
			// can only lint if 'includeCompassSpriteStyles' is false, as it will add scss specific styles
			,includeCompassSpriteStyles = false;

		testableMethods.saveScss( includeCompassSpriteStyles, cssPrefix, stylesOutput, items );

		// ensure file exists before reading it
		expect( fse.existsSync( stylesOutput ) ).toBe( true );

		// Lint it to make sure it is valid CSS
		var css = fse.readFileSync( stylesOutput ).toString();
		utils.lintCSS( done, css )
	});
});