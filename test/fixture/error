#!/bin/bash

# Wait until stdin is closed.
cat > /dev/null
# It's just an arbitrary text.
echo "This is a test error."
# PHPCS uses exit-codes greater than 1 to report about real errors.
exit 2
