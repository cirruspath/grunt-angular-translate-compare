# grunt-angular-translate-compare

> Compares angular-translate translation files for missing keys and variables within those keys

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-angular-translate-compare --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-angular-translate-compare');
```

## The "angular_translate_compare" task

### Overview
In your project's Gruntfile, add a section named `angular_translate_compare` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  angular_translate_compare: {
    options: {
      baseLang: 'en', // the canonical language file to use as a base for comparison. languages determined by file name
      ext: 'json', // the file extensions to load,
      fatal: false, // whether this task should fail a build or not
      parsers: {} // additional parser functions for custom interpolations
    },
    src: 'locales/*.json' // file collection to use in comparison.  Base language file must be included in the collection
  }
});
```

### Options

#### options.baseLang
Type: `String`
Default value: `'en'`

The base language to do comparisons against.  This file represents what should be correct keys and variables.  It's usually your native language and the one you're adding strings to during development.

#### options.fatal
Type: `Boolean`
Default value: `false`

Whether or not this task should fail if there are errors in translations.  Error messages will be printed regardless.

#### options.parsers
Type: `Object`
Default value: `null`

Parsers for additional variable interpolations.  The Angular and MessageFormat interpolations that are standard in angular-translate are included already.  

The object keys are parser names, and the values are to be functions which take a single string, which will be the value from a translation file.  This function should return an array of variable names within the string.

Note that parsers do need to accomodate the other possible parsers to prevent possible false positives.  The included MessageFormat parser, for example, will match {varName} but not {{varName}}.

### Usage Examples

#### Sample Translation Files

Base ([test/fixtures/base.json](test/fixtures/base.json)):

```
{
  "SINGLE_KEY": "Test Key",
  "ANGULAR_VARIABLE": "This has an {{ angularVar }}-style variable in it",
  "MF_VARIABLE": "This has a {messageFormatVar}-style variable in it",
  "MF_CALCULATED_VARIABLE": "This has a multipart {messageFormatVarMulti, plural, one{foo} other{foos}}-style variable in it",
  "MF_MULTI_VARIABLE": "This has one {simpleVar} in it and one {multiVar, select, gender male{foo} female{fooette}} in it",
  "EXTRA_KEY": "This key is in the base, but not the comparison",
  "EMPTY_KEY": "This is only empty in the comparison",
  "MISSING_VARS": "This has two variables {{var1}} {{var2}} in it",
  "MISMATCHED_VARS": "{{ goodVarName }}",
  "EXTRA_VARS": "This does not have a variable",
  "MULTI_LEVEL": {
    "FIRST_KEY": "First Key"
  }
}
```

Comparison ([test/fixtures/compare.json](test/fixtures/compare.json)):

```
{
  "SINGLE_KEY": "Test Key",
  "ANGULAR_VARIABLE": "This has an {{ angularVar }}-style variable in it",
  "MF_VARIABLE": "This has a {messageFormatVar}-style variable in it",
  "MF_CALCULATED_VARIABLE": "This has a multipart {messageFormatVarMulti, plural, one{foo} other{foos}}-style variable in it",
  "MF_MULTI_VARIABLE": "This has one {simpleVar} in it and one {multiVar, select, gender male{foo} female{fooette}} in it",
  "EMPTY_KEY": "",
  "MISSING_VARS": "This is missing a variable",
  "EXTRA_VARS": "This has an extra {{variable}}",
  "MISMATCHED_VARS": "{{ barVarName }}",
  "MULTI_LEVEL": {
    "FIRST_KEY": "First Key"
  }
}
```

### Sample Output

When comparing the two translation files above, the output for the task would be:

```
Checking language 'compare'... ERROR
>> 'compare' is missing keys: 
>>    EXTRA_KEY
>>    EMPTY_KEY
>> 'compare' is missing variables in key 'MISSING_VARS' compared to base: 
>>    var1
>>    var2
>> 'compare' has extra variables in key 'MISMATCHED_VARS' compared to base: 
>>    badVarName
>> 'compare' is missing variables in key 'MISMATCHED_VARS' compared to base: 
>>    goodVarName
>> 'compare' has extra variables in key 'EXTRA_VARS' compared to base: 
>>    variable
```