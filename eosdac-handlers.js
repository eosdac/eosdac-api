const MongoLong = require('mongodb').Long
const MongoClient = require('mongodb').MongoClient

const {Api, JsonRpc, Serialize} = require('eosjs')
const {TextDecoder, TextEncoder} = require('text-encoding')
const fetch = require('node-fetch')

var elasticsearch = require('elasticsearch')
var crypto = require('crypto')

class ActionHandler {
    constructor({queue, db, config}) {
        this.queue = queue
        this.config = config

        const rpc = new JsonRpc(this.config.eos.endpoint, {fetch});
        this.api = new Api({
            rpc,
            signatureProvider: null,
            chainId: this.config.chainId,
            textDecoder: new TextDecoder(),
            textEncoder: new TextEncoder(),
        });

        this.connectDb()

        this.parseInterestedConfig()
    }

    async connectDb() {
        this.db = await this._connectDb()
    }

    async _connectDb() {
        if (this.config.mongo){
            return new Promise((resolve, reject) => {
                MongoClient.connect(this.config.mongo.url, {useNewUrlParser: true}, ((err, client) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(client.db(this.config.mongo.dbName))
                    }
                }).bind(this))
            })
        }
    }

    async processAction({block_num, action, receiver, receiver_sequence, global_sequence}) {

        try {
            let actions = [];
            action.data = new Uint8Array(Object.values(action.data))
            actions.push(action)

            const act = await this.api.deserializeActions(actions);

            if (this.db){
                for (let action_data of act) {
                    const col = this.db.collection(this.config.mongo.traceCollection);
                    action_data.recv_sequence = new MongoLong.fromString(receiver_sequence)
                    action_data.global_sequence = new MongoLong.fromString(global_sequence)
                    //let doc = {block_num, action: action_data}
                    // console.log("ACT\n", act, "INSERT\n", doc, "\nACTION RECEIPT\n", action.receipt);
                    // let index = `actions.gs${action_data.global_sequence}`
                    console.log("\nINSERT\n", action_data)
                    col.updateOne({block_num}, {$addToSet: {action: action_data}}, {upsert: true}).catch(console.log)
                }
            }
            else {
                console.log(act)
            }

        } catch (e) {
            console.log("ERROR deserializeActions", e);
            console.log(e)
            throw e
        }
    }

    async processActionJob(job, done) {
        let block_num = job.data.block_num
        let action = job.data.action
        let receiver = job.data.receiver
        let receiver_sequence = job.data.receiver_sequence
        let global_sequence = job.data.global_sequence

        console.info(`Processing action job ${job.id}, block_num ${block_num}, worker ${job.workerId}`)

        try {
            await this.processAction({block_num, action, receiver, receiver_sequence, global_sequence})
            done()
        } catch (e) {
            console.log(e)
            done(e)
        }
    }


    async queueAction(block_num, action) {
        // console.log(action)
        // console.log("Queue Action", this)
        if (this.interested(action.act.account, action.act.name) && action.receipt[1].receiver == action.act.account) {
            let data = {
                block_num,
                action: action.act,
                receiver: action.receipt[1].receiver,
                receiver_sequence: action.receipt[1].recv_sequence,
                global_sequence: action.receipt[1].global_sequence
            }

            if (this.queue) {
                console.log(`Queueing action for ${action.act.account}::${action.act.name}`)
                this.queue.create('action', data).removeOnComplete(true).save()
            } else {
                console.log(`Processing action for ${action.act.account}::${action.act.name}`)
                this.processAction(data)
            }
        }


        if (action.inline_traces.length) {
            for (let itc of action.inline_traces) {
                //console.log("inline trace\n", itc);
                if (itc[0] == 'action_trace_v0') {
                    this.queueAction(block_num, itc[1]);
                }
            }
        }
    }

    parseInterestedConfig(){
        this.interested_data = {
            contracts: [],
            actions: [],
            contract_actions: []
        }
        this.config.eos.contracts.forEach((contract_str) => {
            if (contract_str.indexOf(':') == -1){
                this.interested_data.contracts.push(contract_str)
            }
            else {
                let [c, a] = contract_str.split(':')
                if (a == '*'){
                    this.interested_data.contracts.push(c)
                }
                else if (c == '*'){
                    this.interested_data.actions.push(a)
                }
                else {
                    this.interested_data.contract_actions.push([c, a])
                }
            }
        })
    }

    interested(account, name) {
        if (name === 'onblock'){
            return false
        }
        if (this.interested_data.contracts.includes(account) ||
            this.interested_data.actions.includes(name) ||
            (this.interested_data.contract_actions[0] == account && this.interested_data.contract_actions[1] == name)){
            return true
        }

        return false;
    }
}


class TraceHandler {
    constructor({queue, action_handler, config}) {
        this.queue = queue
        this.action_handler = action_handler
        this.config = config
        this.block_insert_queue = []

        setInterval(this.flushQueue.bind(this), 10000)

        this.connectDb()
    }

    async connectDb() {
        this.db = await this._connectDb()
    }

    async _connectDb() {
        if (this.config.mongo){
            return new Promise((resolve, reject) => {
                MongoClient.connect(this.config.mongo.url, {useNewUrlParser: true}, ((err, client) => {
                    if (err) {
                        reject(err)
                    } else {
                        const db = client.db(this.config.mongo.dbName)
                        // const col_traces = db.collection(this.config.mongo.traceCollection)
                        // col_traces.createIndex({block_num:-1})
                        resolve(db)
                    }
                }).bind(this))
            })
        }
    }

    async queueTrace(block_num, traces) {
        const data = {block_num, traces}
        this.queue.create('block_traces', data).removeOnComplete(true).save()
    }

    async processTraceJob(job, done) {
        //console.log(`Processing job : ${job.id}, type : ${job.type}`)
        const traces = job.data.traces
        const block_num = job.data.block_num

        try {
            await this.processTrace(block_num, traces)

            done()
        } catch (e) {
            done(e)
        }
    }

    async processTrace(block_num, traces) {
        //console.log(`Process block ${block_num}`)

        for (const trace of traces) {
            switch (trace[0]) {
                case 'transaction_trace_v0':
                    const trx = trace[1];
                    for (let action of trx.action_traces) {
                        //console.log(action)
                        switch (action[0]) {
                            case 'action_trace_v0':
                                this.action_handler.queueAction(block_num, action[1]);
                                break;
                        }
                    }
                    break;
            }

        }

        this.block_insert_queue.push({"insertOne":{block_num, actions:[]}})


    }

    async flushQueue(){
        if (this.block_insert_queue.length){
            const trace_col = this.db.collection(this.config.mongo.traceCollection)
            trace_col.bulkWrite(this.block_insert_queue, {ordered :false}).catch((e) => {})
        }
    }
}

class DeltaHandler {
    constructor({queue, config}) {
        this.queue = queue
        this.config = config
        this.tables = new Map

        const rpc = new JsonRpc(this.config.eos.endpoint, {fetch});
        this.api = new Api({
            rpc,
            signatureProvider: null,
            chainId: this.config.chainId,
            textDecoder: new TextDecoder(),
            textEncoder: new TextEncoder(),
        });

        if (this.config.elasticsearch){
            this.elastic = new elasticsearch.Client(this.config.elasticsearch)
        }

        this.connectDb()


        this.payers = {}

        // setInterval(() => {console.log(this.payers)}, 5000)

    }

    async connectDb() {
        this.db = await this._connectDb()
    }

    async _connectDb() {
        if (this.config.mongo){
            return new Promise((resolve, reject) => {
                MongoClient.connect(this.config.mongo.url, {useNewUrlParser: true}, ((err, client) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(client.db(this.config.mongo.dbName))
                    }
                }).bind(this))
            })
        }
    }

    async getTableType (code, table){
        const contract = await this.api.getContract(code)
        const abi = await this.api.getAbi(code)

        // console.log(abi)

        let this_table, type
        for (let t of abi.tables) {
            if (t.name == table) {
                this_table = t
                break
            }
        }

        if (this_table) {
            type = this_table.type
        } else {
            console.error(`Could not find table "${table}" in the abi`)
            return
        }

        return contract.types.get(type)
    }


    async processDeltaJob(job, done) {
        //console.log(`Processing job : ${job.id}, type : ${job.type}`)
        const deltas = job.data.deltas
        const abi = job.data.abi
        const block_num = job.data.block_num
        // console.log(job.data)

        try {
            // console.log(abi)
            const types = Serialize.getTypesFromAbi(Serialize.createInitialTypes(), abi);
            for (const table of abi.tables)
                this.tables.set(table.name, table.type);
            await this.processDelta(block_num, deltas, types)

            done()
        } catch (e) {
            done(e)
        }
    }

    queueDelta(block_num, deltas, abi) {
        const data = {block_num, deltas, abi}
        this.queue.create('block_deltas', data).removeOnComplete(true).save()
    }

    async processDelta(block_num, deltas, types) {
        // console.log(`received block ${block_num}`)
        // const timestampFromBlockNum = async (block) => {
        //     const block_data = await this.api.rpc.get_block(block)
        //     return block_data.timestamp
        // }
        // const timestamp = await timestampFromBlockNum(block_num)

        for (const delta of deltas) {
            // console.log(delta)
            switch (delta[0]) {
                case 'table_delta_v0':
                    if (delta[1].name == 'contract_row') {
                        for (const row of delta[1].rows) {
                            // console.log(row)
                            const type = types.get(delta[1].name)
                            const sb = new Serialize.SerialBuffer({
                                textEncoder: new TextEncoder,
                                textDecoder: new TextDecoder,
                                array: new Uint8Array(Object.values(row.data))
                            });


                            let row_version, code, scope ,table, primary_key, payer, data_raw
                            try {
                                row_version = sb.get() // ?
                                code = sb.getName()
                                scope = sb.getName()
                                table = sb.getName()
                                primary_key = sb.getUint64AsNumber()
                                payer = sb.getName()
                                data_raw = sb.getBytes()

                                // console.log(`code ${code}`)
                                // console.log(`table ${table}`)
                            }
                            catch (e){
                                console.error(`Error processing row.data for ${block_num} : ${e.message}`)
                                const data_raw = null
                            }


                            if (this.interested(code)) {
                                // console.log(abi)

                                const table_type = await this.getTableType(code, table)
                                const data_sb = new Serialize.SerialBuffer({
                                    textEncoder: new TextEncoder,
                                    textDecoder: new TextDecoder,
                                    array: data_raw
                                })
                                const data = table_type.deserialize(data_sb)

                                if (code != 'eosio'){
                                    console.log(`row version ${row_version}`)
                                    console.log(`code ${code}`)
                                    console.log(`scope ${scope}`)
                                    console.log(`table ${table}`)
                                    console.log(`primary_key ${primary_key}`)
                                    console.log(`payer ${payer}`)
                                    // console.log(`data`)
                                    console.log(data)

                                    const doc = {
                                        block_num, code, scope, table, primary_key, payer, data, present: row.present
                                    }


                                    const col = this.db.collection('deltas')
                                    col.insertOne(doc)
                                }
                            }

                        }

                    } else if (delta[1].name == 'generated_transaction') {
                        // console.log(delta[1]);
                        // return
                        continue

                        for (const row of delta[1].rows) {
                                const type = types.get(delta[1].name)
                                const data_sb = new Serialize.SerialBuffer({
                                    textEncoder: new TextEncoder,
                                    textDecoder: new TextDecoder,
                                    array: row.data
                                })
                                const data = type.deserialize(data_sb)


                            if (this.interested(data[1].sender) || (data[1].sender === '.............' && this.interested(data[1].payer))){
                                // console.log(row)
                                // console.log(data[1].sender_id)

                                const packed = Serialize.hexToUint8Array(data[1].packed_trx)
                                const type_trx = types.get('transaction')
                                const sb_trx = new Serialize.SerialBuffer({
                                    textEncoder: new TextEncoder,
                                    textDecoder: new TextDecoder,
                                    array: packed
                                })
                                const data_trx = type_trx.deserialize(sb_trx)
                                delete data_trx.max_cpu_usage_ms
                                delete data_trx.max_net_usage_words
                                delete data_trx.ref_block_num
                                delete data_trx.ref_block_prefix
                                delete data_trx.context_free_actions
                                delete data_trx.transaction_extensions



                                if (this.elastic){
                                    // let actions = [];
                                    // console.log('hi')
                                    for (let a=0;a<data_trx.actions.length;a++){
                                        delete data_trx.actions[a].data
                                        //     = new Uint8Array(Object.values(data_trx.actions[a].data))
                                        // actions.push(data_trx.actions[a])
                                    }
                                    const acts = data_trx.actions;
                                    delete data_trx.actions
                                    let a_idx = 0

                                    acts.forEach((a) => {
                                        delete a.authorization

                                        data_trx.action = a

                                        const tx_id = Serialize.arrayToHex(row.data) + parseInt(row.present) + a_idx

                                        const id = crypto.createHash('sha256').update(data[1].sender + '-' + data[1].sender_id).digest('hex');

                                        const store_data = {timestamp, present:row.present, data:data_trx, sender:data[1].sender, payer:data[1].payer, block_num}
                                        this.elastic.index({index:'generated-03', id, type:'generated_transaction', body:store_data})

                                        console.log("Generated transaction", store_data)

                                        a_idx++
                                    })
                                }
                                else {

                                    let actions = [];
                                    for (let a=0;a<data_trx.actions.length;a++){
                                        // delete data_trx.actions[a].data
                                        //     = new Uint8Array(Object.values(data_trx.actions[a].data))
                                        actions.push(data_trx.actions[a])
                                    }

                                    data_trx.actions = await this.api.deserializeActions(actions)

                                    console.log(data[1].sender, data_trx.actions[0].data, block_num, data[1].trx_id)
                                }


                                if (typeof this.payers[data[1].payer] == 'undefined'){
                                    this.payers[data[1].payer] = 0
                                }
                                this.payers[data[1].payer]++

                            }
                        }
                    } else if (['resource_usage', 'resource_limits_state', 'resource_limits_config'].includes(delta[1].name)) {

                    } else {
                    }
                    break;
                case '':
                    break;
            }
        }
    }

    interested(account, name) {
        if (this.config.eos.contracts.includes(account)){
            return true
        }

        return false;
    }
}


module.exports = {ActionHandler, TraceHandler, DeltaHandler}

