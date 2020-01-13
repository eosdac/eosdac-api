const connectMongo = require('../connections/mongo');
const {loadConfig} = require('../functions');

const config = loadConfig();

const {eosTableAtBlock,} = require('../eos-table');
const DacDirectory = require('../dac-directory');
const array_xor = require('array-xor');
const IPCClient = require('../ipc-client');


class VotesHandler {

    constructor() {
        this.config = config;

        this.dac_config = null;

        this.logger = require('../connections/logger')('watcher-multisig', config.logger);

        if (config.ipc){
            this.ipc = new IPCClient(config.ipc);
        }
    }

    async recalc_candidate(candidate, dac_id, custodian_contract, db){
        const data_query = {candidates: candidate};
        const table_query = {
            db,
            code: custodian_contract,
            scope: dac_id,
            table: 'votes',
            data_query
        };

        // console.log(table_query);

        let res_votes = await eosTableAtBlock(table_query);
        // console.log(res_votes);
        const voters = res_votes.results.map(row => row.data.voter);

        const coll = db.collection('voters');
        const output = {candidate, voters, dac_id};
        return coll.updateOne({candidate, dac_id}, {$set: output}, {upsert: true});
    }

    async recalc_voter(voter, doc, dac_directory, db){
        // we need the state of the votes table before and after this action, then we need to recalculate the voters
        // for the candidates that are not in both blocks
        const dac_id = doc.action.data.dac_id;
        const action_block = doc.block_num;
        const before_block = parseInt(action_block) - 1;
        const after_block = parseInt(action_block) + 1;
        console.log(`Recalc voter ${voter}, ${before_block} : ${action_block} : ${after_block}`);

        const table_query = {
            db,
            code: doc.action.account,
            scope: dac_id,
            table: 'votes',
            data_query: {voter: doc.action.data.voter}
        };
        table_query.block_num = before_block;
        let res_before = await eosTableAtBlock(table_query);
        table_query.block_num = after_block;
        let res_after = await eosTableAtBlock(table_query);

        let votes_before = [], votes_after = [];
        if (res_before.count){
            votes_before = res_before.results[0].data.candidates;
        }
        if (res_after.count){
            votes_after = res_after.results[0].data.candidates;
        }

        if (this.ipc){
            this.ipc.send_notification({notify: 'VOTES_CHANGED', dac_id, voter, prev: votes_before, current: votes_after, trx_id: doc.trx_id});
        }

        const vote_deltas = array_xor(votes_before, votes_after);

        vote_deltas.forEach((candidate) => {
            this.recalc_candidate(candidate, dac_id, doc.action.account, db);
        });
    }

    async action({doc, dac_directory, db}) {
        if (doc.action.name === 'votecuste'){
            // console.log(doc);

            setTimeout((() => {
                this.recalc_voter(doc.action.data.voter, doc, dac_directory, db);
            }), 1000);
        }
    }

    async delta({doc, dac_directory, db}){}

    async replay() {
        this.logger.info('Replaying voters');

        const db = await connectMongo(config);
        const collection = db.collection('voters');
        const collection_actions = db.collection('actions');

        this.dac_directory = new DacDirectory({config: this.config, db});
        await this.dac_directory.reload();

        this.logger.info('Removing existing entries');
        await collection.deleteMany({});
        // this.logger.info(await collection.find({}).count());

        // const dac_custodian_contracts = Map.keys(this.dac_directory.custodian_contracts());
        const dac_custodian_contracts = [...new Set(this.dac_directory.custodian_contracts().values())];
        console.log(dac_custodian_contracts);

        const table_query = {
            db,
            code: {$in: dac_custodian_contracts},
            table: 'candidates'
        };
        let res_candidates = await eosTableAtBlock(table_query);

        if (res_candidates.count){
            console.log(`Found ${res_candidates.count} candidates`);

            const candidates = res_candidates.results.map(row => {
                // dont include v1 style contracts
                return {
                    name: row.data.candidate_name,
                    dac_id: row.scope,
                    custodian_contract: row.code
                };

            })
                .filter(c => !dac_custodian_contracts.includes(c.dac_id));

            for (let c=0;c<candidates.length;c++){
                const cand = candidates[c];
                await this.recalc_candidate(cand.name, cand.dac_id, cand.custodian_contract, db);
            }
        }


        // this.logger.info(`Imported ${count} vote documents`);
    }
}

module.exports = new VotesHandler();
