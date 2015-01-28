/**
 * This Gruntfile is meant for unit testing and should be executed within a
 * Jasmine `*_spec.js` file, by using the `shell.exec` library to initialize Grunt.
 * There is no default task because each target gets specified in the shell command.
 */

'use strict';
module.exports = function(grunt) {

	grunt.initConfig({
		rootDir: process.cwd() + "/../../"
		,badass: {
			// Load in different targets
			test1: require("./test1.js").test
			,test2: require("./test2.js").test
		}
	});

	// Loads in grunt-badass
	grunt.loadTasks( grunt.config("rootDir")+'tasks');
};
