/*
 * grunt-badass
 * http://github.com/jimdoyle82/grunt-badass
 *
 * Copyright (c) 2014 Jim Doyle
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

	/**
	 * We need to load badass task here just so we can grab the result of one of the functions, which uses Grunt tasks
	 * internally, so we can test it.
	 */
	var _ = require("lodash-node")
		,badass = require('./tasks/badass.js')
		,test3_RunSvgLoaderGruntTasks = badass(grunt).tests.runSvgLoaderGruntTasks( "bad", "tests/resources/svgs/"
										,"dist/test3/svgstore/output/svgloader.js", "dist/test3/svgstore/tmp/", false, false );

	// Project configuration.
	var config = {

		jshint: {
		  all: [
			'Gruntfile.js'
			,'tasks/*.js'
			// ,'<%= nodeunit.tests %>'
		  ],
		  options: {
			jshintrc: '.jshintrc'
		  },
		}

		// Unit tests.
		,jasmine_node: {
			badass: {
				src: ["tests/**/*spec.js"] // for coverage
				,options: {
					coverage: {} // using istanbul defaults
					,specFolders: ['tests']
					,captureExceptions: true
					,showColors: true
					,forceExit: true
				}
			}
		}

		,badass: {
			test1: require("./tests/grunt_configs/test1.js").test
			,test2: require("./tests/grunt_configs/test2.js").test
		}

		,clean: {
			tests: ["dist/test1", "dist/test2",  "dist/test3"]
		}
	};

	// Must combine the configs from after calling 'runSvgLoaderGruntTasks' with the ones decared in this file
	grunt.initConfig( _.extend(config, grunt.config.data) );

	// Actually load this plugin's task(s).
	grunt.loadTasks('tasks');

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-jasmine-node-coverage');

	// use grunt option --dirty=true to skip the clean
	grunt.registerTask('test', ['badass:test1', 'badass:test2', 'test3', 'jasmine_node:badass'] 
		.concat( grunt.option("dirty") ? [] : ["clean:tests"] ) );

	grunt.registerTask('test1', ['badass:test1']);
	grunt.registerTask('test2', ['badass:test2']);
	grunt.registerTask('test3', [ "svgstore:"+test3_RunSvgLoaderGruntTasks.svgStoreName
									, test3_RunSvgLoaderGruntTasks.postSvgStoreName ]);

	grunt.registerTask('default', ['jshint', 'test', 'badass']);
};
