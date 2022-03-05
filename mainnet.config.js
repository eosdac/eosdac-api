module.exports = {
    // redisPrefix: 'q',
    fillClusterSize: 10,
    clusterSize: 6,
    // redis: {
    //     port: 6379,
    //     host: '169.56.83.184',
    //     auth: ''
    // },
    mongo: {
        url: 'mongodb://eosdac-api-db-1:27017',
        dbName: 'alienworlds_dao_mainnet',
        traceCollection: 'traces',
        stateCollection: 'states'
    },
    amq: {
        connectionString: 'amqp://guest:guest@eosdac-api-queue-1/'
    },
    ws: {
        host: 'eosdac-api-ws-1',
        port: '3031'
    },
    ipc: {
        id: 'livenotifications',
        appspace: 'alienworlds_mainnet.'
    },
    eos: {
        // contracts: ['token.worlds', 'dao.worlds', 'msig.worlds', 'alien.worlds', 'eyeke.world', 'kavian.world', 'magor.world', 'naron.world', 'neri.world', 'veles.world'],
        chainId: "8be32650b763690b95b7d7e32d7637757a0a7392ad04f1c393872e525a2ce82b",
        //        endpoint: 'http://127.0.0.1:38888',
        //        wsEndpoint: 'ws://127.0.0.1:38080',
        //        wsEndpoints: ['ws://127.0.0.1:38080'],
        endpoint: 'https://wax.eosdac.io',
        wsEndpoint: 'ws://157.90.129.75:28080',
        wsEndpoints: ['ws://ship.alienworlds.io:28080'],
        msigContract: 'msig.worlds',
        custodianContract: 'dao.worlds',
        dacDirectoryContract: 'index.worlds',
        legacyDacs: ['eos.dac'],
        // the first block that includes any dac contract actions including the initial setcode
        // dao.worlds contract was first set 105376981 
        // 105578904 - first stprofile block
        dacGenesisBlock: 105376981,
    },
    "logger": {
        "level": "info",
        "environment": "waxmainnet",
        "datadog": {
            "apiKey": ''
        }
    }
}