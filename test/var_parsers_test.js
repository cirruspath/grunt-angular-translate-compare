'use strict';

var grunt = require('grunt');

var utils = require('../lib/utils');

var var_parsers = require('../lib/var_parsers');
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

exports.angular_parser = {

  setUp: function(done) {
    this.obj = utils.parseAndFlatten('test/fixtures/base.json');
    this.parser = var_parsers.angular;
    done();
  },

  finds_angular_variable: function(test) {
    test.expect(1);

    var actual = this.parser(this.obj['ANGULAR_VARIABLE']);
    test.deepEqual(actual, ['angularVar'], 'angular variable not found or misnamed');
    test.done();
  },

  does_not_find_messageformat: function(test) {
    test.expect(2);

    var actual = this.parser(this.obj['MF_VARIABLE']);
    test.deepEqual(actual, [], 'angular parser matched messageformat var');

    actual = this.parser(this.obj['MF_CALCULATED_VARIABLE']);
    test.deepEqual(actual, [], 'angular parser matched messageformat var');

    test.done();
  },

  does_not_find_phantoms: function(test) {
    var actual = this.parser(this.obj['SINGLE_KEY']);
    test.deepEqual(actual, [], 'angular parser found phantom variable');

    test.done();
  }
};

exports.messageformat_parser = {
  setUp: function(done) {
    this.obj = utils.parseAndFlatten('test/fixtures/base.json');
    this.parser = var_parsers.messageformat;
    done();
  },

  finds_simple_messageformat_variable: function(test) {
    test.expect(1);

    var actual = this.parser(this.obj['MF_VARIABLE']);
    test.deepEqual(actual, ['messageFormatVar'], 'mf variable not found or misnamed');
    test.done();
  },

  finds_multipart_messageformat_variable: function(test) {
    test.expect(2);

    var actual = this.parser(this.obj['MF_CALCULATED_VARIABLE']);
    test.deepEqual(actual, ['messageFormatVarMulti'], 'mf variable not found or misnamed');

    actual = this.parser(this.obj['MF_MULTI_VARIABLE']);
    test.deepEqual(actual, ['simpleVar', 'multiVar'], 'mf variable not found or misnamed');

    test.done();
  },

  does_not_find_angular: function(test) {
    var actual = this.parser(this.obj['ANGULAR_VARIABLE']);
    test.deepEqual(actual, [], 'mf parser matched angular var');

    test.done();
  },

  does_not_find_phantoms: function(test) {
    var actual = this.parser(this.obj['SINGLE_KEY']);
    test.deepEqual(actual, [], 'angular parser found phantom variable');

    test.done();
  }
};