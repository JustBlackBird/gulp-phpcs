@echo off

:: It's just an arbitrary text.
echo:This is a test error.
:: PHPCS uses exit-codes greater than 1 to report about real errors.
exit /b 3
