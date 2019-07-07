const {memberSnapshotSchema} = require('../schemas');

const MongoLong = require('mongodb').Long;

async function memberSnapshot(fastify, request) {
    // console.log(request)
    return new Promise(async (resolve, reject) => {
        const db = fastify.mongo.db;
        const dac_config = await request.dac_config();
        const dac_id = request.dac();

        const contract = request.query.contract || dac_config.accounts.get(4);
        const symbol = request.query.symbol || 'EOSDAC';
        const block_num = request.query.block_num || null;
        const sort_col = request.query.sort || 'account';

        console.log(`Generating snapshot for ${symbol}@${contract} on block ${block_num} with dac_id ${dac_id}`);

        const col = db.collection('contract_rows');

        const match = {code: contract, scope: dac_id, table: 'members'};

        if (fastify.config.eos.legacyDacs && fastify.config.eos.legacyDacs.length && fastify.config.eos.legacyDacs.includes(dac_id)){
            match.scope = {$in: [dac_id, contract]};
        }

        if (block_num) {
            match.block_num = {$lte: new MongoLong(block_num)}
        }

        col.aggregate([
            {'$match': match},
            {'$sort': {block_num: 1}},
            {
                '$group': {
                    _id: {code: "$code", table: "$table", primary_key: "$primary_key"},
                    block_num: {'$last': "$block_num"},
                    data: {'$last': "$data"},
                    table: {'$last': "$table"},
                    code: {'$last': "$code"},
                    present: {'$last': "$present"}
                }
            },
            {'$match': {present: 1}}
        ], (err, results) => {

            if (err) {
                reject(err);
                console.error(err);
                return
            }

            results.forEach((doc) => {
                // console.log(doc.data.sender)
                const member = doc.data.sender;

                members[member] = {terms: doc.data.agreedtermsversion, balance: null, block_num: doc.block_num}
            }, (err) => {
                if (err) {
                    console.error(err)
                }
            });

            const members = {};

            const account_match = {code: contract, table: 'accounts'};
            if (block_num) {
                account_match.block_num = {$lte: new MongoLong(block_num)}
            }

            col.aggregate([
                {'$match': account_match},
                {'$sort': {block_num: 1}},
                {
                    '$group': {
                        _id: {code: "$code", table: "$table", scope: "$scope"},
                        block_num: {'$last': "$block_num"},
                        data: {'$last': "$data"},
                        table: {'$last': "$table"},
                        code: {'$last': "$code"},
                        present: {'$last': "$present"}
                    }
                },
                {'$match': {present: 1}}
            ], {allowDiskUse: true}, async (err, results) => {

                if (err) {
                    reject(err);
                    console.error(err);
                    return
                }

                // console.log(await results.count())
                results.forEach((row) => {
                    // console.log(row)
                    if (typeof members[row._id.scope] != 'undefined') {
                        members[row._id.scope].balance = row.data.balance
                    }


                }, () => {
                    // console.log("members", members)

                    const output = [];
                    for (let account in members) {

                        // console.log(members[account].terms)
                        if (members[account].balance !== null) {
                            let [bal, sym] = members[account].balance.split(' ');
                            if (parseFloat(bal) >= 1 && sym === symbol) {
                                console.log(`${account},${bal} ${sym}`);
                                output.push({account, balance: bal + ' ' + sym, terms: members[account].terms})
                            }
                        }
                    }

                    let sorter;
                    const balance_sorter = (a, b) => {
                        const [bala] = a.balance.split(' ');
                        const [balb] = b.balance.split(' ');
                        return (parseFloat(bala) > parseFloat(balb)) ? -1 : 1
                    };
                    const account_sorter = (a, b) => (a[sort_col] < b[sort_col]) ? -1 : 1;
                    switch (sort_col) {
                        case 'balance':
                            sorter = balance_sorter;
                            break;
                        case 'account':
                        default:
                            sorter = account_sorter;
                            break
                    }

                    const sorted = output.sort(sorter);

                    resolve({results: sorted, count: sorted.length})
                })
            })

        })
    })
}


module.exports = function (fastify, opts, next) {
    fastify.get('/member_snapshot', {
        schema: memberSnapshotSchema.GET
    }, async (request, reply) => {
        reply.send(await memberSnapshot(fastify, request));
    });
    next()
};
