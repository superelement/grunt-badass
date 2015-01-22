'use strict';
module.exports = function(grunt) {

	grunt.initConfig({
		rootDir: process.cwd() + "/../../"
		,badass: {
			test1: require("./test1.js").test
		}
	});

	// Actually load this plugin's task(s).
	grunt.loadTasks( grunt.config("rootDir")+'tasks');

	grunt.registerTask('default', ['badass']);
};
