
const {Api, JsonRpc, Serialize} = require('eosjs');
const {TextDecoder, TextEncoder} = require('text-encoding');
const fetch = require('node-fetch');

class InterestedContracts {
    constructor({config, db}){
        this.interested_queue = new Map;
        this.config = config;
        this.db = db;
        this.interested_timeout = null;

        const rpc = new JsonRpc(config.eos.endpoint, {fetch});
        const api = new Api({
            rpc,
            signatureProvider: null,
            chainId: config.chainId,
            textDecoder: new TextDecoder(),
            textEncoder: new TextEncoder(),
        });

        this.api = api;
        this.rpc = rpc;
    }

    add(account, dac_name) {
        this.interested_contracts.add(account);

        if (!this.interested_queue.has(dac_name)){
            this.interested_queue.set(dac_name, new Set);
        }
        this.interested_queue.get(dac_name).add(account);
    }

    async reload() {
        this.interested_contracts = new Set();
        const res = await this.rpc.get_table_rows({
            code: this.config.eos.dacDirectoryContract,
            scope: this.config.eos.dacDirectoryContract,
            table: 'dacs'
        });

        res.rows.forEach((row) => {
            row.accounts.forEach((acnt) => {
                // console.log(`Adding ${acnt} to set`);
                this.interested_contracts.add(acnt.value);
            });
        });
    }

    has(value) {
        return this.interested_contracts.has(value);
    }
}

module.exports = InterestedContracts;