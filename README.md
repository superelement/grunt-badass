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
TODO

### SVG naming convention
- File names will generate css class names as part of build. Please keep them short, all lowercase and without any spaces, hyphens or underscores. 

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

 * 2015-01-28   v0.1.1   Changed to "spritesmith". Added unit tests. Changed config variables a bit after writing tests. Separated scss styles for non-sass version.
 * 2015-01-12   v0.1.0   Open sourcing project for first time. Uses Ruby & Compass for sprite generation, but will likely be changed to "spritesmith" in near future.

---

Task submitted by [Jim Doyle](http://jimdoyle.com.au)
