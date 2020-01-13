const connectMongo = require('../connections/mongo');
const {loadConfig} = require('../functions');

const {TextDecoder, TextEncoder} = require('text-encoding');
const {Api, JsonRpc} = require('@jafri/eosjs2');
const fetch = require('node-fetch');

const {eosTableAtBlock} = require('../eos-table');
const DacDirectory = require('../dac-directory');
const IPCClient = require('../ipc-client');


class ReferendumsHandler {

    constructor() {
        this.config = loadConfig();
        this.db = connectMongo(this.config);
        const rpc = new JsonRpc(this.config.eos.endpoint, {fetch});
        this.api = new Api({
            rpc,
            signatureProvider: null,
            chainId: this.config.chainId,
            textDecoder: new TextDecoder(),
            textEncoder: new TextEncoder(),
        });

        if (this.config.ipc){
            this.ipc = new IPCClient(this.config.ipc);
        }

        this.logger = require('../connections/logger')('watcher-proposals', this.config.logger);
    }

    async recalcReferendum(doc, db) {
        this.logger.info(`Calculating referendum at block ${doc.block_num}`);

        let action_data = doc.action.data;
        if (['vote', 'cancel', 'exec'].includes(doc.action.name)){
            doc = await this.getProposeAction({db, doc, dac_id: action_data.dac_id, referendum_id: action_data.referendum_id});
            console.log('PROPOSE', doc)
            action_data = doc.action.data;
        }

        if (doc.action.name !== 'propose'){
            console.log(`Not interested in ${doc.action.name} actions`);
            return
        }

        const res = await eosTableAtBlock({code:doc.action.account, db, scope: action_data.dac_id, table: 'referendums', block_num: doc.block_num});
        const { results, count } = res;
        // console.log(results, count)
        if (count){
            const ref_data = results[0].data;
            const output = ref_data;

            const closing_action = await this.getClosingAction({data:ref_data, db, doc});

            // console.log(ref_data)
            // this.logger.info(JSON.stringify(ref_data));
            output.id = ref_data.referendum_id;
            output.content = action_data.content;
            output.dac_id = action_data.dac_id;

            // check expiry date
            const exp_date = new Date(Date.parse(ref_data.expires.replace(['.000', '.500'], '')));
            const now_date = new Date();
            if (exp_date < now_date){
                output.status = 2;
            }
            output.expires = exp_date;

            const data_query = {referendum_id: ref_data.referendum_id};
            const close_query = {code:doc.action.account, db, scope: action_data.dac_id, table: 'referendums', data_query};
            if (closing_action){ // still open
                console.log(closing_action)
                close_query.block_num = closing_action.block_num;
            }
            const close_res = await eosTableAtBlock(close_query);
            console.log('CLOSE RES', close_res.results[0], close_query);
            let close_data;
            if (close_res.count){
                close_data = close_res.results[0].data;
            }

            if (!close_data){
                close_data = output;
            }

            let votes = null;
            output.votes = {yes:0, no: 0, abstain:0}
            if (ref_data.voting_type === 0){ // token
                votes = close_data.token_votes;
            }
            else if (ref_data.voting_type === 1){ // account
                votes = close_data.account_votes;
            }


            votes.forEach(val => {
                switch (val.key){
                    case 1: //yes
                        output.votes.yes += parseInt(val.value);
                        break;
                    case 2: //no
                        output.votes.no += parseInt(val.value);
                        break;
                    case 3: //abstain
                        output.votes.abstain += parseInt(val.value);
                        break;
                }
            });

            delete output.token_votes;
            delete output.account_votes;
            delete output.referendum_id;

            // console.log(output);
            const coll = db.collection('referendums');
            await coll.updateOne({id: output.id}, {$set:output}, {upsert:true});
        }
        else {
            console.error(`Could not find referendum in contract_rows`);
        }

    }

    async getProposeAction({db, doc, dac_id, referendum_id}){
        return new Promise(async (resolve, reject) => {
            const start_block = doc.block_num;
            const coll_actions = db.collection('actions');

            const proposed_query = {
                "action.account": doc.action.account,
                "action.name": 'proposed',
                "action.data.dac_id": dac_id,
                "action.data.referendum_id": referendum_id,
                "block_num": {$lte: start_block}
            };

            const proposed_res = await coll_actions.find(proposed_query);

            const proposed_act = await proposed_res.next();

            const trx_query = {
                "action.account": doc.action.account,
                "action.name": 'propose',
                "trx_id": proposed_act.trx_id
            };
            const trx_res = await coll_actions.findOne(trx_query);

            resolve(trx_res);
        });
    }

    async getClosingAction({data, db, doc}){
        const start_block = doc.block_num;
        const coll_actions = db.collection('actions');
        const closing_actions = ['cancel', 'exec'];
        if (closing_actions.includes(doc.action.name)){
            return doc;
        }
        const closing_query = {
            "action.account": doc.action.account,
            "action.name": {$in: closing_actions},
            "action.data.dac_id": data.dac_id,
            "action.data.referendum_id": data.referendum_id,
            "block_num": {$gte: start_block}
        };
        const closing_res = await coll_actions.find(closing_query);

        const closing_act = await closing_res.next();

        return closing_act;
    }

    async action({doc, dac_directory, db}) {
        const referendum_contracts = Array.from(dac_directory.referendum_contracts().values());
        if (referendum_contracts.includes(doc.action.account)){
            this.db = await db;
            this.dac_directory = dac_directory;
            this.recalcReferendum(doc, db);
        }
    }

    async delta({doc, dac_directory, db}){}

    async replay() {
        const db = await connectMongo(this.config);
        const collection = db.collection('referendums');
        const collection_actions = db.collection('actions');

        this.dac_directory = new DacDirectory({config: this.config, db});
        await this.dac_directory.reload();

        collection.createIndex({id:1}, {background:true, unique:true});
        collection.createIndex({status:1, expires:1}, {background:true});

        this.logger.info('Replaying referendums, removing existing entries');
        await collection.deleteMany({});

        const res = collection_actions.find({
            'action.account': {$in: Array.from(this.dac_directory.referendum_contracts().values())},
            'action.name': 'propose'
        }).sort({block_num: 1});
        let doc;
        const recalcs = [];
        let count = 0;
        this.logger.info((await res.count()) + ' referendums found');
        while (doc = await res.next()) {
            recalcs.push(this.recalcReferendum(doc, db));
            count++;
        }

        Promise.all(recalcs).then(() => {
            this.logger.info(`Imported ${count} referendums`);
            //process.exit(0);
        }).catch((e) => {
            this.logger.error(`Failed to recalc referendums during replay ${e.message}`, {e});
            process.exit(1);
        })

        // process.exit(0)
    }
}


module.exports = new ReferendumsHandler();
