const connectMongo = require('./connections/mongo');

function loadConfig() {
    const config_name = (process.env.CONFIG) ? process.env.CONFIG : '';
    if (!config_name) {
        throw new Error(`Config not specified, please provide CONFIG environmental variable`)
    }
    const config = require(`../${config_name}.config`);

    config.name = config_name;

    return config
}


async function getRestartBlock() {
    const config = loadConfig();
    const mongo = await connectMongo(config);
    //
    const coll_actions = mongo.collection('actions');
    const coll_contract_rows = mongo.collection('contract_rows');

    let actions_block = 1, contract_rows_block = 1;

    const res_actions = await coll_actions.find({}).sort({block_num: -1}).limit(1).next();
    const res_contract_rows = await coll_contract_rows.find({}).sort({block_num: -1}).limit(1).next();

    if (res_actions) {
        actions_block = res_actions.block_num
    }
    if (res_contract_rows) {
        contract_rows_block = res_contract_rows.block_num
    }


    const block = Math.min(actions_block, contract_rows_block);

    if (block > 1){
        console.log(`Getting restart block from ${config.mongo.dbName}, ${block}`);
    }

    return block
}


module.exports = {loadConfig, getRestartBlock};
