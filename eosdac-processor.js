#!/usr/bin/env node

const fs = require('fs')
const commander = require('commander');
const { Api, JsonRpc } = require('eosjs');
const { TextDecoder, TextEncoder } = require('text-encoding');
const fetch = require('node-fetch');

const kue = require('kue')
const cluster = require('cluster')

const MongoClient = require('mongodb').MongoClient;
const {ActionHandler, BlockHandler} = require('./eosdac-handlers')

// var access = fs.createWriteStream('consumers.log')
// process.stdout.write = process.stderr.write = access.write.bind(access)


class JobProcessor {
    constructor({ config = 'jungle' }) {
        this.config = require(`./${config}.config`)


        this.queue = kue.createQueue({
            prefix: this.config.redisPrefix,
            redis: this.config.redis
        })

        const rpc = new JsonRpc(this.config.eos.endpoint, { fetch });
        this.api = new Api({
            rpc, null, chainId:this.config.chainId, textDecoder: new TextDecoder(), textEncoder: new TextEncoder(),
        });

        this.action_handler = new ActionHandler({queue:this.queue, config:this.config})
        this.block_handler = new BlockHandler({queue:this.queue, action_handler:this.action_handler, config:this.config})
    }


    async start(){
        this.contracts = this.config.eos.contracts;

        rpc = new JsonRpc(this.config.eos.endpoint, { fetch });
        this.api = new Api({
            rpc, signatureProvider, chainId:this.config.eos.chainId, textDecoder: new TextDecoder(), textEncoder: new TextEncoder(),
        });

        if (cluster.isMaster) {
            console.log("Starting processor...")

            for (let i = 0; i < this.config.clusterSize; i++) {
                cluster.fork()
            }
        } else {
            MongoClient.connect(this.config.mongo.url, {useNewUrlParser: true}, ((err, client) => {
                if (err){
                    console.error("\nFailed to connect\n", err)
                }
                else if (client){
                    this.db = client.db(this.config.mongo.dbName);
                }

                this.queue.process('block_traces', 1, this.block_handler.processBlockJob.bind(this.block_handler))
                this.queue.process('action', 1, this.action_handler.processActionJob.bind(this.action_handler))
            }).bind(this));
        }
    }
}


commander
    .version('0.1', '-v, --version')
    .option('-c, --config <config>', 'Config prefix, will load <config>.config.js from the current directory',  'jungle')
    .parse(process.argv);

const processor = new JobProcessor(commander);
processor.start()