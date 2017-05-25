@echo off

:: Resend stdin to stdout.
more
:: PHPCS uses exit-code = 1 to report about style problems.
exit /b 2
