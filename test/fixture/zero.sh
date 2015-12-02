#!/bin/bash

# Wait until stdin is closed.
cat > /dev/null
# The script exits with zero exit code. The message it sends to stdout has
# no meaning.
echo "This script ends up with zero exit-code."
