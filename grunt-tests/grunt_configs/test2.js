exports.test = {
	src: '<%= rootDir %>tests/resources/svgs/'
	,dest: "<%= rootDir %>dist/test2/"
	,options: {
		cssPrefix: "bad" // sprites will take this folder name as part of class name, so keep it short

		// if 'standAlone' is marked as true, files will get copied to this directory
		,standAlonePngDir: "<%= rootDir %>dist/test2/singles/"
		
		// final url for sprite
		,spriteUrl: "/absolute/url/to/sprite.png"
		,spriteOutput: "<%= rootDir %>dist/test2/sprite.png"

		// ,svgDir: "<%= rootDir %>tmp/test2/myicons-svgs/"
		,stylesOutput: "<%= rootDir %>dist/test2/icons.css"

		// By default compressSprite.keepUncompressed = false
		,compressSprite: {
            keepUncompressed: true
        }

		,items: [
			 { filename: "camera", class: "camera-warm", w: 50, h:44, fillCol: "orange" }
			,{ filename: "camera", class: "camera-cold", w: 50, h:44, fillCol: "blue", standAlone: true }
			,{ filename: "cloud", class: "cloud-down", w: 50, h:41, fillCol: "#999" }
			,{ filename: "code", class: "code-sm-bright", w: 50, h:38, fillCol: "yellow" }
			,{ filename: "code", class: "code-md-bright", w: 60, h:45, fillCol: "yellow" }
			,{ filename: "code", class: "code-lg-bright", w: 80, h:60, fillCol: "yellow" }
		]

		,svgoPlugins: [
	        /**
	         * One Apache server configuration has been known to convert certain combinations of numbers into ********** asterisk characters.
			 * Suspected cause is some kind of malware protection blocking know number sequences in viruses.
	         * This is a very rare edge case, but if you come across it, turning off the following 'convert' plugins will fix it.
	         * However, as this same compression is used in PDFs and Font Awesome icons, you must start with an uncompressed source, or else
	         * it will keep happening.
	         */
	         { convertPathData: false }
	        ,{ convertStyleToAttrs: false }
	        ,{ convertTransform: false }
	        ,{ convertShapeToPath: false }
	    ]


		// ,clearTmpDir: false
	}
}