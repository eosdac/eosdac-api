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
        connectionString: 'amqp://user:pass@host/vhost'
    },
    ws: {
        host: '127.0.0.1',
        port: '3030'
    },
    ipc: {
        id: 'livenotifications',
        appspace: 'eosdac.'
    },
    eos: {
        chainId: "e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473",
        endpoint: 'http://jungle2.eosdac.io:8882',
        wsEndpoint: 'ws://jungle2.eosdac.io:8080',
        msigContract: 'eosio.msig',
        dacGenesisBlock: 12345,  // the first block that includes any dac contract actions including the initial setcode
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
