#!/usr/bin/env node


const MongoClient = require('mongodb').MongoClient


const account = process.argv[2]
if (!account || account.length > 12){
    console.error(`Please supply a valid account name`)
    process.exit(1)
}

const config = require('./jungle.config')

console.log(`Getting linked auths for ${account}`)

let permissions = {}

MongoClient.connect(config.mongo.url, {useNewUrlParser: true}, ((err, client) => {
    if (err) {
        console.error("\nFailed to connect\n", err)
        process.exit(0)
    } else if (client) {
        console.info(`Connected to ${config.mongo.url}/${config.mongo.dbName}`)
        const db = client.db(config.mongo.dbName);

        const col = db.collection('permission_links')


        col.aggregate([
            {'$match':{account:account}},
            {'$sort':{block_num:1}},
            {'$group':{
                    _id:{account:"$account", code:"$code", message_type:"$message_type"},
                    block_num:{'$last':"$block_num"},
                    account:{'$last':"$account"},
                    code:{'$last':"$code"},
                    message_type:{'$last':"$message_type"},
                    required_permission:{'$last':"$required_permission"},
                    present:{'$last':"$present"}
                }
            },
            {'$match': {present:true}}
        ], {allowDiskUse:true}, (err, results) => {

            results.forEach((row) => {
                // console.log(row)

                if (typeof permissions[row.required_permission] == 'undefined'){
                    permissions[row.required_permission] = []
                }
                permissions[row.required_permission].push({
                    account: row.account,
                    code: row.code,
                    message_type: row.message_type
                })

            }, () => {
                console.log(permissions)

                process.exit(0)
            })

        })
    }
}))


