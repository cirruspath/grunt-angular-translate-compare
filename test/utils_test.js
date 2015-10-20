'use strict';

var grunt = require('grunt');

var utils = require('../lib/utils');

var parsers = require('../lib/var_parsers');
/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/


exports.flatten = {

  setUp: function(done) {
    this.flattened = utils.parseAndFlatten('test/fixtures/base.json');
    done();
  },

  flatten_single_key: function(test) {
    test.ok(this.flattened['SINGLE_KEY'], 'single key not present in map');
    test.done();
  },

  flatten_multi_key: function(test) {
    test.ok(this.flattened['MULTI_LEVEL.FIRST_KEY'], 'multi level keys not present in map');
    test.done();
  },

  flatten_all_strings: function(test) {
    for (var prop in this.flattened) {
      test.equal(typeof this.flattened[prop], 'string', 'all keys not strings');
    }
    test.done();
  }
};

exports.key_diff = {

  setUp: function(done) {
    this.flatBase = utils.parseAndFlatten('test/fixtures/base.json');
    this.flatCompare = utils.parseAndFlatten('test/fixtures/compare.json');
    done();
  },

  key_diff_same_keys: function(test) {
    var actual = utils.keyDiff(this.flatBase, this.flatBase);
    test.deepEqual(actual, [], 'fully matching keys return diffs');
    test.done();
  },

  key_diff_missing_keys: function(test) {
    var actual = utils.keyDiff(this.flatBase, this.flatCompare);
    test.deepEqual(actual, ['EXTRA_KEY', 'EMPTY_KEY'], 'unexpected mismatched keys returned');
    test.done();
  }
};

exports.compare_vars = {

  setUp: function(done) {
    this.flatBase = utils.parseAndFlatten('test/fixtures/base.json');
    this.flatCompare = utils.parseAndFlatten('test/fixtures/compare.json');
    done();
  },

  compare_vars_finds_parser_mismatch: function(test) {
    var actual = utils.compareVars(this.flatBase['ANGULAR_VARIABLE'], this.flatBase['MF_VARIABLE'], parsers);
    var expected = [{
      error: 'parser_mismatch'
    }];

    test.deepEqual(actual, expected, 'unexpected error object returned');
    test.done();
  },

  compare_vars_does_not_flag_mismatch_when_one_parser_not_found: function(test) {
    // missing_vars has no variables and should flag as missing_vars, not a parser_mismatch
    var actual = utils.compareVars(this.flatBase['MISSING_VARS'], this.flatCompare['MISSING_VARS'], parsers);
    test.equal(actual[0].error, 'missing_vars', 'unexpected error object returned');
    test.done();
  },

  compare_vars_no_errors_for_valid_keys: function(test) {
    var actual = utils.compareVars(this.flatBase['MF_VARIABLE'], this.flatCompare['MF_VARIABLE'], parsers);
    test.deepEqual(actual, [], 'unexpected error object returned');
    test.done();
  },

  compare_vars_finds_missing_vars: function(test) {
    var actual = utils.compareVars(this.flatBase['MISSING_VARS'], this.flatCompare['MISSING_VARS'], parsers);
    var expected = [{
      error: 'missing_vars',
      vars: ['var1', 'var2']
    }];

    test.deepEqual(actual, expected, 'unexpected error object returned');
    test.done();
  },

  compare_vars_finds_extra_vars: function(test) {
    var actual = utils.compareVars(this.flatBase['EXTRA_VARS'], this.flatCompare['EXTRA_VARS'], parsers);
    var expected = [{
      error: 'extra_vars',
      vars: ['variable']
    }];

    test.deepEqual(actual, expected, 'unexpected error object returned');
    test.done();
  }
};