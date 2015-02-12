exports.test = {
	src: '<%= rootDir %>tests/resources/svgs/'
	,dest: "<%= rootDir %>dist/test2/"
	,options: {
		cssPrefix: "bad" // css classes will take this folder name as first part of class name, so keep it short

		,stylesOutput: "<%= rootDir %>dist/test2/icons.css"

		,items: [
			 { filename: "camera", class: "camera-warm", w: 50, h:44, fillCol: "orange" }
			,{ filename: "camera", class: "camera-cold", w: 50, h:44, fillCol: "blue", standAlone: true }
			,{ filename: "cloud", class: "cloud-down", w: 50, h:41, fillCol: "#999" }
			,{ filename: "code", class: "code-sm-bright", w: 50, h:38, fillCol: "yellow" }
			,{ filename: "code", class: "code-md-bright", w: 60, h:45, fillCol: "yellow" }
			,{ filename: "code", class: "code-lg-bright", w: 80, h:60, fillCol: "yellow" }
		]

		,clearTmpDir: false
	}
}