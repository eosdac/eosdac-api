
const {Api, JsonRpc} = require('@jafri/eosjs2');
const {TextDecoder, TextEncoder} = require('text-encoding');
const fetch = require('node-fetch');
const {eosTableIter} = require('./eos-table');

class DacDirectory {
    constructor({config, db}){
        this.interested_queue = new Map;
        this.config = config;
        this.db = db;
        this.mode = config.eos.dacDirectoryMode || 'all';
        this.dac_id = config.eos.dacDirectoryDacId || '';
        this.interested_contracts = new Set();
        this._auth_accounts = new Map();
        this._msig_contracts = new Map();
        this._custodian_contracts = new Map();
        this._proposals_contracts = new Map();
        this._token_contracts = new Map();
        this._referendum_contracts = new Map();

        this.logger = require('./connections/logger')('dacdirectory', config.logger);

        this.rpc = new JsonRpc(config.eos.endpoint, {fetch});
        this.api = new Api({
            rpc: this.rpc,
            signatureProvider: null,
            chainId: config.chainId,
            textDecoder: new TextDecoder(),
            textEncoder: new TextEncoder(),
        });

        if (!this.config.eos.dacDirectoryContract && config.mode !== 'single'){
            throw new Error('You must specify eos.dacDirectoryContract in config');
        }
        else if (this.mode === 'single' && !this.dac_id){
            throw new Error('If you specify eos.dacDirectoryMode "single" then you must also supply eos.dacDirectoryDacId');
        }
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
        this._proposals_contracts = new Map();
        this._referendum_contracts = new Map();

        this.logger.info(`Reloading dacdirectory`);


        let res;
        const query_data = {
            api: this.api,
            code: this.config.eos.dacDirectoryContract,
            scope: this.config.eos.dacDirectoryContract,
            table: 'dacs',
            greed_factor: 1,
            primary_key: 'dac_id'
        };

        if (this.mode === 'single'){
            query_data.lower_bound = this.dac_id;
            query_data.upper_bound = this.dac_id;
            query_data.limit = 1;
            res = await this.rpc.get_table_rows(query_data);

            if (res.rows.length === 0){
                throw new Error(`DAC not found in directory`);
            }

            res.rows.forEach((row) => {
                row.accounts.forEach((acnt) => {this.add_account(acnt, row.dac_id)});
            });
        }
        else {
            const table_iter = new eosTableIter(query_data);

            for await (let row of table_iter){
                // console.log(row);
                row.accounts.forEach((acnt) => {this.add_account(acnt, row.dac_id)});
                // add the token contract
                // console.log(`Adding ${row.symbol.contract}`);
                this.add_account({value:row.symbol.contract, key:4}, row.dac_id);
            }

        }
    }

    add_account(acnt, dac_id){
        // console.log(`Adding ${acnt} to set`);
        this.interested_contracts.add(acnt.value);

        if (acnt.key === 3){ // multisig
            this._msig_contracts.set(dac_id, acnt.value);
        }
        else if (acnt.key === 2){ // custodian
            this._custodian_contracts.set(dac_id, acnt.value);
        }
        else if (acnt.key === 0){ // auth
            this._auth_accounts.set(dac_id, acnt.value);
        }
        else if (acnt.key === 6){ // proposals
            this._proposals_contracts.set(dac_id, acnt.value);
        }
        else if (acnt.key === 4){ // token
            this._token_contracts.set(dac_id, acnt.value);
        }
        else if (acnt.key === 10){ // referendum
            this._referendum_contracts.set(dac_id, acnt.value);
        }
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

    proposals_contracts() {
        return this._proposals_contracts;
    }

    token_contracts() {
        return this._token_contracts;
    }

    referendum_contracts() {
        return this._referendum_contracts;
    }

    has(value) {
        return this.interested_contracts.has(value);
    }
}

module.exports = DacDirectory;
