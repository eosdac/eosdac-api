#!/usr/bin/env node


const MongoClient = require('mongodb').MongoClient;

let members = {};

const config = require('./mainnet.config');
MongoClient.connect(config.mongo.url, {useNewUrlParser: true}, ((err, client) => {
    if (err) {
        console.error("\nFailed to connect\n", err);
        process.exit(0)
    } else if (client) {
        // console.info(`Connected to ${config.mongo.url}/${config.mongo.dbName}`)
        const db = client.db(config.mongo.dbName);

        const col = db.collection('contract_rows');

        col.aggregate([
            {'$match': {code: "eosdactokens", table: 'members', block_num: {$lte: 42888888}}},
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

            results.forEach((doc) => {
                const member = doc.data.sender;

                members[member] = null
            }, (err) => {
                if (err) {
                    console.error(err);
                    process.exit(0)
                }
            });


            col.aggregate([
                {'$match': {code: "eosdactokens", table: 'accounts', block_num: {$lte: 42888888}}},
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
            ], {allowDiskUse: true}, (err, results) => {
                results.forEach((row) => {
                    // console.log(row)
                    if (typeof members[row._id.scope] != 'undefined') {
                        members[row._id.scope] = row.data.balance
                    }


                }, () => {
                    // console.log(members)

                    for (let act in members) {
                        if (members[act] !== null) {
                            let [bal] = members[act].split(' ');
                            if (parseFloat(bal) >= 1) {
                                console.log(`${act},${members[act]}`)
                            }
                        }

                    }
                    process.exit(0)
                })
            })


            //process.exit(0)
        })

    }

}));
