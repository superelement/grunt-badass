'use strict';

var badass = require("../tasks/badass.js");
var shell = require("shelljs");

describe("badass", function() {

	beforeEach(function() {

		var cwd = process.cwd();
		process.chdir("tests/grunt_configs/");
		var result = shell.exec("grunt badass", {silent:true});
		process.chdir(cwd);

		console.log( "before each", result );
	});

	afterEach(function() {
		console.log( "after each" );
	});

	it("should be true", function() {
		expect(true).toBe(true);
	});
});