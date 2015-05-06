# Badass SVG

## Description
This is an attempt to write 'Grunt Badass' as node module as that doesn't depend on Grunt. Then it would be easier to build a Gulp plugin around it as well.

## Features
### Gulp considerations
Some features would become optional and removed for the Gulp version, as they would be used in separate plugins, such as listed below:
- sprite image compression - gulp-imagemin

### Removing certain options
- Compass sprite option seems a bit pointless. Will document how to add compass support, but doesn't need to be included.

### SVG Store
- As this plugin only exists as Grunt and Gulp plugins, a fork of the Gulp version will need to be created to remove the Gulp dependency. It's a pretty simple plugin, so this shouldn't be too hard.

### No JS SVG template
- At the moment there is a handlebars template helper. Keep this (as an option), but also create a template for ejs and jade.

### Html5 Shiv
Update this to the latest version of the Shiv, in case somethings has been updated. Document that it is only needed if supporting ie8.

### Old browsers
Experiment with ie7 support.

### Research
- Look into accessibility benefits of SVGs and document them.

## Improvements
- start using promises