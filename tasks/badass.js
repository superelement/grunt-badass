module.exports = function( grunt ) {
	"use strict";

	var svgToPng = require( 'svg-to-png' )
		,_ = require( 'lodash-node' )
        ,ALMOST_ZERO = "0.0001";

	grunt.registerMultiTask("badass", "Icon PNG fallback task", function() {

		var config = this.options({
            pngDir: "bad"
            ,standAlonePngDir: "./stand-alone-pngs/"
            ,svgDir: "myicons-svgs/"
			,scssOutput: "_myicons.scss"
            ,defaultWidth: "10px"
            ,defaultHeight: "10px"
            ,defaultCol: "BADA55"
            ,items: [
                 // { filename: "halo", class: "halo-md-gold", w: 64, h:64, strokeWidth: 10, strokeCol: "#ff00ff" }
                // ,{ filename: "bitbucket", class: "bitbucket-sm-red", w: 30, h:30, fillCol: "#00ff00" }
            ]
            ,tmpDir: "./tmp/"
            ,cwd: null
		});

        // sets the current working directory ("cwd") if not defined in config
        if(!config.cwd) config.cwd = process.cwd();

        // ensures a trailing forward slash exists if not set in cwd
        if(config.cwd[ config.cwd.length-1 ] != "/" ) config.cwd += "/";

        config.tmpDir = config.cwd + config.tmpDir;
        console.log( config.cwd )

        // empty the temp folder if exists
        if( grunt.file.exists(config.tmpDir) )
            grunt.file.delete( config.tmpDir, { force: true });

		var done = this.async();
		grunt.log.writeln( "BADASS".yellow );

		var fileObj = this.files[0];

		if( fileObj.src.length === 0 ) {
			grunt.log.error( "BADASS needs at least 1 src directory!".red );
			done();
			return;
		}

		var opts = {
            pngfolder: config.pngDir
            ,defaultWidth: config.defaultWidth
            ,defaultHeight: config.defaultHeight
        };

        var cnt = 0;
        _.forEach( fileObj.src, function( src ) {
	        cnt++;


            coloursAndSizes( config.defaultCol, src, config.items, config.tmpDir );
            copySafeSrc( config.defaultCol, src, config.svgDir );
            saveScss( config.pngDir, config.cwd, config.scssOutput, config.items );

            svgToPng.convert( config.tmpDir, fileObj.dest, opts )
            .then( function( result , err ){
                if( err ){
                    grunt.fatal( err );
                }

                copyStandAlonePngs( config.items, fileObj.dest + config.pngDir + "/", config.standAlonePngDir );

                if( cnt >= fileObj.src.length ) {
                    // empty the temp folder
                    grunt.file.delete( config.tmpDir, { force: true });
                    done();
                }
            });
        });

	});
    
    
    function copyStandAlonePngs( items, pngDir, standAlonePngDir ) {

        _.forEach( items, function( item ) {

            if( item.standAlone ) {

                var copyFromPath = pngDir + item.class + ".png";
                var copyToPath = standAlonePngDir + item.class + ".png";
                // console.log( copyFromPath, grunt.file.exists( copyFromPath ) );

                 grunt.file.copy( copyFromPath, copyToPath );
            }
        });
    }

    // to be processed by pngToSvg
	function coloursAndSizes( defaultCol, src, items, tmpDir ) {

        grunt.file.recurse( src, function(abspath, rootdir, subdir, filename) {

            var contents = grunt.file.read( abspath );

            if( contents.indexOf("<?xml") === -1 )
                contents = '<?xml version="1.0" encoding="utf-8"?>\n' + contents;

            contents = contents.split("<symbol").join("<g").split("</symbol").join("</g");
            if( contents.indexOf("xmlns=") == -1 )
                contents = contents.split("<svg ").join('<svg xmlns="http://www.w3.org/2000/svg" ');

            var originalContents = contents;
            for(var i=0; i<items.length; i++) {
                var item = items[i];

                var baseName = filename.replace(".svg", "");
                if( item.filename === baseName ) {

                    // fileNameBase only gets used if item.class is not specified
                    var fileNameBase = baseName + "-w"+item.w +"-h"+item.h;
                    if( item.strokeWidth ) fileNameBase += "-sw-"+item.strokeWidth;
                    if( item.strokeCol ) fileNameBase += "-sc-"+item.strokeCol.split("#").join("");
                    if( item.fillCol ) fileNameBase += "-fc-"+item.fillCol.split("#").join("");

                    contents = originalContents;

                    // must remove width and height attributes so they don't get added twice, which would cause an error in svgToPng
                    contents = removeAttr( "svg", "width", contents );
                    contents = removeAttr( "svg", "height", contents );

                    contents = contents.replace("<svg ", "<svg width='"+item.w+"' height='"+item.h+"' ");

                    contents = replaceTag( 'stroke-width="0.1"', "stroke-width", item.strokeWidth, contents );
                    contents = replaceTag( 'stroke="#'+defaultCol+'"', "stroke", item.strokeCol, contents );
                    contents = replaceTag( 'fill="#'+defaultCol+'"', "fill", (item.fillCol || "transparent"), contents );

                    // So SVG To PNG doesn't error, we fill in any remnants. 
                    // Stroke width can't be zero, so we give it a teeny-tiny number that is too small to render.

                    if( contents.indexOf('stroke-width="0.1"') !== -1 )
                        contents = replaceTag( 'stroke-width="0.1"', "stroke-width", ALMOST_ZERO, contents );

                    if( contents.indexOf('stroke="#'+defaultCol+'"') !== -1 )
                        contents = replaceTag( 'stroke="#'+defaultCol+'"', "stroke", "transparent", contents );

                    if( contents.indexOf('fill="#'+defaultCol+'"') !== -1 )
                        contents = replaceTag( 'fill="#'+defaultCol+'"', "fill", "transparent", contents );
                    
                    // console.log( tmpDir + (item.class || fileNameBase) + ".svg" );
                    grunt.file.write( tmpDir + (item.class || fileNameBase) + ".svg", contents );
                }
            }
        });
	}


    function removeAttr( tagName, attrName, str ) {

        var svgOpenArr1 = str.split( "<" + tagName );
        var svgOpenArr2 = svgOpenArr1[1].split(">");

        // console.log( svgOpenArr2[0] );
        
        str = svgOpenArr1[0] + "<" + tagName;

        _.forEach( svgOpenArr2, function( splitStr, i ) {

            if( i === 0 ) {

                str += replaceBetween( attrName+'="', '"', splitStr, "", false );
            } else {
                str += ">" + splitStr;
            }
        });

        return str;
    }

    function replaceTag( tag, attrName, val, contents, warningCB ) {

        if( val ) {
            if( contents.indexOf( tag ) !== -1 )
                contents = contents.split( tag ).join( attrName + '="' + val + '"' );
        }

        return contents;
    }


    // copies original svgs to be processed by svgmin
    function copySafeSrc( defaultCol, src, dest ) {

        grunt.file.recurse( src, function(abspath, rootdir, subdir, filename) {

            if( filename.indexOf(".svg") != -1 ) {
                var contents = grunt.file.read( abspath );

                // if( contents.indexOf('stroke="#'+BADASS+'"') != -1 && contents.indexOf('stroke-width="0.1"') == -1 )
                    // contents = contents.split('stroke="#'+BADASS+'"').join(' stroke-width="0" ');

                contents = contents.split('stroke-width="0.1"').join("");
                contents = contents.split('stroke="#'+defaultCol+'"').join("");
                contents = contents.split('fill="#'+defaultCol+'"').join("");

                /*if( filename == "clickandcollect-4up.svg" ) {
                    console.log( contents );
                }*/

                grunt.file.write( dest + filename, contents );
            }
        });
    }

    function saveScss( pngDir, cwd, scssOutput, items ) {

        var scss = grunt.file.read( cwd + "tasks/resources/icons.scss" );
        
        scss = _.template( scss, {pngDir: pngDir} );

        scss += getClassesByProp( pngDir, items, "fillCol", "fill", true );
        scss += getClassesByProp( pngDir, items, "strokeCol", "stroke", false );
        scss += getClassesByProp( pngDir, items, "strokeWidth", "stroke-width", false );

        // Think this does nothing
        // scss = scss.split( ALMOST_ZERO ).join("0");

        grunt.file.write( scssOutput, scss );
    }


    function getClassesByProp( pngDir, items, propName, cssPropName, inclNone ) {

        var vals = _.uniq( _.pluck( items, propName ) )
            ,line1 = "\n"
            ,line2 = "\n\n";

        var rtnStr = "";
        _.forEach( vals, function( val ) {

            // must be a string, so not to be a falsey
            // if( inclNone && propName === "strokeWidth" && !val ) val = "0";

            if( val || !val && inclNone ) {

                _.forEach( items, function( item ) {

                    if( item[ propName ] === val ) {
                        rtnStr += "."+pngDir+"-" + item.class + ","+line1;
                    }
                });

                rtnStr = rtnStr.slice( 0, rtnStr.length-2 ) + " {"+line1;
                rtnStr += "   "+cssPropName+": " + (val || "transparent") + ";"+line1;
                rtnStr += "}"+line2;
            }
        });

        // console.log( rtnStr );
        return rtnStr;
    }


    function replaceBetween(rxStart, rxEnd, originalString, replacementString, keepDelimeteres ) {
        // Notes:
        // REF: http://www.developerscloset.com/?p=548
        // 1. In this expression "\\d\\D" makes sure line breaks are included
        // 2. And "*?" means that everything will be replaced between
        // 3. "g" stands for global, which means it will look through the entire string
        // 4. If you want to escape a "/", you must make it "\/"
        // 5. If you want to escape an "*", you must make it "\\*"

        var rx = new RegExp( rxStart + "[\\d\\D]*?" + rxEnd, "g");

        // console.log( originalString.substr( rx ) );

        var result;
        if( keepDelimeteres === true ) {
            result = originalString.replace( rx, rxStart + replacementString + rxEnd );
        } else {
            result = originalString.replace( rx, replacementString );
        }

        return result;
    }

    
}