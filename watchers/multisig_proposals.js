const connectMongo = require('../connections/mongo');
const {loadConfig} = require('../functions');

const {TextDecoder, TextEncoder} = require('text-encoding');
const {Api, JsonRpc} = require('eosjs');
const fetch = require('node-fetch');
const {IPC} = require('node-ipc');

const config = loadConfig();

const {eosTableAtBlock} = require('../eos-table');
const DacDirectory = require('../dac-directory');

const MsigTypes = require('../msig-types');


class MultisigProposalsHandler {

    constructor() {
        this.config = config;
        this.db = connectMongo(config);

        this.msig_contract = config.eos.msigContract || 'eosio.msig';

        this.dac_config = null;

        const rpc = new JsonRpc(this.config.eos.endpoint, {fetch});
        this.api = new Api({
            rpc,
            signatureProvider: null,
            chainId: this.config.chainId,
            textDecoder: new TextDecoder(),
            textEncoder: new TextEncoder(),
        });

        this.logger = require('../connections/logger')('watcher-multisig', config.logger);

        if (config.ipc){
            // this.ipc = new IPC();
            // this.ipc.config.appspace = config.ipc.appspace;
            // this.ipc.connectTo(config.ipc.id, async () => {
            //     this.logger.info(`Connected to IPC ${config.ipc.appspace}${config.ipc.id}`);
            // });
        }
    }

    async thresholdFromName(name, dac_id){
        // this.logger.info(`Getting threshold ${name} for ${dac_id}`);
        return new Promise(async (resolve, reject) => {
            const custodian_contract = this.dac_directory._custodian_contracts.get(dac_id);
            const scope = dac_id;
            const table_rows_req = {code:custodian_contract, scope, table:'config2'};
            const dac_config_res = await this.api.rpc.get_table_rows(table_rows_req);
            const dac_config = dac_config_res.rows[0];

            if (!dac_config){
                this.logger.info(`DAC config not found`, {table_rows_req, dac_id});
                reject(`Could not find dac config for ${dac_id} "${name}"`);
                return;
            }

            switch (name) {
                case 'low':
                    resolve(dac_config.auth_threshold_low);
                    break;
                case 'med':
                    resolve(dac_config.auth_threshold_mid);
                    break;
                case 'high':
                case 'active':
                    resolve(dac_config.auth_threshold_high);
                    break;
                default:
                    reject(`Unknown permission name "${name}"`);
            }
        });
    }

    async permissionToThreshold(perm, dac_id) {
        return new Promise(async (resolve) => {
            const self = this;
            const auth_account = this.dac_directory._auth_accounts.get(dac_id);

            if (perm.actor === auth_account) {
                resolve(await this.thresholdFromName(perm.permission, dac_id))
            } else {
                // get the account and follow the tree down
                const acct = await this.api.rpc.get_account(perm.actor);
                // this.logger.info(acct)
                const thresholds = [];

                for (let p = 0; p < acct.permissions.length; p++) {
                    const act_perm = acct.permissions[p];
                    // this.logger.info(act_perm);

                    if (act_perm.perm_name === perm.permission) {
                        // this.logger.info(act_perm, act_perm.required_auth.accounts)

                        if (act_perm.required_auth.accounts.length === 0) {
                            this.logger.warn(`Permission has no required accounts`, {dac_id, perm_name:act_perm.perm_name});
                            resolve(0);
                        }


                        for (let a = 0; a < act_perm.required_auth.accounts.length; a++) {
                            const perm = act_perm.required_auth.accounts[a];
                            // this.logger.info('getting permission', perm)
                            const p = await self.permissionToThreshold(perm.permission, dac_id);
                            thresholds.push(p);
                        }

                        this.logger.debug('thresholds', {thresholds, dac_id, act_perm})

                    }
                }

                if (!thresholds.length) {
                    this.logger.warn(`Did not find any thresholds`, {dac_id, perm});
                    resolve(0);
                } else {
                    resolve(Math.max(...thresholds));
                }
            }
        })

    }

    async getTrxType(trx, dac_id){

        return new Promise(async (resolve, reject) => {
            let type = MsigTypes.TYPE_UNKNOWN;
            if (!trx || !trx.actions) {
                this.logger.error(`Bad transaction`, {trx});
                reject(new Error('Bad transaction'));
            }

            for (let a = 0; a < trx.actions.length; a++) {
                const act = trx.actions[a];

                switch (act.name){
                    case  'transfer':
                        type = MsigTypes.TYPE_TRANSFER;
                        break;
                    case  'newaccount':
                        type = MsigTypes.TYPE_NEWACCOUNT;
                        break;
                    case  'setcode':
                        type = MsigTypes.TYPE_CODE;
                        break;
                    case  'updateauth':
                    case  'linkauth':
                    case  'unlinkauth':
                        type = MsigTypes.TYPE_DAC_OPS;
                        break;
                    case 'newmemterms':
                    case 'newmemtermse':
                        type = MsigTypes.TYPE_TERMS;
                        break;
                    case 'updateconfig':
                    case 'updateconfige':
                        type = MsigTypes.TYPE_CONFIG;
                        break;
                    case 'firecust':
                    case 'firecand':
                    case 'firecuste':
                    case 'firecande':
                        type = MsigTypes.TYPE_CUSTODIAN;
                        break;
                }

                switch (act.account){
                    case 'decentiummmm':
                    case 'decentiumorg':
                    case 'eosio.forum':
                        type = MsigTypes.TYPE_COMMS;
                        break;
                    case this.dac_directory._custodian_contracts.get(dac_id):
                        if (type === MsigTypes.TYPE_UNKNOWN){
                            type = MsigTypes.TYPE_DAC_OPS;
                        }
                        break;
                }

                if (type !== MsigTypes.TYPE_UNKNOWN){
                    break;
                }
            }

            if (type === MsigTypes.TYPE_UNKNOWN){
                this.logger.warn(`Unknown msig type`, {trx});
            }

            resolve(type);
        });
    }

    async getTrxThreshold(trx, dac_id) {
        return new Promise(async (resolve, reject) => {
            if (!trx || !trx.actions) {
                this.logger.error(`Bad transaction`, {trx});
                reject(new Error('Bad transaction'));
            }

            const thresholds = [];

            for (let a = 0; a < trx.actions.length; a++) {
                const act = trx.actions[a];

                for (let p = 0; p < act.authorization.length; p++) {
                    const perm = act.authorization[p];

                    thresholds.push(await this.permissionToThreshold(perm, dac_id));
                }
            }

            // this.logger.info(thresholds);
            const threshold = Math.max(...thresholds);

            resolve(threshold);
        })
    }

    async getApprovals(proposer, data_query, check_block){

        let approvals_data = [];
        let res_approvals = await eosTableAtBlock({
            db,
            code: this.msig_contract,
            scope: proposer,
            table: 'approvals',
            block_num: check_block,
            data_query
        });

        if (!res_approvals.results.length){
            res_approvals = await eosTableAtBlock({
                db,
                code: this.msig_contract,
                scope: proposer,
                table: 'approvals2',
                block_num: check_block,
                data_query
            });
        }

        return approvals_data;
    }

    async recalcMsigs({doc, db, retry=false, replay=false}) {
        // this.logger.info('Recalc', doc)

        // const db = mongo.db(this.config.mongo.dbName);
        const coll = db.collection('multisigs');
        const coll_actions = db.collection('actions');

        const dac_directory = this.dac_directory;
        const msig_contracts = Array.from(dac_directory.msig_contracts().values());

        if (!['proposed', 'proposede'].includes(doc.action.name)){
            // find the original proposed
            const doc_proposed = await coll_actions.findOne({
                'action.account': {$in:msig_contracts},
                'action.name': {$in:['proposed', 'proposede']},
                'action.data.proposal_name': doc.action.data.proposal_name,
                'action.data.proposer': doc.action.data.proposer,
                'block_num': {$lt:doc.block_num}
            });

            doc_proposed.proposed_retry = true;

            return this.recalcMsigs({doc: doc_proposed, db});
        }

        const block_num = doc.block_num;
        const block_timestamp = doc.block_timestamp;
        const proposer = doc.action.data.proposer;
        const proposal_name = doc.action.data.proposal_name;
        let dac_id = doc.action.data.dac_id;


        if (!dac_id){
            dac_id = doc.action.data.dac_id = this.config.eos.legacyDacs[0];
        }

        this.logger.info(`Recalc proposal ${proposer}:${proposal_name} on DAC ${dac_id}`, {dac_id, proposer, proposal_name});

        const output = {
            block_num,
            block_timestamp,
            proposer,
            proposal_name,
            dac_id,
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
                    this.logger.info(`Used dirty-json to parse ${doc.action.data.metadata}`, {dac_id, proposer, proposal_name})
                } catch (e) {
                    metadata = {title: '', description: ''};
                    this.logger.error('Failed to parse metadata', {metadata:doc.action.data.metadata, e, dac_id, proposer, proposal_name})
                }
            }

            output.title = metadata.title;
            output.description = metadata.description;
        }


        this.logger.info(`parsed ${block_num}:${proposer}:${proposal_name}:${dac_id}`, {dac_id, proposer, proposal_name});

        const data_query = {
            proposal_name
        };
        let check_block = block_num + 1;
        if (['cancelled', 'executed', 'cancellede', 'executede'].includes(doc.action.name)) {
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

        const approvals_data = this.getApprovals(proposer, data_query, check_block);

        const proposal = res_proposals.results[0];
        if (!proposal) {
            if (!retry){
                retry = true;
                setTimeout(() => {
                    this.recalcMsigs({doc, db, retry});
                }, 5000);
            }
            this.logger.error(`Error getting proposal ${proposal_name} from state`, {dac_id, proposal, proposal_name});
            return;
        }
        // this.logger.info(proposal.block_num, proposal.data.proposal_name, proposal.data.packed_transaction)
        try {
            output.trx = await this.api.deserializeTransactionWithActions(proposal.data.packed_transaction);
        }
        catch (e){
            this.logger.error(`Could not deserialise transaction for ${proposal.data.proposal_name}`, {dac_id, proposal, proposal_name});
            return;
        }

        // get the trxid stored in the dacmultisigs table
        const local_data_query = {
            proposalname: proposal_name
        };
        let res_data = await eosTableAtBlock({
            db,
            code: {$in:msig_contracts},
            scope: proposer,
            table: 'proposals',
            block_num: check_block,
            data_query: local_data_query
        });
        if (!res_data.results.length){
            // new format where dac id is the scope
            res_data = await eosTableAtBlock({
                db,
                code: {$in:msig_contracts},
                scope: dac_id,
                table: 'proposals',
                block_num: check_block,
                data_query: local_data_query
            });

            if (!res_data.results.length) {
                if (!retry){
                    setTimeout(() => {
                        const retry = true;
                        this.recalcMsigs({doc, db, retry});
                    }, 5000);
                }

                this.logger.error(`Could not find proposal in table`, {dac_id, proposal, proposal_name});
                return;
            }
        }
        output.trxid = res_data.results[0].data.transactionid;

        if (res_approvals.count) {
            output.requested_approvals = res_approvals.results[0].data.requested_approvals;
        }


        // We have the transaction data, now get approvals
        // Get threshold
        output.threshold = await this.getTrxThreshold(output.trx, dac_id);
        if (output.threshold === 0){
            this.logger.warn(`Found threshold of 0`, {dac_id, proposal, proposal_name});
        }
        output.type = await this.getTrxType(output.trx, dac_id);
        output.expiration = new Date(output.trx.expiration);


        // this.logger.info(proposer, proposal_name, output)

        // Get the current state by getting cancel/exec/clean transactions
        const closing_query = {
            'block_num': {$gt: block_num},
            'action.account': {$in:msig_contracts},
            'action.name': {$in: ['cancelled', 'executed', 'clean', 'cancellede', 'executede', 'cleane']},
            'action.data.proposal_name': proposal_name,
            'action.data.proposer': proposer
        };
        const closing_actions = await coll_actions.find(closing_query).sort({block_num: 1});

        const ca = await closing_actions.next();
        if (ca) {
            switch (ca.action.name) {
                case 'cancelled':
                case 'cancellede':
                    output.status = MultisigProposalsHandler.STATUS_CANCELLED;
                    break;
                case 'executed':
                case 'executede':
                    output.status = MultisigProposalsHandler.STATUS_EXECUTED;

                    // add executor to the data
                    output.executer = ca.action.data.executer;
                    output.executed_trxid = ca.trx_id;
                    break;
                case 'clean':
                case 'cleane':
                    output.status = MultisigProposalsHandler.STATUS_EXPIRED;
                    break
            }

            output.block_num = ca.block_num
        }


        if (output.expiration < new Date() && output.status === MultisigProposalsHandler.STATUS_OPEN){
            output.status = MultisigProposalsHandler.STATUS_EXPIRED;
        }


        let end_block = 0;
        if (ca) {
            end_block = ca.block_num - 1
        }

        // Get current custodians
        let custodians = [];
        // if the msig has ended then get the custodians at the time it ended
        const custodian_contract = this.dac_directory._custodian_contracts.get(dac_id);
        let scope = dac_id;
        if (dac_id === 'eos.dac'){
            scope = {$in:[custodian_contract, dac_id]};
        }
        const custodian_query = {
            db,
            code: custodian_contract,
            scope,
            table: 'custodians',
            limit:100
        };

        if (end_block){
            custodian_query.block_num = end_block;
        }

        const custodian_res = await eosTableAtBlock(custodian_query);

        custodians = custodian_res.results.map((row) => row.data.cust_name);

        output.custodians = custodians;


        // Get the latest provided approvals
        const query_provided = {db: db, code: this.msig_contract, scope: proposer, table: 'approvals', data_query};
        if (end_block) {
            query_provided.block_num = end_block
        }
        // this.logger.info('Querying approvals', query_provided);

        const provided = await eosTableAtBlock(query_provided);
        if (provided.count) {
            // this.logger.info('Provided approvals', provided.results[0].data.provided_approvals);
            output.provided_approvals = provided.results[0].data.provided_approvals
        } else {
            const query_provided2 = {db: db, code: this.msig_contract, scope: proposer, table: 'approvals2', data_query};
            const provided2 = await eosTableAtBlock(query_provided2);
            if (provided2.count) {
                output.provided_approvals = provided.results[0].data.provided_approvals
            }
            else {
                output.provided_approvals = [];
            }
            // this.logger.info('Resetting provided_approvals');

        }

        // only include custodians
        // output.provided_approvals = output.provided_approvals.filter((approval) => custodians.includes(approval.actor));

        // remove provided approvals from requested approvals
        // this.logger.info('requested', output.requested_approvals);
        const provided_actors = output.provided_approvals.map((pro) => pro.actor);
        output.requested_approvals = output.requested_approvals.filter((req) => !provided_actors.includes(req.actor));
        // only include custodians (if the msig is current then they are modified in the api)
        // output.requested_approvals = output.requested_approvals.filter((req) => custodians.includes(req.actor));

        if (!replay && this.ipc && !doc.proposed_retry){
            this.ipc.of.livenotifications.emit('notification', {notify: 'MSIG_PROPOSED', dac_id, proposer, proposal_name, trx_id: doc.trx_id});
        }

        this.logger.info(`Inserting ${proposer}:${proposal_name}:${output.trxid}`, {dac_id, doc:output});
        return await coll.updateOne({proposer, proposal_name, trxid: output.trxid}, {$set: output}, {upsert: true})

    }

    async action({doc, dac_directory, db}) {
        const msig_contracts = Array.from(dac_directory.msig_contracts().values());

        if (msig_contracts.includes(doc.action.account)) {
            this.db = await db;
            this.dac_directory = dac_directory;

            this.logger.info('Reacting to msig action');
            // delay to wait for the state to update
            setTimeout((() => {
                this.recalcMsigs({doc, db: this.db});
            }), 1000)
        }
    }

    async delta(doc){}

    async replay() {
        this.logger.info('Replaying msigs');

        this.db.then(async (mongo) => {
            const db = mongo.db(this.config.mongo.dbName);
            const collection = db.collection('multisigs');
            const collection_actions = db.collection('actions');

            this.dac_directory = new DacDirectory({config: this.config, db});
            await this.dac_directory.reload();

            this.logger.info('Removing existing entries');
            await collection.deleteMany({});
            // this.logger.info(await collection.find({}).count());

            const res = collection_actions.find({
                'action.account': {$in: Array.from(this.dac_directory.msig_contracts().values())},
                'action.name': {$in:['proposed', 'proposede']}
            }).sort({block_num: -1}).limit(1000);
            let doc;
            let count = 0;
            const replay = true;
            const recalcs = [];
            while (doc = await res.next()) {
                recalcs.push(this.recalcMsigs({doc, db, replay}));
                count++;
            }

            await Promise.all(recalcs);
            this.logger.info(`Imported ${count} multisig documents`);
        })
    }
}


MultisigProposalsHandler.STATUS_CANCELLED = 0;
MultisigProposalsHandler.STATUS_OPEN = 1;
MultisigProposalsHandler.STATUS_EXECUTED = 2;
MultisigProposalsHandler.STATUS_EXPIRED = 3;

module.exports = new MultisigProposalsHandler();
