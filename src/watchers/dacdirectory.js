const connectMongo = require('../connections/mongo');
const {loadConfig} = require('../functions');

const config = loadConfig();

const {eosTableAtBlock} = require('../eos-table');
const DacDirectory = require('../dac-directory');

/*
Maintains a cache of dacdirectory for easy querying and to provide a consistent api to app developers
 */

class DacdirectoryHandler {

    constructor() {
        this.config = config;

        this.dac_config = null;

        this.logger = require('../connections/logger')('watcher-dacdirectory', config.logger);
    }

    process_refs(refs){
        const out = {};
        const lookup = {
            0: 'homepage',
            1: 'logo_url',
            2: 'description',
            3: 'logo_notext_url',
            4: 'background_url',
            5: 'colors',
            6: 'client_extension',
            7: 'favicon_url',
            8: 'dac_currency_url',
            9: 'system_currency_url'
        };
        refs.forEach((r) => {
            let value = r.value;
            if (value.indexOf('{') === 0){
                try {
                    // temporary hack because some system is sending $warning in colours
                    value = value.replace('\$warning', 'warning');
                    console.log('json value for parsing', value);
                    value = JSON.parse(value);
                } catch (e) {}
            }
            out[`ref${r.key}`] = value;

            if (typeof lookup[r.key] !== 'undefined'){
                out[lookup[r.key]] = value;
            }
        });
        return out;
    }

    process_accounts(accounts){
        const out = {};
        const lookup = {
            0: 'auth',
            1: 'treasury',
            2: 'custodian',
            3: 'msigs',
            5: 'service',
            6: 'proposals',
            7: 'escrow',
            8: 'vote_weight',
            9: 'activation',
            10: 'referendum',
        };
        accounts.forEach((r) => {
            out[`account${r.key}`] = r.value;

            if (typeof lookup[r.key] !== 'undefined'){
                out[lookup[r.key]] = r.value;
            }
        });
        return out;
    }

    async recalc_dac(doc, db){
        if (!doc.data.dac_id){
            console.log('No dac_id in row');
            return;
        }
        console.log('Recalc dacdirectory', doc);
        const coll = db.collection('dacdirectory');
        await coll.createIndex({dac_id: 1, symbol: 1}, {unique: true});

        const symbol = doc.data.symbol;
        const [precision_str, symbol_code] = (symbol.sym || symbol.symbol).split(',');
        symbol.code = symbol_code;
        symbol.precision = parseInt(precision_str);

        const refs = this.process_refs(doc.data.refs);
        const accounts = this.process_accounts(doc.data.accounts);

        const indexed_doc = {
            dac_id: doc.data.dac_id,
            owner: doc.data.owner,
            title: doc.data.title,
            symbol,
            refs,
            accounts,
            homepage: refs.ref0,
            logo_url: refs.ref1,
            description: refs.ref2,
            logo_notext_url: refs.ref3,
            client_extension: refs.ref4,
            theme: refs.ref5,
        };

        this.logger.info(`Inserting dac cache ${indexed_doc.dac_id}`, {doc:indexed_doc});
        coll.updateOne({dac_id: indexed_doc.dac_id}, {$set: indexed_doc}, {upsert: true});

        console.log(indexed_doc);
    }

    async action({doc, dac_directory, db}) {}

    async delta({doc, dac_directory, db}){
        console.log('dacdirectory delta')
        if (doc.table === 'dacs'){
            this.recalc_dac(doc, db);
        }
    }

    async replay() {
        return new Promise(async (resolve, reject) => {
            console.log('Recalculating dac directory entries');
            const db = await connectMongo(config);
            // this.recalc_tokens('evilmikehere', db);
            // return;
            const collection = db.collection('contract_rows');

        });


    }
}

module.exports = new DacdirectoryHandler();
