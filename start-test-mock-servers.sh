#!/bin/bash

set -e

setsid sh -c 'node ./tests/mocks/github.js & node ./tests/mocks/npm.js & node ./tests/mocks/repo.js' &
groupid=$!

echo "$groupid" > test-mock-server-group-pid
echo "Mock servers running in background in process group $groupid"
echo "stop them both by running: ./stop-test-mock-servers.sh"
