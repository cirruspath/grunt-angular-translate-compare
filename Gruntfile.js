/*
 * grunt-angular-translate-compare
 * https://github.com/cirruspath/grunt-angular-translate-compare
 *
 * Copyright (c) 2015 Nick Dresselhaus
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'lib/*.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp']
    },

    angular_translate_compare: {
      passing: {
        options: {
          baseLang: 'base',
          fatal: true
        },
        src: [
          'test/fixtures/base.json',
          'test/fixtures/base_clone.json'
        ]
      },
      failing: {
        options: {
          baseLang: 'base',
          fatal: false
        },
        src: [
          'test/fixtures/base.json',
          'test/fixtures/compare.json'
        ]
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'angular_translate_compare', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};