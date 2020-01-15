const connectMongo = require('../connections/mongo');
const {loadConfig} = require('../functions');

const config = loadConfig();

const {eosTableAtBlock} = require('../eos-table');
const DacDirectory = require('../dac-directory');

/*
Maintains a cache of tokens owned
 */

class TokensHandler {

    constructor() {
        this.config = config;

        this.dac_config = null;

        this.logger = require('../connections/logger')('watcher-tokens', config.logger);
    }

    async recalc_tokens(account, db){
        return new Promise(async (resolve, reject) => {

            const query = {'scope': account, 'table': 'accounts'};

            const collection = db.collection('contract_rows');
            const cache_collection = db.collection('tokens');

            cache_collection.createIndex({acnt:1, code:1, symbol:1, precision:1}, {unique:true});
            cache_collection.createIndex({acnt:1}, {background:true});

            collection.find(query, {sort: {block_num: 1}}, (err, res) => {
                if (err) {
                    reject(err);
                }
                else if (res) {
                    const symbols = new Set();
                    res.count().then((cnt) => {
                        console.log(`Found ${cnt} records`);
                        if (cnt){
                            res.forEach((row) => {
                                // console.log(row);
                                if (row.data.balance){
                                    const [bal, sym] = row.data.balance.split(' ');
                                    const bal_float = parseFloat(bal);
                                    if (!isNaN(bal_float) && bal_float > 0){
                                        const [,d] = bal.split('.');
                                        const p = (d)?d.length:0;

                                        symbols.add(`${row.code}:${sym}:${p}`);
                                    }
                                }
                            }, () => {
                                console.log(`Writing ${symbols.size} symbols for ${account}`);
                                cache_collection.deleteMany({acnt:account}, {}, () => {
                                    const bulk_writes = [];

                                    if (symbols.size){
                                        Array.from(symbols).forEach((s) => {
                                            const [code, symbol, precision] = s.split(':');
                                            bulk_writes.push({
                                                updateOne: {
                                                    filter: {acnt:account, code, symbol, precision:parseInt(precision)},
                                                    update: {$set:{acnt:account, code, symbol, precision:parseInt(precision)}},
                                                    upsert: true
                                                }
                                            });
                                        });

                                        // console.log(JSON.stringify(bulk_writes));
                                        cache_collection.bulkWrite(bulk_writes, {ordered:false}).then((res, err) => {
                                            if (err){
                                                reject(err);
                                            }
                                            else {
                                                resolve();
                                            }
                                        });
                                    }
                                    else {
                                        resolve();
                                    }
                                });

                            });
                        }
                    });
                }
            });
        });

    }

    async action({doc, dac_directory, db}) {}

    async delta({doc, dac_directory, db}){
        if (doc.table === 'accounts'){
            this.recalc_tokens(doc.scope, db);
        }
    }

    async replay() {
        return new Promise(async (resolve, reject) => {
            console.log(`Recalculating token balances`);
            const db = await connectMongo(config);
            // this.recalc_tokens('evilmikehere', db);
            // return;
            const collection = db.collection('contract_rows');
            const res = await collection.aggregate([{$group: {_id:'$scope'}}]);
            const promises = [];
            res.forEach(row => {
                const account = row._id;
                promises.push(this.recalc_tokens(account, db));
            }, async () => {
                const res = await Promise.all(promises);
                console.log(`Recalculated ${promises.length} account tokens owned`);
                resolve(res);
            });
        });


    }
}

module.exports = new TokensHandler();
