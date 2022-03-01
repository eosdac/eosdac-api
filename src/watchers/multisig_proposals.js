const connectMongo = require('../connections/mongo');
const {loadConfig} = require('../functions');

const {TextDecoder, TextEncoder} = require('text-encoding');
const {Api, JsonRpc} = require('@jafri/eosjs2');
const fetch = require('node-fetch');
const IPCClient = require('../ipc-client');

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
            this.ipc = new IPCClient(config.ipc);
        }
    }

    async thresholdFromName(name, dac_id){
        // this.logger.info(`Getting threshold ${name} for ${dac_id}`);
        const auth_account = this.dac_directory._auth_accounts.get(dac_id);
        const account_res = await this.api.rpc.get_account(auth_account);
        // quick fix for active linked to high
        if (name === 'active'){
            name = 'high';
        }
        // console.log(account_res.permissions);
        for (let p=0;p<account_res.permissions.length;p++){
            if (account_res.permissions[p].perm_name === name){
                return account_res.permissions[p].required_auth.threshold;
            }
        }

        return 0;
    }

    async permissionToThreshold(perm, dac_id, check_block=0) {
        return new Promise(async (resolve) => {
            const self = this;
            const auth_account = this.dac_directory._auth_accounts.get(dac_id);
            const custodian_contract = this.dac_directory._custodian_contracts.get(dac_id);

            // When DAC is in genesis custodian state before unlock
            // Maybe read auth later, but assume 1 for now
            const db = await this.db;
            const table_query = {
                db,
                code: custodian_contract,
                scope: dac_id,
                table: 'state'
            };
            if (check_block > 0){
                table_query.block_num = check_block;
            }

            // console.log(table_query);

            let res_state = await eosTableAtBlock(table_query);
            if (res_state.count == 0 || res_state.results[0].lastperioddate === '1970-01-01T00:00:00'){
                resolve(1);
                return;
            }

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
                    case 'regaccount':
                    case 'regref':
                    case 'stakeconfig':
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

    async getTrxThreshold(trx, dac_id, check_block) {
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

                    thresholds.push(await this.permissionToThreshold(perm, dac_id, check_block));
                }
            }

            // this.logger.info(thresholds);
            const threshold = Math.max(...thresholds);

            resolve(threshold);
        })
    }

    async getApprovals(db, proposer, data_query, check_block=0){

        let approvals_data = {
            requested_approvals: [],
            provided_approvals: []
        };

        const table_query = {
            db,
            code: this.msig_contract,
            scope: proposer,
            table: 'approvals',
            data_query
        };
        if (check_block > 0){
            table_query.block_num = check_block;
        }

        // console.log(table_query);

        let res_approvals = await eosTableAtBlock(table_query);

        if (res_approvals.results.length) {
            approvals_data = res_approvals.results[0].data;
            console.log(`Approvals data at block ${check_block}`, approvals_data);
        }
        else {
            console.log(`checking new table at block ${check_block}`);
            table_query.table = 'approvals';
            res_approvals = await eosTableAtBlock(table_query);

            if (res_approvals.results.length){
                approvals_data = res_approvals.results[0].data;
                // console.log(approvals_data);

                approvals_data.requested_approvals = approvals_data.requested_approvals.map((r) => {
                    return r.level;
                });
                approvals_data.provided_approvals = approvals_data.provided_approvals.map((p) => {
                    return p.level;
                });
            }
        }

        return approvals_data;
    }

    async sendNotification(msg_name, data){
        data.notify = msg_name
        this.ipc.send_notification(data);
    }

    async recalcMsigs({doc, db, retry=false, replay=false, original_doc=null}) {
        this.logger.info('recalcMsigs', doc)

        // const db = mongo.db(this.config.mongo.dbName);
        const coll = db.collection('multisigs');
        const coll_actions = db.collection('actions');

        const dac_directory = this.dac_directory;
        const msig_contracts = Array.from(dac_directory.msig_contracts().values());
        let is_propose = true;
        let actor = doc.action.data.proposer

        
        const block_num = doc.block_num;
        const block_timestamp = doc.block_timestamp;
        const proposal_name = doc.action.data.proposal_name;
        let dac_id = doc.action.data.dac_id;
        this.logger.info(`Recalc proposal ${JSON.stringify(doc, null, 2)}`);
        
        // const metadata = weird_map_to_normal_map(doc.action.data.metadata);
        // console.log(`metadata: ${JSON.stringify(metadata)}`)
        const output = {
            block_num,
            block_timestamp,
            proposal_name,
            dac_id,
            threshold: 0,
            requested_approvals: [],
            provided_approvals: [],
            // status: MultisigProposalsHandler.STATUS_PENDING,
        };

        this.logger.info(`parsed ${block_num}:${proposal_name}:${dac_id}`, {dac_id, proposal_name});
        
        const data_query = {
            proposal_name
        };
        let check_block = block_num + 1;
        if (['cancelled', 'executed', 'cancellede', 'executede', 'exec'].includes(doc.action.name)) {
            check_block = block_num - 1
        }

        const res_proposals = await eosTableAtBlock({
            db,
            code: this.msig_contract,
            scope: dac_id,
            table: 'proposals',
            block_num: check_block,
            data_query
        });



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

        this.logger.info(`proposal ${proposal_name} from db: ${JSON.stringify(proposal, null, 2)}`)
        
        const proposer = proposal.data.proposer
        output.status = proposal.data.state
        output.proposer = proposer
        
        if(proposal.data.metadata) {
          output.metadata = weird_map_to_normal_map(proposal.data.metadata)          
        } else {
          output.metadata = null
        }
        if(proposal_name == '134k2wakdmpa') {
          this.logger.info(`134k2wakdmpa ohai 1`)          
        }
        try {
            output.trx = await this.api.deserializeTransactionWithActions(proposal.data.packed_transaction);
        }
        catch (e){
            this.logger.error(`Could not deserialise transaction for ${proposal_name}`, {dac_id, proposal, proposal_name});
            console.log(`proposal: ${JSON.stringify(proposal, null, 2)}`)
            throw e;
        }

        if(proposal_name == '134k2wakdmpa') {
          this.logger.info(`134k2wakdmpa ohai 2`)          
        }


        // We have the transaction data, now get approvals
        // Get threshold
        output.threshold = await this.getTrxThreshold(output.trx, dac_id, check_block);
        if (output.threshold === 0){
            this.logger.warn(`Found threshold of 0`, {dac_id, proposal, proposal_name});
        }
        output.type = await this.getTrxType(output.trx, dac_id);
        output.expiration = new Date(output.trx.expiration);

        if(proposal_name == '134k2wakdmpa') {
          this.logger.info(`134k2wakdmpa ohai 2.1`)          
        }
        

        // Get current approvals
        const approvals_data = await this.getApprovals(db, proposer, data_query, check_block);
        output.requested_approvals = approvals_data.requested_approvals;
        output.provided_approvals = approvals_data.provided_approvals;

        if(proposal_name == '134k2wakdmpa') {
          this.logger.info(`134k2wakdmpa ohai 2.2`)          
        }
        // Get current custodians
        let custodians = [];
        // if the msig has ended then get the custodians at the time it ended
        const custodian_contract = this.dac_directory._custodian_contracts.get(dac_id);
        if(proposal_name == '134k2wakdmpa') {
          this.logger.info(`134k2wakdmpa ohai 2.3`)          
        }
        let scope = dac_id;
        const custodian_query = {
            db,
            code: custodian_contract,
            scope,
            table: 'custodians',
            limit:100
        };
        if(proposal_name == '134k2wakdmpa') {
          this.logger.info(`134k2wakdmpa ohai 3`)          
        }

        const custodian_res = await eosTableAtBlock(custodian_query);

        custodians = custodian_res.results.map((row) => row.data.cust_name);

        output.custodians = custodians;



        // only include custodians
        // output.provided_approvals = output.provided_approvals.filter((approval) => custodians.includes(approval.actor));

        // remove provided approvals from requested approvals
        // this.logger.info('requested', output.requested_approvals);
        const provided_actors = output.provided_approvals.map((pro) => pro.actor);
        output.requested_approvals = output.requested_approvals.filter((req) => !provided_actors.includes(req.actor));
        // only include custodians (if the msig is current then they are modified in the api)
        // output.requested_approvals = output.requested_approvals.filter((req) => custodians.includes(req.actor));

        // get denials
        const denial_query = {
            db,
            code: this.config.eos.msigContract,
            scope: dac_id,
            table: 'denials',
            data_query: {proposalname: proposal_name}
        };

        
        const denials_res = await eosTableAtBlock(denial_query);
        output.denials = denials_res.results.map((r) => {
            return r.data.denier;
        });
        if(proposal_name == '134k2wakdmpa') {
          this.logger.info(`134k2wakdmpa ohai 4`)          
        }
        const dt = block_timestamp.getTime();
        let original_timestamp = null;
        if (original_doc){
            original_timestamp = original_doc.block_timestamp.getTime();
        }
        const now = new Date().getTime();
        // Check that action is within last 20 seconds
        const max_delay = 20 * 1000;
        if (!replay && this.ipc && (Math.abs(now - dt) < max_delay || (original_timestamp && Math.abs(now - original_timestamp) < max_delay))){
            if (is_propose && !doc.proposed_retry){
                this.sendNotification('MSIG_PROPOSED', {dac_id, msig_data:output, actor, proposer, proposal_name, trx_id: doc.trx_id});
            }
            else if (original_doc){
                let msg_name = '';
                switch (original_doc.action.name){
                    case 'approve':
                        msg_name = 'MSIG_APPROVED';
                        actor = original_doc.action.data.approver;
                        break;
                    case 'unapprove':
                        msg_name = 'MSIG_UNAPPROVED';
                        actor = original_doc.action.data.unapprover;
                        break;
                    case 'cancel':
                        msg_name = 'MSIG_CANCELLED';
                        actor = original_doc.action.data.canceler;
                        break;
                    case 'exec':
                        msg_name = 'MSIG_EXECUTED';
                        actor = original_doc.action.data.executer;
                        break;
                }

                if (msg_name){
                    this.sendNotification(msg_name, {msig_data:output, actor, dac_id, proposer, proposal_name, trx_id: original_doc.trx_id});
                }
            }
        }
        if(proposal_name == '134k2wakdmpa') {
          this.logger.info(`134k2wakdmpa ohai 5`)          
        }

        this.logger.info(`Inserting MSIG to db: ${JSON.stringify(output, null, 2)}`);
        return coll.updateOne({proposer, proposal_name, dac_id}, {$set: output}, {upsert: true})

    }

    async action({doc, dac_directory, db}) {
        const dac_msig_contract = this.config.eos.msigContract || 'dacmultisigs';
        console.log(`multisig_proposal.action doc.action.account: ${doc.action.account}`)
        if (doc.action.account === dac_msig_contract || doc.action.account === this.msig_contract) {
            this.db = await db;
            this.dac_directory = dac_directory;
            
            console.log('Reacting to msig action')
            this.logger.info('Reacting to msig action');
            // delay to wait for the state to update
            setTimeout((() => {
                this.recalcMsigs({doc, db: this.db});
            }), 1000);
        }
    }

    async delta({doc, dac_directory, db}){}

    async replay() {
        this.logger.info('Replaying msigs');

        const db = await this.db;
        const collection = db.collection('multisigs');
        const collection_actions = db.collection('actions');

        this.dac_directory = new DacDirectory({config: this.config, db});
        await this.dac_directory.reload();

        this.logger.info('Removing existing entries');
        await collection.deleteMany({});
        // this.logger.info(await collection.find({}).count());

        const dac_msig_contract = this.config.eos.msigContract || 'dacmultisigs';
        const res = collection_actions.find({
            'action.account': dac_msig_contract,
            'action.name': {$in: ['propose']}
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
    }
}

/* Transforms the weird EOS-style map
 * [{"key":"title","value":"xxx"},{"key":"description","value":"yyy"}]
 * to something normal:
 * {"title": "xxx", "description": "yyy"}
 */
function weird_map_to_normal_map(weird_map) {
  const d = {}
  for(const {key, value} of weird_map) {
    d[key] = value
  }
  return d
}

MultisigProposalsHandler.STATUS_PENDING = 0;
MultisigProposalsHandler.STATUS_EXECUTED = 1;
MultisigProposalsHandler.STATUS_CANCELLED = 2;

module.exports = new MultisigProposalsHandler();
