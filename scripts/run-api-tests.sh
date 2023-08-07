#!/bin/sh

TEST_COMPOSE="$(dirname "$0")/../docker-compose-api-tests.yml"
ENVIRONMENT=test docker compose -f "$TEST_COMPOSE" build
ENVIRONMENT=test docker compose -f "$TEST_COMPOSE" up --force-recreate
exit $?
 