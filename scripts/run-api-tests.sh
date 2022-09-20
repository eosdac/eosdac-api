#!/bin/sh

TEST_COMPOSE="$(dirname "$0")/../docker-compose-api-tests.yml"
NODE_ENV=test docker compose -f "$TEST_COMPOSE" build
NODE_ENV=test docker compose -f "$TEST_COMPOSE" up --force-recreate
exit $?
