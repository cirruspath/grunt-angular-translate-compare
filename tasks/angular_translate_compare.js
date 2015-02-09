/*
 * grunt-angular-translate-compare
 * https://github.com/cirruspath/grunt-angular-translate-compare
 *
 * Copyright (c) 2015 Nick Dresselhaus
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');
var utils = require('../lib/utils');
var parsers = require('../lib/var_parsers.js');

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks
  grunt.registerMultiTask('angular_translate_compare',
    'Compares angular-translate translation files for missing keys and variables within those keys',
    function() {

      var options = this.options({
        baseLang: 'en',
        ext: 'json'
      });

      // if the user specified additional parsers, clone over
      if (options.parsers) {
        var newParsers = {};
        for (var parserKey in parsers) {
          newParsers[parserKey] = parsers[parserKey];
        }

        for (parserKey in options.parsers) {
          var parser = options.parsers[parserKey];
          if (typeof parser === 'function') {
            newParsers[parserKey] = parser;
          }
        }

        parsers = newParsers;
      }

      function warn(text) {
        // if options.outputFile ...

        if (!Array.isArray(text)) {
          text = [text];
        }

        text.forEach(function(t) {
          grunt.log.error(t);
        });

        return !options.fatal;
      }

      var baseFile = null;
      var otherFiles = [];

      this.filesSrc.forEach(function(file) {
        if (path.basename(file, '.' + options.ext) === options.baseLang) {
          baseFile = file;
        } else if (path.extname(file) === '.' + options.ext) {
          otherFiles.push(file);
        }
      });

      if (!baseFile || !grunt.file.exists(baseFile)) {
        return warn('Base translation file \'' + options.baseLang + '.' + options.ext + '\' not found.');
      }

      // find missing vars between the base and all langs

      var baseTranslation = utils.parseAndFlatten(baseFile);

      var hasErrors = false;

      otherFiles.forEach(function(file) {
        var lang = '\'' + path.basename(file, '.' + options.ext) + '\'';
        var translation = utils.parseAndFlatten(file);

        grunt.log.write('Checking language ' + lang + '... ');

        var langResults = [];

        // find missing keys compared to base
        var keyDiff = utils.keyDiff(baseTranslation, translation);
        if (keyDiff.length > 0) {
          langResults.push(lang + ' is missing keys: \n\t' + grunt.log.wordlist(keyDiff, {
            separator: '\n\t'
          }));
        }

        for (var key in baseTranslation) {
          /* jshint loopfunc:true */
          // empty/missing translations handled above
          if (translation[key]) {

            var comparison = utils.compareVars(baseTranslation[key], translation[key], parsers);

            var keyText = '\'' + key + '\'';

            var errs = comparison.map(function(result) {
              switch (result.error) {
                case 'parser_mismatch':
                  return lang + ' does not appear to use the same parser for as base for key ' + keyText;
                case 'extra_vars':
                  return lang + ' has extra variables in key ' + keyText + ' compared to base: \n\t' + grunt.log.wordlist(result.vars, {
                    separator: '\n\t'
                  });
                case 'missing_vars':
                  return lang + ' is missing variables in key ' + keyText + ' compared to base: \n\t' + grunt.log.wordlist(result.vars, {
                    separator: '\n\t'
                  });
                default:
                  return result.error;
              }
            });

            if (errs.length > 0) {
              langResults = langResults.concat(errs);
            }
          }
        }

        if (langResults.length > 0) {
          grunt.log.error();
          warn(langResults);
          hasErrors = true;
        } else {
          grunt.log.ok();
        }
      });

      if (!hasErrors) {
        grunt.log.ok('No errors found!');
        return true;
      } else {
        if (!options.fatal) {
          grunt.log.writeln();
          grunt.log.warn('There were errors, but the \'fatal\' option was not specified, so this task did not fail');
        }
        return !options.fatal;
      }
    });
};