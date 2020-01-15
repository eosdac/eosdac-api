const {financialReportsSchema} = require('../schemas');
const {eosTableAtBlock} = require('../eos-table')

const MongoLong = require('mongodb').Long;

async function financialReports(fastify, request) {
    // console.log(request)
    return new Promise(async (resolve, reject) => {
        const dac_config = await request.dac_config();
        const db = fastify.mongo.db;
        const actions_collection = db.collection('actions');
        const rows_collection = db.collection('contract_rows');
        const account = request.query.account || 'evilmikehere';
        const start = new Date(request.query.start);
        const end = new Date(request.query.end - 1);

        const tokens = [{contract: 'eosio.token', symbols: ['EOS', 'JUNGLE']}, {contract: 'kasdactokens', symbols: ['KASDAC', 'IOIO']}];

        const output = {};

        let token_res_count = 0;

        for (let t=0;t<tokens.length;t++) {
            const token = tokens[t];

            const opening_balances = await eosTableAtBlock({code: token.contract, table: 'accounts', scope: account, block_timestamp: start, db});
            const closing_balances = await eosTableAtBlock({code: token.contract, table: 'accounts', scope: account, block_timestamp: end, db});

            for (let s=0;s<token.symbols.length;s++) {
                const symbol = token.symbols[s];
                const ref = `${token.contract}:${symbol}`;
                if (!output[ref]){
                    output[ref] = {};
                }
                const opening_row = opening_balances.results.filter(b => b.data.balance.indexOf(symbol) > -1)[0];
                const closing_row = closing_balances.results.filter(b => b.data.balance.indexOf(symbol) > -1)[0];
                if (opening_row && closing_row){
                    output[ref].opening_balance = opening_row.data.balance;
                    output[ref].closing_balance = closing_row.data.balance;
                    output[ref].symbol = symbol;
                    output[ref].contract = token.contract;
                    output[ref].transactions = [];
                }
            }

            const transfers_query_from = {'action.account': token.contract, 'action.name': 'transfer', 'action.data.from': account, 'block_timestamp': {$gte: start, $lte: end}};
            const transfers_res_from = await actions_collection.find(transfers_query_from);
            const transfers_query_to = {'action.account': token.contract, 'action.name': 'transfer', 'action.data.to': account, 'block_timestamp': {$gte: start, $lte: end}};
            const transfers_res_to = await actions_collection.find(transfers_query_to);

            const count = await transfers_res_from.count();

            const append_fn = (row) => {
                // console.log(row)
                const [, symbol] = row.action.data.quantity.split(' ');
                if (token.symbols.includes(symbol)) {
                    // console.log(row);
                    const ref = `${token.contract}:${symbol}`;
                    if (typeof output[ref].transactions === 'undefined'){
                        output[ref].transactions = [];
                    }
                    delete row._id;
                    output[ref].transactions.push(row);
                }
            };

            transfers_res_from.forEach(append_fn, () => {
                transfers_res_to.forEach(append_fn, () => {
                    token_res_count++;
                    if (token_res_count >= tokens.length){
                        const out_results = Object.values(output)
                            .map((r) => {
                                r.transactions.sort((a, b) => a.block_num < b.block_num ? -1 : 1 );
                                return r;
                            });

                        resolve(out_results);
                    }
                });
            });

        }


        return;

        const query = {'action.name': 'transfer', 'block_timestamp': {$gte: start, $lte: end}};
        resolve(query);
        if (start_block) {
            if (!('block_num' in query)) {
                query.block_num = {}
            }
            query.block_num['$gte'] = new MongoLong(start_block)
        }
        if (end_block) {
            if (!('block_num' in query)) {
                query.block_num = {}
            }
            query.block_num['$lte'] = new MongoLong(end_block)
        }


        collection.find(query, {sort: {block_num: 1}}, async (err, res) => {
            // console.log("action", res.action.data)
            if (err) {
                reject(err)
            } else if (res) {
                const timeline = [];
                if (!await res.count()) {
                    let zero_bal = `0 ${symbol}`;
                    timeline.push({block_num:0, balance:zero_bal});
                    resolve(timeline);
                } else {
                    res.forEach((row) => {
                        const [bal, sym] = row.data.balance.split(' ');
                        if (symbol === sym) {
                            timeline.push({block_num: row.block_num, balance: row.data.balance})
                        }
                    }, async () => {
                        const info = await fastify.eos.rpc.get_info();
                        const lib = info.last_irreversible_block_num;

                        const timeline_last = {block_num:lib, balance:timeline[timeline.length-1].balance};
                        timeline.push(timeline_last);

                        resolve(timeline)
                    })
                }

            }
        })
    })
}


module.exports = function (fastify, opts, next) {
    fastify.get('/financial_reports', {
        schema: financialReportsSchema.GET
    }, async (request, reply) => {
        const res = await financialReports(fastify, request);
        reply.send({ results: res, count: res.length });
    });
    next()
};
