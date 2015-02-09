'use strict';

function parseAngularVariables(str) {
  // check for angular interpolation
  var index = 0,
    length = str.length,
    startSymbol = '{{',
    endSymbol = '}}';

  var vars = [];

  while (index < length) {
    var startIndex = str.indexOf(startSymbol, index);
    if (startIndex !== -1) {
      var endIndex = str.indexOf(endSymbol, startIndex + startSymbol.length);

      var v = str.substring(startIndex + startSymbol.length, endIndex)
        .trim();

      vars.push(v);

      index = endIndex + endSymbol.length;
    } else {
      index = length;
    }
  }

  return vars;

}

function parseMessageFormatVariables(str) {
  var vars = [];

  // guard against angular interpolations
  if (str.indexOf('{{') === -1) {

    var index = 0,
      length = str.length,
      startSymbol = '{',
      endSymbol = '}',
      delimiter = ',';

    while (index < length) {
      var startIndex = str.indexOf(startSymbol, index);
      if (startIndex !== -1) {
        // everything up to delimiter is the variable name

        var endSymbolIndex = str.indexOf(endSymbol, startIndex + startSymbol.length);
        var endDelimiterIndex = str.indexOf(delimiter, startIndex + startSymbol.length);

        if (endDelimiterIndex === -1) {
          endDelimiterIndex = Infinity;
        }

        var endIndex = Math.min(endSymbolIndex, endDelimiterIndex);

        var v = str.substring(startIndex + startSymbol.length, endIndex)
          .trim();

        vars.push(v);

        if (endIndex === endDelimiterIndex) {
          // we broke on a delimiter match, so we need to get through all the various plural definitions and whatnot
          var bracketIndex = 1; // 1 for the initial starting symbol
          index = endDelimiterIndex + 1;
          while (bracketIndex !== 0 && index < length) {
            if (str[index] === startSymbol) {
              bracketIndex++;
            } else if (str[index] === endSymbol) {
              bracketIndex--;
            }
            index++;
          }
        } else {
          // matched a simple case
          index = endIndex + endSymbol.length;
        }
      } else {
        index = length;
      }
    }
  }

  return vars;
}

module.exports = {
  angular: parseAngularVariables,
  messageformat: parseMessageFormatVariables
};