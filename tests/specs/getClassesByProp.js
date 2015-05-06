var badass = require("./../../index.js")
	,testableMethods = badass.testableMethods
	,utils = require("./../utils.js")
	,_ = require("lodash-node")

describe("getClassesByProp()", function() {

	it("should return specific CSS with 'fillCol' property", function(done) {
		
		var returnedStr = callSimple();

		expect( utils.trimAllWhite(returnedStr) ).toBe(".bad-cloud-down{fill:#999;}");

		utils.lintCSS( done, returnedStr );
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
			expect( utils.trimAllWhite(returnedStr) ).toBe(".bad-cloud-down{stroke:#999;}");

			utils.lintCSS( done, returnedStr );
		});


		it("should have specified hex value, when 'inclNone' is true, showing it doesn't matter what this value is if property exists and ISN'T a falsey", function(done) {
			
			var inclNone = true
				,thisItem = _.clone(item);

			var returnedStr = testableMethods.getClassesByProp( cssPrefix, [thisItem], propName, cssPropName, inclNone );

			// expect result, based on 'strokeCol' property having a value in object with 'items' array. 
			expect( utils.trimAllWhite(returnedStr) ).toBe(".bad-cloud-down{stroke:#999;}");

			utils.lintCSS( done, returnedStr );
		});


		it("should have 'transparent' value, when 'inclNone' is true and if property IS a falsey", function(done) {
			
			var inclNone = true
				,thisItem = _.clone(item);

			thisItem.strokeCol = undefined;

			var returnedStr = testableMethods.getClassesByProp( cssPrefix, [thisItem], propName, cssPropName, inclNone );

			expect( utils.trimAllWhite(returnedStr) ).toBe(".bad-cloud-down{stroke:transparent;}");

			utils.lintCSS( done, returnedStr );
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