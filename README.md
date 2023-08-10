# DAO API v2.0.0

It provides DAO-specific API endpoints that allow developers to query the database and serve the data populated by its respective [history tools implementation](https://github.com/Alien-Worlds/aw-history-dao).

To learn more about history tools and how to read data from blockchain and populate into database, please refer to the respective repository [aw-history-dao](https://github.com/Alien-Worlds/aw-history-dao).

## API

The API uses [fastify](https://www.fastify.io/) as a web server technology and reads data from MongoDB. It serves the data populated by the [aw-history-dao](https://github.com/Alien-Worlds/aw-history-dao).

### Swagger Document

All the available endpoints are documented and served as a Swagger document. The Swagger document is auto generated based on Postman API collection and served on the `/v2/dao/docs` endpoint once the API is up and running.

DAO API Swagger document is available in the production environment at the following URL

> https://api.alienworlds.io/v2/dao/docs

## Environments

The DAO API is available in three environments - Production, Staging, and Development - each has its own purpose and is used for different stages of the development process.

1. **Production** (https://api.alienworlds.io)
   It is the live version of the API being used by end-users.

2. **Staging** (https://api-stage.alienworlds.io)
   It serves the upcoming release candidate API, where new features and changes are tested by the UI team before being deployed to Production environment.

3. **Development** (https://api-dev.alienworlds.io)
   It is used internally by the API development team to test new features and changes before deploying to staging environment. This environment may have more frequent updates and changes.

## Local Development Environment

### Prerequisites

Before running the API on your local machine, ensure that you have the following available:

1. [GitHub](https://github.com) account
2. [Node.js](https://nodejs.org/en)
3. Node package manager ([yarn](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable) or npm)
4. [MongoDB](https://www.mongodb.com/docs/manual/installation/) native installation or running inside a Docker container

#### Additional tools

Optionally, you can choose to install the following tools or any other alternatives.

1. [Compass](https://www.mongodb.com/products/compass) - The GUI for MongoDB
2. [Docker](https://www.docker.com/) to run API or services on which the API depends. It is also possible to run the API without using Docker when required services (e.g. MongoDB) are installed natively.

### Clone the repository

```
git clone https://github.com/Alien-Worlds/aw-api-dao.git
```

### Environment variables

You need a _.env_ file which contains all necessary environment configuration for DAO API. An example config file is available at _[.env.example](https://github.com/Alien-Worlds/aw-api-dao/blob/master/.env.example)_.

You can copy the example config and create a _.env_ file

```
cp .env.example .env
```

Afterwards, the newly created _.env_ file can be modified according to your needs.

#### Several environment configurations

You may create separate configuration files for each environment e.g. `.env.stage`, `.env.production` etc.

In each configuration file, the `ENVIRONMENT` key should contain the name of the environment which will later be used when starting the API.

### Build API

```
yarn
yarn build
```

### Start API

The API can be started locally by running the following command

```
yarn api:dev
```

The API will start on the URL `http://localhost:8800`, unless a different `PORT` is specified in the `.env` file.

The above command `yarn api:dev` starts the API in **watch mode**. On saving new changes in a file under _/src_ directory, it will rebuild and new changes will be served automatically.

#### Different environment configuration

You can switch between different configuration files by giving a different value to the environment variable `ENVIRONMENT`.

For example, if you have a `.env.production` config file, you can run the api using that config as follows

```
ENVIRONMENT=production yarn api
```

#### Start API using Docker

In order to start the services in docker, just use the command:

```
docker compose up --build
```

As already explained, you can use a different environment configuration file by providing the the environment name as variable e.g. if config file is `.env.production`, then the command will be

```
ENVIRONMENT=prod docker compose up --build
```

### Optional: Setting up a local blockchain for testing

```
git clone git@github.com:Alien-Worlds/eosdac-contracts.git
cd eosdac-contracts
yarn
yarn test
```

The command `yarn test` will build and start a docker container with a fresh blockchain, compile and deploy the eosdac-contracts and run the tests. The docker container will stay running and the nodeos API node of the blockchain will be exposed on port 8888. You can verify that the blockchain is running from the host system:

```
curl http://127.0.0.1:8888/v1/chain/get_info
```

It also creates a docker network named `lamington` that you can use to connect to the blockchain from other docker containers.

### Health Check

Once the API is running, you can perform a basic health check to ensure that everything is configured properly.

A `/health` endpoint is available and can be accessed at following path

> `/v2/dao/health`

e.g. health check for API running locally on port 8800 (http://localhost:8800/v2/dao/health)

```
curl --location 'http://localhost:8800/v2/dao/health'
```

If everything is fine, then you should be able to get a response similar to below

```
{
    "status": "OK",
    "version": "2.0.0",
    "timestamp": "2023-08-10T14:17:37.935Z",
    "uptimeSeconds": 2124,
    "nodeVersion": "v18.15.0",
    "dependencies": {
        "@alien-worlds/aw-antelope": "^0.0.40",
        "@alien-worlds/aw-contract-alien-worlds": "^0.0.24",
        "@alien-worlds/aw-contract-dao-worlds": "^0.0.32",
        "@alien-worlds/aw-contract-index-worlds": "^0.0.29",
        "@alien-worlds/aw-contract-stkvt-worlds": "^0.0.23",
        "@alien-worlds/aw-contract-token-worlds": "^0.0.32",
        "@alien-worlds/aw-core": "^0.0.15",
        "@alien-worlds/aw-storage-mongodb": "^0.0.10",
        "fastify": "^3.25.0",
    },
    "database": {
        "mongodb": "OK"
    },
    "historyApi": {
        "currentBlockNumber": "260412883",
        "status": "OK"
    }
}
```

## Postman API Collection

Postman API collection is placed in the directory

[`.postman/collections/aw-api-dao.postman_collection.json`](https://github.com/Alien-Worlds/aw-api-dao/blob/docs/postman/collections/aw-api-dao.postman_collection.json)

## Unit Tests

[Jest](https://jestjs.io/) is the unit testing framework of choice. Test suite can be executed by the command

```
yarn test:unit
```

Unit tests for the component to be tested are co-located under a sub-directory _`__tests__`_. By convention, all unit test files are suffixed with `*.unit.test.ts`

### Executing tests for a specific component

Unit tests can be executed for a single component of interest by specifying relative/absolute path to its directory.

The specified directory path will be taken as the starting point and test runner will execute unit tests placed under its sub-directory _`__tests__`_. Test runner will also include tests for any recursive sub-directories matching the criteria.

```
yarn test:unit -- <directory path>
```

For example, `yarn test:unit -- src/endpoints/custodians/domain`

## API Integration Tests

Integration or end-to-end test suite for API endpoints is also implemented using [Jest](https://jestjs.io/).

Each API response is validated against pre-defined JSON schema which determines the test result. We use [Ajv](https://ajv.js.org/) to validate API JSON response against the respective JSON schema. The JSON schemas are expected to follow JSON schema specification [2020-12](https://json-schema.org/specification.html).

For example, JSON response schema for `/health` endpoint can be found at [here](https://github.com/Alien-Worlds/aw-api-dao/blob/develop/src/endpoints/health/schemas/health.response.schema.json).

API Integration tests are suffixed with `*.api.test.ts` and are placed at

```
tests/api/*.api.test.ts
```

### How to run API Integration test suite?

Integration tests can be run either using Docker or without using Docker. We describe both approaches below

#### Executing API integration tests using Docker

Open a new terminal window. While being at the project root directory, run the following command in the terminal.

```
./scripts/run-api-tests.sh
```

#### Executing API integration tests natively

To run integration tests without using Docker, it is expected that the configured MongoDB instance is up and running.

Run the following command in terminal.

```
yarn test:api
```

## Generate Swagger Document

Swagger document is automatically generated based on Postman API collection using [postman-to-openapi](https://joolfe.github.io/postman-to-openapi) library.

After update in Postman collection _[(aw-api-dao.postman_collection.json)](https://github.com/Alien-Worlds/aw-api-dao/blob/develop/postman/collections/aw-api-dao.postman_collection.json)_, run the following command to update the Swagger document.

```
yarn docs:generate
```

Latest swagger document can be found at _[./docs/aw-api-dao-oas.yaml](https://github.com/Alien-Worlds/aw-api-dao/blob/develop/docs/aw-api-dao-oas.yaml)_.
