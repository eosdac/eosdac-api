module.exports = {
    fillClusterSize: 4,
    clusterSize: 10,
    mongo: {
        url: 'mongodb://eosdac-api-test-db:27017',
        dbName: 'eosdac',
        traceCollection: 'traces',
        stateCollection: 'states'
    },
    amq: {
        connectionString: 'amqp://guest:guest@eosdac-api-queue-1/'
    },
    ws: {
        host: 'eosdac-api-ws-1',
        port: '3030'
    },
    ipc: {
        id: 'livenotifications',
        appspace: 'eosdac.'
    },
    eos: {
        chainId: "8be32650b763690b95b7d7e32d7637757a0a7392ad04f1c393872e525a2ce82b",
        endpoint: 'https://wax.eosdac.io',
        wsEndpoint: 'ws://157.90.129.75:28080',
        wsEndpoints: ['ws://ship.alienworlds.io:28080'],
        msigContract: 'msig.worlds',
        custodianContract: 'dao.worlds',
        dacDirectoryContract: 'index.worlds',
        legacyDacs: ['eyeke'],
        dacDirectoryMode: 'all',
        dacDirectoryDacId: '',
        dacGenesisBlock: 105376981,
    },
    logger: {
        level: "info",
        environment: "test",
        datadog: {
            apiKey: ""
        }
    }
};