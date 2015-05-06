var badass = require("./../../index.js")
	,testableMethods = badass.testableMethods
	,utils = require("./../utils.js")
	,fse = require("fs-extra")
	,_ = require("lodash-node")

describe("svgMin()", function() {

	var srcPath = "./tests/resources/svgs/"
		,destPath = utils.TEST_DIR + "safe-svgs/";


	it("should verify that all '.svg' files have been copied to 'dest' directory", function(done) {

		testableMethods.svgMin( utils.DEF_COL, srcPath, destPath, testableMethods.svgoPlugins, function() {

			var srcFileNames = fse.readdirSync( srcPath )
				,destFileNamesMin = fse.readdirSync( destPath+"min/" )
				,destFileNamesUnmin = fse.readdirSync( destPath+"unmin/" )

			expect( _.isEqual(srcFileNames, destFileNamesMin) ).toBe( true );
			expect( _.isEqual(srcFileNames, destFileNamesUnmin) ).toBe( true );
			done();
		});
	});

	it("should check that svgs have had references to BADASS removed", function(done) {

		testableMethods.svgMin( utils.DEF_COL, srcPath, destPath, testableMethods.svgoPlugins, function() {
			var srcFileNames = fse.readdirSync( srcPath );

			srcFileNames.forEach(function(fileName) {

				var destContents = fse.readFileSync( destPath+"unmin/" + fileName ).toString();

				expect( destContents.indexOf("#"+utils.DEF_COL) ).toEqual( -1 );
				expect( destContents.indexOf("#"+utils.DEF_COL.toLowerCase()) ).toEqual( -1 );
			});
			done();
		});

	});
});