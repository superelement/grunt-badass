# grunt-badass

> Use SVG elements on modern browsers with sprite fallback for IE8, just using CSS classes and some conditional JS polyfilling.

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-badass --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-badass');
```

*This plugin was designed to work with Grunt 0.4.5. It will not work with v0.3.x.*

## 'badass' task
### src
> Local path to a folder containing `.svg` files

### dest
> Local path that you want all your generated files to be exported to

### options
#### items {array of objects}
> Each object in this array must follow this format.
```js
{ filename: "camera", class: "camera-cold", w: 50, h:44, fillCol: "#4183c4", standAlone: true }
```
- filename {string} - the name of the svg file without the extension.
- class {string} optional - the modified svg's name. This will be the css class name used and the file name for and pngs generated during the build. If omitted an auto-generated name will be created. Recommendation is to include this option.
- w {number} - width of the svg in pixels. It is up to you to work out the w/h ratio.
- h {number} - height of the svg in pixels. It is up to you to work out the w/h ratio.
- fillCol {string} optional - hex or css colour value that you want to replace the `#BADA55` fluro green with for the fill colour.
- strokeCol {string} optional - hex or css colour value that you want to replace the `#BADA55` fluro green with for the stroke colour.
- strokeWidth {string} optional - width in pixels of the stroke that you want to alter. If the stroke is set to `0.1pt` in the svg, it will be affected by this.
- standAlone {boolean} optional - if you want a copy of the png as a stand alone file as well. It will still be included in the sprite.

#### cssPrefix {string}
> A class prefix for your sprite's icons. Keep it short, as it will appear on all badass svg classes.

#### standAlonePngDir {string}
> Local path to the folder that will contain any icons marked as 'stand alone' (in each icon config you can set this with `standAlone:true`).

#### spriteUrl {string}
> The absolute path to your sprite, which will get embedded into your CSS or SCSS styles.

#### spriteOutput {string}
> The local path you want your sprite exported to, including the name of the sprite.

#### svgDir {string}
> Copies original svgs to be processed by svgmin, removing references to BADASS for modern browsers

#### includeCompassSpriteStyles {boolean}
> Default is false. Will add compass sprite snippet to top of scss. Only change this to true if your project uses compass sprites and you want to merge badass icons into the main project sprite.

#### stylesOutput {string}
> Local path to `.css` or `.scss` file that contains sprite data. If using compass sprites and scss, this should be a `.scss` file and `includeCompassSpriteStyles:true` option should also be set.

#### cwd
> Will default to the current working directory, but you can change it if you need to


### SVG naming convention
- File names will generate css class names as part of build. Please keep them short, all lowercase and without any spaces. They must fall within the regex 'a-z\-\_0-9' and not start with a number. 

### SVG definitions
These SVGs get processed into a single js `svgloader.js`, which dynamically embeds the SVG inline just after the body tag is opened.

The following markup must be placed in the markup just after the body tag is opened and must be loaded synchronously (a standard script tag is the easiest way).
```js
<span class="svgdefs"></span>
<script src="/path/to/svgloader.js"></script>
```

### Grunt Badass VS Font Awesome
Font Awesome offers similar advantages to Grunt Badass, when optimising icons:
- custom vector icons
- retina screen support
- single header request
- CSS colouring
- You can animate these colours using CSS in modern browsers (need to check if possible with FA).

But Font Awesome does have some drawbacks:
- Only a single colour change can be applied and it colours the entire vector image.
- Resizing by font-size is a bit awkward.
- Can be difficult to get pixel perfect positioning in some browsers, due to the fact that it is a font.

The one advantage Font Awesome has is that it supports IE6 & IE7, whereas Grunt Badass only supports IE8.

So, if you only have to support IE8 and up, plus anything above Android 2.3 (all other major browsers are supported), the advantages to Grunt Badass are as follows:
- Both fills and strokes can be changed with CSS on individual instances. 
- You can have multiple colours in an SVG too, but just alter one of the colours with CSS. This colour is configured using the hex value (a flouro-green) `#BADA55`.
- You can add descriptive titles to your SVG icons, which improves accessibility.
- SVGs are a standard way to implement vector images in modern browsers.
- The IE8 fallback uses a sprite, which also is small in filesize and has a single header request.


#### Resources:
- About inline SVGs and definitions
Scroll down to 'Using "inline" SVG' - http://css-tricks.com/using-svg/

- About loading SVGs with js
http://www.pencilscoop.com/2014/04/injecting-svg-with-javascript/

- About inline SVGs with the <symbol> tag
http://css-tricks.com/svg-symbol-good-choice-icons/

- SVGs vs Font Icons
http://ianfeather.co.uk/ten-reasons-we-switched-from-an-icon-font-to-svg/


## Limitations
- Currently only supports Adobe Illustrator SVGs
- You can only alter 1 fill and 1 stroke colour in each SVG instance. They can be different colours.

## Dependecies
- NodeJS/NPM
- GruntJS


## Release History

 * 2015-02-05   v0.1.3   Added tests for 'runSvgLoaderGruntTasks()' and included extra functionality, including UIDs, to it
 * 2015-01-29   v0.1.2   Removed 'svgDir' option and added svgo, svgstore and svgloader.js into the task. Unit tests still need updating. 
 * 2015-01-28   v0.1.1   Changed to "spritesmith". Added unit tests. Changed config variables a bit after writing tests. Separated scss styles for non-sass version.
 * 2015-01-12   v0.1.0   Open sourcing project for first time. Uses Ruby & Compass for sprite generation, but will likely be changed to "spritesmith" in near future.

---

Task submitted by [Jim Doyle](http://jimdoyle.com.au)
