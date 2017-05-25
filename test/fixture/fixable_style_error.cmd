@echo off

:: Resend stdin to stdout.
more
:: PHPCS uses exit-code = 1 to report about fixable style problems.
exit /b 1
