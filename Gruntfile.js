/*
 * grunt-badass
 * http://github.com/jimdoyle82/grunt-badass
 *
 * Copyright (c) 2014 Jim Doyle
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({

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
				src: ["tasks/badass.js"]
				,options: {
					coverage: {}
					,forceExit: true
					,specFolders: ['tests']
					,captureExceptions: true
					,showColors: true
				}
			}
		}

		,badass: {
			dist: {
				src: 'tests/resources/'
				,dest: "dist/"
				,options: {
					pngDir: "bad" // sprites will take this folder name as part of class name, so keep it short

					// if 'standAlone' is marked as true, files will get copied to this directory
					,standAlonePngDir: "dist/singles/"
					,spriteUrl: "/_dist/deploy/img/sprites/dmicon-s501a7eb4b9.png"

					,svgDir: "tmp/myicons-svgs/"
					,scssOutput: "dist/icons.scss"
					,items: [
						 { filename: "camera", class: "camera-warm", w: 50, h:44, fillCol: "orange" }
						,{ filename: "camera", class: "camera-cold", w: 50, h:44, fillCol: "blue", standAlone: true }
						,{ filename: "cloud", class: "cloud-down", w: 50, h:41, fillCol: "#999" }
						,{ filename: "code", class: "code-sm-bright", w: 50, h:38, fillCol: "yellow" }
						,{ filename: "code", class: "code-md-bright", w: 60, h:45, fillCol: "yellow" }
						,{ filename: "code", class: "code-lg-bright", w: 80, h:60, fillCol: "yellow" }
					]
				}
			}
		}

	});

	// Actually load this plugin's task(s).
	grunt.loadTasks('tasks');

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-jasmine-node-coverage');

	grunt.registerTask('tests', ['jasmine_node']);
	// grunt.registerTask('test', ['copy', 'clean', 'jasmine_node']);

	grunt.registerTask('default', ['jshint', 'tests', 'badass']);
};
