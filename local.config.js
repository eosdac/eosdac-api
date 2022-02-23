module.exports = {
    fillClusterSize: 4,
    clusterSize: 10,
    mongo: {
        url: 'mongodb://localhost:27017',
        dbName: 'eosdac',
        traceCollection: 'traces',
        stateCollection: 'states'
    },
    amq: {
        connectionString: 'amqp://guest:guest@localhost/'
    },
    ws: {
        host: 'localhost',
        port: '3030'
    },
    ipc: {
        id: 'livenotifications',
        appspace: 'eosdac.'
    },
    eos: {
        chainId: "8be32650b763690b95b7d7e32d7637757a0a7392ad04f1c393872e525a2ce82b",
        endpoint: 'http://localhost:8888',
        wsEndpoint: 'ws://localhost:8080',
        msigContract: 'msig.world',
        dacGenesisBlock: 1,  // the first block that includes any dac contract actions including the initial setcode
        dacDirectoryContract: 'dacdirectory',
        dacMsigContract: 'dacmultisigs',
        legacyDacs: ['eos.dac'],
        dacDirectoryMode: 'all',
        dacDirectoryDacId: ''
    },
    logger: {
        level: "info",
        environment: "jungle",
        datadog: {
            apiKey: ""
        }
    }
};
