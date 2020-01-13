const {loadConfig} = require('../functions');

const IPCClient = require('../ipc-client');



class NewPeriodHandler {

    constructor(config) {
        this.config = config;
        this.logger = require('../connections/logger')('watcher-multisig', config.logger);

        if (config.ipc){
            this.ipc = new IPCClient(config.ipc);
        }
    }

    async action({doc, dac_directory, db}) {
        const custodian_contracts = Array.from(dac_directory.custodian_contracts().values());

        if (custodian_contracts.includes(doc.action.account) && doc.action.name === 'newperiode') {
            console.log(`NEWPERIOD`);
            if (this.ipc){
                this.ipc.send_notification({notify: 'NEW_PERIOD', dac_id:doc.action.data.dac_id, trx_id: doc.trx_id});
            }
        }
    }

    async delta({doc, dac_directory, db}){}

    async replay() {}
}

const config = loadConfig();
module.exports = new NewPeriodHandler(config);
