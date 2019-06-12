
const {Api, JsonRpc} = require('eosjs');
const {TextDecoder, TextEncoder} = require('text-encoding');
const fetch = require('node-fetch');

class InterestedContracts {
    constructor({config, db}){
        this.interested_queue = new Map;
        this.config = config;
        this.db = db;
        this.interested_timeout = null;
        this.interested_contracts = new Set();
        this._auth_accounts = new Map();
        this._msig_contracts = new Map();
        this._custodian_contracts = new Map();

        this.rpc = new JsonRpc(config.eos.endpoint, {fetch});
        this.api = new Api({
            rpc: this.rpc,
            signatureProvider: null,
            chainId: config.chainId,
            textDecoder: new TextDecoder(),
            textEncoder: new TextEncoder(),
        });
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
        this._msig_contracts = new Map();
        this._custodian_contracts = new Map();
        this._auth_accounts = new Map();

        const res = await this.rpc.get_table_rows({
            code: this.config.eos.dacDirectoryContract,
            scope: this.config.eos.dacDirectoryContract,
            table: 'dacs'
        });

        res.rows.forEach((row) => {
            row.accounts.forEach((acnt) => {
                // console.log(`Adding ${acnt} to set`);
                this.interested_contracts.add(acnt.value);

                if (acnt.key === 3){ // multisig
                    this._msig_contracts.set(row.dac_name, acnt.value);
                }
                else if (acnt.key === 2){ // custodian
                    this._custodian_contracts.set(row.dac_name, acnt.value);
                }
                else if (acnt.key === 0){ // auth
                    this._auth_accounts.set(row.dac_name, acnt.value);
                }
            });
        });
    }

    auth_accounts() {
        return this._auth_accounts;
    }

    custodian_contracts() {
        return this._custodian_contracts;
    }

    msig_contracts() {
        return this._msig_contracts;
    }

    has(value) {
        return this.interested_contracts.has(value);
    }
}

module.exports = InterestedContracts;