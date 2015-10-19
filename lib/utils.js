'use strict';

var grunt = require('grunt');
var utils = module.exports;

utils.parseAndFlatten = function(file) {
  return utils.flatten(grunt.file.readJSON(file));
}

utils.flatten = function(obj) {

  var flattened = {};

  function f(obj, prefix) {
    for (var prop in obj) {
      var val = obj[prop];
      if (typeof(val) === 'string') {
        flattened[(prefix ? prefix + '.' : '') + prop] = val;
      } else {
        f(val, (prefix ? prefix + '.' : '') + prop);
      }
    }
  }

  f(obj, '');

  return flattened;
};

utils.keyDiff = function(a, b) {
  var props = [];

  for (var prop in a) {
    if (!b[prop] && a[prop].length>0) {
      props.push(prop);
    }
  }

  return props;
};

utils.compareVars = function(a, b, parsers) {
  function getVars(val) {

    // fidn the first parser that has any values
    for (var parserKey in parsers) {
      var parser = parsers[parserKey];
      var vars = parser(val);
      if (vars.length > 0) {
        return {
          parser: parserKey,
          vars: vars
        };
      }
    }

    return {
      parser: null,
      vars: []
    };
  }

  var aVars = getVars(a);
  var bVars = getVars(b);

  var errs = [];

  if (aVars.parser && bVars.parser &&
    aVars.parser !== bVars.parser) {
    errs.push({
      error: 'parser_mismatch'
    });
  } else {
    // check for mismatched variables

    var aClone = aVars.vars.slice(0);
    var bClone = bVars.vars.slice(0);

    var diff = function(a, b) {
      a.forEach(function(v, i) {
        while ((i = b.indexOf(v)) !== -1) {
          b.splice(i, 1);
        }
      });
    }

    diff(aVars.vars, bClone);
    diff(bVars.vars, aClone);

    if (bClone.length > 0) {
      errs.push({
        error: 'extra_vars',
        vars: bClone
      });
    }

    if (aClone.length > 0) {
      errs.push({
        error: 'missing_vars',
        vars: aClone
      });
    }
  }

  return errs;
}