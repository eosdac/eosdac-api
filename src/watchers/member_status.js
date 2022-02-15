const connectMongo = require('../connections/mongo');
const {loadConfig} = require('../functions');

const {eosTableAtBlock,} = require('../eos-table');
const DacDirectory = require('../dac-directory');


class MemberStatusHandler {

    constructor() {
        this.config = loadConfig();
        this.db = connectMongo(this.config);

        this.dac_config = null;

        this.logger = require('../connections/logger')('watcher-multisig', this.config.logger);
    }


    async getMembershipTypes(account, db){
        const data_query = {
            sender: account
        };
        const members_res = await eosTableAtBlock({
            db,
            code: 'kasdactokens',
            table: 'members',
            data_query,
            limit: 1000
        });
        const dac_data = members_res.results.map((row) => {
            // console.log(row, row.data);
            return {
                dac_id: row.scope,
                code: row.code,
                account: row.data.sender,
                terms_version: row.data.agreedtermsversion,
                member_type: 1
            };
        });
        const dac_ids = dac_data.map(d => d.dac_id);

        const dac_map = new Map();
        dac_data.forEach((d) => {
            dac_map.set(d.dac_id, d);
        });


        // Check for candidate
        const cand_data_query = {
            candidate_name: account
        };
        const cand_res = await eosTableAtBlock({
            db,
            code: 'dacelections',
            table: 'candidates',
            data_query: cand_data_query
        });

        cand_res.results.forEach((cand) => {
            if (dac_map.has(cand.scope)){
                const dac_data = dac_map.get(cand.scope);
                dac_data.member_type = 2; // candidate
                dac_map.set(cand.scope, dac_data);
            }
        });

        // Check for custodian
        const cust_data_query = {
            cust_name: account
        };
        const cust_res = await eosTableAtBlock({
            db,
            code: 'dacelections',
            table: 'custodians',
            data_query: cust_data_query
        });

        cust_res.results.forEach((cand) => {
            if (dac_map.has(cand.scope)){
                const dac_data = dac_map.get(cand.scope);
                dac_data.member_type = 3; // custodian
                dac_map.set(cand.scope, dac_data);
            }
        });

        // console.log(dac_map.values());

        return Array.from(dac_map.values());
    }

    async recalc_member_status({account, db, replay=false}){
        // return;
        console.log(`Recalc member status ${account}`);

        const types = await this.getMembershipTypes(account, db);
        const coll = db.collection('memberstats');
        await coll.deleteMany({account});

        types.forEach((type) => {
            this.logger.info(`Inserting ${account} ${type.dac_id}`, {doc:type});
            coll.updateOne({dac_id: type.dac_id, account}, {$set: type}, {upsert: true});
        });

        return types;
    }

    async action({doc, dac_directory, db}) {}

    async delta({doc, dac_directory, db}){
        // console.log(`DELTA`, doc);
        let account;
        if (doc.table === 'members'){
            account = doc.data.sender;
        }
        else if (doc.table === 'candidates'){
            account = doc.data.candidate_name;
        }
        else if (doc.table === 'custodians'){
            account = doc.data.cust_name;
        }

        if (account){
            setTimeout((() => {
                this.recalc_member_status({account, doc, dac_directory, db});
            }), 1000);
        }
    }

    async replay() {
        this.logger.info('Replaying member status');

        const db = await this.db;
        const collection = db.collection('memberstats');
        const collection_actions = db.collection('actions');

        this.dac_directory = new DacDirectory({config: this.config, db});
        await this.dac_directory.reload();

        this.logger.info('Removing existing entries');
        await collection.deleteMany({});
        // this.logger.info(await collection.find({}).count());

        const dac_custodian_contracts = Array.from(new Set(this.dac_directory.token_contracts().values()));
        const query = {
            'action.account': {$in: dac_custodian_contracts},
            'action.name': 'memberrege'
        };
        // console.log(query);
        const res = collection_actions.find(query).sort({block_num: -1}).limit(10000);
        let doc;
        let count = 0;
        const replay = true;
        const recalcs = [];
        const members = new Set();
        while (doc = await res.next()) {
            members.add(doc.action.data.sender);
        }

        Array.from(members.values()).forEach((account) => {
            recalcs.push(this.recalc_member_status({account, db, replay}));
            count++;
        });

        await Promise.all(recalcs);
        this.logger.info(`Imported ${count} member stats`);
    }
}

module.exports = new MemberStatusHandler();
