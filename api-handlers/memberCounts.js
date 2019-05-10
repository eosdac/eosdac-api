const {memberCountsSchema} = require('../schemas');

const MongoLong = require('mongodb').Long;

class eosTableIter {
    constructor({code, scope, table, api, greed_factor, primary_key}){
        if (greed_factor > 19){
            throw new Error(`greed_factor must be less than 20`);
        }
        this.code = code;
        this.scope = scope;
        this.table = table;
        this.api = api;
        this.greed_factor = greed_factor;
        this.primary_key = primary_key;
        this.current_set = [];
        this.current_pos = 0;
        this.has_more = false;
        this.unique_index = new Set;
    }

    [Symbol.asyncIterator](){
        return {
            next: () => {
                return new Promise((resolve, reject) => {
                    if (!this.current_set.length || ((this.current_pos >= this.current_set.length) && this.has_more)){
                        console.log('fetching...');
                        const req = {code:this.code, scope:this.scope, table:this.table, limit:20};
                        if (this.current_set.length){
                            req.lower_bound = this.current_set[this.current_set.length-this.greed_factor].sender;
                        }

                        this.api.rpc.get_table_rows(req).then((res) => {
                            if (res.rows && res.rows.length){
                                if (this.current_set.length){
                                    for (let i=0;i<this.greed_factor;i++){
                                        res.rows.shift();
                                    }
                                }
                                this.current_set = res.rows;
                                this.has_more = res.more;
                                this.current_pos = 0;
                                resolve({value:this.current_set[this.current_pos++]});
                            }
                            else {
                                resolve({done:true});
                            }
                        });
                    }
                    else if (!this.has_more && (this.current_pos >= this.current_set.length)) {
                        resolve({done: true});
                    }
                    else {
                        let next = this.current_set[this.current_pos++];
                        if (this.primary_key){
                            while (this.unique_index.has(next[this.primary_key])){
                                next = this.current_set[this.current_pos++];
                            }
                        }

                        resolve({value:next});
                    }
                });

            }
        }

    }

};

async function memberCounts(fastify, request) {
    // console.log(request)
    return new Promise(async (resolve, reject) => {
        const api = fastify.eos.api;

        const dac_config = await request.dac_config();
        const token_contract = dac_config.accounts.get(4);

        const cust_req = {code:token_contract, scope:token_contract, table:'members', api, greed_factor:1, primary_key:'sender'};

        const table_iter = new eosTableIter(cust_req);
        const results = new Map;
        results.set('total', 0);
        let i = 0;
        for await (let row of table_iter){
            const key = `terms_v${row.agreedtermsversion}`;
            if (!results.has(key)){
                results.set(key, 0);
            }
            results.set(key, results.get(key)+1);
            results.set('total', results.get('total')+1);
        }
        const res_obj = Array.from(results).reduce((obj, [key, value]) => {
            obj[key] = value;
            return obj;
        }, {});
        resolve(res_obj);
        console.log(`${i} rows`, res_obj);
    })
}


module.exports = function (fastify, opts, next) {
    fastify.get('/member_counts', {
        schema: memberCountsSchema.GET
    }, async (request, reply) => {
        const res = await memberCounts(fastify, request);
        reply.send({results: res, count: res.length});
    });
    next()
};
