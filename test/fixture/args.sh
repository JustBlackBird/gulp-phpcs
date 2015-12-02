#!/bin/bash

# Wait until stdin is closed.
cat > /dev/null
# Just output all arguments as string to stdout.
echo $*
# Pretend that passed in args are report about codding style problems.
exit 1
