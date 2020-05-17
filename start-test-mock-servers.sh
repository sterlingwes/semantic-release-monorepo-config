#!/bin/bash

set -e

setsid sh -c 'node ./tests/mocks/github.js & node ./tests/mocks/npm.js' &
groupid=$!

echo "$groupid" > test-mock-server-group-pid
echo "Mock servers running in background in process group $groupid"
echo "stop them both by running: yarn test:stop-mock-servers"
