#!/bin/sh

TEST_COMPOSE="$(dirname "$0")/../docker-compose-api-tests.yml"
NODE_ENV=test docker compose -p tests -f "$TEST_COMPOSE" build
NODE_ENV=test docker compose -p tests -f "$TEST_COMPOSE" run api-tests-runner
exit $?
