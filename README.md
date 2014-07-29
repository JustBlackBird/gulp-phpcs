# gulp-phpcs

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
        // Pass in options to the task
        .pipe(phpcs({
            bin: 'src/vendor/bin/phpcs',
            standard: 'PSR2',
            warningSeverity: 0
        }));
});
```


## API

### phpcs(options)

#### options.bin

Type `string`

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


## License

[MIT](http://opensource.org/licenses/MIT) © Dmitriy Simushev