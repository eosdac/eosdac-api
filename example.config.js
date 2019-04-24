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
    eos: {
        contracts: ['kasdactokens', 'dacelections', 'eosdacdoshhq', 'dacmultisigs'],
        chainId: "e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473",
        endpoint: 'http://jungle2.eosdac.io:8882',
        wsEndpoint: 'ws://jungle2.eosdac.io:8080',
        authContract: 'dacauthority',
        msigContract: 'eosio.msig',
        custodianContract: 'daccustodian',
        dacMsigContract: 'dacmultisigs',
        proposalsContract: 'dacproposals'
    }
};
