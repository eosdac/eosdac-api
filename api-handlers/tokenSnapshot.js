
const {tokenSnapshotSchema} = require('../schemas')

const connectMongo = require('../connections/mongo')

const {loadConfig} = require('../functions')


async function tokenSnapshot(fastify, request) {
    // console.log(request)
    return new Promise(async (resolve, reject) => {
        const config = loadConfig()
        const mongo = await connectMongo(config)
        const db = mongo.db(config.mongo.dbName)
        const collection = db.collection('contract_rows')
        const contract = request.query.contract || 'eosdactokens'
        const symbol = request.query.contract || 'EOSDAC'
        const block_num = request.query.block_num || 0xffffffff


        const col = db.collection('contract_rows')

        const res = col.aggregate([
            {'$match':{code:contract, table:'members', block_num:{$lte:42888888}}},
            {'$sort':{block_num:1}},
            {'$group':{
                    _id:{code:"$code", table:"$table", primary_key:"$primary_key"},
                    block_num:{'$last':"$block_num"},
                    data:{'$last':"$data"},
                    table:{'$last':"$table"},
                    code:{'$last':"$code"},
                    present:{'$last':"$present"}
                }
            },
            {'$match': {present:1}}
        ], (err, results) => {

            results.forEach((doc) => {
                // console.log(doc.data.sender)
                const member = doc.data.sender

                members[member] = {terms:doc.data.agreedtermsversion, balance:null}
            }, (err) => {
                if (err){
                    console.error(err)
                }
            })

            const members = {}

            col.aggregate([
                {'$match':{code:contract, table:'accounts', block_num:{$lte:42888888}}},
                {'$sort':{block_num:1}},
                {'$group':{
                        _id:{code:"$code", table:"$table", scope:"$scope"},
                        block_num:{'$last':"$block_num"},
                        data:{'$last':"$data"},
                        table:{'$last':"$table"},
                        code:{'$last':"$code"},
                        present:{'$last':"$present"}
                    }
                },
                {'$match': {present:1}}
            ], {allowDiskUse:true}, async (err, results) => {
                // console.log(await results.count())
                results.forEach((row) => {
                    // console.log(row)
                    if (typeof members[row._id.scope] != 'undefined'){
                        members[row._id.scope].balance = row.data.balance
                    }


                }, () => {
                    // console.log("members", members)

                    const output = []
                    for (let account in members){

                        // console.log(members[account].terms)
                        if (members[account].balance !== null){
                            let [bal, cur] = members[account].balance.split(' ')
                            if (parseFloat(bal) >= 1){
                                console.log(`${account},${bal} ${cur}`)
                                output.push({account, balance:bal + ' ' + cur, terms:members[account].terms})
                            }
                        }

                    }

                    resolve(output)
                })
            })

        })
    })
}


module.exports = function (fastify, opts, next) {
    fastify.get('/token_snapshot', {
        schema: tokenSnapshotSchema.GET
    }, async (request, reply) => {
        reply.header('Access-Control-Allow-Origin', '*')
        reply.send(await tokenSnapshot(fastify, request));
    });
    next()
};
