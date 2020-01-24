const connectMongo = require('../connections/mongo');
const {loadConfig} = require('../functions');

const {TextDecoder, TextEncoder} = require('text-encoding');
const {Api, JsonRpc} = require('@jafri/eosjs2');
const fetch = require('node-fetch');
const MongoLong = require('mongodb').Long;
const IPCClient = require('../ipc-client');

const {eosTableAtBlock} = require('../eos-table');
const DacDirectory = require('../dac-directory');


class WorkerProposalsHandler {

    constructor() {
        this.config = loadConfig();
        this.db = connectMongo(this.config);
        this.is_replay = false;

        // this.proposals_contracts = this.dac_directory._proposals_contracts.get(dac_id);
        // this.proposals_contract = config.eos.proposalsContract || 'dacproposals';
        this.escrow_contract = this.config.eos.escrowContract || 'eosdacescrow';

        const rpc = new JsonRpc(this.config.eos.endpoint, {fetch});
        this.api = new Api({
            rpc,
            signatureProvider: null,
            chainId: this.config.chainId,
            textDecoder: new TextDecoder(),
            textEncoder: new TextEncoder(),
        });

        this.logger = require('../connections/logger')('watcher-proposals', this.config.logger);

        if (this.config.ipc){
            this.ipc = new IPCClient(this.config.ipc);
        }
    }

    async recalcProposal(doc, db) {

        const coll = db.collection('workerproposals');
        const coll_actions = db.collection('actions');
        let original_doc = null;

        let data = doc.action.data;
        const dac_id = data.dac_scope || data.dac_id;
        const proposal_id = data.id || data.proposal_id;
        this.logger.info(`Recalc worker proposal ${proposal_id}:${dac_id}`, {dac_id});

        const proposals_contract = this.dac_directory._proposals_contracts.get(dac_id);
        // const table_rows_req = {code: proposals_contract, scope: dac_id, table: 'config'};
        // this.logger.info(table_rows_req);
        // const dac_config = await this.api.rpc.get_table_rows(table_rows_req);
        // this.logger.info('here');
        // this.proposals_config = dac_config.rows[0];
        //
        // if (!this.proposals_config){
        //     this.logger.error('NO CONFIG', table_rows_req);
        //     return;
        // }

        //
        // if (data.id != '70220531909136904'){
        //     return;
        // }

        // if this is not the createprop action, then find it
        if (doc.action.name !== 'createprop'){
            const createprop_query = {
                "action.account": proposals_contract,
                "action.name": 'createprop',
                "action.data.id": proposal_id,
                "action.data.dac_id": dac_id,
                "block_num": {$lte: doc.block_num}
            };

            this.logger.info('Finding createprop action');

            original_doc = doc;

            doc = await coll_actions.findOne(createprop_query);

            if (!doc){
                delete createprop_query['action.data.dac_id'];
                doc = await coll_actions.findOne(createprop_query);
            }

            if (!doc){
                this.logger.error(`Could not find createprop for proposal id ${proposal_id}`, {dac_id, proposal_id});
                return;
            }

            data = doc.action.data;
        }

        let actor = data.proposer;
        const closing_action = await this.getClosingAction(data, db, doc);

        // get votes and updates between start and end block
        const is_closed = (closing_action);

        let closing_block_num = 0;
        if (is_closed){
            closing_block_num = closing_action.block_num;
        }


        const proposal_data = await this.getProposalData({dac_id, id: proposal_id}, db, closing_block_num);
        data.comments = await this.getComments(data, db, closing_action, doc.block_num);
        data.escrow_status = await this.getEscrowStatus(data, db);
        data.status = await this.getStatus(data, db, closing_action);
        if (data.status === null){
            this.logger.error(`No status for ${proposal_id}`, {dac_id, proposal_id});
            return;
        }
        const votes = await this.calculateVotes(data, db, closing_block_num);
        data.votes = Object.values(votes.details);
        data.vote_totals = votes.totals;
        const block_date = Date.parse(doc.block_timestamp);
        data.propose_timestamp = new Date(block_date);
        const expiry = Date.parse(proposal_data.expiry);
        data.expiry = new Date(expiry);


        data.complete_work_timestamp = null;
        const complete_work_action = await coll_actions.findOne({
            "action.account": proposals_contract,
            "action.name": 'completework',
            "action.data.proposal_id": proposal_id,
            "action.data.dac_id": dac_id,
            "block_num": {$gte: doc.block_num}
        });
        if (complete_work_action){
            data.complete_work_timestamp = new Date(Date.parse(complete_work_action.block_timestamp));
        }

        data.start_work_timestamp = null;
        const start_work_action = await coll_actions.findOne({
            "action.account": proposals_contract,
            "action.name": 'startwork',
            "action.data.proposal_id": proposal_id,
            "action.data.dac_id": dac_id,
            "block_num": {$gte: doc.block_num}
        });
        if (start_work_action){
            data.start_work_timestamp = new Date(Date.parse(start_work_action.block_timestamp));
        }


        data.id = data.id;
        data.dac_id = dac_id;
        data.block_num = doc.block_num;
        data.block_timestamp = doc.block_timestamp;
        data.trx_id = doc.trx_id;

        data.approve_voted = [];
        data.finalize_voted = [];

        data.votes.forEach((vote) => {
            switch (vote.vote){
                case 1:
                case 2:
                    data.approve_voted.push(vote.voter);
                    vote.delegates.forEach((delegate) => {
                        data.approve_voted.push(delegate.voter);
                    });
                    break;
                case 3:
                case 4:
                    data.finalize_voted.push(vote.voter);
                    vote.delegates.forEach((delegate) => {
                        data.finalize_voted.push(delegate.voter);
                    });
                    break;
            }
        });

        let action = doc.action;

        if (!this.is_replay && this.ipc){
            let notify = 'WP_PROPOSED';
            if (original_doc){
                action = original_doc.action;

                switch (original_doc.action.name){
                    case 'arbapprove':
                        notify = 'WP_ARB_APPROVE';
                        actor = action.data.arbitrator;
                        break;
                    case 'cancel':
                        notify = 'WP_CANCEL';
                        break;
                    case 'comment':
                        notify = 'WP_COMMENT';
                        actor = action.data.commenter;
                        break;
                    case 'completework':
                        notify = 'WP_COMPLETE_WORK';
                        break;
                    case 'finalize':
                        notify = 'WP_FINALIZE';
                        break;
                    case 'startwork':
                        notify = 'WP_START_WORK';
                        break;
                    case 'voteprop':
                        notify = 'WP_VOTED';
                        actor = action.data.custodian;
                        break;
                }
            }


            this.ipc.send_notification({notify, dac_id, wp_data:data, action, actor, trx_id: doc.trx_id});
        }

        this.logger.info(`Saving ${data.id}`, data);
        coll.updateOne({id: data.id}, {$set:data}, {upsert:true});
    }

    async getComments(data, db, closing_action, start_block){

        return new Promise(async (resolve, reject) => {
            const comments = [];
            const dac_id = data.dac_scope || data.dac_id;
            const proposals_contract = this.dac_directory._proposals_contracts.get(dac_id);

            const coll_actions = db.collection('actions');
            const query = {
                "action.account": proposals_contract,
                "action.name": 'comment',
                "action.data.proposal_id": data.id,
                "action.data.dac_id": dac_id,
                "block_num": {$gte: start_block}
            };
            if (closing_action){
                this.logger.info('Closing action', {closing_action});
                query.block_num['$lte'] = await closing_action.block_num;
            }
            const comments_res = coll_actions.find(query).sort({block_num:-1});

            comments_res.forEach((comment) => {
                const comment_data = {
                    commenter: comment.action.data.commenter,
                    comment: comment.action.data.comment,
                    timestamp: comment.block_timestamp
                };

                comments.push(comment_data);
            }, () => {
                resolve(comments);
            });

        });
    }

    async getProposalData(data, db, closing_block_num = null){
        const dac_id = data.dac_scope || data.dac_id;
        const proposals_contract = this.dac_directory._proposals_contracts.get(dac_id);

        const data_query = {
            proposal_id: data.id
        };
        // get current status from the table
        const table_query = {
            code: proposals_contract,
            table: 'proposals',
            scope: dac_id,
            db,
            data_query
        };
        if (closing_block_num){
            table_query.block_num = closing_block_num - 1
        }

        const table_res = await eosTableAtBlock(table_query);
        if (!table_res.count){
            this.logger.error(`Could not find state for proposal ${data.id}`, {dac_id, table_query});
            return null;
        }
        return table_res.results[0].data;
    }

    async getStatus(data, db, closing_action){
        this.logger.info('Get status');

        if (closing_action){
            this.logger.info(`Closing action`, {closing_action});

            if (closing_action.action.name === 'cancel'){
                return 100;
            }
            else if (closing_action.action.name === 'finalize') {
                return 101;
            }
            else if (closing_action.action.name === 'arbapprove') {
                return 102;
            }
        }

        const prop_data = await this.getProposalData(data, db);

        const status = prop_data.state;

        return status;
    }

    async getEscrowStatus(data, db){
        this.logger.info('get escrow status');
        let status = 0;
        const coll_actions = db.collection('actions');

        const init_query = {
            "action.account":this.escrow_contract,
            "action.name": 'init',
            "action.data.ext_reference": data.id
        };
        const init_res = coll_actions.find(init_query);
        const init_act = await init_res.next();
        if (init_act){
            status = 1;
        }


        const approve_query = {
            "action.account":this.escrow_contract,
            "action.name": 'approve',
            "action.data.key": data.id
        };
        const approve_res = coll_actions.find(approve_query);
        const approve_act = await approve_res.next();
        if (approve_act){
            status = 3;
        }


        const disapprove_query = {
            "action.account":this.escrow_contract,
            "action.name": 'disapprove',
            "action.data.key": data.id
        };
        const disapprove_res = coll_actions.find(disapprove_query);
        const disapprove_act = await disapprove_res.next();
        if (disapprove_act){
            status = 4;
        }


        const refund_query = {
            "action.account":this.escrow_contract,
            "action.name": 'refund',
            "action.data.key": data.id
        };
        const refund_res = coll_actions.find(refund_query);
        const refund_act = await refund_res.next();
        if (refund_act){
            status = 5;
        }

        return status;
    }

    async calculateVotes(data, db, closing_block_num){
        this.logger.info("Calculating votes");

        // Get votes
        const dac_id = data.dac_scope || data.dac_id;
        const proposals_contract = this.dac_directory._proposals_contracts.get(dac_id);
        const cat_delegates_query = {
            code: proposals_contract,
            table: 'propvotes',
            scope: dac_id,
            'data.category_id': {'$ne':null},
            db,
            limit: 100
        };
        if (closing_block_num){
            cat_delegates_query.block_num = closing_block_num -1;
        }
        const cat_delegates_res = await eosTableAtBlock(cat_delegates_query);
        // console.info("Category delegates", cat_delegates_res);
        const indexed_cat_delegates = {};
        for (let c=0;c<cat_delegates_res.results.length;c++){
            const cat_data = cat_delegates_res.results[c].data;
            if (data.category == cat_data.category_id){
                // this.logger.info(cat_delegates_res.results[c].data);
                if (typeof indexed_cat_delegates[cat_data.delegatee] === 'undefined'){
                    indexed_cat_delegates[cat_data.delegatee] = [];
                }
                indexed_cat_delegates[cat_data.delegatee].push(cat_data.voter);
            }
        }

        console.info("Indexed category delegates", indexed_cat_delegates);

        const votes_query = {
            code: proposals_contract,
            table: 'propvotes',
            scope: dac_id,
            data_query: {proposal_id: data.id},
            db
        };
        if (closing_block_num){
            votes_query.block_num = closing_block_num -1;
        }
        const votes_res = await eosTableAtBlock(votes_query);
        const indexed_votes_data = {};
        for (let v=0;v<votes_res.results.length;v++){
            indexed_votes_data[votes_res.results[v].data.voter] = votes_res.results[v].data;
        }
        // console.info("Indexed votes", indexed_votes_data);


        // get a list of direct voters
        const direct_voters = Object.keys(indexed_votes_data);


        /* Add weights from delegated votes */
        for (let voter in indexed_votes_data){
            // this.logger.info(indexed_votes_data[voter], voter);

            if (indexed_votes_data[voter].delegatee && indexed_votes_data.hasOwnProperty(indexed_votes_data[voter].delegatee)){
                let vote_weight = indexed_votes_data[indexed_votes_data[voter].delegatee].weight || 1;
                vote_weight++;
                // this.logger.info(`Weight now delegate direct for ${voter} ${vote_weight}, was ${indexed_votes_data[voter].weight}`);
                indexed_votes_data[indexed_votes_data[voter].delegatee].weight = vote_weight;
                indexed_votes_data[voter].weight = 0;

                // create list of delegate votes
                const delegates = indexed_votes_data[indexed_votes_data[voter].delegatee].delegates || [];
                const delegate_data = {
                    voter,
                    delegate_type: 'direct'
                };
                delegates.push(delegate_data);
                indexed_votes_data[indexed_votes_data[voter].delegatee].delegates = delegates;

                delete indexed_votes_data[voter];
                continue;
            }
            else if (indexed_votes_data[voter].delegatee) {
                indexed_votes_data[voter].weight = 0;
            }
            else {
                indexed_votes_data[voter].weight = indexed_votes_data[voter].weight || 1;
            }

            delete indexed_votes_data[voter].proposal_id;
        }


        // Category delegations
        // this.logger.info(indexed_cat_delegates, "Category delegations");
        for (let voter in indexed_votes_data){
            if (typeof indexed_cat_delegates[voter] !== 'undefined'){
                indexed_cat_delegates[voter].forEach((proxying_account) => {
                    if (!direct_voters.includes(proxying_account)){
                        const delegates = indexed_votes_data[voter].delegates || [];
                        delegates.push({
                            voter: proxying_account,
                            delegate_type: 'category'
                        });
                        indexed_votes_data[voter].delegates = delegates;


                        let vote_weight = indexed_votes_data[voter].weight || 1;
                        vote_weight++;
                        // this.logger.info(`Weight now delegate category for ${voter} ${vote_weight}, was ${indexed_votes_data[voter].weight}`);
                        indexed_votes_data[voter].weight = vote_weight;
                    }
                });
            }
        }


        // this.logger.info("votes data", indexed_votes_data);

        const vote_totals = {
            proposal_approve: 0,
            proposal_deny: 0,
            finalize_approve: 0,
            finalize_deny: 0
        };
        for (let voter in indexed_votes_data){
            // make sure delegates is an array
            indexed_votes_data[voter].delegates = indexed_votes_data[voter].delegates || [];

            switch (indexed_votes_data[voter].vote){
                case 1:
                    vote_totals.proposal_approve += indexed_votes_data[voter].weight;
                    break;
                case 2:
                    vote_totals.proposal_deny += indexed_votes_data[voter].weight;
                    break;
                case 3:
                    vote_totals.finalize_approve += indexed_votes_data[voter].weight;
                    break;
                case 4:
                    vote_totals.finalize_deny += indexed_votes_data[voter].weight;
                    break;
            }
        }


        return {totals: vote_totals, details:indexed_votes_data};
    }

    async getClosingAction(data, db, doc){
        const start_block = doc.block_num;
        const coll_actions = db.collection('actions');
        // Find the closing actions to get the range for this proposal
        // this is in case there are more than one proposal with the same id
        const proposals_contracts = Array.from(this.dac_directory.proposals_contracts().values());
        const closing_actions = ['arbapprove', 'finalize', 'cancel'];
        if (closing_actions.includes(doc.action.name)){
            return doc;
        }
        const closing_query = {
            "action.account": {$in:proposals_contracts},
            "action.name": {$in:closing_actions},
            "action.data.proposal_id": data.id,
            "action.data.dac_id": data.dac_id,
            "block_num": {$gte: start_block}
        };
        const closing_res = coll_actions.find(closing_query);

        const closing_act = await closing_res.next();

        return closing_act;
    }

    async action({doc, dac_directory, db}) {
        const proposals_contracts = Array.from(dac_directory.proposals_contracts().values());

        if (proposals_contracts.includes(doc.action.account)){
            this.logger.info('Reacting to proposals action', {action:doc.action});
            this.db = await db;
            this.dac_directory = dac_directory;
            // delay to wait for the state to update
            setTimeout((() => {
                this.recalcProposal(doc, this.db);
            }), 600)
        }
    }

    async delta({doc, dac_directory, db}){}

    async replay() {
        this.is_replay = true;
        const db = await connectMongo(this.config);
        const collection = db.collection('workerproposals');
        const collection_actions = db.collection('actions');

        this.dac_directory = new DacDirectory({config: this.config, db});
        await this.dac_directory.reload();

        collection.createIndex({id:1, dac_scope:1, block_num:1}, {background:true, unique:true});

        this.logger.info('Replaying worker proposals, emoving existing entries');
        await collection.deleteMany({});

        const res = collection_actions.find({
            'action.account': {$in: Array.from(this.dac_directory.proposals_contracts().values())},
            'action.name': 'createprop'
        }).sort({block_num: 1});
        let doc;
        const recalcs = [];
        let count = 0;
        this.logger.info((await res.count()) + ' proposals found');
        while (doc = await res.next()) {
            recalcs.push(this.recalcProposal(doc, db));
            count++;
        }

        Promise.all(recalcs).then(() => {
            this.logger.info(`Imported ${count} worker proposals`);
            //process.exit(0);
        }).catch((e) => {
            this.logger.error(`Failed to recalc proposals during replay`, {e});
            process.exit(1);
        })

        // process.exit(0)
    }
}


module.exports = new WorkerProposalsHandler();
