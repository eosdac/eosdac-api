#!/usr/bin/env node


const MongoClient = require('mongodb').MongoClient

const config = require('./jungle.config')

MongoClient.connect(config.mongo.url, {useNewUrlParser: true}, ((err, client) => {
    if (err){
        console.error("\nFailed to connect\n", err)
    }
    else if (client){
        console.info(`Connected to ${config.mongo.url}/${config.mongo.dbName}`)
        const db = client.db(config.mongo.dbName);

        const col = db.collection('deltas')

        const res = col.aggregate([
            {'$match':{code:"dacelections", table:'votes'/*, block_num:{$lte:3750792}*/}},
            {'$sort':{block_num:1}},
            {'$group':{
                    _id:{code:"$code", table:"$table", scope:"$scope", primary_key:"$primary_key"},
                    block_num:{'$last':"$block_num"},
                    data:{'$last':"$data"},
                    table:{'$last':"$table"},
                    code:{'$last':"$code"},
                    scope:{'$last':"$scope"},
                    primary_key:{'$last':"$primary_key"},
                    present:{'$last':"$present"}
                }
            },
            {'$match': {present:1}}
        ], (err, results) => {

            results.forEach((doc) => {
                console.log(doc)
            }, (err) => {
                if (err){
                    console.error(err)
                }
                process.exit(0)
            })

            //process.exit(0)
        })

    }

}));

