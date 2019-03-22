module.exports = {
    redisPrefix: 'q',
    fillClusterSize: 4,
    clusterSize: 10,
    redis: {
        port: 6379,
        host: '127.0.0.1',
        auth: 'sooper-secret'
    },
    mongo: {
        url: 'mongodb://localhost:27017',
        dbName: 'eosdac',
        traceCollection: 'traces',
        stateCollection: 'states'
    },
    amq: {
        connectionString: 'amqp://user:pass@host/vhost'
    },
    eos: {
        contracts: ['kasdactokens', 'dacelections', 'eosdacdoshhq', 'dacmultisigs'],
        chainId: "e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473",
        endpoint: 'http://jungle2.eosdac.io:8882',
        wsEndpoint: 'ws://jungle2.eosdac.io:8080',
        msigContract: 'eosio.msig',
        custodianContract: 'daccustodian'
    }
}
