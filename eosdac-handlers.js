
const MongoLong = require('mongodb').Long
const MongoClient = require('mongodb').MongoClient

const { Api, JsonRpc } = require('eosjs')
const { TextDecoder, TextEncoder } = require('text-encoding')
const fetch = require('node-fetch')

class ActionHandler {
    constructor({queue, db, config}){
        this.queue = queue
        this.config = config

        const rpc = new JsonRpc(this.config.eos.endpoint, { fetch });
        this.api = new Api({
            rpc, signatureProvider: null, chainId:this.config.chainId, textDecoder: new TextDecoder(), textEncoder: new TextEncoder(),
        });

        this.connectDb()
    }

    async connectDb() {
        this.db = await this._connectDb()
    }

    async _connectDb(){
        return new Promise((resolve, reject) => {
            MongoClient.connect(this.config.mongo.url, {useNewUrlParser: true}, ((err, client) => {
                if (err){
                    reject(err)
                }
                else {
                    resolve(client.db(this.config.mongo.dbName))
                }
            }).bind(this))
        })
    }

    async processAction({block_num, action, receiver, receiver_sequence, global_sequence}){

        try {
            let actions = [];
            action.data = new Uint8Array(Object.values(action.data))
            actions.push(action)

            const act = await this.api.deserializeActions(actions);

            for (let action_data of act){
                const col = this.db.collection(this.config.mongo.traceCollection);
                action_data.recv_sequence = new MongoLong.fromString(receiver_sequence)
                action_data.global_sequence = new MongoLong.fromString(global_sequence)
                let doc = {block_num, action:action_data}
                // console.log("ACT\n", act, "INSERT\n", doc, "\nACTION RECEIPT\n", action.receipt);
                console.log("\nINSERT\n", doc)
                col.updateOne({block_num}, {$addToSet:{actions:action_data}}, {upsert:true}).catch(console.log)
            }
        }
        catch (e){
            console.log("ERROR deserializeActions", e);
            console.log(e)
            throw e
        }
    }

    async processActionJob(job, done){
        let block_num = job.data.block_num
        let action = job.data.action
        let receiver = job.data.receiver
        let receiver_sequence = job.data.receiver_sequence
        let global_sequence = job.data.global_sequence

        console.info(`Processing action job ${job.id}, block_num ${block_num}, worker ${job.workerId}`)

        try {
            await this.processAction({block_num, action, receiver, receiver_sequence, global_sequence})
            done()
        }
        catch (e){
            console.log(e)
            done(e)
        }
    }


    async queueAction(block_num, action){
        // console.log(action)
        // console.log("Queue Action", this)
        if (this.interested(action.act.account, action.act.name) && action.receipt[1].receiver == action.act.account){
            let data = {
                block_num,
                action:action.act,
                receiver:action.receipt[1].receiver,
                receiver_sequence: action.receipt[1].recv_sequence,
                global_sequence: action.receipt[1].global_sequence
            }

            if (this.queue){
                console.log(`Queueing action for ${action.act.account}::${action.act.name}`)
                this.queue.create('action', data).save()
            }
            else {
                console.log(`Processing action for ${action.act.account}::${action.act.name}`)
                this.processAction(data)
            }
        }


        if (action.inline_traces.length){
            for (let itc of action.inline_traces){
                //console.log("inline trace\n", itc);
                if (itc[0] == 'action_trace_v0'){
                    this.queueAction(block_num, itc[1]);
                }
            }
        }
    }

    interested(account, name){
        if (this.config.eos.contracts.includes(account) || (account == 'eosio' && ['linkauth', 'unlinkauth'].includes(name))){
            return true
        }

        return false;
    }
}


class BlockHandler {
    constructor({queue, action_handler}){
        this.queue = queue
        this.action_handler = action_handler
    }

    async queueBlock(block_num, traces){
        const data = {block_num, traces}
        this.queue.create('block_traces', data).removeOnComplete( true ).save()
    }

    async processBlockJob(job, done){
        const traces = job.data.traces
        const block_num = job.data.block_num

        try {
            await this.processBlock(block_num, traces)

            done()
        }
        catch (e){
            done(e)
        }
    }

    async processBlock(block_num, traces){
        //console.log(`Process block ${block_num}`)

        for (const trace of traces){
            switch (trace[0]){
                case 'transaction_trace_v0':
                    const trx = trace[1];
                    for (let action of trx.action_traces){
                        //console.log(action)
                        switch (action[0]){
                            case 'action_trace_v0':
                                this.action_handler.queueAction(block_num, action[1]);
                                break;
                        }
                    }
                    break;
            }

        }
    }
}


module.exports = {ActionHandler, BlockHandler}

