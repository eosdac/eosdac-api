const connectMongo = require('../connections/mongo');
const {loadConfig} = require('../functions');

const {TextDecoder, TextEncoder} = require('text-encoding');
const {Api, JsonRpc} = require('eosjs');
const fetch = require('node-fetch');

const config = loadConfig();

const eosTableAtBlock = require('../eos-table');


class MultisigProposalsHandler {

    constructor() {
        this.config = loadConfig();
        this.db = connectMongo(config);

        this.msig_contract = config.eos.msigContract || 'eosio.msig';
        this.auth_account = config.eos.authContract || 'dacauthority';
        this.custodian_contract = config.eos.custodianContract || 'daccustodian';
        this.dac_multisig_contract = config.eos.dacMsigContract || 'dacmultisigs';

        this.dac_config = null;

        const rpc = new JsonRpc(this.config.eos.endpoint, {fetch});
        this.api = new Api({
            rpc,
            signatureProvider: null,
            chainId: this.config.chainId,
            textDecoder: new TextDecoder(),
            textEncoder: new TextEncoder(),
        });
    }

    async thresholdFromName(name){
        // console.log(`Getting threshold ${name}`)
        return new Promise(async (resolve, reject) => {
            if (!this.dac_config){
                const table_rows_req = {code:this.custodian_contract, scope:this.custodian_contract, table:'config'};
                const dac_config = await this.api.rpc.get_table_rows(table_rows_req);
                this.dac_config = dac_config.rows[0];
            }

            switch (name) {
                case 'low':
                    resolve(this.dac_config.auth_threshold_low);
                    break;
                case 'med':
                    resolve(this.dac_config.auth_threshold_mid);
                    break;
                case 'high':
                case 'active':
                    resolve(this.dac_config.auth_threshold_high);
                    break;
                default:
                    reject(`Unknown permission name "${name}"`);
            }
        });
    }

    async permissionToThreshold(perm) {
        return new Promise(async (resolve) => {
            const self = this;

            if (perm.actor === this.auth_account) {
                resolve(await this.thresholdFromName(perm.permission))
            } else {
                // get the account and follow the tree down
                const acct = await this.api.rpc.get_account(perm.actor);
                // console.log(acct)
                const thresholds = [];

                for (let p = 0; p < acct.permissions.length; p++) {
                    const act_perm = acct.permissions[p];
                    // console.log(act_perm);

                    if (act_perm.perm_name === perm.permission) {
                        // console.log(act_perm, act_perm.required_auth.accounts)

                        if (act_perm.required_auth.accounts.length === 0) {
                            resolve(0)
                        }


                        for (let a = 0; a < act_perm.required_auth.accounts.length; a++) {
                            const perm = act_perm.required_auth.accounts[a];
                            // console.log('getting permission', perm)
                            const p = await self.permissionToThreshold(perm.permission);
                            thresholds.push(p)
                        }

                        // console.log('thresholds', thresholds, Math.max(...thresholds))

                    }
                }

                if (!thresholds.length) {
                    resolve(0)
                } else {
                    resolve(Math.max(...thresholds))
                }
            }
        })

    }

    async getTrxThreshold(trx) {
        const self = this;
        const thresholds = [];

        return new Promise(async (resolve, reject) => {
            if (!trx || !trx.actions) {
                console.error(`Bad transaction`, trx);
                reject(new Error('Bad transaction'));
            }

            for (let a = 0; a < trx.actions.length; a++) {
                const act = trx.actions[a];

                for (let p = 0; p < act.authorization.length; p++) {
                    const perm = act.authorization[p];

                    thresholds.push(await self.permissionToThreshold(perm))
                }
                // console.log(thresholds);

                resolve(Math.max(...thresholds))
            }
        })
    }

    async replay() {
        this.db.then(async (mongo) => {
            const db = mongo.db(this.config.mongo.dbName);
            const collection = db.collection('multisigs');
            const collection_actions = db.collection('actions');

            console.log('Removing existing entries');
            await collection.deleteMany({});
            // console.log(await collection.find({}).count());

            const res = collection_actions.find({
                'action.account': this.dac_multisig_contract,
                'action.name': 'proposed'
            }).sort({block_num: 1});
            let doc;
            let count = 0;
            while (doc = await res.next()) {
                await this.recalcMsigs(doc);
                count++
            }

            console.log(`Imported ${count} multisig documents`);
        })
    }

    async recalcMsigs(doc) {
        // console.log('Recalc', doc)

        const mongo = await this.db;
        const db = mongo.db(this.config.mongo.dbName);
        const coll = db.collection('multisigs');
        const coll_actions = db.collection('actions');

        if (doc.action.name !== 'proposed'){
            // find the original proposed
            const doc_proposed = await coll_actions.findOne({
                'action.account': this.dac_multisig_contract,
                'action.name': 'proposed',
                'action.data.proposal_name': doc.action.data.proposal_name,
                'action.data.proposer': doc.action.data.proposer,
                'block_num': {$lt:doc.block_num}
            });

            return await this.recalcMsigs(doc_proposed);
        }

        const block_num = doc.block_num;
        const block_timestamp = doc.block_timestamp;
        const proposer = doc.action.data.proposer;
        const proposal_name = doc.action.data.proposal_name;

        const output = {
            block_num,
            block_timestamp,
            proposer,
            proposal_name,
            threshold: 0,
            requested_approvals: [],
            provided_approvals: [],
            status: MultisigProposalsHandler.STATUS_OPEN
        };

        if (doc.action.data.metadata) {
            let metadata = '';
            try {
                metadata = JSON.parse(doc.action.data.metadata)
            } catch (e) {
                try {
                    const dJSON = require('dirty-json');
                    metadata = dJSON.parse(doc.action.data.metadata);
                    console.log(`Used dirty-json to parse ${doc.action.data.metadata}`)
                } catch (e) {
                    metadata = {title: '', description: ''};
                    console.error('Failed to parse metadata', doc.action.data.metadata, e.message)
                }
            }

            output.title = metadata.title;
            output.description = metadata.description
        }


        console.log(`parsed ${block_num}:${proposer}:${proposal_name}`);

        const data_query = {
            proposal_name
        };
        const local_data_query = {
            proposalname: proposal_name
        };

        let check_block = block_num + 1;
        if (['cancelled', 'executed'].includes(doc.action.name)) {
            check_block = block_num - 1
        }

        const res_proposals = await eosTableAtBlock({
            db,
            code: this.msig_contract,
            scope: proposer,
            table: 'proposal',
            block_num: check_block,
            data_query
        });
        const res_approvals = await eosTableAtBlock({
            db,
            code: this.msig_contract,
            scope: proposer,
            table: 'approvals',
            block_num: check_block,
            data_query
        });

        const proposal = res_proposals.results[0];
        if (!proposal) {
            console.error(`Error getting proposal`);
            return
        }
        // console.log(proposal.block_num, proposal.data.proposal_name, proposal.data.packed_transaction)
        output.trx = await this.api.deserializeTransactionWithActions(proposal.data.packed_transaction);

        // get the trxid stored in the dacmultisigs table
        const res_data = await eosTableAtBlock({
            db,
            code: this.dac_multisig_contract,
            scope: proposer,
            table: 'proposals',
            block_num: check_block,
            data_query: local_data_query
        });
        output.trxid = res_data.results[0].data.transactionid;


        if (res_approvals.count) {
            output.requested_approvals = res_approvals.results[0].data.requested_approvals
        }


        // We have the transaction data, now get approvals
        // Get threshold
        output.threshold = await this.getTrxThreshold(output.trx);
        output.expiration = new Date(output.trx.expiration);


        // console.log(proposer, proposal_name, output)

        // Get the current state by getting cancel/exec/clean transactions
        const closing_query = {
            'block_num': {$gt: block_num},
            'action.account': this.dac_multisig_contract,
            'action.name': {$in: ['cancelled', 'executed', 'clean']},
            'action.data.proposal_name': proposal_name,
            'action.data.proposer': proposer
        };
        const closing_actions = await coll_actions.find(closing_query).sort({block_num: 1});

        const ca = await closing_actions.next();
        if (ca) {
            switch (ca.action.name) {
                case 'cancelled':
                    output.status = MultisigProposalsHandler.STATUS_CANCELLED;
                    break;
                case 'executed':
                    output.status = MultisigProposalsHandler.STATUS_EXECUTED;
                    break;
                case 'clean':
                    output.status = MultisigProposalsHandler.STATUS_EXPIRED;
                    break
            }

            output.block_num = ca.block_num
        }


        if (output.expiration < new Date() && output.status === MultisigProposalsHandler.STATUS_OPEN){
            output.status = MultisigProposalsHandler.STATUS_EXPIRED;
        }


        // Get the latest provided approvals
        let end_block = 0;
        if (ca) {
            end_block = ca.block_num - 1
        }
        const query_provided = {db: db, code: this.msig_contract, scope: proposer, table: 'approvals', data_query};
        if (end_block) {
            query_provided.block_num = end_block
        }
        // console.log('Querying approvals', query_provided);

        const provided = await eosTableAtBlock(query_provided);
        if (provided.count) {
            // console.log('Provided approvals', provided.results[0].data.provided_approvals);
            output.provided_approvals = provided.results[0].data.provided_approvals
        } else {
            // console.log('Resetting provided_approvals');
            output.provided_approvals = []
        }

        // remove provided approvals from requested approvals
        const provided_actors = output.provided_approvals.map((pro) => {
            return pro.actor;
        });
        output.requested_approvals = output.requested_approvals.filter((req) => {
            return !provided_actors.includes(req.actor);
        });


        // console.log(`Inserting ${proposer}:${proposal_name}:${output.trxid}`, output);
        return await coll.updateOne({proposer, proposal_name, trxid: output.trxid}, {$set: output}, {upsert: true})

    }

    async action(doc) {
        if (doc.action.account === this.dac_multisig_contract) {
            console.log('Reacting to msig action');
            this.recalcMsigs(doc)
        }
    }
}


MultisigProposalsHandler.STATUS_CANCELLED = 0;
MultisigProposalsHandler.STATUS_OPEN = 1;
MultisigProposalsHandler.STATUS_EXECUTED = 2;
MultisigProposalsHandler.STATUS_EXPIRED = 3;

module.exports = new MultisigProposalsHandler();