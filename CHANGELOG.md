# Changelog

## 2.2.0

- Add `--ignore` option.

## 2.1.0

- Add `--report` option.

## 2.0.0

- Make the plugin compatible with PHPCS 3.x. Since PHPCS breaks backward compatibity, `gulp-phpcs@2.0.0` **is not compatible** with PHPCS 2.x.


## 1.4.0

- Make "Fail" reporter log all the bad file names when `failOnFirst = false`

## 1.3.0

- Use "close" event instead of "exit" event on child PHPCS process.

## 1.2.0

- Add "failOnFirst" option to Fail reporter.
- Add "exclude" option.

## 1.1.1

- Fix `which` package dependency.

## 1.1.0

- Resolve real bin path (just like unix `which` does).

## 1.0.0

- Rewrite PHPCS runner.
- `error` field in `phpcsReport` object attached to checked file is now just a
  boolean true/false instead of Error instance.
- Human-readable error is thrown if PHPCS bin is unavailable.
- Add unit tests.
- Add File reporter.

## 0.7.0

- Add "sniffs" option.

## 0.6.0

- Add "colors" option.

## 0.5.0

- Add support for STDIN file exclude patterns.

## 0.4.0

- Add "showSniffCode" option.

## 0.3.0

- Add "encoding" option.

## 0.2.1

- Fix "package.json"

## 0.2.0

- Extract reporters from CLI runner.

## 0.1.0

- Initial release
