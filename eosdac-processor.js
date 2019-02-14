#!/usr/bin/env node

const fs = require('fs')
const commander = require('commander');

const kue = require('kue')
const cluster = require('cluster')

const MongoClient = require('mongodb').MongoClient;
const {ActionHandler, TraceHandler, DeltaHandler} = require('./eosdac-handlers')

// var access = fs.createWriteStream('consumers.log')
// process.stdout.write = process.stderr.write = access.write.bind(access)


class JobProcessor {
    constructor({ config = 'jungle' }) {
        this.config = require(`./${config}.config`)


        this.queue = kue.createQueue({
            prefix: this.config.redisPrefix,
            redis: this.config.redis
        })


        this.action_handler = new ActionHandler({queue:this.queue, config:this.config})
        this.block_handler = new TraceHandler({queue:this.queue, action_handler:this.action_handler, config:this.config})
        this.delta_handler = new DeltaHandler({queue:this.queue, config:this.config})
    }


    async start(){
        this.contracts = this.config.eos.contracts;


        if (cluster.isMaster) {
            console.log(`Starting processor with ${this.config.clusterSize} threads...`)
            kue.app.listen(3001)

            for (let i = 0; i < this.config.clusterSize; i++) {
                cluster.fork()
            }
        } else {
            if (this.config.mongo){
                MongoClient.connect(this.config.mongo.url, {useNewUrlParser: true}, ((err, client) => {
                    if (err){
                        console.error("\nFailed to connect\n", err)
                    }
                    else if (client){
                        this.db = client.db(this.config.mongo.dbName);
                    }

                    this.queue.process('block_traces', 1, this.block_handler.processTraceJob.bind(this.block_handler))
                    this.queue.process('action', 1, this.action_handler.processActionJob.bind(this.action_handler))
                    this.queue.process('block_deltas', 1, this.delta_handler.processDeltaJob.bind(this.delta_handler))

                }).bind(this));
            }
            else {
                this.queue.process('block_traces', 1, this.block_handler.processTraceJob.bind(this.block_handler))
                this.queue.process('action', 1, this.action_handler.processActionJob.bind(this.action_handler))
                this.queue.process('block_deltas', 1, this.delta_handler.processDeltaJob.bind(this.delta_handler))
            }

        }
    }
}


commander
    .version('0.1', '-v, --version')
    .option('-c, --config <config>', 'Config prefix, will load <config>.config.js from the current directory',  'jungle')
    .parse(process.argv);

const processor = new JobProcessor(commander);
processor.start()