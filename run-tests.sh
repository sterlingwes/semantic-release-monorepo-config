#!/bin/bash

set -e

rm -rf mock-server-requests
mkdir mock-server-requests
./start-test-mock-servers.sh

node tests/setup
node tests/runner
node tests/teardown

./stop-test-mock-servers.sh
