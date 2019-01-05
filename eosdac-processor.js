#!/usr/bin/env node

const fs = require('fs')
const commander = require('commander');
const { Api, JsonRpc } = require('eosjs');
const { TextDecoder, TextEncoder } = require('text-encoding');
const fetch = require('node-fetch');

const kue = require('kue')
const cluster = require('cluster')

const zlib = require('zlib')

const MongoLong = require('mongodb').Long;
const MongoClient = require('mongodb').MongoClient;

let rpc;
const signatureProvider = null;

var access = fs.createWriteStream('consumers.log')
process.stdout.write = process.stderr.write = access.write.bind(access)


class JobProcessor {
    constructor({ config = 'jungle' }) {
        this.config = require(`./${config}.config`)
        this.config_name = config


        this.queue = kue.createQueue({
            prefix: this.config.redisPrefix,
            redis: this.config.redis
        })

        this.start()
    }


    async start(){
        let chain = this.config_name
        this.contracts = this.config.eos.contracts;
        this.trace_collection = this.config.mongo.traceCollection + '_' + chain
        this.state_collection = this.config.mongo.stateCollection + '_' + chain

        rpc = new JsonRpc(this.config.eos.endpoint, { fetch });
        this.api = new Api({
            rpc, signatureProvider, chainId:this.config.eos.chainId, textDecoder: new TextDecoder(), textEncoder: new TextEncoder(),
        });

        if (cluster.isMaster) {
            console.log("Starting...")

            for (let i = 0; i < this.config.clusterSize; i++) {
                cluster.fork()
            }
        } else {
            const self = this;

            MongoClient.connect(this.config.mongo.url, {useNewUrlParser: true}, function(err, client) {
                if (err){
                    console.error("\nFailed to connect\n", err)
                }
                else if (client){
                    self.db = client.db(self.config.mongo.dbName);
                }
            });

            this.queue.process('block_traces', 1, this.processBlock.bind(this))
            this.queue.process('action', 1, this.processAction.bind(this))
        }
    }


    async processAction(job, done){

        let block_num = job.data.block_num
        let action = job.data.action
        let receiver = job.data.receiver
        let receiver_sequence = job.data.receiver_sequence
        let global_sequence = job.data.global_sequence

        console.info(`Processing action job ${job.id}, block_num ${block_num}, worker ${job.workerId}`)

        // await this.handleAction(block_num, action, receiver, receiver_sequence, global_sequence)
        try {
            let actions = [];
            action.data = new Uint8Array(Object.values(action.data))
            actions.push(action)
            this.api.deserializeActions(actions)
                .then(act => {
                    for (let action_data of act){
                        const col = this.db.collection(this.trace_collection);
                        action_data.recv_sequence = new MongoLong.fromString(receiver_sequence)
                        action_data.global_sequence = new MongoLong.fromString(global_sequence)
                        let doc = {block_num, action:action_data}
                        // console.log("ACT\n", act, "INSERT\n", doc, "\nACTION RECEIPT\n", action.receipt);
                        console.log("\nINSERT\n", doc);
                        col.updateOne({block_num}, {$addToSet:{actions:action_data}}, {upsert:true}).catch(console.log);
                    }
                })
                .catch(e => {
                    console.log(actions)
                    console.log("ERROR deserializeActions", e);
                    done(e)
                    return
                });
        }
        catch (e){
            console.log(e)
            done(e)
            return
        }


        done()
    }


    async queueAction(block_num, action){
        // console.log(action)
        if (this.interested(action.act.account, action.act.name) && action.receipt[1].receiver == action.act.account){
            console.log(`Queueing action for ${action.act.account}::${action.act.name}`)
            let data = {
                block_num,
                action:action.act,
                receiver:action.receipt[1].receiver,
                receiver_sequence: action.receipt[1].recv_sequence,
                global_sequence: action.receipt[1].global_sequence
            }
            this.queue.create('action', data).save()
        }


        if (action.inline_traces.length){
            for (let itc of action.inline_traces){
                //console.log("inline trace\n", itc);
                if (itc[0] == 'action_trace_v0'){
                    await this.queueAction(block_num, itc[1]);
                }
            }
        }
    }

    async processBlock(job, done){
        let traces = job.data.traces
        let block_num = job.data.block_num

        console.log(`Process block ${block_num}`)

        for (let trace of traces){
            switch (trace[0]){
                case 'transaction_trace_v0':
                    const trx = trace[1];
                    for (let action of trx.action_traces){
                        //console.log(action)
                        switch (action[0]){
                            case 'action_trace_v0':
                                this.queueAction(block_num, action[1]);
                                break;
                        }
                    }
                    break;
            }

        }
        done()
    }

    interested(account, name){
        if (this.contracts.includes(account) || (account == 'eosio' && ['linkauth', 'unlinkauth'].includes(name))){
            return true
        }

        return false;
    }
}




commander
    .version('0.1', '-v, --version')
    .option('-c, --config <config>', 'Config prefix, will load <config>.config.js from the current directory',  'jungle')
    .parse(process.argv);

const processor = new JobProcessor(commander);
