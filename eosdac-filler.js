#!/usr/bin/env node

const fs = require('fs')
const commander = require('commander');
const { Api, JsonRpc } = require('eosjs');
const { TextDecoder, TextEncoder } = require('text-encoding');
const fetch = require('node-fetch');

const { Connection } = require("./connection")

var kue = require('kue')
const cluster = require('cluster')

let rpc;
const signatureProvider = null;


const MongoLong = require('mongodb').Long
const MongoClient = require('mongodb').MongoClient


// var access = fs.createWriteStream('filler.log')
// process.stdout.write = process.stderr.write = access.write.bind(access)

class ActionHandler {
    constructor({queue, db, config}){
        this.queue = queue
        this.config = config

        let rpc = new JsonRpc(this.config.eos.endpoint, { fetch });
        this.api = new Api({
            rpc, signatureProvider, chainId:this.config.chainId, textDecoder: new TextDecoder(), textEncoder: new TextEncoder(),
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

class BlockReceiver {
    /* mode 0 = serial, 1 = parallel */
    constructor({ startBlock = 0, endBlock = 0xffffffff, config, mode = 0 }){
        this.trace_handlers = []

        // console.log(config)

        this.config = config
        this.mode = mode

        this.start_block = startBlock
        this.end_block = endBlock
        this.current_block = -1
        this.complete = true

        this.state_collection = 'state'

    }

    registerTraceHandler(h){
        this.trace_handlers.push(h)
    }

    status(){
        const start = this.start_block
        const end = this.end_block
        const current = this.current_block

        return {start, end, current}
    }

    async start(){
        // check for resume data
        const self = this
        if (!this.complete){
            throw "Already started"
        }

        if (this.connection){
            this.connection = null
        }

        this.complete = false

        this.db = await this.connectDb()

        this.connection = new Connection({
            socketAddress: this.config.eos.wsEndpoint,
            receivedAbi: this.requestBlocks.bind(this),
            receivedBlock: this.receivedBlock.bind(this),
        });
    }

    async connectDb(){
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

    async requestBlocks(){
        try {
            await this.connection.requestBlocks({
                irreversibleOnly:false,
                start_block_num: this.start_block,
                end_block_num: this.end_block,
                have_positions:[],
                fetch_block: false,
                fetch_traces: true,
                fetch_deltas: false,
            });
        } catch (e) {
            console.error(e);
            process.exit(1);
        }
    }

    async handleFork(block_num){
        const trace_collection = this.config.mongo.traceCollection
        const col = this.db.collection(trace_collection)
        return col.deleteMany({block_num:{$gte:block_num}})
    }

    async receivedBlock(response, block, traces, deltas) {
        if (!response.this_block)
            return;
        let block_num = response.this_block.block_num;

        if ( this.mode === 0 && block_num <= this.current_block ){
            console.log(`Detected fork in serial mode: current:${block_num} <= head:${this.current_block}`)
            await this.handleFork(block_num)
        }

        this.complete = false

        this.current_block = block_num

        if (!(block_num % 100)){
            console.info(`BlockReceiver : received block ${block_num}`);
            let {start, end, current} = this.status()
            console.info(`Start: ${start}, End: ${end}, Current: ${current}`)

            // this.connection.requestStatus()
            // this.queue.inactiveCount((err, total) => {
            //     console.info("redis queue length " + total)
            // })
        }

        if (traces){
            this.trace_handlers.map((handler) => {
                if (this.mode === 0){
                    handler.processBlock(block_num, traces)
                }
                else {
                    handler.queueBlock(block_num, traces)
                }
            })
        }

        if (this.current_block === this.end_block -1){
            console.log("Im done")
            this.complete = true
        }

        // const state_col = this.db.collection(this.state_collection);
        // state_col.updateOne({name:'head_block'}, {$set:{block_num}}, {upsert:true})

    } // receivedBlock
}


class FillManager {
    constructor({ startBlock = 0, endBlock = 0xffffffff, config = 'jungle', irreversibleOnly = false, replay = false }) {
        this.config = require(`./${config}.config`)
        this.config_name = config
        this.start_block = startBlock
        this.end_block = endBlock
        this.replay = replay

        console.log(`Loading config ${config}.config.js`)
    }

    async run(){
        let queue

        let start_block = this.start_block

        // If replay is set then we start from block 0 in parallel and then start a serial handler from lib onwards
        // Otherwise we start from this.start_block in serial

        rpc = new JsonRpc(this.config.eos.endpoint, { fetch });
        this.api = new Api({
            rpc, signatureProvider, chainId:this.config.chainId, textDecoder: new TextDecoder(), textEncoder: new TextEncoder(),
        });


        const action_handler = new ActionHandler({queue, config:this.config})
        const block_handler = new BlockHandler({queue, action_handler, config:this.config})

        if (this.replay){

            queue = kue.createQueue({
                prefix: this.config.redisPrefix,
                redis: this.config.redis
            })

            this.queue = queue


            if (cluster.isMaster){
                kue.app.listen(3000)

                const info = await this.api.rpc.get_info()
                const lib = info.last_irreversible_block_num

                let chunk_size = 100000
                let from = 0;
                let to = chunk_size; // to is not inclusive
                let break_now = false
                while (true){
                    console.log(`adding job for ${from} to ${to}`)
                    queue.create('block_range', {from, to}).removeOnComplete( true ).save()

                    if (to == lib){
                        break_now = true
                    }

                    from += chunk_size
                    to += chunk_size

                    if (to > lib){
                        to = lib
                    }

                    if (from > to){
                        break_now = true
                    }

                    // WARNING : debug
                    // if (to > 100000){
                    //     break_now = true;
                    // }

                    if (break_now){
                        break
                    }
                }

                for (let i = 0; i < this.config.fillClusterSize; i++) {
                    let worker = cluster.fork()
                    worker.on('exit', (code, signal) => {
                        if (signal) {
                            console.log(`FillManager : worker was killed by signal: ${signal}`);
                            let worker = cluster.fork()
                        } else if (code !== 0) {
                            console.log(`FillManager : worker exited with error code: ${code}`);
                        } else {
                            console.log('FillManager : worker success!');
                        }
                    });
                }

                // Start in serial mode from lib onwards
                this.br = new BlockReceiver({startBlock:lib, mode:0, config:this.config})
                this.br.registerTraceHandler(block_handler)
                this.br.start()
            }
            else {
                queue.process('block_range', 1, this.processBlockRange.bind(this))
            }

        }
        else {
            if (start_block === 0){
                // TODO: need to look for restart point
            }

            this.br = new BlockReceiver({startBlock:start_block, mode:0, config:this.config})
            this.br.registerTraceHandler(block_handler)
            this.br.start()
        }

    }

    async processBlockRange(job, done){
        const start_block = job.data.from
        const end_block = job.data.to

        console.log(`Starting block listener ${start_block} to ${end_block}`)

        const action_handler = new ActionHandler({queue:this.queue, config:this.config})
        const block_handler = new BlockHandler({queue:this.queue, action_handler, config:this.config})

        let br = new BlockReceiver({startBlock:start_block, endBlock:end_block, mode:1, config:this.config})
        br.registerTraceHandler(block_handler)
        await br.start()

        done()
    }
}

commander
    .version('0.1', '-v, --version')
    .option('-s, --start-block <start-block>', 'Start at this block')
    .option('-e, --end-block <end-block>', 'End block (exclusive)', 0xffffffff)
    .option('-c, --config <config>', 'Config prefix, will load <config>.config.js from the current directory',  'jungle')
    .option('-r, --replay', 'Force replay (ignore head block)', false)
    .parse(process.argv);

// const monitor = new Monitor(commander);
// const fill = new FillAPI(commander);

const fm = new FillManager(commander)
fm.run()