#!/bin/bash

set -e

groupid=$(cat test-mock-server-group-pid)

kill -TERM -$groupid
rm test-mock-server-group-pid
