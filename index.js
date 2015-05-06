'use strict';

var svgToPng = require('svg-to-png')
	,spritesmith = require('spritesmith')
	,fse = require("fs-extra")
	,_ = require('lodash-node')
	,SVGO = require('svgo')


function svgbadass() {

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


function saveScss( includeCompassSpriteStyles, cssPrefix, stylesOutput, items ) {

    var scss = "";

    if( includeCompassSpriteStyles )
        scss = fse.readFileSync( getResourcesDir() + "icons-compass-sprite.scss" ).toString()+"\n\n";

    scss += fse.readFileSync( getResourcesDir() + "icons.css" ).toString();

    scss = _.template( scss, {cssPrefix: cssPrefix} ) + "\n\n";

    scss += getClassesByProp( cssPrefix, items, "fillCol", "fill", true );
    scss += getClassesByProp( cssPrefix, items, "strokeCol", "stroke", false );
    scss += getClassesByProp( cssPrefix, items, "strokeWidth", "stroke-width", false );

    // Think this does nothing
    // scss = scss.split( ALMOST_ZERO ).join("0");

    fse.outputFileSync( stylesOutput, scss );
}

// copies original svgs to be processed by svgo, removing references to BADASS for modern browsers
function svgMin( defaultCol, src, svgDir, _svgoPlugins, done ) {

    var svgo = new SVGO({ plugins: _svgoPlugins });
    var totalCount = 0;
    var contentsArr = [];
    // var totalSaved = 0;

    src = ensureTrailingSlash( src );

    fse.readdirSync( src ).forEach(function(filename) {

        if( filename.indexOf(".svg") != -1 ) {

            totalCount++;

            var contents = fse.readFileSync( src + filename ).toString();

            contents = contents.split('stroke-width="0.1"').join("");
            contents = contents.split('stroke="#'+defaultCol+'"').join("");
            contents = contents.split('fill="#'+defaultCol+'"').join("");

            // if not using svgo, write svgs into svgDir
            fse.outputFileSync( svgDir + "unmin/" + filename, contents );

            contentsArr.push( {contents: contents, filename: filename} );
        }
    });

    var count = 0;
    contentsArr.forEach(function(obj) {
        
        svgo.optimize(obj.contents, function (result) {
            if (result.error) throw new Error('Error parsing SVG: ' + result.error );

            fse.outputFileSync( svgDir + "min/" + obj.filename, result.data );

            count++;
            // console.log( count, totalCount)
            if(count>=totalCount) {
                // console.log( "done")
                done();
            }
        });
    });
}

function getModuleDir() {
    if( fse.existsSync("./node_modules/svgbadass/") ) 
        return "./node_modules/svgbadass/"

    return "./";
}

function getResourcesDir() {
    return getModuleDir() + "tasks/resources/";
}

function ensureTrailingSlash( path ) {
	if( path[path.length-1] !== "/" ) path += "/";
	return path;
}

module.exports.svgbadass = svgbadass;
module.exports.testableMethods = {
	replaceBetween: replaceBetween
	,getClassesByProp: getClassesByProp
	,saveScss: saveScss
	,svgMin: svgMin
}