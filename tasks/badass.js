module.exports = function( grunt ) {
	"use strict";

    /**
     * TODO:
     * - add more checks for options and items and give errors or warnings
     * - maybe change dependant npm modules from `devDependencies` to `dependencies`, so they download when doing `npm install`. Need to check this.
     */



    var svgToPng = require('svg-to-png')
        ,spritesmith = require('spritesmith')
        ,fse = require("fs-extra")
        ,_ = require('lodash-node')
        ,SVGO = require('svgo');

    var svgoPlugins = [
        /**
         * Removed all 'convert' options as caused VERY weird error when deployed to UAT (production) apache server.
         * Certain combinations of numbers would display as ********** asterisk characters.
         * Didn't matter what the file type was either - tried .txt, .js, .css and .jsp.
         */
         { convertPathData: false }
        ,{ convertStyleToAttrs: false }
        ,{ convertTransform: false }
        ,{ convertShapeToPath: false }
        ,{
            // want to keep rounded edges on strokes
            removeUselessStrokeAndFill: false
        }
        ,{
            // want to keep stroke and fille "none" values
            removeUnknownsAndDefaults: false
        }
    ]

    grunt.registerMultiTask("badass", "Icon PNG fallback task", function() {


        var config = this.options({
            cssPrefix: "bad"
            ,standAlonePngDir: "./stand-alone-pngs/"
            ,spriteUrl: null
            ,spriteOutput: null
            // ,svgDir: "myicons-svgs/"
            ,stylesOutput: "_myicons.css"
            ,includeCompassSpriteStyles: false
            ,defaultWidth: "10px"
            ,defaultHeight: "10px"
            ,defaultCol: "BADA55"
            ,items: []
            ,tmpDir: "./tmp/"
            ,cwd: null
            ,svgoPlugins: svgoPlugins
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

        var svgDir = config.tmpDir + "svgs/";

        // Waits for all async 'done' callbacks to complete
        var doneCount = 0
        ,fullyDone = function() {
            doneCount++;
            if(doneCount>=2) {
                console.log( "log" );
                runSvgLoaderGruntTasks( config.cssPrefix, svgDir + "min/", fileObj.dest, config.tmpDir );
                done();
            }
        }

        var cnt = 0;
        _.forEach( fileObj.src, function( src ) {
            cnt++;

            checkCSSCompatibleFileNames( src );
            coloursAndSizes( config.defaultCol, src, config.items, svgDir + "unmin-coloured/" );
            copySafeSrc( config.defaultCol, src, svgDir, config.svgoPlugins, fullyDone );
            saveScss( config.includeCompassSpriteStyles, config.cssPrefix, config.cwd, config.stylesOutput, config.items );



            svgToPng.convert( svgDir + "unmin-coloured/", fileObj.dest, opts )
            .then( function( result , err ){
                if( err ) grunt.fatal( err );

                var pngDir = fileObj.dest + config.cssPrefix + "/";
                copyStandAlonePngs( config.items, pngDir, config.standAlonePngDir );

                if( cnt >= fileObj.src.length ) {
                    // empty the temp folder
                    // grunt.file.delete( config.tmpDir, { force: true });

                    if(!config.spriteUrl || !config.spriteOutput) {
                        grunt.log.warn( "'spriteUrl' or 'spriteOutput' not specified. No sprite generared." );
                        fullyDone();
                    }
                    else {
                        generateSprite( config.spriteUrl, config.spriteOutput, config.cssPrefix, config.stylesOutput, config.items, pngDir, function() {
                            fse.remove( pngDir, fullyDone );
                        });
                    }
                }
            });
        });

	});


    function checkCSSCompatibleFileNames( src ) {
        fse.readdirSync( src ).forEach(function(filename) {

            if( filename.lastIndexOf(".svg") !== filename.length-4 )
                throw new Error("SVG file '"+filename+"' name does not end in '.svg'. Please ensure it does.");

            if( filename !== filename.toLowerCase() )
                throw new Error("SVG file '"+filename+"' name contains upper case characters. They should be converted to lower case as it is not CSS friendly.");

            if( filename[0].match(/[0-9]/) )
                throw new Error("SVG file '"+filename+"' name contains a number as first character. This should be removed, as it is not CSS friendly.");

            if( filename[0].match(/[\-\_]/) )
                throw new Error("SVG file '"+filename+"' name contains an underscore or a dash as first character. This should be removed, as it is not CSS friendly.");

            if( filename.indexOf(" ") !== -1 )
                throw new Error("SVG file '"+filename+"' name contains a space. This is not CSS friendly. This should be removed, as it is not CSS friendly.");

            _.forEach(filename.split(".svg")[0], function(ch, i) {
                if( !ch.match(/[a-z\-\_0-9]/) ) {
                    throw new Error("SVG file '"+filename+"' name contains characters that are not CSS friendly. Stopping at character number "+i+" - '"+ch+"'.");
                }
            });
        });
    }


    function generateSprite( spriteUrl, spriteOutput, cssPrefix, stylesOutput, items, pngDir, done ) {

        var icons = [];
        items.forEach(function(item) {
            icons.push( pngDir + getFileBaseName(item) + '.png' );
        });

        spritesmith({ src: icons }, function(err, result) {

            if(err) throw err;

            fse.outputFileSync( spriteOutput, result.image, 'binary' );

            var scss = fse.readFileSync( stylesOutput );

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

            fse.outputFileSync( stylesOutput, scss );
            
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
	function coloursAndSizes( defaultCol, src, items, svgDir ) {

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

                    grunt.file.write( svgDir + getFileBaseName(item) + ".svg", contents );
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
    function copySafeSrc( defaultCol, src, svgDir, svgoPlugins, done ) {

        var svgo = new SVGO({ plugins:svgoPlugins });
        var totalCount = 0;
        var contentsArr = [];
        // var totalSaved = 0;

        grunt.file.recurse( src, function(abspath, rootdir, subdir, filename) {

            if( filename.indexOf(".svg") != -1 ) {

                totalCount++;

                var contents = grunt.file.read( abspath );

                contents = contents.split('stroke-width="0.1"').join("");
                contents = contents.split('stroke="#'+defaultCol+'"').join("");
                contents = contents.split('fill="#'+defaultCol+'"').join("");

                // if not using svgo, write svgs into svgDir
                grunt.file.write( svgDir + "unmin/" + filename, contents );

                contentsArr.push( {contents: contents, filename: filename} );
            }
        });

        var count = 0;
        contentsArr.forEach(function(obj) {
            
            svgo.optimize(obj.contents, function (result) {
                if (result.error) {
                    return grunt.warn('Error parsing SVG: ' + result.error);
                }

                grunt.file.write( svgDir + "min/" + obj.filename, result.data );

                count++;
                console.log( count, totalCount)
                if(count>=totalCount) {
                    console.log( "done")
                    done();
                }
            });
        });
    }

    function saveScss( includeCompassSpriteStyles, cssPrefix, cwd, stylesOutput, items ) {

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

        grunt.file.write( stylesOutput, scss );
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

    function runSvgLoaderGruntTasks( cssPrefix, svgDir, dest, tmpDir, cb ) {

        /**
         * This task only has a grunt implementation, so need to run it as a grunt task
         */

        grunt.loadNpmTasks("grunt-svgstore");

        var files = {};
        files[ tmpDir+"svgdefs.min.svg" ] = svgDir+"*.svg";

        grunt.config.data.svgstore = {
            badass: {
                options: {
                    prefix : cssPrefix+'-'
                }
                ,files: files
            }
        }

        grunt.registerTask("badass-post-svgstore", "Part of 'grunt-badass' plugin. Runs after 'svgstore:badass'.", function() {

            var contents = fse.readFileSync("tasks/resources/svgloader.js")
                ,svgDefs = fse.readFileSync(tmpDir+"svgdefs.min.svg");

            fse.removeSync( svgDir+"svgdefs.min.svg" );
            fse.removeSync( tmpDir );
            
            contents = _.template( contents, { "svgDefs":svgDefs } );

            fse.outputFileSync( dest + "svgloader.js", contents )

            if(cb) cb();
        });

        grunt.task.run(["svgstore:badass", "badass-post-svgstore"]);

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
            ,generateSprite: generateSprite
            ,checkCSSCompatibleFileNames: checkCSSCompatibleFileNames
            ,runSvgLoaderGruntTasks:runSvgLoaderGruntTasks
            ,svgoPlugins: svgoPlugins // just a var for reference in tests
        }
    }
}