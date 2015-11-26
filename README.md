# gulp-phpcs [![NPM version](https://badge.fury.io/js/gulp-phpcs.png)](https://www.npmjs.org/package/gulp-phpcs)

> Gulp plugin for running [PHP Code Sniffer](https://github.com/squizlabs/PHP_CodeSniffer).


## Install

1. Install the plugin with the following command:

	```shell
	npm install gulp-phpcs --save-dev
	```

2. [Install PHP Code Sniffer](https://github.com/squizlabs/PHP_CodeSniffer#installation)


## Usage

```js
var gulp = require('gulp');
var phpcs = require('gulp-phpcs');

gulp.task('default', function () {
    return gulp.src(['src/**/*.php', '!src/vendor/**/*.*'])
        // Validate files using PHP Code Sniffer
        .pipe(phpcs({
            bin: 'src/vendor/bin/phpcs',
            standard: 'PSR2',
            warningSeverity: 0
        }))
        // Log all problems that was found
        .pipe(phpcs.reporter('log'));
});
```


## API

### phpcs(options)

#### options.bin

Type: `String`

Default: `'phpcs'`

PHP Code Sniffer executable.

#### options.severity

Type: `Integer`

The minimum severity required to display an error or warning.

This option is equivalent to Code Sniffer `--severity=<severity>` option.

#### options.warningSeverity

Type: `Integer`

The minimum severity required to display an error or warning.

This option is equivalent to Code Sniffer `--warning-severity=<severity>` option.

#### options.errorSeverity

Type: `Integer`

The minimum severity required to display an error or warning.

This option is equivalent to Code Sniffer `--error-severity=<severity>` option.

#### options.standard

Type: `String`

The name or path of the coding standard to use.

This option is equivalent to Code Sniffer `--standard="<standard>"` option.

#### options.encoding

Type: `String`

The encoding of the files being checked.

This option is equivalent to Code Sniffer `--encoding="<encoding>"` option.

#### options.showSniffCode

Type: `Boolean`

Display sniff codes in the report.

This option is equivalent to Code Sniffer `-s` option.

#### options.sniffs

Type: `Array`

Filter for executed Sniffs

This option is equivalent to Code Sniffer `--sniffs` option.

#### options.colors

Type: `Boolean`

Pass colorized output of Code Sniffer to reporters.

This option is equivalent to Code Sniffer `--colors` option.

**Warning**: This options is only compatible with 2.x branch of Code Sniffer.

#### options.report

Type: `String`

Pass the type of the report which sould be generated.

#### options.reportFile

Type: `String`

Path where the generated report should be stored.

### phpcs.failOnError(type)

Loads one of the fail reporters that shipped with the plugin (see below).

#### type

Type: `String`

Default: 'fail'

The type of the reporter that should be loaded.


## Fail on Error

The plugin only pass files through PHP Code Sniffer. To process the results of
the check and notify about an error one should use a fail reporter. Fail reporters are plugins too, so one can pipe a files stream to them. Several fail reporters can be used on a stream, just like any other plugins.

These fail reporters are shipped with the plugin:

1. Fail reporter - fails if a problem was found. Use `phpcs.failOnError()`
to load it.

2. Log reporter - outputs all problems to the console. Use
`phpcs.reporter('log')` to load it.


## License

[MIT](http://opensource.org/licenses/MIT) © Dmitriy Simushev
