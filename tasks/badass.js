module.exports = function( grunt ) {
	"use strict";

	var svgToPng = require('svg-to-png')
        ,spritesmith = require('spritesmith')
        ,fse = require("fs-extra")
		,_ = require('lodash-node')

	grunt.registerMultiTask("badass", "Icon PNG fallback task", function() {

		var config = this.options({
            cssPrefix: "bad"
            ,standAlonePngDir: "./stand-alone-pngs/"
            ,spriteUrl: null
            ,svgDir: "myicons-svgs/"
			,scssOutput: "_myicons.css"
            ,includeCompassSpriteStyles: false
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
            pngfolder: config.cssPrefix
            ,defaultWidth: config.defaultWidth
            ,defaultHeight: config.defaultHeight
        };

        var cnt = 0;
        _.forEach( fileObj.src, function( src ) {
	        cnt++;


            coloursAndSizes( config.defaultCol, src, config.items, config.tmpDir );
            copySafeSrc( config.defaultCol, src, config.svgDir );
            saveScss( config.includeCompassSpriteStyles, config.cssPrefix, config.cwd, config.scssOutput, config.items );

            svgToPng.convert( config.tmpDir, fileObj.dest, opts )
            .then( function( result , err ){
                if( err ) grunt.fatal( err );

                var pngDir = fileObj.dest + config.cssPrefix + "/";
                copyStandAlonePngs( config.items, pngDir, config.standAlonePngDir );

                if( cnt >= fileObj.src.length ) {
                    // empty the temp folder
                    grunt.file.delete( config.tmpDir, { force: true });

                    if(config.spriteUrl)   generateSprite( config.spriteUrl, config.cssPrefix, config.scssOutput, config.items, pngDir, done);
                    else                   done();
                }
            });
        });

	});


    function generateSprite( spriteUrl, cssPrefix, scssOutput, items, pngDir, done ) {

        var icons = [];
        items.forEach(function(item) {
            icons.push( pngDir + getFileBaseName(item) + '.png' );
        });

        spritesmith({ src: icons }, function(err, result) {

            if(err) throw err;

            fse.writeFileSync( pngDir + "sprite.png", result.image, 'binary' );

            var scss = fse.readFileSync( scssOutput );

            // console.log( result.coordinates );
            // console.log( result.properties );

            // Declare the sprite used as background image for all classes
            scss += "."+cssPrefix+
                        /*
                        // Actually, we don't need all the other classes, because the DOM elements should 
                        // contain the main sprite class as well as the icon class. So commenting out this part.

                        (function(coords) {
                            var rtn = "";
                            _.forEach(coords, function(imgObj, name) {

                                var lastSlashIndex = name.lastIndexOf("/");
                                var dotIndex = name.lastIndexOf(".png");

                                rtn += ", ."+cssPrefix+"-"+name.slice( lastSlashIndex+1, dotIndex );
                            });
                            return rtn;
                        })(result.coordinates)+
                        */
                    " {\n"+
                    "  background: url('"+spriteUrl+"') no-repeat;\n"+
                    "}\n\n";

            // Now declare the individual icon classes with coords on the sprite
            scss += (function(coords) {
                    var rtn = "";
                    _.forEach(coords, function(imgObj, name) {

                        var lastSlashIndex = name.lastIndexOf("/");
                        var dotIndex = name.lastIndexOf(".png");

                        if( imgObj.x !== 0 ) imgObj.x = imgObj.x * -1;
                        if( imgObj.y !== 0 ) imgObj.y = imgObj.y * -1;

                        rtn += "."+cssPrefix+"-"+name.slice( lastSlashIndex+1, dotIndex ) + " {\n";

                        rtn += "  background-position:"+imgObj.x+"px "+ imgObj.y+"px;\n";
                        rtn += "  width:"+imgObj.width+"px;\n";
                        rtn += "  height:"+imgObj.height+"px;\n";
                        rtn += "}\n\n";
                    });
                    return rtn;
                })(result.coordinates);

            fse.writeFileSync( scssOutput, scss );
            
            done();
        });
    }
    
    
    function copyStandAlonePngs( items, pngDir, standAlonePngDir ) {

        _.forEach( items, function( item ) {

            if( item.standAlone ) {

                var fileNameBase = getFileBaseName( item )
                    ,copyFromPath = pngDir + fileNameBase + ".png"
                    ,copyToPath = standAlonePngDir + fileNameBase + ".png";

                 grunt.file.copy( copyFromPath, copyToPath );
            }
        });
    }

    function getFileBaseName( item ) {

        if( item.class ) return item.class;

        // fileNameBase only gets used if item.class is not specified
        var fileNameBase = item.filename.replace(".svg", "") + "-w"+item.w +"-h"+item.h;
        if( item.strokeWidth )  fileNameBase += "-sw-"+item.strokeWidth;
        if( item.strokeCol )    fileNameBase += "-sc-"+item.strokeCol.split("#").join("");
        if( item.fillCol )      fileNameBase += "-fc-"+item.fillCol.split("#").join("");

        return fileNameBase;
    }

    // to be processed by svgToPng
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

                    contents = originalContents;

                    // must remove width and height attributes so they don't get added twice, which would cause an error in svgToPng
                    contents = removeAttr( "svg", "width", contents );
                    contents = removeAttr( "svg", "height", contents );

                    contents = contents.replace("<svg ", "<svg width='"+item.w+"' height='"+item.h+"' ");

                    // Fill and stroke colours will be made transparent, if no config value is given for them
                    contents = replaceTag( 'fill="#'+defaultCol+'"',    "fill",    (item.fillCol || "transparent"),   contents );
                    contents = replaceTag( 'stroke="#'+defaultCol+'"',  "stroke",  (item.strokeCol || "transparent"), contents );

                    /**
                     * If the svg uses the stroke value "0.1", we assume it is meant to be used with Grunt Badass.
                     * Then, if the config supplies a 'strokeWidth' property, we use it, otherwise, to avoid an svgToPng error,
                     * we give the stroke a tiny number ('almostZero') that will render invisible.
                     */
                    var almostZero = "0.0001";
                    contents = replaceTag( 'stroke-width="0.1"', "stroke-width", (item.strokeWidth || almostZero),  contents );

                    grunt.file.write( tmpDir + getFileBaseName(item) + ".svg", contents );
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

    function replaceTag( tag, attrName, val, contents ) {

        if( val ) {
            if( contents.indexOf( tag ) !== -1 )
                contents = contents.split( tag ).join( attrName + '="' + val + '"' );
        }

        return contents;
    }


    // copies original svgs to be processed by svgmin, removing references to BADASS for modern browsers
    function copySafeSrc( defaultCol, src, dest ) {

        grunt.file.recurse( src, function(abspath, rootdir, subdir, filename) {

            if( filename.indexOf(".svg") != -1 ) {
                var contents = grunt.file.read( abspath );

                contents = contents.split('stroke-width="0.1"').join("");
                contents = contents.split('stroke="#'+defaultCol+'"').join("");
                contents = contents.split('fill="#'+defaultCol+'"').join("");

                grunt.file.write( dest + filename, contents );
            }
        });
    }

    function saveScss( includeCompassSpriteStyles, cssPrefix, cwd, scssOutput, items ) {

        var scss = "";

        if( includeCompassSpriteStyles )
            scss = grunt.file.read( cwd + "tasks/resources/icons-compass-sprite.scss" )+"\n\n";

        scss += grunt.file.read( cwd + "tasks/resources/icons.css" );

        scss = _.template( scss, {cssPrefix: cssPrefix} ) + "\n\n";

        scss += getClassesByProp( cssPrefix, items, "fillCol", "fill", true );
        scss += getClassesByProp( cssPrefix, items, "strokeCol", "stroke", false );
        scss += getClassesByProp( cssPrefix, items, "strokeWidth", "stroke-width", false );

        // Think this does nothing
        // scss = scss.split( ALMOST_ZERO ).join("0");

        grunt.file.write( scssOutput, scss );
    }


    function getClassesByProp( cssPrefix, items, propName, cssPropName, inclNone ) {

        /**
         * 'inclNone' {boolean}
         * If true will place the property in even if it can't find the property in an object within the 'items' array.
         * It will put it in the css with the 'transparent' value.
         */

        // console.log( cssPrefix, items, propName, cssPropName, inclNone )

        var vals = _.uniq( _.pluck( items, propName ) )
            ,line1 = "\n"
            ,line2 = "\n\n";

        // console.log( vals );

        var rtnStr = "";
        _.forEach( vals, function( val ) {

            // must be a string, so not to be a falsey
            // if( inclNone && propName === "strokeWidth" && !val ) val = "0";

            // console.log( val, inclNone )
            if( val || !val && inclNone ) {

                _.forEach( items, function( item ) {

                    if( item[ propName ] === val ) {
                        rtnStr += "."+cssPrefix+"-" + item.class + ","+line1;
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

        // replace special characters that can cause problems in regex
        if( rxStart.indexOf("?") != -1 )    rxStart = rxStart.split("?").join("\\?");
        if( rxEnd.indexOf("?") != -1 )      rxEnd = rxEnd.split("?").join("\\?");

        if( rxStart.indexOf("*") != -1 )    rxStart = rxStart.split("*").join("\\*");
        if( rxEnd.indexOf("*") != -1 )      rxEnd = rxEnd.split("*").join("\\*");

        var rx = new RegExp( rxStart + "[\\d\\D]*?" + rxEnd, "g");

        // console.log( originalString.substr( rx ) );

        if(!replacementString) replacementString = "";

        var result;
        if( keepDelimeteres === true ) {
            result = originalString.replace( rx, rxStart + replacementString + rxEnd );
        } else {
            result = originalString.replace( rx, replacementString );
        }

        return result;
    }

    // Returns a 'tests' object for unit testing purposes only
    return {
        tests: {
            getClassesByProp: getClassesByProp
            ,replaceBetween: replaceBetween
            ,saveScss: saveScss
            ,copySafeSrc: copySafeSrc
            ,replaceTag: replaceTag
            ,removeAttr: removeAttr
            ,coloursAndSizes: coloursAndSizes
            ,getFileBaseName: getFileBaseName
            ,copyStandAlonePngs: copyStandAlonePngs
        }
    }
}