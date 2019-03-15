const connectMongo = require('./connections/mongo')

function loadConfig(){
    const config_name = (process.env.CONFIG)?process.env.CONFIG:''
    if (!config_name){
        throw new Error(`Config not specified, please provide CONFIG environmental variable`)
    }
    const config = require(`./${config_name}.config`)

    return config
}


async function getRestartBlock(){
    const config = loadConfig()
    const mongo = await connectMongo(config)
    const coll_actions = mongo.db(config.mongo.dbName).collection('actions')
    const coll_contract_rows = mongo.db(config.mongo.dbName).collection('contract_rows')

    const res_actions = await coll_actions.find({}).sort({block_num:-1}).limit(1).next()
    const res_contract_rows = await coll_contract_rows.find({}).sort({block_num:-1}).limit(1).next()

    const actions_block = res_actions.block_num
    const contract_rows_block = res_contract_rows.block_num

    const block = Math.min(actions_block, contract_rows_block)

    console.log(`Got restart block ${block}`)

    return block
}


module.exports = {loadConfig, getRestartBlock}
