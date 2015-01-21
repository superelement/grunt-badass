'use strict';

var badass = require("../tasks/badass.js");
var gruntMock = require("gruntmock");
var grunt = require("grunt");

exports.badass = {
	test1: function() {

		grunt.initConfig({
			target: "badass"

			,src: 'tests/resources/'
			,dest: "dist/"
			,options: {
				pngDir: "bad" // sprites will take this folder name as part of class name, so keep it short

				// if 'standAlone' is marked as true, files will get copied to this directory
				,standAlonePngDir: "dist/singles/"

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
		});

		return grunt;

		/*console.log( grunt );

		return gruntMock.create({
			target: "badass"

			,src: 'tests/resources/'
			,dest: "dist/"
			,options: {
				pngDir: "bad" // sprites will take this folder name as part of class name, so keep it short

				// if 'standAlone' is marked as true, files will get copied to this directory
				,standAlonePngDir: "dist/singles/"

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
		});*/
	}
}